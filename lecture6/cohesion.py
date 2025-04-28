# metrics/cohesion.py

import re

def calculate_cohesion(code):
    function_pattern = r'function\s+(\w+)\s*\([^)]*\)\s*{([\s\S]*?)}'
    variable_pattern = r'\b(\w+)\b'

    functions = []
    matches = re.finditer(function_pattern, code)

    for match in matches:
        function_body = match.group(2)
        variables = re.findall(variable_pattern, function_body)
        functions.append(set(variables))

    shared_variables = 0
    for i in range(len(functions)):
        for j in range(i + 1, len(functions)):
            shared = functions[i].intersection(functions[j])
            shared_variables += len(shared)

    return shared_variables
