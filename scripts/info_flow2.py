import os
import re
from collections import defaultdict

def get_files_by_extension(directory, extension):
    """Get all files with a given extension recursively."""
    return [
        os.path.join(root, file)
        for root, _, files in os.walk(directory)
        for file in files if file.endswith(extension)
    ]

def extract_js_imports(content):
    """Extract dependencies from JS files."""
    require_pattern = r'require\([\'"](.+?)[\'"]\)'
    import_pattern = r'import\s+(?:[\w*{}\s,]+\s+from\s+)?[\'"](.+?)[\'"]'
    matches = re.findall(require_pattern, content) + re.findall(import_pattern, content)
    return [m.split('/')[0] for m in matches if not m.startswith('.')]

def extract_css_links_from_ejs(content):
    """Find linked CSS files in EJS templates."""
    pattern = r'<link\s+[^>]*href=["\'](?:.*/)?([^"\']+\.css)["\']'
    return re.findall(pattern, content)

def compute_ifc_with_css(project_root):
    js_dir = project_root
    css_dir = os.path.join(project_root, "public/css")
    ejs_dir = os.path.join(project_root, "views")

    js_files = get_files_by_extension(js_dir, ".js")
    css_files = get_files_by_extension(css_dir, ".css")
    ejs_files = get_files_by_extension(ejs_dir, ".ejs")

    module_files = {}
    imports_map = defaultdict(set)
    reverse_imports = defaultdict(set)
    loc_map = {}

    # Register all JS and CSS modules
    for path in js_files + css_files:
        name = os.path.splitext(os.path.basename(path))[0]
        module_files[name] = path

    # JS analysis
    for path in js_files:
        name = os.path.splitext(os.path.basename(path))[0]
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        loc = len([line for line in content.splitlines() if line.strip() and not line.strip().startswith("//")])
        loc_map[name] = loc

        imports = extract_js_imports(content)
        for imp in imports:
            if imp in module_files and imp != name:
                imports_map[name].add(imp)
                reverse_imports[imp].add(name)

    # CSS analysis from EJS
    for path in ejs_files:
        template_name = os.path.splitext(os.path.basename(path))[0]
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        linked_css = extract_css_links_from_ejs(content)
        for css_file in linked_css:
            css_mod = os.path.splitext(os.path.basename(css_file))[0]
            if css_mod in module_files:
                imports_map[template_name].add(css_mod)
                reverse_imports[css_mod].add(template_name)

    # LOC for CSS files
    for path in css_files:
        name = os.path.splitext(os.path.basename(path))[0]
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            loc = len([line for line in f.readlines() if line.strip() and not line.strip().startswith("/*")])
        loc_map[name] = loc

    # IFC Calculation
    ifc_scores = {}
    all_modules = set(module_files.keys()) | set(reverse_imports.keys()) | set(imports_map.keys())

    for mod in all_modules:
        fan_in = len(reverse_imports.get(mod, []))
        fan_out = len(imports_map.get(mod, []))
        length = loc_map.get(mod, 0)
        ifc = length * (fan_in * fan_out) ** 2 if fan_in > 0 and fan_out > 0 else 0

        ifc_scores[mod] = {
            "fan_in": fan_in,
            "fan_out": fan_out,
            "length": length,
            "IFC": ifc
        }

    return ifc_scores

if __name__ == "__main__":
    result = compute_ifc_with_css("../")  # Adjust path if running from scripts/
    for mod, data in result.items():
        print(f"\nModule: {mod}")
        for key, value in data.items():
            print(f"{key}: {value}")
