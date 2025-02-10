import os
import time
import shutil
import logging
from datetime import datetime

class HomeworkUploadTester:
    def __init__(self, base_url='http://localhost:3000'):
        self.base_url = base_url
        self.source_dir = r'C:\Users\NYSON\Desktop\myfiles'
        self.dest_dir = r'C:\Users\NYSON\Desktop\software-metrics-g8\uploads'
        self.test_output = 'test_output.txt'
        self.weekly_metrics_file = 'WEEKLY_METRICS.txt'
        
        # Setup logging to record test details
        logging.basicConfig(
            filename=self.test_output,
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def analyze_files(self):
        """Analyze files in the source directory, copy them to the uploads folder,
        and log performance metrics."""
        try:
            if not os.path.exists(self.source_dir):
                self.logger.error(f"Source directory {self.source_dir} does not exist!")
                return
                
            if not os.path.exists(self.dest_dir):
                os.makedirs(self.dest_dir)
                
            files = os.listdir(self.source_dir)
            total_size = 0
            file_count = 0
            start_time = time.time()
            
            self.logger.info(f"Starting file analysis from {self.source_dir}")
            self.logger.info("=" * 50)
            
            for file in files:
                if file.endswith(('.pdf', '.doc', '.docx')):
                    file_path = os.path.join(self.source_dir, file)
                    file_size = os.path.getsize(file_path)
                    total_size += file_size
                    file_count += 1
                    
                    # Copy file to uploads directory and measure time taken
                    try:
                        dest_path = os.path.join(self.dest_dir, file)
                        copy_start = time.time()
                        shutil.copy2(file_path, dest_path)
                        copy_time = time.time() - copy_start
                        
                        self.logger.info(f"""
File: {file}
Size: {file_size / 1024:.7f} KB
Copy Time: {copy_time:.7f} seconds
Status: Successfully copied
""")
                    except Exception as e:
                        self.logger.error(f"Failed to copy {file}: {str(e)}")
            
            total_time = time.time() - start_time
            avg_time = total_time / file_count if file_count > 0 else 0
            
            # Generate performance summary
            summary = f"""
Performance Test Summary
=======================
Total Files Processed: {file_count}
Total Size: {total_size / 1024:.7f} KB
Total Time: {total_time:.7f} seconds
Average Time per File: {avg_time:.2f} seconds
Average Speed: {(total_size / 1024) / total_time:.2f} KB/s
"""
            self.logger.info(summary)
            
            # Append summary to the test output file
            with open(self.test_output, 'a') as f:
                f.write("\n" + "=" * 50 + "\n")
                f.write(f"Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(summary)
            
            # Generate and append the weekly metrics report
            self.generate_weekly_metrics_report(file_count, total_size, total_time, avg_time)
            
        except Exception as e:
            self.logger.error(f"Analysis failed: {str(e)}")
            
    def generate_weekly_metrics_report(self, file_count, total_size, total_time, avg_time):
        """Generate a weekly metrics report and append it to the metrics file."""
        current_date = datetime.now().strftime('%Y-%m-%d')
        weekly_report = f"""
## That Week: {current_date}
**Key Contributions:**
- Uploaded {file_count} files from 'myfiles' to 'uploads'.
- Automated performance testing of the file upload process.

**Applied Metrics:**
- Total Files Processed: {file_count}
- Total Size: {total_size / 1024:.7f} KB
- Total Time: {total_time:.7f} seconds
- Average Time per File: {avg_time:.2f} seconds
- Average Upload Speed: {(total_size / 1024) / total_time:.2f} KB/s

**Challenges & Solutions:**
- Implemented error handling during file copy operations.
- Ensured directory existence and optimized file processing.

---
This report is a collaborative effort by the group. Each team member is encouraged to update their section weekly using this template.
"""
        # Append the weekly report to the metrics file
        with open(self.weekly_metrics_file, 'a') as wf:
            wf.write(weekly_report)
            
        self.logger.info("Weekly metrics report generated and appended to the metrics file.")

if __name__ == "__main__":
    tester = HomeworkUploadTester()
    tester.analyze_files()
