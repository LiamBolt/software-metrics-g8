import os
import subprocess
import pandas as pd

def get_cyclomatic_complexity(path):
    result = subprocess.run(['radon', 'cc', '-s', '-a', path], capture_output=True, text=True)
    lines = result.stdout.split('\n')
    cc_data = {}
    current_file = None  
    for line in lines:
        if line.strip().endswith(':'):
            current_file = line.strip().rstrip(':')  
        elif line.strip().startswith('Average complexity:'):
            if current_file:
                avg_cc_str = line.split(':')[-1].strip()
                try:
                    avg_cc = float(avg_cc_str.split('(')[-1].split(')')[0].strip())
                    cc_data[current_file] = avg_cc
                except ValueError:
                    print(f"Could not convert complexity value from {avg_cc_str} for {current_file}")
            else:
                print(f"Warning: No current file assigned for line: {line}")
    return cc_data

def count_lines_of_code(path):
    loc_data = {}
    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = sum(1 for line in f if line.strip())
                        loc_data[file_path] = lines
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    return loc_data

def collect_metrics(path):
    cc = get_cyclomatic_complexity(path)
    loc = count_lines_of_code(path)

    # Combine data
    files = set(cc.keys()) | set(loc.keys())
    data = []
    for file in files:
        data.append({
            'File': file,
            'Cyclomatic Complexity': cc.get(file, None),
            'Lines of Code': loc.get(file, None)
        })

    df = pd.DataFrame(data)
    return df

def main():
    path = input("Enter the path to your codebase: ")

    df = collect_metrics(path)

    print("\nCollected Metrics (Cyclomatic Complexity and LOC):")
    print(df)

if __name__ == "__main__":
    main()
