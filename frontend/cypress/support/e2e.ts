// Import commands.js using CommonJS syntax:
require('./commands');

// Hide fetch/XHR requests from command log
const app = window.top;
if (app) {
  app.document.addEventListener('DOMContentLoaded', () => {
    const style = app.document.createElement('style');
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    app.document.head.appendChild(style);
  });
}

// Prevent TypeScript from reading file as legacy script
export {};

declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here if needed
      login(email: string, password: string): Chainable<void>;
    }
  }
}

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  // Visit the login page first
  cy.visit('/');
  
  // Wait for the page to load
  cy.get('body').should('be.visible');
  
  // Intercept the login request
  cy.intercept('POST', '/api/token/', {
    statusCode: 200,
    body: {
      access: 'test-access-token',
      refresh: 'test-refresh-token'
    }
  }).as('loginRequest');

  // Wait for login form to be visible and interact with it
  cy.get('#login-username', { timeout: 10000 }).should('be.visible').type(email);
  cy.get('#login-password', { timeout: 10000 }).should('be.visible').type(password);
  cy.get('button[type="submit"]', { timeout: 10000 }).should('be.visible').click();

  // Wait for the login request to complete
  cy.wait('@loginRequest');
  
  // Verify we're logged in
  cy.contains('Budg').should('be.visible');
}); 