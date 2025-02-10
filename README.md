# software-metrics-g8

# Homework Portal

A Homework Portal to be used as a case study in Software Metrics.
A web-based platform that facilitates homework distribution and management between teachers and parents in schools. The system provides secure role-based access, efficient file management, and streamlined communication channels.

## Core Features

### 1. Role-Based Access Control
- **Three distinct user roles**: Admin, Teachers, and Parents
- Secure authentication using bcrypt password hashing
- Protected routes based on user roles
- Admin dashboard for user management

### 2. Homework Management
- Teachers can upload homework assignments (PDF format)
- Parents can download assignments for their children
- Organized by grade level (Primary 1-4) and subjects
- Automatic weekly reset of assignments

### 3. Subject Resources
- Dedicated sections for each subject:
  - Mathematics
  - English
  - Science
  - Social Studies
- Grade-specific resource libraries
- Easy navigation between different subjects and grades

## Technical Implementation

### Security
- Session-based authentication
- Password encryption
- Input validation
- Protected file uploads
- Role-based middleware

### Database
- PostgreSQL for data persistence
- Efficient query optimization
- Structured tables for:
  - User management
  - Homework uploads
  - Subject resources

### Interface
- Responsive web design
- Intuitive navigation
- Clear user feedback
- Mobile-friendly layout

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: Bcrypt
- **File Handling**: Multer
- **Template Engine**: EJS

## Performance Optimization
- Efficient file storage system
- Optimized database queries
- Caching strategies
- Scalable architecture


## Getting Started

### Prerequisites
- Node.js (v14.0.0 or higher)
- PostgreSQL (v12.0 or higher)
- Git

### Installation Steps

#### Windows
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/software-metrics-g8.git
   cd software-metrics-g8
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
4. Create a new database named 'homework_portal'
5. Copy `.env.example` to `.env` and update the values
6. Start the application
   ```bash
   npm start
   ```

#### macOS
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/software-metrics-g8.git
   cd software-metrics-g8
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Install PostgreSQL using Homebrew
   ```bash
   brew install postgresql
   brew services start postgresql
   ```
4. Create a new database named 'homework_portal'
5. Copy `.env.example` to `.env` and update the values
6. Start the application
   ```bash
   npm start
   ```

#### Linux (Ubuntu/Debian)
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/software-metrics-g8.git
   cd software-metrics-g8
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Install PostgreSQL
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```
4. Create a new database named 'homework_portal'
5. Copy `.env.example` to `.env` and update the values
6. Start the application
   ```bash
   npm start
   ```

## Environment Variables
Create a `.env` file in the root directory with the following variables:


## Software Metrics & Progress Tracking

To ensure continuous improvement and maintain software quality, we track key software metrics weekly. Each team member is responsible for updating their progress in the metrics report.

📌 **[View Weekly Metrics Report](software-metrics/WEEKLY_METRICS.md)**



---


## How to Run the Test Script

1. **Setup Directories:**  
   Ensure that:
   - Your source files are located in the `myfiles` directory.
   - The destination `uploads` directory exists (the script will create it if not).

2. **Update Paths (if necessary):**  
   Modify the paths in the script (`source_dir` and `dest_dir`) to match your local setup.

3. **Run the Script:**  
   Execute the script using Python:
   ```bash
   python upload_test.py

