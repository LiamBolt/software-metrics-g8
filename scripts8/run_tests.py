import subprocess

# Function to run unit tests and generate coverage report
def run_tests_with_coverage():
    print("Running tests with coverage...")

    # Install pytest and pytest-cov
    print("Installing pytest and pytest-cov...")
    subprocess.run(["pip", "install", "pytest", "pytest-cov"], check=True)

    # Run tests with coverage
    print("Running pytest with coverage...")
    result = subprocess.run(
        ["pytest", "--cov=src", "tests/"],
        capture_output=True,
        text=True
    )

    # Print the test results and coverage report
    print(result.stdout)

# Run the tests with coverage
if __name__ == "__main__":
    run_tests_with_coverage()
