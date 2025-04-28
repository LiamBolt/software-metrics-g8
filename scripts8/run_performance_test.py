import subprocess
import time

# Function to run the performance test
def run_performance_test():
    print("Running performance test...")

    # Get the current time (start time)
    start_time = time.time()

    # Specify the path to the Python script you want to run
    script_path = r'C:\Users\FAPO FLINT COMPUTERS\software-metrics-g8\scripts8\run_performance_test.py'  # Update this with the correct script

    # Execute the script using subprocess (equivalent to running the command in bash)
    result = subprocess.run(
        ['python', script_path],  # Run the Python script
        capture_output=True,  # Capture output (stdout and stderr)
        text=True  # Get the output as a string (not bytes)
    )

    # Check if the process was successful
    if result.returncode == 0:
        print("Script executed successfully.")
    else:
        print(f"Error during execution: {result.stderr}")

    # Get the end time
    end_time = time.time()

    # Calculate execution time
    execution_time = end_time - start_time
    print(f"Execution Time: {execution_time:.2f} seconds")

# Run the performance test
if __name__ == "__main__":
    run_performance_test()
