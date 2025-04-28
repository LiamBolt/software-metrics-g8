import subprocess

# Function to run code quality analysis
def run_code_quality_analysis():
    print("Running code quality analysis...")

    # Install radon using pip
    print("Installing radon...")
    subprocess.run(["pip", "install", "radon"], check=True)

    # Cyclomatic Complexity Analysis
    print("Cyclomatic Complexity Analysis:")
    complexity_result = subprocess.run(
        ["radon", "cc", "src/", "-a"], capture_output=True, text=True
    )
    print(complexity_result.stdout)

    # Raw Metrics (Maintainability Index, Comments, LOC)
    print("Raw Metrics (Maintainability Index, Comments, LOC):")
    raw_metrics_result = subprocess.run(
        ["radon", "raw", "src/"], capture_output=True, text=True
    )
    print(raw_metrics_result.stdout)

# Run the code quality analysis
if __name__ == "__main__":
    run_code_quality_analysis()
