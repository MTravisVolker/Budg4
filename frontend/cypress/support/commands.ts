/// <reference types="cypress" />

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
      getByRole(role: string, options?: { name?: string }): Chainable<JQuery<HTMLElement>>
    }
  }
}

// Add custom commands here
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('getByRole', (role: string, options?: { name?: string }) => {
  return cy.get(`[role="${role}"]${options?.name ? `:contains("${options.name}")` : ''}`);
});

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/');
  cy.get('#login-username').type(username);
  cy.get('#login-password').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for login to complete
  cy.contains('Budg').should('be.visible');
});

// Prevent TypeScript from reading file as legacy script
export {}; 