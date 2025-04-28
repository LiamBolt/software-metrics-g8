Homework Portal: Teacher Upload Feature Summary
This readme explains how the Teacher Upload functionality in a Homework Portal project aligns with the Goal-Question-Metric (GQM) framework from SENG 421. It breaks down the feature into:

Business Goal: Ensure reliable and timely distribution of homework PDFs from teachers to parents.
Questions to assess success:

Are teachers able to upload PDFs without errors?
Are only valid PDF files accepted?
Is each uploaded file properly logged and stored with metadata?


Metrics for measurement:

Upload Availability: % of successful upload requests
Upload Integrity: % of uploads with proper PDF MIME type
Storage Traceability: Number of database records per upload attempt


Implementation using Multer middleware to:

Store uploaded files in the uploads/ directory
Filter to accept only PDFs
Limit file size to 5MB
Record file data in a homework database table


Data Collection through SQL queries to track success rates and performance