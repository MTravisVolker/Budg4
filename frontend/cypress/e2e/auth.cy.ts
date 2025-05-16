describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should show login form when not authenticated', () => {
    cy.get('h1').should('contain', 'Budg - Login');
    cy.get('input[type="text"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show error message with invalid credentials', () => {
    cy.intercept('POST', '/api/token/', {
      statusCode: 401,
      body: { detail: 'Invalid credentials' }
    }).as('loginRequest');

    cy.get('input[type="text"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.get('.text-error').should('contain', 'Invalid username or password');
  });

  it('should successfully log in with valid credentials', () => {
    cy.intercept('POST', '/api/token/', {
      statusCode: 200,
      body: {
        access: 'test-access-token',
        refresh: 'test-refresh-token'
      }
    }).as('loginRequest');

    cy.get('input[type="text"]').type('test@example.com');
    cy.get('input[type="password"]').type('validpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.get('h1').should('contain', 'Budg');
    cy.get('button').should('contain', 'Logout');
  });

  it('should log out when clicking logout button', () => {
    // First log in
    cy.intercept('POST', '/api/token/', {
      statusCode: 200,
      body: {
        access: 'test-access-token',
        refresh: 'test-refresh-token'
      }
    }).as('loginRequest');

    cy.get('input[type="text"]').type('test@example.com');
    cy.get('input[type="password"]').type('validpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    // Then log out
    cy.get('button').contains('Logout').click();
    cy.get('h1').should('contain', 'Budg - Login');
  });
}); 