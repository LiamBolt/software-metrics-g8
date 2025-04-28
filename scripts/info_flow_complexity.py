import os
import re
import json
import csv
from collections import defaultdict

def get_files_by_extension(directory, extension):
    """Get all files with a given extension recursively."""
    return [
        os.path.join(root, file)
        for root, _, files in os.walk(directory)
        for file in files if file.endswith(extension)
    ]

def extract_js_imports(content):
    """Extract dependencies from JS files including relative imports."""
    require_pattern = r'require\([\'"](.+?)[\'"]\)'
    import_pattern = r'import\s+(?:[\w*{}\s,]+\s+from\s+)?[\'"](.+?)[\'"]'
    matches = re.findall(require_pattern, content) + re.findall(import_pattern, content)
    
    # Process paths to get just the filename without extension
    resolved_imports = []
    for m in matches:
        # Keep all imports, including relative ones
        parts = m.split('/')
        # Get the last part (filename or module name)
        filename = parts[-1]
        # Remove extension if present
        if '.' in filename:
            filename = os.path.splitext(filename)[0]
        resolved_imports.append(filename)
    
    return resolved_imports

def extract_css_links_from_ejs(content):
    """Find linked CSS files in EJS templates."""
    # Pattern to match various link formats
    pattern = r'<link\s+[^>]*href=["\'](?:.*?)?([^/"\']+\.css)["\']'
    matches = re.findall(pattern, content)
    return [os.path.splitext(match)[0] for match in matches]

def extract_ejs_includes(content):
    """Find included EJS templates in other templates."""
    include_pattern = r'<%[-=]?\s*include\([\'"](.+?)[\'"](?:\s*,\s*{.+?})?\)\s*%>'
    matches = re.findall(include_pattern, content)
    # Process paths to get just the filename without extension
    return [os.path.splitext(os.path.basename(m))[0] for m in matches]

def calculate_information_flow_metrics(project_root):
    """Calculate Information Flow Complexity for all project files."""
    # Output directories
    metrics_dir = os.path.join(project_root, "metrics")
    os.makedirs(metrics_dir, exist_ok=True)
    
    print(f"\n📊 Analyzing Information Flow for project: {project_root}\n")
    
    # Get all files by extension across the entire project
    js_files = get_files_by_extension(project_root, ".js")
    css_files = get_files_by_extension(project_root, ".css")
    ejs_files = get_files_by_extension(project_root, ".ejs")

    # Filter out node_modules and other unnecessary directories
    def should_include(file_path):
        excluded_dirs = ["node_modules", "dist", "build", ".git", "__pycache__", "backup"]
        return not any(excluded in file_path for excluded in excluded_dirs)
    
    js_files = [f for f in js_files if should_include(f)]
    css_files = [f for f in css_files if should_include(f)]
    ejs_files = [f for f in ejs_files if should_include(f)]

    print(f"📄 Found {len(js_files)} JS files, {len(css_files)} CSS files, {len(ejs_files)} EJS files\n")

    module_files = {}
    imports_map = defaultdict(set)
    reverse_imports = defaultdict(set)
    loc_map = {}

    # Register all files with their module names
    for path in js_files + css_files + ejs_files:
        name = os.path.splitext(os.path.basename(path))[0]
        module_files[name] = path
        # Also register common variations
        module_files[f"{name}.js"] = path
        module_files[f"{name}.css"] = path
        module_files[f"{name}.ejs"] = path

    # JS analysis - find imports and calculate LOC
    print("⚙️ Analyzing JavaScript dependencies...")
    for path in js_files:
        name = os.path.splitext(os.path.basename(path))[0]
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            # Count LOC (non-empty, non-comment lines)
            code_lines = [
                line.strip() for line in content.splitlines() 
                if line.strip() and not line.strip().startswith("//")
            ]
            loc_map[name] = len(code_lines)
            
            # Find imports
            imports = extract_js_imports(content)
            for imp in imports:
                if imp in module_files and imp != name:
                    imports_map[name].add(imp)
                    reverse_imports[imp].add(name)
        except Exception as e:
            print(f"Error processing {path}: {e}")

    # EJS analysis - find includes and linked CSS
    print("⚙️ Analyzing EJS template dependencies...")
    for path in ejs_files:
        name = os.path.splitext(os.path.basename(path))[0]
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                
            # Count LOC (non-empty lines)
            code_lines = [line.strip() for line in content.splitlines() if line.strip()]
            loc_map[name] = len(code_lines)
            
            # Find included templates
            includes = extract_ejs_includes(content)
            for inc in includes:
                if inc in module_files and inc != name:
                    imports_map[name].add(inc)
                    reverse_imports[inc].add(name)
            
            # Find linked CSS
            linked_css = extract_css_links_from_ejs(content)
            for css_name in linked_css:
                if css_name in module_files:
                    imports_map[name].add(css_name)
                    reverse_imports[css_name].add(name)
        except Exception as e:
            print(f"Error processing {path}: {e}")

    # CSS analysis - calculate LOC
    print("⚙️ Analyzing CSS metrics...")
    for path in css_files:
        name = os.path.splitext(os.path.basename(path))[0]
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            
            # Count LOC (non-empty, non-comment lines)
            code_lines = [
                line.strip() for line in content.splitlines() 
                if line.strip() and not line.strip().startswith("/*")
            ]
            loc_map[name] = len(code_lines)
        except Exception as e:
            print(f"Error processing {path}: {e}")

    # IFC Calculation
    print("\n📈 Calculating Information Flow Complexity...\n")
    ifc_scores = {}
    
    # Get unique modules (removing duplicates like name.js, etc.)
    base_modules = set()
    for mod in module_files.keys():
        if "." not in mod:
            base_modules.add(mod)
    
    for mod in base_modules:
        fan_in = len(reverse_imports.get(mod, []))
        fan_out = len(imports_map.get(mod, []))
        length = loc_map.get(mod, 0)
        
        # Henry-Kafura IFC formula: length * (fan_in * fan_out)^2
        ifc = length * (fan_in * fan_out) ** 2 if fan_in > 0 and fan_out > 0 else 0

        ifc_scores[mod] = {
            "fan_in": fan_in,
            "fan_out": fan_out,
            "length": length,
            "dependencies": list(imports_map.get(mod, [])),
            "dependent_modules": list(reverse_imports.get(mod, [])),
            "IFC": ifc
        }

    # Save results to CSV
    csv_file = os.path.join(metrics_dir, "information_flow_metrics.csv")
    with open(csv_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Module", "Fan In", "Fan Out", "LOC", "IFC"])
        
        for mod, data in sorted(ifc_scores.items(), key=lambda x: x[1]["IFC"], reverse=True):
            writer.writerow([
                mod, 
                data["fan_in"], 
                data["fan_out"], 
                data["length"], 
                data["IFC"]
            ])
    
    # Save detailed results to JSON
    json_file = os.path.join(metrics_dir, "information_flow_detailed.json")
    with open(json_file, 'w') as f:
        json.dump(ifc_scores, f, indent=2)
        
    print(f"✅ Information flow metrics saved to {csv_file}")
    print(f"✅ Detailed results saved to {json_file}")
    
    # Print summary
    print("\n📊 Summary of Top 10 Modules by IFC:")
    print("{:<20} {:<8} {:<8} {:<8} {:<12}".format("Module", "Fan In", "Fan Out", "LOC", "IFC"))
    print("="*60)
    
    for mod, data in sorted(ifc_scores.items(), key=lambda x: x[1]["IFC"], reverse=True)[:10]:
        print("{:<20} {:<8} {:<8} {:<8} {:<12.2f}".format(
            mod, data["fan_in"], data["fan_out"], data["length"], data["IFC"]))
    
    return ifc_scores

if __name__ == "__main__":
    # Run from the project root directory
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    calculate_information_flow_metrics(project_dir)