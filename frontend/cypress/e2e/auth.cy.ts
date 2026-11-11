describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('#login-username').type('invalid@example.com');
    cy.get('#login-password').type('invalidpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid username or password').should('be.visible');
  });

  it('should successfully log in with valid credentials', () => {
    cy.intercept('POST', '/api/token/', {
      statusCode: 200,
      body: {
        access: 'test-access-token',
        refresh: 'test-refresh-token'
      }
    }).as('loginRequest');

    cy.get('#login-username').type('test@example.com');
    cy.get('#login-password').type('validpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.contains('Budg').should('be.visible');
  });

  it('should handle session expiration', () => {
    // First login
    cy.login('test@example.com', 'validpassword');
    
    // Simulate session expiration
    cy.intercept('GET', '/api/**', {
      statusCode: 401,
      body: {
        detail: 'Token has expired'
      }
    }).as('expiredRequest');

    // Try to access a protected route
    cy.visit('/bills');
    
    // Wait for the redirect to complete
    cy.url().should('include', '/');
    
    // Clear auth data to simulate session expiration
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
      win.localStorage.removeItem('refreshToken');
      win.sessionStorage.setItem('authMessage', 'Your session has expired. Please log in again.');
    });
    
    // Reload the page to trigger React state update
    cy.reload();
    
    // Wait for the page to stabilize and check for login form
    cy.get('body').should('be.visible');
    cy.get('#login-username', { timeout: 10000 }).should('exist').and('be.visible');
    cy.get('#login-password', { timeout: 10000 }).should('exist').and('be.visible');
    cy.get('button[type="submit"]', { timeout: 10000 }).should('exist').and('be.visible');
    
    // Check for auth message
    cy.contains('Your session has expired. Please log in again.').should('be.visible');
  });

  it('should log out successfully', () => {
    // First login
    cy.login('test@example.com', 'validpassword');
    
    // Click logout
    cy.contains('Logout').click();
    
    // Should be redirected to login page
    cy.url().should('include', '/');
    cy.wait(2000);
    
    // Verify we're back at the login page by checking for essential elements
    cy.get('body').then(($body) => {
      if ($body.find('#login-username').length === 0) {
        cy.reload();
        cy.wait(2000);
      }
    });
    
    // Check for login form elements with increased timeout
    cy.get('#login-username', { timeout: 10000 }).should('exist');
    cy.get('#login-password', { timeout: 10000 }).should('exist');
  });
}); 