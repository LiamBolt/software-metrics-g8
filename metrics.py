#!/usr/bin/env python3
"""
Software Metrics Analyzer

This script calculates Lines of Code (LOC) and Halstead complexity metrics
for all source code files in a given directory tree.

Usage:
    python metrics.py [path] [--output output_file]

If no path is provided, the current directory is used.

Outputs a metrics report to the console and to a file (default: metrics_report.txt).

Supports multiple languages (.py, .java, .c, .cpp, .js, .ts) by file extension.
"""

import os
import sys
import re
import argparse
import math

def is_source_file(filename):
    """Check if a file is a source code file of interest."""
    source_ext = {'.py', '.java', '.c', '.cpp', '.js', '.ts'}
    _, ext = os.path.splitext(filename)
    return ext.lower() in source_ext

def count_loc_and_comments(filepath):
    """
    Count total lines, blank lines, comment lines, and code lines in a source file.
    Supports Python, Java/C-style (C, C++, Java), JavaScript.
    Returns a tuple: (total_lines, blank_lines, comment_lines, code_lines).
    """
    total = blank = comment = code = 0
    in_block_comment = False
    ext = os.path.splitext(filepath)[1].lower()
    try:
        with open(filepath, 'r', errors='ignore') as file:
            for line in file:
                total += 1
                stripped = line.strip()
                if not stripped:
                    blank += 1
                    continue
                if ext in ('.c', '.cpp', '.java', '.js', '.ts'):
                    # Handle C-style block comments /* */
                    if not in_block_comment:
                        if stripped.startswith('/*'):
                            in_block_comment = True
                            comment += 1
                            # if block comment ends on same line
                            if '*/' in stripped and stripped.find('*/') > stripped.find('/*'):
                                in_block_comment = False
                            continue
                        if stripped.startswith('//'):
                            comment += 1
                            continue
                    else:
                        comment += 1
                        if '*/' in stripped:
                            in_block_comment = False
                        continue
                if ext == '.py':
                    # Handle Python comments and docstrings (""" or ''')
                    if not in_block_comment and (stripped.startswith('"""') or stripped.startswith("'''")):
                        in_block_comment = True
                        comment += 1
                        if (stripped.endswith('"""') or stripped.endswith("'''")) and len(stripped) > 3:
                            in_block_comment = False
                        continue
                    if in_block_comment:
                        comment += 1
                        if (stripped.endswith('"""') or stripped.endswith("'''")):
                            in_block_comment = False
                        continue
                    if stripped.startswith('#'):
                        comment += 1
                        continue
                # If not comment or blank, it's code
                code += 1
    except Exception as e:
        raise e
    return total, blank, comment, code

def tokenize_line(line):
    """
    Tokenize a line of code into operators and operands.
    Returns a list of tokens.
    """
    # Multi-character operators
    multi_ops = ["===", "!==", ">>>", "<<<", "==", "!=", "<=", ">=", "//",
                 "<<", ">>", "++", "--", "+=", "-=", "*=", "/=", "%=", "&&",
                 "||", "->", "::", "**"]
    for op in sorted(set(multi_ops), key=len, reverse=True):
        line = line.replace(op, f' {op} ')
    # Single-character operators/punctuation
    single_ops = ['+', '-', '*', '/', '%', '=', '<', '>', '&', '|',
                  '^', '~', '!', '?', ':', '(', ')', '{', '}', '[', ']', ';', ',', '.', '#']
    for op in single_ops:
        line = line.replace(op, f' {op} ')
    tokens = [tok for tok in line.split() if tok]
    return tokens

def compute_halstead_metrics(tokens, operators, keywords):
    """
    Compute Halstead metrics (distinct ops/operands, totals) for a list of tokens.
    Returns (distinct_ops_count, distinct_operands_count, total_ops, total_operands, sets_ops, sets_operands).
    """
    distinct_ops_set = set()
    distinct_operands_set = set()
    total_ops = total_operands = 0
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        # Numeric literal
        if re.match(r'^\d+(\.\d*)?$', tok):
            total_operands += 1
            distinct_operands_set.add(tok)
            i += 1
            continue
        # String literal (enclosed in quotes)
        if (tok.startswith('"') and tok.endswith('"')) or (tok.startswith("'") and tok.endswith("'")):
            total_operands += 1
            distinct_operands_set.add(tok[1:-1])
            i += 1
            continue
        # Operator or keyword
        if tok in operators or tok in keywords:
            total_ops += 1
            distinct_ops_set.add(tok)
            i += 1
            continue
        # Function call detection: if next token is '('
        if i+1 < len(tokens) and tokens[i+1] == '(':
            total_ops += 1
            distinct_ops_set.add(tok)
            i += 1
            continue
        # Otherwise operand (variable, name, etc.)
        total_operands += 1
        distinct_operands_set.add(tok)
        i += 1
    return (len(distinct_ops_set), len(distinct_operands_set),
            total_ops, total_operands,
            distinct_ops_set, distinct_operands_set)

def analyze_project(path):
    """
    Traverse directory tree and analyze all source files.
    Returns aggregated LOC metrics and Halstead metrics.
    """
    total_lines = blank_lines = comment_lines = code_lines = 0
    all_distinct_ops = set()
    all_distinct_operands = set()
    total_ops = total_operands = 0

    # Define operators and keywords for Halstead
    keywords = {
        'if', 'else', 'elif', 'while', 'for', 'do', 'return', 'break', 'continue',
        'switch', 'case', 'default', 'import', 'package', 'public', 'private', 'protected',
        'class', 'def', 'void', 'int', 'float', 'double', 'char', 'String', 'boolean',
        'static', 'final', 'try', 'catch', 'finally', 'new', 'this', 'super', 'extends',
        'implements', 'interface', 'throws', 'throw', 'const', 'var', 'let', 'function',
        'lambda', 'async', 'await', 'yield', 'sizeof', 'typedef', 'enum', 'goto', 'namespace',
        'True', 'False', 'None', 'and', 'or', 'not'
    }
    operators = {
        '+', '-', '*', '/', '%', '++', '--', '+=', '-=', '*=', '/=', '%=',
        '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '&', '|', '^', '~', '<<', '>>', '>>>',
        '<<=', '>>=', '>>>=',
        '->', '::', '.', ',', ';', ':', '?',
        '(', ')', '{', '}', '[', ']'
    }

    for root, _, files in os.walk(path):
        for fname in files:
            if not is_source_file(fname):
                continue
            filepath = os.path.join(root, fname)
            try:
                t, b, c, code = count_loc_and_comments(filepath)
            except Exception as e:
                print(f"Warning: could not read {filepath}: {e}", file=sys.stderr)
                continue
            total_lines += t
            blank_lines += b
            comment_lines += c
            code_lines += code

            try:
                with open(filepath, 'r', errors='ignore') as f:
                    lines = f.readlines()
            except Exception:
                continue

            in_block = False
            for line in lines:
                if not line.strip():
                    continue
                line_code = line
                ext = os.path.splitext(filepath)[1].lower()
                # Remove comments for tokenization
                if ext in ('.c', '.cpp', '.java', '.js', '.ts'):
                    if '//' in line_code:
                        line_code = line_code.split('//')[0]
                    if '/*' in line_code:
                        in_block = True
                        line_code = line_code.split('/*')[0]
                    if '*/' in line_code:
                        in_block = False
                        parts = line_code.split('*/', 1)
                        line_code = parts[1] if len(parts) > 1 else ''
                    if in_block:
                        continue
                if ext == '.py':
                    if not in_block and '"""' in line_code:
                        in_block = True
                        line_code = line_code.split('"""')[0]
                    if in_block and '"""' in line_code:
                        in_block = False
                        parts = line_code.split('"""', 1)
                        line_code = parts[1] if len(parts) > 1 else ''
                    if '#' in line_code and not in_block:
                        line_code = line_code.split('#')[0]
                    if in_block:
                        continue

                tokens = tokenize_line(line_code)
                dops, doper, ops, oper, ops_set, oper_set = compute_halstead_metrics(tokens, operators, keywords)
                total_ops += ops
                total_operands += oper
                all_distinct_ops.update(ops_set)
                all_distinct_operands.update(oper_set)

    return {
        'total_lines': total_lines,
        'blank_lines': blank_lines,
        'comment_lines': comment_lines,
        'code_lines': code_lines,
        'distinct_ops': len(all_distinct_ops),
        'distinct_operands': len(all_distinct_operands),
        'total_ops': total_ops,
        'total_operands': total_operands
    }

def calculate_metrics(data):
    """
    Given aggregated Halstead counts, calculate Halstead metrics values.
    Returns a dict of metrics.
    """
    n1 = data['distinct_ops']
    n2 = data['distinct_operands']
    N1 = data['total_ops']
    N2 = data['total_operands']
    n = n1 + n2  # vocabulary
    N = N1 + N2  # program length
    V = N * math.log2(n) if n > 0 else 0
    D = (n1/2) * (N2/float(n2)) if n2 > 0 else 0
    E = D * V
    T = E / 18.0 if E > 0 else 0
    B = V / 3000.0 if V > 0 else 0
    N_hat = (n1 * math.log2(n1) + n2 * math.log2(n2)) if n1 > 0 and n2 > 0 else 0
    return {
        'vocabulary': n,
        'program_length': N,
        'calculated_length': N_hat,
        'volume': V,
        'difficulty': D,
        'effort': E,
        'time': T,
        'bugs': B
    }

def main():
    parser = argparse.ArgumentParser(description='Analyze software metrics (LOC and Halstead) in source code.')
    parser.add_argument('path', nargs='?', default='.', help='Path to project directory (default: current directory)')
    parser.add_argument('--output', '-o', default='metrics_report.txt', help='Output report file name')
    args = parser.parse_args()

    path = args.path
    if not os.path.isdir(path):
        print(f"Error: {path} is not a valid directory.")
        sys.exit(1)

    data = analyze_project(path)

    total_loc = data['total_lines']
    comment_lines = data['comment_lines']
    code_lines = data['code_lines']
    blank_lines = data['blank_lines']
    comment_density = (comment_lines / total_loc * 100) if total_loc > 0 else 0

    halstead = calculate_metrics(data)

    report = []
    report.append("Software Metrics Report")
    report.append(f"Analyzed path: {os.path.abspath(path)}")
    report.append("")
    report.append("Lines of Code (LOC):")
    report.append(f"    Total lines: {total_loc}")
    report.append(f"    Blank lines: {blank_lines}")
    report.append(f"    Comment lines: {comment_lines}")
    report.append(f"    Code lines (NCLOC): {code_lines}")
    report.append(f"    Comment density: {comment_density:.2f}%")
    report.append("")
    report.append("Halstead Metrics:")
    report.append(f"    Distinct operators (η1): {data['distinct_ops']}")
    report.append(f"    Distinct operands (η2): {data['distinct_operands']}")
    report.append(f"    Program vocabulary (η): {halstead['vocabulary']}")
    report.append(f"    Total operators (N1): {data['total_ops']}")
    report.append(f"    Total operands (N2): {data['total_operands']}")
    report.append(f"    Program length (N): {halstead['program_length']}")
    report.append(f"    Estimated program length (N^): {halstead['calculated_length']:.2f}")
    report.append(f"    Volume (V): {halstead['volume']:.2f}")
    report.append(f"    Difficulty (D): {halstead['difficulty']:.2f}")
    report.append(f"    Effort (E): {halstead['effort']:.2f}")
    report.append(f"    Time to program (seconds): {halstead['time']:.2f}")
    report.append(f"    Estimated delivered bugs (B): {halstead['bugs']:.2f}")

    # join the list into a single string
    report_text = "\n".join(report)

    # print and write out with UTF-8 encoding
    print(report_text)
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(report_text)

if __name__ == "__main__":
    main()
