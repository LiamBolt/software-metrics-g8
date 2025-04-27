import os
import subprocess
import pandas as pd
import matplotlib.pyplot as plt

def get_cyclomatic_complexity(path):
    result = subprocess.run(['radon', 'cc', '-s', '-a', path], capture_output=True, text=True)
    lines = result.stdout.split('\n')
    cc_data = {}
    current_file = None  # Initialize current_file
    for line in lines:
        if line.strip().endswith(':'):
            current_file = line.strip().rstrip(':')  # Set the current file name
        elif line.strip().startswith('Average complexity:'):
            if current_file:  # Only process if current_file has been set
                avg_cc_str = line.split(':')[-1].strip()
                try:
                    # Extract the numeric value from within the parentheses
                    avg_cc = float(avg_cc_str.split('(')[-1].split(')')[0].strip())
                    cc_data[current_file] = avg_cc
                except ValueError:
                    print(f"Could not convert the complexity value from {avg_cc_str} for {current_file}")
            else:
                print(f"Warning: No current file assigned for line: {line}")
    
    return cc_data


def get_maintainability_index(path):
    result = subprocess.run(['radon', 'mi', '-s', path], capture_output=True, text=True)
    lines = result.stdout.split('\n')
    mi_data = {}
    for line in lines:
        parts = line.strip().split()
        if len(parts) >= 2:
            filename = parts[0]
            try:
                mi_score = float(parts[1])
                mi_data[filename] = mi_score
            except ValueError:
                print(f"Could not convert maintainability index value from {line}")
    return mi_data

def count_lines_of_code(path):
    loc_data = {}
    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith(".py"):  # Only process Python files
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = sum(1 for line in f if line.strip())  # Count non-empty lines
                        loc_data[file_path] = lines
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    return loc_data

def collect_metrics(path):
    # Collecting metrics for Cyclomatic Complexity, Maintainability Index, and LOC
    cc = get_cyclomatic_complexity(path)
    mi = get_maintainability_index(path)
    loc = count_lines_of_code(path)
    
    # Create a list of all the files to ensure all are accounted for
    files = set(cc.keys()) | set(mi.keys()) | set(loc.keys())
    
    data = []
    for file in files:
        data.append({
            'File': file,
            'Cyclomatic Complexity': cc.get(file, None),
            'Maintainability Index': mi.get(file, None),
            'Lines of Code': loc.get(file, None)
        })
    
    # Convert the data to a pandas DataFrame for easy manipulation
    df = pd.DataFrame(data)
    return df

def plot_graphs(df):
    plt.figure(figsize=(14, 6))

    # Plot 1: Cyclomatic Complexity vs Maintainability Index
    plt.subplot(1, 2, 1)
    plt.scatter(df['Cyclomatic Complexity'], df['Maintainability Index'], color='blue')
    plt.title('Cyclomatic Complexity vs Maintainability Index')
    plt.xlabel('Cyclomatic Complexity')
    plt.ylabel('Maintainability Index')
    plt.grid(True)

    # Plot 2: Lines of Code vs Maintainability Index
    plt.subplot(1, 2, 2)
    plt.scatter(df['Lines of Code'], df['Maintainability Index'], color='green')
    plt.title('Lines of Code vs Maintainability Index')
    plt.xlabel('Lines of Code')
    plt.ylabel('Maintainability Index')
    plt.grid(True)

    plt.tight_layout()
    plt.show()

def main():
    # Prompt for the codebase path
    path = input("Enter the path to your codebase: ")
    
    # Collect all metrics (Cyclomatic Complexity, Maintainability Index, LOC)
    df = collect_metrics(path)
    
    # Display the collected metrics in a table format
    print("\nCollected Metrics:")
    print(df)
    
    # Plot the graphs to visualize the relationships
    plot_graphs(df)

if __name__ == "__main__":
    main()
