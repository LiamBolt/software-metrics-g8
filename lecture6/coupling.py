# metrics/coupling.py

import re

def calculate_coupling(code):
    function_call_pattern = r'\b\w+\s*\(.*?\)'

    matches = re.findall(function_call_pattern, code)
    external_function_calls = set(matches)

    return len(external_function_calls)
