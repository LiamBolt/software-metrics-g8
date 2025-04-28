# metrics/cyclomatic_complexity.py

import re

def calculate_cyclomatic_complexity(code):
    decision_keywords = ['if', 'for', 'while', 'case', 'catch', 'and', 'or', '?']
    complexity = 1  # Start from 1

    for keyword in decision_keywords:
        matches = re.findall(r'\b' + re.escape(keyword) + r'\b', code)
        complexity += len(matches)

    return complexity
