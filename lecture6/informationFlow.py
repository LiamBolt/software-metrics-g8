# metrics/information_flow.py

import re

def calculate_information_flow(code):
    function_call_pattern = r'\b\w+\s*\(.*?\)'

    matches = re.findall(function_call_pattern, code)

    fan_out = len(matches)
    fan_in = len([m for m in matches if 'return' in m])  # crude assumption

    return {
        'fan_in': fan_in,
        'fan_out': fan_out,
        'total_flow': fan_in + fan_out
    }
