import os
import re
import math
import sys

def get_source_files(directory, extensions=(".py", ".java", ".c", ".cpp", ".js")):
    """ Recursively get all source code files in a directory. """
    source_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(extensions):
                source_files.append(os.path.join(root, file))
    return source_files

def tokenize_code(content):
    """ Extract operators and operands from source code using regex. """
    operators = set(r"+-*/%=<>!&|^~?:,.(){}[];")
    pattern = r"[A-Za-z_]\w*|\d+|[+\-*/%=<>!&|^~?:,(){}[\];]"
    tokens = re.findall(pattern, content)

    operators_found = [t for t in tokens if t in operators]
    operands_found = [t for t in tokens if t not in operators]

    return operators_found, operands_found

def halstead_metrics(operators, operands):
    """ Calculate Halstead complexity measures. """
    n1 = len(set(operators))  # Number of distinct operators
    n2 = len(set(operands))   # Number of distinct operands
    N1 = len(operators)       # Total occurrences of operators
    N2 = len(operands)        # Total occurrences of operands

    n = n1 + n2  # Program vocabulary
    N = N1 + N2  # Program length

    if n1 == 0 or n2 == 0:
        return None  # Avoid division errors

    L = (n1 * math.log2(n1) + n2 * math.log2(n2)) if n > 0 else 0
    V = N * math.log2(n) if n > 0 else 0
    D = (n1 / 2) * (N2 / n2) if n2 > 0 else 0
    E = D * V

    return {
        "n1": n1, "n2": n2, "N1": N1, "N2": N2,
        "Vocabulary (n)": n, "Length (N)": N,
        "Calculated Length (L)": L, "Volume (V)": V,
        "Difficulty (D)": D, "Effort (E)": E
    }

def analyze_directory(directory):
    """ Analyze all source code files in a directory. """
    files = get_source_files(directory)
    results = {}

    for file in files:
        with open(file, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        operators, operands = tokenize_code(content)
        metrics = halstead_metrics(operators, operands)

        if metrics:
            results[file] = metrics

    return results

if __name__ == "__main__":
    directory = sys.argv[1] if len(sys.argv) > 1 else "."
    results = analyze_directory(directory)

    for file, metrics in results.items():
        print(f"\nFile: {file}")
        for key, value in metrics.items():
            print(f"{key}: {value:.2f}")
