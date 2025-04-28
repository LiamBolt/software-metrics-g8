# metrics/nesting_depth.py

def calculate_nesting_depth(code):
    max_depth = 0
    current_depth = 0

    for line in code.split('\n'):
        open_braces = line.count('{')
        close_braces = line.count('}')

        current_depth += open_braces
        current_depth -= close_braces

        if current_depth > max_depth:
            max_depth = current_depth

    return max_depth
