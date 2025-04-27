#!/bin/bash
# Script to run unit tests and generate coverage report

echo "Running tests with coverage..."
pip install pytest pytest-cov

pytest --cov=src tests/
