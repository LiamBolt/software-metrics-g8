# Software Metrics: Lecture 10 Implementation - Black Box Testing

## Concept Applied
**Black Box Testing with Test Case Definition** 

## Feature Tested
**Role-Based Access Control (Login Functionality)**  
The login feature allows users (Admin, Teacher, Parent) to access role-specific dashboards by entering their credentials.

## Use Case
**User logs in to the Homework Portal with valid or invalid credentials.**  
- **Actors**: Admin, Teacher, Parent  
- **Description**: A user enters their username (email) and password to access their role-specific dashboard (e.g., Teacher dashboard for homework uploads).

## Test Cases

### Test Case 1: Valid Login (Teacher)
- **Inputs**: Username = `teacher1@example.com`, Password = `correctpass`
- **Execution Conditions**: User is not logged in, PostgreSQL database is active, session-based authentication is enabled.
- **Expected Result**: User is redirected to the Teacher dashboard (e.g., `/teacher/dashboard`), and the page displays homework upload options.
- **Result**: Pass - Redirected to `/teacher/dashboard`, homework upload form displayed.

### Test Case 2: Invalid Password
- **Inputs**: Username = `teacher1@example.com`, Password = `wrongpass`
- **Execution Conditions**: User is not logged in, PostgreSQL database is active.
- **Expected Result**: Error message displayed (e.g., “Invalid credentials”) on the login page, no access granted.
- **Result**: Pass - “Invalid credentials” message shown, remained on login page.

### Test Case 3: Empty Fields
- **Inputs**: Username = `""`, Password = `""`
- **Execution Conditions**: User is not logged in, input validation is active.
- **Expected Result**: Error message displayed (e.g., “Fields cannot be empty”) on the login page, no access granted.
- **Result**: Pass - “Fields cannot be empty” message shown, remained on login page.

## Testing Method
Manual black box testing was performed by interacting with the login page of the Homework Portal, verifying functionality without inspecting the internal code structure, as per Lecture 10 (Page 3).

## Notes
- Testing was conducted on April 27, 2025.
- No bugs were found during testing.
- Future work: Add regression tests for any bug fixes, as suggested in Lecture 10.