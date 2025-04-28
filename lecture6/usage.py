# analyze_code.py

from metrics import (
    calculate_cyclomatic_complexity,
    calculate_nesting_depth,
    calculate_cohesion,
    calculate_coupling,
    calculate_information_flow
)

# Sample code snippet
code_snippet = """
function example() {
    if (true) {
        for (let i = 0; i < 10; i++) {
            console.log(i);
        }
    }
}
"""

# Calculate each metric
cyclomatic_complexity = calculate_cyclomatic_complexity(code_snippet)
print("Cyclomatic Complexity:", cyclomatic_complexity)

nesting_depth = calculate_nesting_depth(code_snippet)
print("Nesting Depth:", nesting_depth)

cohesion = calculate_cohesion(code_snippet)
print("Cohesion:", cohesion)

coupling = calculate_coupling(code_snippet)
print("Coupling:", coupling)

information_flow = calculate_information_flow(code_snippet)
print("Information Flow Complexity:", information_flow)
