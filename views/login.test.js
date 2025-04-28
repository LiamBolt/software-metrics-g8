/**
 * Login Page Tests
 * 
 * These tests verify the structure and basic functionality
 * of the login page.
 */

// Setup the HTML document before each test
beforeEach(() => {
  document.body.innerHTML = `
    <div class="wrapper">
      <div class="title"><span>Login Form</span></div>
      <form action="/login" autocomplete="off" method="POST">
        <div class="row">
          <i class="fas fa-user"></i>
          <input type="text" name="username" placeholder="Username" required autocomplete="off" />
        </div>
        <div class="row">
          <i class="fas fa-lock"></i>
          <input type="password" name="password" placeholder="Password" required autocomplete="off" />
        </div>
        <div class="pass"><a href="#">Forgot password?</a></div>
        <div class="row button">
          <input type="submit" value="Login" />
        </div>
        <div class="signup-link">Not a member? <a href="/sign-up">Signup now</a></div>
      </form>
    </div>
  `;
});

describe('Login Page', () => {
  // Test page title
  test('should have correct title text', () => {
    const title = document.querySelector('.title span');
    expect(title).not.toBeNull();
    expect(title.textContent).toBe('Login Form');
  });

  // Test form attributes
  test('form should have correct attributes', () => {
    const form = document.querySelector('form');
    expect(form).not.toBeNull();
    expect(form.getAttribute('action')).toBe('/login');
    expect(form.getAttribute('method')).toBe('POST');
    expect(form.getAttribute('autocomplete')).toBe('off');
  });

  // Test username input field
  test('username field should have correct attributes', () => {
    const usernameInput = document.querySelector('input[name="username"]');
    expect(usernameInput).not.toBeNull();
    expect(usernameInput.getAttribute('type')).toBe('text');
    expect(usernameInput.getAttribute('placeholder')).toBe('Username');
    expect(usernameInput.required).toBe(true);
    expect(usernameInput.getAttribute('autocomplete')).toBe('off');
  });

  // Test password input field
  test('password field should have correct attributes', () => {
    const passwordInput = document.querySelector('input[name="password"]');
    expect(passwordInput).not.toBeNull();
    expect(passwordInput.getAttribute('type')).toBe('password');
    expect(passwordInput.getAttribute('placeholder')).toBe('Password');
    expect(passwordInput.required).toBe(true);
    expect(passwordInput.getAttribute('autocomplete')).toBe('off');
  });

  // Test login button
  test('should have a login button', () => {
    const loginButton = document.querySelector('input[type="submit"]');
    expect(loginButton).not.toBeNull();
    expect(loginButton.getAttribute('value')).toBe('Login');
  });

  // Test forgot password link
  test('should have forgot password link', () => {
    const forgotPasswordLink = document.querySelector('.pass a');
    expect(forgotPasswordLink).not.toBeNull();
    expect(forgotPasswordLink.textContent).toBe('Forgot password?');
    expect(forgotPasswordLink.getAttribute('href')).toBe('#');
  });

  // Test signup link
  test('should have signup link with correct URL', () => {
    const signupLink = document.querySelector('.signup-link a');
    expect(signupLink).not.toBeNull();
    expect(signupLink.textContent).toBe('Signup now');
    expect(signupLink.getAttribute('href')).toBe('/sign-up');
  });

  // Test form submission (basic)
  test('form should be submittable', () => {
    const form = document.querySelector('form');
    const submitSpy = jest.fn(e => e.preventDefault());
    form.addEventListener('submit', submitSpy);
    
    // Fill in required fields
    document.querySelector('input[name="username"]').value = 'testuser';
    document.querySelector('input[name="password"]').value = 'password123';
    
    // Submit the form
    form.dispatchEvent(new Event('submit'));
    
    expect(submitSpy).toHaveBeenCalled();
  });

  // Test form validation for required fields
  test('form should validate required fields', () => {
    const usernameInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    
    // Both fields should be required
    expect(usernameInput.validity.valueMissing).toBe(true);
    expect(passwordInput.validity.valueMissing).toBe(true);
    
    // Fill in username only
    usernameInput.value = 'testuser';
    expect(usernameInput.validity.valueMissing).toBe(false);
    expect(passwordInput.validity.valueMissing).toBe(true);
    
    // Fill in password only
    usernameInput.value = '';
    passwordInput.value = 'password123';
    expect(usernameInput.validity.valueMissing).toBe(true);
    expect(passwordInput.validity.valueMissing).toBe(false);
    
    // Fill in both fields
    usernameInput.value = 'testuser';
    expect(usernameInput.validity.valueMissing).toBe(false);
    expect(passwordInput.validity.valueMissing).toBe(false);
  });
});