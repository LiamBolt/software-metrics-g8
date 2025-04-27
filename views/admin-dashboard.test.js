// Admin Dashboard - Unit Tests
// Using Jest and jsdom for testing the EJS template

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const fetchMock = require('jest-fetch-mock');

// Mock fetch API
fetchMock.enableMocks();

// Setup test environment
describe('Admin Dashboard Tests', () => {
  let dom;
  let window;
  let document;
  
  // Set up DOM before each test
  beforeEach(() => {
    // Load EJS as HTML (removing EJS tags for testing)
    const template = fs.readFileSync(path.resolve(__dirname, './admin-dashboard.ejs'), 'utf8')
      .replace(/<%=\s*(.*?)\s*%>/g, 'test-data') // Replace EJS variables
      .replace(/<%\s*(.*?)\s*%>/g, ''); // Remove EJS logic
    
    // Create a DOM environment
    dom = new JSDOM(template, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true
    });
    
    window = dom.window;
    document = window.document;
    
    // Mock fetch in the jsdom environment
    window.fetch = fetchMock;
  });
  
  // Reset fetch mocks after each test
  afterEach(() => {
    fetchMock.resetMocks();
  });
  
  // Test if the page loads correctly
  test('should load admin dashboard correctly', () => {
    expect(document.title).toBe('Admin Dashboard');
    expect(document.querySelector('.navbar h1').textContent).toBe('Admin Dashboard');
  });
  
  // Test navigation links
  test('should have correct navigation links', () => {
    const navLinks = document.querySelectorAll('.navbar ul li a');
    expect(navLinks.length).toBe(3);
    expect(navLinks[0].getAttribute('href')).toBe('/admin');
    expect(navLinks[1].getAttribute('href')).toBe('/teachers');
    expect(navLinks[2].getAttribute('href')).toBe('/parents');
  });
  
  // Test form elements
  test('should have a user form with correct fields', () => {
    const form = document.querySelector('form[action="/admin/add-user"]');
    expect(form).not.toBeNull();
    
    expect(document.getElementById('username')).not.toBeNull();
    expect(document.getElementById('role')).not.toBeNull();
    expect(document.getElementById('email')).not.toBeNull();
    expect(document.getElementById('password')).not.toBeNull();
  });
  
  // Test password field attributes
  test('password field should be readonly', () => {
    const passwordField = document.getElementById('password');
    expect(passwordField.getAttribute('readonly')).not.toBeNull();
  });
  
  // Test dropdown options
  test('role dropdown should have correct options', () => {
    const roleSelect = document.getElementById('role');
    const options = roleSelect.querySelectorAll('option');
    
    expect(options.length).toBe(3);
    expect(options[0].value).toBe('Admin');
    expect(options[1].value).toBe('Teacher');
    expect(options[2].value).toBe('Parent');
  });
  
  // Test password generation function
  test('generatePassword function should fetch and update password field', async () => {
    // Mock the fetch response
    fetchMock.mockResponseOnce(JSON.stringify({ password: 'test-password-123' }));
    
    // Manually call the generatePassword function
    await window.generatePassword();
    
    // Verify fetch was called correctly
    expect(fetchMock).toHaveBeenCalledWith('/generate-password');
    
    // Check if password field was updated
    const passwordField = document.getElementById('password');
    expect(passwordField.value).toBe('test-password-123');
  });
  
  // Test error handling in generatePassword
  test('generatePassword should handle errors', async () => {
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock a fetch error
    fetchMock.mockRejectOnce(new Error('Network error'));
    
    // Call the function
    await window.generatePassword();
    
    // Expect console.error to be called
    expect(consoleSpy).toHaveBeenCalled();
    
    // Restore the original console.error
    consoleSpy.mockRestore();
  });
  
  // Test focus event on password field
  test('focus on password field should trigger password generation', () => {
    // Create a spy for the generatePassword function
    const generatePasswordSpy = jest.spyOn(window, 'generatePassword');
    
    // Trigger focus event on password field
    const passwordField = document.getElementById('password');
    passwordField.focus();
    
    // Check if generatePassword was called
    expect(generatePasswordSpy).toHaveBeenCalled();
    
    // Clean up
    generatePasswordSpy.mockRestore();
  });
  
  // Test user table structure
  test('should have a user table with correct headers', () => {
    const tableHeaders = document.querySelectorAll('.user-list table thead th');
    expect(tableHeaders.length).toBe(3);
    expect(tableHeaders[0].textContent).toBe('Username');
    expect(tableHeaders[1].textContent).toBe('Role');
    expect(tableHeaders[2].textContent).toBe('Actions');
  });
  
  // Test form submission (mock)
  test('form should have correct method and action', () => {
    const form = document.querySelector('form[action="/admin/add-user"]');
    expect(form.getAttribute('method')).toBe('POST');
  });
  
  // Test delete user form
  test('delete user form should have correct attributes', () => {
    // In a real test, we would have real users in the table
    // For now, just checking the structure is correct
    const deleteForm = document.querySelector('form[action^="/admin/delete-user/"]');
    expect(deleteForm).not.toBeNull(); // This might fail if no users are in the mock data
  });
});