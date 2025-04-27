import git
import csv
import os
from datetime import datetime

OUTPUT_FOLDER = "metrics"
OUTPUT_FILE = os.path.join(OUTPUT_FOLDER, "process_metrics.csv")

def main():
    # Create output folder if it doesn't exist
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    # Open the current repository (assumes the script is run from the repo root)
    repo = git.Repo(".")
    
    # Get commits from the main branch (adjust branch name if necessary)
    commits = list(repo.iter_commits("main"))
    
    with open(OUTPUT_FILE, mode="w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["commit_hash", "date", "author", "lines_added", "lines_deleted", "files_changed"])
        
        for commit in commits:
            commit_hash = commit.hexsha
            commit_date = datetime.fromtimestamp(commit.committed_date).strftime("%Y-%m-%d %H:%M:%S")
            author = commit.author.name
            stats = commit.stats.total
            lines_added = stats.get("insertions", 0)
            lines_deleted = stats.get("deletions", 0)
            files_changed = stats.get("files", 0)
            
            writer.writerow([commit_hash, commit_date, author, lines_added, lines_deleted, files_changed])
    
    print(f"Process metrics saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
