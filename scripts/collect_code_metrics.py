import os
import json
import csv
import subprocess

# Set the folder where your source code is stored.
# Change "src" to the appropriate folder if needed.
SOURCE_FOLDER = "public"
OUTPUT_FOLDER = "metrics"
OUTPUT_FILE = os.path.join(OUTPUT_FOLDER, "code_metrics.csv")

def run_radon(command, target):
    """
    Runs a radon command (raw, cc, or mi) on the target folder/file.
    Returns the parsed JSON output.
    """
    cmd = ["python", "-m", "radon", command, "-j", target]
    try:
        result = subprocess.check_output(cmd, universal_newlines=True)
        return json.loads(result)
    except subprocess.CalledProcessError as e:
        print(f"Error running radon {command} on {target}: {e}")
        return {}

def main():
    # Create output folder if it doesn't exist
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    # Run radon commands on the source folder
    raw_metrics = run_radon("raw", SOURCE_FOLDER)
    cc_metrics = run_radon("cc", SOURCE_FOLDER)
    mi_metrics = run_radon("mi", SOURCE_FOLDER)

    with open(OUTPUT_FILE, mode="w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["filename", "loc", "lloc", "comments", "avg_cyclomatic_complexity", "maintainability_index"])
        
        # Loop through each file that radon analyzed (keys are file paths)
        for filename in raw_metrics:
            raw_data = raw_metrics.get(filename, {})
            loc = raw_data.get("loc", "N/A")
            lloc = raw_data.get("lloc", "N/A")
            comments = raw_data.get("comments", "N/A")
            
            # Calculate average cyclomatic complexity for the file
            cc_data = cc_metrics.get(filename, [])
            if cc_data:
                avg_cc = sum(item["complexity"] for item in cc_data) / len(cc_data)
                avg_cc = round(avg_cc, 2)
            else:
                avg_cc = "N/A"
            
            # Get maintainability index
            mi_data = mi_metrics.get(filename, {})
            mi = mi_data.get("mi", "N/A")
            if mi != "N/A":
                mi = round(mi, 2)
            
            writer.writerow([filename, loc, lloc, comments, avg_cc, mi])
    
    print(f"Code metrics saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()