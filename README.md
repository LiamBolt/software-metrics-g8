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
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL database
4. Configure environment variables
5. Run the application: `npm start`

## Environment Variables
