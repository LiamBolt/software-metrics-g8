#!/bin/bash
# Script to measure performance by timing the main app

echo "Running performance test..."
START_TIME=$(date +%s)

python src/main.py  # Replace with your app entry point

END_TIME=$(date +%s)
EXECUTION_TIME=$((END_TIME - START_TIME))

echo "Execution Time: $EXECUTION_TIME seconds"
