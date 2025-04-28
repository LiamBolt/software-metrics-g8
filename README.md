# software-metrics-g8

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Homework Portal</h3>

  <p align="center">
    A web-based platform that facilitates homework distribution and management between teachers and parents in schools. The system provides secure role-based access, efficient file management, and streamlined communication channels.
    <br />
    <a href="https://github.com/LiamBolt/software-metrics-g8"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/LiamBolt/software-metrics-g8">View Demo</a>
    ·
    <a href="https://github.com/LiamBolt/software-metrics-g8/issues">Report Bug</a>
    ·
    <a href="https://github.com/LiamBolt/software-metrics-g8/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#core-features">Core Features</a></li>
    <li><a href="#software-metrics">Software Metrics</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#team-members">Team Members</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

The Homework Portal is a case study project for Software Metrics that demonstrates the application of various software quality metrics and best practices. This web-based platform facilitates homework distribution and management between teachers and parents in schools, providing secure role-based access, efficient file management, and streamlined communication channels.

### Built With

* [![Node.js][Node.js]][Node-url]
* [![Express][Express.js]][Express-url]
* [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
* [![HTML][HTML]][HTML-url]
* [![CSS][CSS]][CSS-url]
* [![JavaScript][JavaScript]][JavaScript-url]
* [![EJS][EJS]][EJS-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

* Node.js (v14.0.0 or higher)
* PostgreSQL (v12.0 or higher)
* Git

### Installation

#### Windows
1. Clone the repository
   ```bash
   git clone https://github.com/LiamBolt/software-metrics-g8.git
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
   git clone https://github.com/LiamBolt/software-metrics-g8.git
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
   git clone https://github.com/LiamBolt/software-metrics-g8.git
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

```
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=homework_portal
SESSION_SECRET=your_session_secret
PORT=3000
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CORE FEATURES -->
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

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SOFTWARE METRICS -->
## Software Metrics

This project implements various software metrics to track and enhance code quality. Each team member has focused on specific metrics from different lectures.

### Size Metrics (Lecture 5)

We've implemented code size metrics using a custom Python script (`metrics.py`) that calculates:

1. **Lines of Code (LOC)** - Measures different aspects of code size:
   - Physical LOC: Total number of lines in the file
   - Logical LOC: Number of statements (excluding comments and blank lines)
   - Comment LOC: Number of comment lines
   - Blank LOC: Number of blank lines

2. **Halstead Complexity Metrics** - Calculates software complexity based on:
   - Number of distinct operators (n1)
   - Number of distinct operands (n2)
   - Total occurrences of operators (N1)
   - Total occurrences of operands (N2)

   From these basic counts, we derive:
   - Program length (N): N1 + N2
   - Program vocabulary (n): n1 + n2
   - Volume (V): N × log2(n)
   - Difficulty (D): (n1/2) × (N2/n2)
   - Effort (E): D × V
   - Time to implement (T): E/18 seconds
   - Number of bugs (B): V/3000

#### Using the Metrics Script

To run the metrics analysis on the project:

```bash
python software-metrics/metrics.py --path ./path/to/source/files --format json
```

Options:
- `--path`: Directory containing source files to analyze
- `--format`: Output format (json, csv, or terminal)
- `--output`: Output file path (optional)
- `--exclude`: Directories to exclude (comma-separated)

#### Weekly Metrics Reporting

We track these metrics weekly to monitor code quality and complexity over time.

📌 **[View Weekly Metrics Report](software-metrics/WEEKLY_METRICS.md)**

### Other Implemented Metrics

- **Cohesion & Coupling** (Lecture 2) - [@Kashb-shielah](https://github.com/Kashb-shielah)
- **Function Point Analysis** (Lecture 3) - [@Nysonn](https://github.com/Nysonn) and [@LiamBolt](https://github.com/LiamBolt)
- **Cyclomatic Complexity** (Lecture 4) - [@Catherine-Arinaitwe722](https://github.com/Catherine-Arinaitwe722) and [@enockgeek](https://github.com/enockgeek)
- **Object-Oriented Metrics** (Lecture 6) - [@Precious187](https://github.com/Precious187)
- **Reliability Metrics** (Lecture 7) - [@LiamBolt](https://github.com/LiamBolt)
- **Testing Metrics** (Lecture 8) - [@Catherine-Arinaitwe722](https://github.com/Catherine-Arinaitwe722)
- **Maintainability Metrics** (Lecture 9) - [@Nysonn](https://github.com/Nysonn)
- **Security Metrics** (Lecture 10) - [@enockgeek](https://github.com/enockgeek)
- **Quality Models** (Lecture 11) - [@Hotchapu13](https://github.com/Hotchapu13)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Implement role-based authentication
- [x] Create homework upload/download functionality
- [x] Develop subject resource libraries
- [x] Implement software metrics tracking
- [ ] Add real-time notification system
- [ ] Implement gradebook feature
- [ ] Add parent-teacher messaging system

See the [open issues](https://github.com/LiamBolt/software-metrics-g8/issues) for a full list of proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TEAM MEMBERS -->
## Team Members

- [@LiamBolt](https://github.com/LiamBolt) - Lectures 3 & 7
- [@Kashb-shielah](https://github.com/Kashb-shielah) - Lecture 2
- [@Nysonn](https://github.com/Nysonn) - Lectures 3 & 9
- [@Catherine-Arinaitwe722](https://github.com/Catherine-Arinaitwe722) - Lectures 4 & 8
- [@enockgeek](https://github.com/enockgeek) - Lectures 4 & 10
- [@thefr3spirit](https://github.com/thefr3spirit) - Lecture 5
- [@Precious187](https://github.com/Precious187) - Lecture 6
- [@Hotchapu13](https://github.com/Hotchapu13) - Lecture 11

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* Our Software Metrics Dr. [@kimrichies](https://github.com/kimrichies) for providing the materials and mentorship

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/LiamBolt/software-metrics-g8.svg?style=for-the-badge
[contributors-url]: https://github.com/LiamBolt/software-metrics-g8/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/LiamBolt/software-metrics-g8.svg?style=for-the-badge
[forks-url]: https://github.com/LiamBolt/software-metrics-g8/network/members
[stars-shield]: https://img.shields.io/github/stars/LiamBolt/software-metrics-g8.svg?style=for-the-badge
[stars-url]: https://github.com/LiamBolt/software-metrics-g8/stargazers
[issues-shield]: https://img.shields.io/github/issues/LiamBolt/software-metrics-g8.svg?style=for-the-badge
[issues-url]: https://github.com/LiamBolt/software-metrics-g8/issues
[license-shield]: https://img.shields.io/github/license/LiamBolt/software-metrics-g8.svg?style=for-the-badge
[license-url]: https://github.com/LiamBolt/software-metrics-g8/blob/main/LICENSE.txt
[Node.js]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[Express.js]: https://img.shields.io/badge/Express.js-404D59?style=for-the-badge
[Express-url]: https://expressjs.com/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[HTML]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML-url]: https://developer.mozilla.org/en-US/docs/Web/HTML
[CSS]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS-url]: https://developer.mozilla.org/en-US/docs/Web/CSS
[JavaScript]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[EJS]: https://img.shields.io/badge/EJS-A91E50?style=for-the-badge
[EJS-url]: https://ejs.co/
