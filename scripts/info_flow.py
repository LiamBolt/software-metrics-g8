import os
import re
from collections import defaultdict
import json

def get_js_and_ejs_files(directory):
    js_files = []
    ejs_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.js'):
                js_files.append(os.path.join(root, file))
            if file.endswith('.ejs'):
                ejs_files.append(os.path.join(root, file))
    return js_files + ejs_files

def extract_js_imports(content):
    """Extract CommonJS (require) and ES6 (import) module dependencies."""
    require_pattern = r'require\([\'"](.+?)[\'"]\)'
    import_pattern = r'import\s+(?:[\w*{}\s,]+\s+from\s+)?[\'"](.+?)[\'"]'
    matches = re.findall(require_pattern, content) + re.findall(import_pattern, content)
    return [m.split('/')[0] for m in matches if not m.startswith('.')]  # Only include module names

def compute_js_ifc(directory):
    module_files = {}
    imports_map = defaultdict(set)
    reverse_imports = defaultdict(set)
    loc_map = {}

    js_files = get_js_and_ejs_files(directory)

    # Map module names to paths
    for path in js_files:
        mod_name = os.path.splitext(os.path.basename(path))[0]
        module_files[mod_name] = path

    for path in js_files:
        mod_name = os.path.splitext(os.path.basename(path))[0]
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        # LOC (excluding empty/comment lines)
        loc = len([line for line in content.splitlines() if line.strip() and not line.strip().startswith("//")])
        loc_map[mod_name] = loc

        # Extract imports (relative & external)
        imports = extract_js_imports(content)
        for imp in imports:
            if imp in module_files and imp != mod_name:
                imports_map[mod_name].add(imp)
                reverse_imports[imp].add(mod_name)

    # Compute IFC
    ifc_scores = {}
    for module in module_files:
        fan_in = len(reverse_imports[module])
        fan_out = len(imports_map[module])
        length = loc_map.get(module, 0)

        ifc = length * (fan_in * fan_out) ** 2 if fan_in > 0 and fan_out > 0 else 0
        ifc_scores[module] = {
            "fan_in": fan_in,
            "fan_out": fan_out,
            "length": length,
            "IFC": ifc
        }

    return ifc_scores

if __name__ == "__main__":
    results = compute_js_ifc("../")
    for module, data in results.items():
        print(f"\nModule: {module}")
        for key, value in data.items():
            print(f"{key}: {value}")
    # files = get_js_and_ejs_files("../")
    # print(files)
# import json

# with open("js_ifc_metrics.json", "w") as f:
#     json.dump(results, f, indent=2)