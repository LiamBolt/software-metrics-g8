import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import crypto from 'crypto';
import multer from "multer";
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

dotenv.config();

const port = 3000;
// const host = '192.168.88.163';
const app = express();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Connect to the PostgreSQL database
db.connect();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Define storage settings for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the destination directory for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Save the file with its original name
  }
});

// File filter to accept only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only PDF files are allowed!'), false); // Reject the file
  }
};

// Initialize multer with the specified storage and file filter
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
});

//COOKIE SESSION
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  rolling: true, // Reset expiration on each request
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

//MIDDLEWARE TO CHECK THE ROLE OF THE USER


// General role-checking middleware
function hasRole(allowedRoles) {
  return function (req, res, next) {
    console.log("User role in session:", req.session.role);

    // Check if the user's role is in the list of allowed roles
    if (allowedRoles.includes(req.session.role)) {
      return next();
    } else {
      return res.status(403).send('Access denied.');
    }
  };
}

// Middleware to check if the user is a teacher (admin also has access)
const isTeacher = hasRole(['teacher', 'admin']);

// Middleware to check if the user is a parent (admin also has access)
const isParent = hasRole(['parent', 'admin']);

// Middleware to check if the user is an admin
const isAdmin = hasRole(['admin']);


// GET ROUTE FOR SIGN-UP
app.get('/sign-up', (req, res) => {
  res.render('sign-up'); 
});

// POST ROUTE FOR SIGN-UP
app.post('/signup', async (req, res) => {
  const { username, role, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, role, password) 
      VALUES ($1, $2, $3) RETURNING id;
    `;
    const values = [username, role, hashedPassword];

    const result = await db.query(query, values);

    res.redirect('/login');
  } catch (err) {
    console.error('Error inserting user into the database:', err);
    res.status(500).send('Server error');
  }
});

// GET ROUTE FOR LOGIN
app.get('/login', (req, res) => {
  res.render('login'); 
});

// POST ROUTE FOR LOGIN WITH ROLE CHECK
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const query = `SELECT * FROM users WHERE username = $1`;
    const result = await db.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(400).send('Invalid username or password.');
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send('Invalid username or password.');
    }

    // Store user role and ID in session
    req.session.userId = user.id;
    req.session.role = user.role.toLowerCase();  // Case-insensitive role checking

     // Log the session details for debugging
     console.log('User logged in:', {
      id: req.session.userId,
      role: req.session.role
    });

    // Redirect based on role
    if (req.session.role === 'teacher') {
      return res.redirect('/teachers');
    } else if (req.session.role === 'parent') {
      return res.redirect('/parents');
    } else if (req.session.role === 'admin') {
      return res.redirect('/admin');
    } else {
      return res.status(400).send('User role not recognized.');
    }

  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).send('Server error');
  }
});


// GET ROUTE FOR TEACHER'S DASHBOARD
app.get('/teachers', isTeacher, async (req, res) => {
  try {
    // Retrieve homework uploads from the database specific to the teacher if needed
    const query = `SELECT * FROM primary_one_mathematics_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('teachers', {
      uploadedHomework: result.rows,
      success: req.query.success,
      userRole: req.session.role
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// GET ROUTE FOR THE PARENT DASHBOARD
app.get('/parents', isParent, async (req, res) => {
  try {
    // Parents might want to see all homework uploads
    const query = `SELECT * FROM primary_one_mathematics_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('parents', {
      uploadedHomework: result.rows,
      success: req.query.success,
      userRole: req.session.role
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// GET ROUTE FOR THE DOWNLOAD HOMEWORK
app.get('/download_homework', async (req, res) => {
  res.render('download_homework'); 
});

// POST ROUTE FOR DOWNLOADING THE HOMEWORK
app.post('/download-homework', (req, res) => {
  const filePath = req.body.filePath;

  // Log the file path received
  console.log('File path received for download:', filePath);

  // Get the absolute path of the file
  const absolutePath = path.join(__dirname, filePath);

  // Check if the file exists
  fs.access(absolutePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', err);
      return res.status(404).send('File not found');
    }

    // Set the content type to application/pdf
    res.setHeader('Content-Type', 'application/pdf');

    // If file exists, send it for download
    res.download(absolutePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        return res.status(500).send('Error downloading file');
      }
    });
  });
});


// PRIMARY ONE TEACHERS UPLOAD ROUTES FOR ALL FOUR SUBJECTS


//GET ROUTE FOR PRIMARY ONE SELECT SUBJECTS (TEACHERS)
app.get('/primary-one-subjects-select',isTeacher, async (req, res) => {
  res.render('primary-one', {
    userRole: req.session.role
  });
});

//GET ROUTE FOR PRIMARY ONE SELECT SUBJECTS (PARENTS)
app.get('/primary-one-subjects-select-parents', isParent ,async (req, res) => {
  res.render('download-primary-one', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR PRIMARY ONE MATH UPLOAD HOMEWORK (TEACHERS)
app.get('/upload-math-primary-one', isTeacher, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_one_mathematics_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-one-math-homework', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY ONE MATH DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-math-primary-one', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_one_mathematics_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-one-math-homework', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY ONE MATH UPLOAD HOMEWORK
app.post('/upload-mathematics-homework', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_one_mathematics_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-math-primary-one?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY ONE ENGLISH UPLOAD HOMEWORK
app.get('/upload-eng-primary-one', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_one_english_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-one-eng-homework', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY ONE ENGLISH DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-eng-primary-one', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_one_english_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-one-eng-homework', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY ONE ENGLISH UPLOAD HOMEWORK
app.post('/upload-english-homework', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_one_english_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-eng-primary-one?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY ONE SCIENCE UPLOAD HOMEWORK
app.get('/upload-sci-primary-one', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_one_science_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-one-sci-homework', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY ONE SCIENCE DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-sci-primary-one', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_one_science_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-one-sci-homework', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY ONE SCIENCE UPLOAD HOMEWORK
app.post('/upload-science-homework', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_one_science_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-sci-primary-one?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY ONE SST UPLOAD HOMEWORK
app.get('/upload-sst-primary-one', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_one_social_studies_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-one-sst-homework', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY ONE SST DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-sst-primary-one', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_one_social_studies_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-one-sst-homework', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY ONE SST UPLOAD HOMEWORK
app.post('/upload-sst-homework', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_one_social_studies_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-sst-primary-one?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});


// PRIMARY TWO TEACHERS UPLOAD ROUTES FOR ALL FOUR SUBJECTS

//GET ROUTE FOR PRIMARY TWO SELECT SUBJECTS(TEACHERS)
app.get('/primary-two-subjects-select', isTeacher, async (req, res) => {
  res.render('primary-two', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR PRIMARY TWO SELECT SUBJECTS (PARENTS)
app.get('/primary-two-subjects-select-parents',isParent, async (req, res) => {
  res.render('download-primary-two', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR PRIMARY TWO ENGLISH UPLOAD HOMEWORK
app.get('/upload-eng-primary-two', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_two_english_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-two-eng-homework', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY TWO ENGLISH DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-eng-primary-two', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_two_english_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-two-eng-homework', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY TWO ENGLISH UPLOAD HOMEWORK
app.post('/upload-eng-homework-primary-two', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_two_english_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-eng-primary-two?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY TWO MATHEMATICS UPLOAD HOMEWORK
app.get('/upload-math-primary-two', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_two_mathematics_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-two-math-homework', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY TWO MATHEMATICS DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-math-primary-two', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_two_mathematics_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-two-math-homework', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY TWO MATHEMATICS UPLOAD HOMEWORK
app.post('/upload-math-homework-primary-two', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_two_mathematics_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-math-primary-two?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});


//GET ROUTE FOR PRIMARY TWO SCIENCE UPLOAD HOMEWORK
app.get('/upload-sci-primary-two', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_two_science_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-two-sci-homework', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY TWO SCIENCE DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-sci-primary-two', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_two_science_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-two-sci-homework', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY TWO SCIENCE UPLOAD HOMEWORK
app.post('/upload-sci-homework-primary-two', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_two_science_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-sci-primary-two?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY TWO SOCIAL STUDIES UPLOAD HOMEWORK
app.get('/upload-sst-primary-two', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_two_social_studies_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-two-sst-homework', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY TWO SOCIAL STUDIES DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-sst-primary-two', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_two_social_studies_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-two-sst-homework', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY TWO SOCIAL STUDIES UPLOAD HOMEWORK
app.post('/upload-sst-homework-primary-two', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_two_social_studies_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-sst-primary-two?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

// PRIMARY THREE TEACHERS UPLOAD ROUTES FOR ALL FOUR SUBJECTS

//GET ROUTE FOR PRIMARY THREE SELECT SUBJECTS(TEACHERS)
app.get('/primary-three-subjects-select', isTeacher, async (req, res) => {
  res.render('primary-three', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR PRIMARY THREE SELECT SUBJECTS (PARENTS)
app.get('/primary-three-subjects-select-parents', isParent, async (req, res) => {
  res.render('download-primary-three', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR PRIMARY THREE MATHEMATICS UPLOAD HOMEWORK
app.get('/upload-math-primary-three', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_three_mathematics_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-three-math', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY THREE MATHEMATICS DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-math-primary-three', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_three_mathematics_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-three-math', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY THREE MATHEMATICS UPLOAD HOMEWORK
app.post('/upload-math-homework-primary-three', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_three_mathematics_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-math-primary-three?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY THREE ENGLISH UPLOAD HOMEWORK
app.get('/upload-eng-primary-three', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_three_english_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-three-eng', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY THREE ENGLISH DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-eng-primary-three', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_three_english_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-three-eng', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY THREE ENGLISH UPLOAD HOMEWORK
app.post('/upload-eng-homework-primary-three', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_three_english_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-eng-primary-three?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY THREE SCIENCE UPLOAD HOMEWORK
app.get('/upload-sci-primary-three', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_three_science_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-three-sci', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY THREE SCIENCE DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-sci-primary-three', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_three_science_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-three-sci', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY THREE SCIENCE UPLOAD HOMEWORK
app.post('/upload-sci-homework-primary-three', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_three_science_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-sci-primary-three?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY THREE SOCIAL STUDIES UPLOAD HOMEWORK
app.get('/upload-sst-primary-three', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_three_social_studies_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-three-sst', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY THREE SST DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-sst-primary-three', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_three_social_studies_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-three-sst', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY THREE SOCIAL STUDIES UPLOAD HOMEWORK
app.post('/upload-sst-homework-primary-three', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_three_social_studies_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-sst-primary-three?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

// PRIMARY FOUR TEACHERS UPLOAD ROUTES FOR ALL FOUR SUBJECTS

//GET ROUTE FOR PRIMARY FOUR SELECT SUBJECTS (TEACHERS)
app.get('/primary-four-subjects-select', isTeacher, async (req, res) => {
  res.render('primary-four', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR PRIMARY FOUR SELECT SUBJECTS (PARENTS)
app.get('/primary-four-subjects-select-parents', isParent, async (req, res) => {
  res.render('download-primary-four', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR PRIMARY FOUR MATHEMATICS UPLOAD HOMEWORK
app.get('/upload-math-primary-four', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_four_mathematics_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-four-math', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY FOUR MATH DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-math-primary-four', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_four_mathematics_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-four-math', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY FOUR MATHEMATICS UPLOAD HOMEWORK
app.post('/upload-math-homework-primary-four', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_four_mathematics_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-math-primary-four?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY FOUR ENGLISH UPLOAD HOMEWORK
app.get('/upload-eng-primary-four', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_four_english_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-four-eng', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY FOUR ENGLISH DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-eng-primary-four', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_four_english_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-four-eng', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY FOUR ENGLISH UPLOAD HOMEWORK
app.post('/upload-eng-homework-primary-four', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_four_english_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-eng-primary-four?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY FOUR SCIENCE UPLOAD HOMEWORK
app.get('/upload-sci-primary-four', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_four_science_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-four-sci', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY FOUR SCIENCE DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-sci-primary-four', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_four_science_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-four-sci', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY FOUR SCIENCE UPLOAD HOMEWORK
app.post('/upload-sci-homework-primary-four', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_four_science_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-sci-primary-four?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY FOUR SOCIAL STUDIES UPLOAD HOMEWORK
app.get('/upload-sst-primary-four', async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_four_social_studies_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-four-sst', {
      uploadedHomework: result.rows, // Pass the uploaded homework data to the template
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

//GET ROUTE FOR PRIMARY FOUR SST DOWNLOAD HOMEWORK (PARENTS)
app.get('/download-sst-primary-four', isParent, async (req, res) => {
  try {
    // Retrieve homework uploads from the database
    const query = `SELECT * FROM primary_four_social_studies_homework_uploads ORDER BY upload_date DESC;`;
    const result = await db.query(query);

    res.render('upload-primary-four-sst', {
      uploadedHomework: result.rows, 
      success: req.query.success,
      userRole: req.session.role 
    });
  } catch (err) {
    console.error('Error fetching uploaded homework:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE FOR PRIMARY FOUR SOCIAL STUDIES UPLOAD HOMEWORK
app.post('/upload-sst-homework-primary-four', upload.single('homeworkFile'), async (req, res) => {
  const uploadDate = req.body.uploadDate;
  const filePath = req.file.path; // The path where the file is saved
  const originalFileName = req.file.originalname; // The original name of the uploaded file

  try {
    // Save the file information to the database
    const query = `
      INSERT INTO primary_four_social_studies_homework_uploads (upload_date, file_path, original_file_name)
      VALUES ($1, $2, $3);
    `;
    const values = [uploadDate, filePath, originalFileName];

    await db.query(query, values);

    // Redirect back to the upload page with a success message
    res.redirect('/upload-sst-primary-four?success=true');
  } catch (err) {
    console.error('Error uploading homework:', err);
    res.status(500).send('Server error');
  }
});

// ADMIN DASHBOARD

// Function to generate a secure random password
function generateSecurePassword() {
  return crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
}

// GET ROUTE FOR PASSWORD GENERATION
app.get('/generate-password', (req, res) => {
  const password = generateSecurePassword();
  res.json({ password });
});

// GET ROUTE FOR ADMIN DASHBOARD
app.get('/admin', isAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    const users = result.rows;

    res.render('admin-dashboard', { users, generatedPassword: '' }); // No password initially
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server error');
  }
});

// Set up Nodemailer transporter with Gmail using .env variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Gmail address from .env
    pass: process.env.GMAIL_PASS, // Gmail App Password from .env
  },
});

// Function to send an email using Nodemailer
function sendEmail(email, username, generatedPassword) {
  const mailOptions = {
    from: '"Your App" <' + process.env.GMAIL_USER + '>', // Sender address
    to: email, // Recipient's email
    subject: 'Your Login Details',
    text: `Hello ${username},\n\nHere are your login details:\n\nUsername: ${username}\nPassword: ${generatedPassword}\n\nFeel free to access our resources.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email with Nodemailer:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
}

// POST route for adding a new user
app.post('/admin/add-user', isAdmin, async (req, res) => {
  const { username, role, email } = req.body;

  // Generate a random password
  const generatedPassword = generateSecurePassword();

  try {
    // Hash the generated password before saving to the DB
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Save the user to the database
    const query = `INSERT INTO users (username, role, password) VALUES ($1, $2, $3) RETURNING id;`;
    const values = [username, role, hashedPassword];
    await db.query(query, values);

    // Send the email to the user using Nodemailer
    sendEmail(email, username, generatedPassword);

    // Redirect back to the admin dashboard
    res.redirect('/admin');
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).send('Server error');
  }
});

// POST ROUTE TO DELETE A USER
app.post('/admin/delete-user/:id', isAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
    const query = 'DELETE FROM users WHERE id = $1';
    await db.query(query, [userId]);

    res.redirect('/admin');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send('Server error');
  }
});

//SUBJECT RESOURCES PRIMARY ONE

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY ONE MATH (TEACHERS)
app.get('/subjectresources-primary-one-math', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-one-math', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY ONE MATH (PARENTS)
app.get('/subjectresources-primary-one-math-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-one-math-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY ONE ENG (TEACHERS)
app.get('/subjectresources-primary-one-eng', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-one-eng', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY ONE ENG (PARENTS)
app.get('/subjectresources-primary-one-eng-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-one-eng-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY ONE SCI (TEACHERS)
app.get('/subjectresources-primary-one-sci', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-one-sci', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY ONE SCI (PARENTS)
app.get('/subjectresources-primary-one-sci-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-one-sci-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY ONE SST (TEACHERS)
app.get('/subjectresources-primary-one-sst', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-one-sst', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY ONE SST (PARENTS)
app.get('/subjectresources-primary-one-sst-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-one-sst-parent', {
    userRole: req.session.role
  }); 
});


//SUBJECT RESOURCES PRIMARY TWO

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY TWO MATH (TEACHERS)
app.get('/subjectresources-primary-two-math', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-two-math', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY TWO MATH (PARENTS)
app.get('/subjectresources-primary-two-math-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-two-math-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY TWO ENG (TEACHERS)
app.get('/subjectresources-primary-two-eng', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-two-eng', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY TWO ENG (PARENTS)
app.get('/subjectresources-primary-two-eng-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-two-eng-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY TWO SCI (TEACHERS)
app.get('/subjectresources-primary-two-sci', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-two-sci', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY TWO SCI (PARENTS)
app.get('/subjectresources-primary-two-sci-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-two-sci-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY TWO SST (TEACHERS)
app.get('/subjectresources-primary-two-sst', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-two-sst', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY TWO SST (PARENTS)
app.get('/subjectresources-primary-two-sst-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-two-sst-parent', {
    userRole: req.session.role
  }); 
});

//SUBJECT RESOURCES PRIMARY THREE

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY THREE MATH (TEACHERS)
app.get('/subjectresources-primary-three-math', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-three-math', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY THREE MATH (PARENTS)
app.get('/subjectresources-primary-three-math-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-three-math-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY THREE ENG (TEACHERS)
app.get('/subjectresources-primary-three-eng', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-three-eng', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY THREE ENG (PARENTS)
app.get('/subjectresources-primary-three-eng-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-three-eng-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY THREE SCI (TEACHERS)
app.get('/subjectresources-primary-three-sci', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-three-sci', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY THREE SCI (PARENTS)
app.get('/subjectresources-primary-three-sci-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-three-sci-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY THREE SST (TEACHERS)
app.get('/subjectresources-primary-three-sst', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-three-sst', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY THREE SST (PARENTS)
app.get('/subjectresources-primary-three-sst-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-three-sst-parent', {
    userRole: req.session.role
  }); 
});

//SUBJECT RESOURCES PRIMARY FOUR

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY FOUR MATH (TEACHERS)
app.get('/subjectresources-primary-four-math', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-four-math', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY FOUR MATH (PARENTS)
app.get('/subjectresources-primary-four-math-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-four-math-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY FOUR ENG (TEACHERS)
app.get('/subjectresources-primary-four-eng', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-four-eng', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY FOUR ENG (PARENTS)
app.get('/subjectresources-primary-four-eng-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-four-eng-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY FOUR SCI (TEACHERS)
app.get('/subjectresources-primary-four-sci', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-four-sci', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY FOUR SCI (PARENTS)
app.get('/subjectresources-primary-four-sci-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-four-sci-parent', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY FOUR SST (TEACHERS)
app.get('/subjectresources-primary-four-sst', isTeacher, async (req, res) => {
  res.render('subjectresources-primary-four-sst', {
    userRole: req.session.role
  }); 
});

//GET ROUTE FOR SUBJECT RESOURCES PRIMARY FOUR SST (PARENTS)
app.get('/subjectresources-primary-four-sst-parent', isParent, async (req, res) => {
  res.render('sub-res-pri-four-sst-parent', {
    userRole: req.session.role
  }); 
});


// START THE SERVER
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

