// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

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
  cy.intercept('POST', '/api/token/', {
    statusCode: 200,
    body: {
      access: 'test-access-token',
      refresh: 'test-refresh-token'
    }
  }).as('loginRequest');

  cy.get('input[type="text"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();

  cy.wait('@loginRequest');
}); 