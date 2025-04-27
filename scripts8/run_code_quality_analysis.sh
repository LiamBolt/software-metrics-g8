#!/bin/bash
# Script to measure internal code quality (Complexity, Comments)

echo "Running code quality analysis..."
pip install radon

echo "Cyclomatic Complexity Analysis:"
radon cc src/ -a

echo "Raw Metrics (Maintainability Index, Comments, LOC):"
radon raw src/
