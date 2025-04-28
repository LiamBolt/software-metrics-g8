import os
import math
from pathlib import Path

class COCOMOEstimator:
    def __init__(self):
        # Since script is in scripts folder, navigate to project root
        self.script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        self.project_root = self.script_dir.parent
        
        # Define output directory for metrics
        self.metrics_dir = self.project_root / "metrics"
        
        # Create metrics directory if it doesn't exist
        os.makedirs(self.metrics_dir, exist_ok=True)
        
        # Define file extensions for each component category
        self.backend_extensions = {'.js'}  # Node.js/Express files
        self.frontend_extensions = {'.html', '.ejs', '.css'}  # Frontend files
        self.database_extensions = {'.sql'}  # Database files
        
        # Exclude directories that shouldn't be counted
        self.exclude_dirs = {'node_modules', '.git', '__pycache__', 'dist', 'build', 'scripts', 'metrics'}
        
        # Initialize counters for each component
        self.backend_loc = 0
        self.frontend_loc = 0
        self.database_loc = 0

    def count_file_lines(self, file_path):
        """Count non-empty, non-comment lines in a file."""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                # Count non-empty and non-comment lines
                lines = [line.strip() for line in file.readlines()]
                code_lines = [line for line in lines 
                            if line and not line.startswith('//') 
                            and not line.startswith('/*') 
                            and not line.startswith('*') 
                            and not line.startswith('*/') 
                            and not line.startswith('#')]
                return len(code_lines)
        except Exception as e:
            print(f"Error reading file {file_path}: {str(e)}")
            return 0

    def categorize_and_count(self):
        """Traverse the project and count lines of code for each category."""
        print("Analyzing project structure and counting lines of code...")
        print(f"Project root: {self.project_root}")
        
        # Key directories to check
        key_directories = [
            self.project_root / "public",
            self.project_root / "views",
            self.project_root
        ]
        
        # Process each directory
        for directory in key_directories:
            print(f"Scanning directory: {directory}")
            if not directory.exists():
                print(f"Directory {directory} not found. Skipping...")
                continue
                
            for root, dirs, files in os.walk(directory):
                # Skip excluded directories
                dirs[:] = [d for d in dirs if d not in self.exclude_dirs]
                
                path = Path(root)
                
                for file in files:
                    file_path = path / file
                    extension = file_path.suffix.lower()
                    
                    # Skip non-code files
                    if not extension or extension not in (self.backend_extensions | self.frontend_extensions | self.database_extensions):
                        continue
                    
                    # Count lines in the file
                    loc = self.count_file_lines(file_path)
                    
                    # Categorize based on file extension and location
                    if extension in self.backend_extensions:
                        # Check if it's not in a frontend directory
                        if not any(frontend_dir in str(file_path).lower() for frontend_dir in ['public', 'views']):
                            self.backend_loc += loc
                            print(f"Backend: {file_path.relative_to(self.project_root)} - {loc} lines")
                    elif extension in self.frontend_extensions:
                        # Check if it's in a frontend directory
                        if any(frontend_dir in str(file_path).lower() for frontend_dir in ['public', 'views']):
                            self.frontend_loc += loc
                            print(f"Frontend: {file_path.relative_to(self.project_root)} - {loc} lines")
                    elif extension in self.database_extensions:
                        self.database_loc += loc
                        print(f"Database: {file_path.relative_to(self.project_root)} - {loc} lines")

    def calculate_cocomo(self):
        """Calculate COCOMO metrics."""
        # Calculate total LOC and KLOC
        total_loc = self.backend_loc + self.frontend_loc + self.database_loc
        kloc = total_loc / 1000
        
        # Apply Basic COCOMO model for organic mode: Effort = 2.4 * (KLOC)^1.05
        effort = 2.4 * (kloc ** 1.05)
        
        return total_loc, kloc, effort

    def generate_report(self):
        """Generate the COCOMO analysis report."""
        total_loc, kloc, effort = self.calculate_cocomo()
        
        report = f"""
COCOMO Analysis Report for Primary School Homework Portal
========================================================

COCOMO Model Explanation:
------------------------
The Constructive Cost Model (COCOMO) is a procedural software cost estimation model.
This analysis uses the Basic COCOMO model for organic mode projects.
The formula used is: Effort = 2.4 * (KLOC)^1.05
where KLOC is thousands of lines of code and Effort is in person-months.

Lines of Code Breakdown:
----------------------
Backend (Node.js/Express): {self.backend_loc:,} lines
Frontend (HTML/CSS/JS): {self.frontend_loc:,} lines
Database (SQL): {self.database_loc:,} lines

Total Metrics:
-------------
Total Lines of Code: {total_loc:,}
KLOC (Thousands of Lines of Code): {kloc:.2f}
Estimated Effort: {effort:.2f} person-months

Note: This estimation assumes:
- Organic mode (relatively small team, good development environment)
- Familiar development environment
- Medium project constraints
"""
        return report

def main():
    # Initialize estimator
    estimator = COCOMOEstimator()
    
    # Count lines of code
    estimator.categorize_and_count()
    
    # Generate and save report
    print("\nGenerating COCOMO analysis report...")
    report = estimator.generate_report()
    
    # Save to file in metrics directory
    output_file = estimator.metrics_dir / 'cocomo_analysis.txt'
    with open(output_file, 'w') as f:
        f.write(report)
    
    print(f"Analysis complete! Results saved to {output_file}")
    print("\nSummary:")
    print(f"Backend LOC: {estimator.backend_loc:,}")
    print(f"Frontend LOC: {estimator.frontend_loc:,}")
    print(f"Database LOC: {estimator.database_loc:,}")
    
    total_loc, kloc, effort = estimator.calculate_cocomo()
    print(f"Total LOC: {total_loc:,}")
    print(f"KLOC: {kloc:.2f}")
    print(f"Estimated Effort: {effort:.2f} person-months")

if __name__ == "__main__":
    main()