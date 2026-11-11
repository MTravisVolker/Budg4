describe("Budg Application Main Flows", () => {
  beforeEach(() => {
    // Reset any state between tests
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe("Authentication Flow", () => {
    it("should handle login and logout", () => {
      cy.visit("/");

      // Test invalid login
      cy.get("#login-username").type("invalid");
      cy.get("#login-password").type("invalid");
      cy.get('button[type="submit"]').click();
      cy.contains("Invalid username or password").should("be.visible");

      // Test valid login with intercept
      cy.intercept("POST", "/api/token/", {
        statusCode: 200,
        body: {
          access: "test-access-token",
          refresh: "test-refresh-token",
        },
      }).as("loginRequest");

      cy.get("#login-username").clear().type("testuser");
      cy.get("#login-password").clear().type("testpass");
      cy.get('button[type="submit"]').click();

      // Wait for login request to complete
      cy.wait("@loginRequest");

      // Verify we're logged in and on the main page
      cy.contains("Budg").should("be.visible");
      cy.url().should("eq", Cypress.config().baseUrl + "/");

      // Debug: Check localStorage
      cy.window().then((win) => {
        cy.log("localStorage:", {
          token: win.localStorage.getItem("token"),
          refreshToken: win.localStorage.getItem("refreshToken"),
        });
      });

      // Wait for the page to stabilize
      cy.wait(1000);

      // Debug: Log the current URL and page content
      cy.url().then((url) => {
        cy.log(`Current URL: ${url}`);
      });

      // Debug: Log all buttons and their properties
      cy.get("button").then(($buttons) => {
        cy.log(`Found ${$buttons.length} buttons`);
        $buttons.each((i, btn) => {
          cy.log(`Button ${i}:`, {
            text: btn.textContent?.trim(),
            classes: btn.className,
            html: btn.outerHTML,
            visible: btn.offsetParent !== null,
          });
        });
      });

      // Try to find and click the logout button
      cy.get("body").then(($body) => {
        const logoutButton = $body.find('button:contains("Logout")');
        const errorButton = $body.find("button.btn-outline.btn-error");

        cy.log("Button search results:", {
          logoutButtonFound: logoutButton.length > 0,
          errorButtonFound: errorButton.length > 0,
          logoutButtonHTML:
            logoutButton.length > 0 ? logoutButton[0].outerHTML : "not found",
          errorButtonHTML:
            errorButton.length > 0 ? errorButton[0].outerHTML : "not found",
        });

        if (logoutButton.length > 0) {
          cy.log("Found logout button by text");
          cy.wrap(logoutButton[0]).click({ force: true });
        } else if (errorButton.length > 0) {
          cy.log("Found logout button by class");
          cy.wrap(errorButton[0]).click({ force: true });
        } else {
          cy.log("No logout button found, reloading page");
          cy.reload();
          cy.wait(1000);
          cy.get("button.btn-outline.btn-error")
            .should("exist")
            .click({ force: true });
        }
      });

      // Verify we're back at the login page
      cy.url().should("include", "/");
      cy.get("#login-username").should("be.visible");
    });
  });

  describe("Main Page", () => {
    beforeEach(() => {
      // Login before each test
      cy.login("testuser", "testpass");
    });

    it("should display and interact with the main table", () => {
      
      // Mock API responses for dropdown data
      cy.intercept('GET', '/api/bills/', {
        statusCode: 200,
        body: [
          { id: 1, name: 'Test Bill 1', default_amount_due: '100.00', recurrence: 1, draft_account: 1, priority: 1 },
          { id: 2, name: 'Test Bill 2', default_amount_due: '200.00', recurrence: 2, draft_account: 2, priority: 2 }
        ]
      }).as('getBills');

      cy.intercept('GET', '/api/recurrences/', {
        statusCode: 200,
        body: [
          { id: 1, name: 'Monthly', interval: 30 },
          { id: 2, name: 'Weekly', interval: 7 }
        ]
      }).as('getRecurrences');

      cy.intercept('GET', '/api/bankaccounts/', {
        statusCode: 200,
        body: [
          { id: 1, name: 'Checking', font_color: '#000000' },
          { id: 2, name: 'Savings', font_color: '#000000' }
        ]
      }).as('getAccounts');

      cy.intercept('GET', '/api/statuses/', {
        statusCode: 200,
        body: [
          { id: 1, name: 'Active', highlight_color: '#00FF00' },
          { id: 2, name: 'Inactive', highlight_color: '#FF0000' }
        ]
      }).as('getStatuses');

      cy.visit("/");

      // Test date range picker
      cy.contains("Select Date Range").click();
      cy.get(".rdrCalendarWrapper").should("be.visible");

      // Test adding a due bill
      cy.contains("Add Due Bill").click();
      cy.get(".modal").should("be.visible");
      
      // Wait for API responses
      cy.wait(['@getBills', '@getRecurrences', '@getAccounts', '@getStatuses']);

      // Debug: Log the contents of the bill select dropdown
      cy.get('[data-testid="bill-select"]').then($select => {
        cy.log('Bill select options:', $select.find('option').map((i, el) => ({
          value: (el as HTMLOptionElement).value,
          text: el.textContent
        })).get());
      });

      // Verify the bill select has options before trying to select
      cy.get('[data-testid="bill-select"] option').should('have.length.at.least', 3);
      cy.pause();
      // Fill in all required fields for Add Due Bill
      cy.get('[data-testid="bill-select"]').select("1", { force: true });
      cy.get('[data-testid="amount-input"]').type("100.00");
      cy.get('[data-testid="total-balance-input"]').type("500.00");
      cy.get('[data-testid="due-date-input"]').type("2024-03-20");
      cy.get('[data-testid="priority-input"]').type("1");
      
      // Verify other dropdowns have options before selecting
      cy.get('[data-testid="recurrence-select"] option').should('have.length.at.least', 2);
      cy.get('[data-testid="draft-account-select"] option').should('have.length.at.least', 2);
      cy.get('[data-testid="status-select"] option').should('have.length.at.least', 2);
      
      // Fill in optional fields
      cy.get('[data-testid="recurrence-select"]').select("1", { force: true });
      cy.get('[data-testid="draft-account-select"]').select("1", { force: true });
      cy.get('[data-testid="pay-date-input"]').type("2024-03-15");
      cy.get('[data-testid="status-select"]').select("1", { force: true });
      
      // Mock the POST request for adding a due bill
      cy.intercept('POST', '/api/duebills/', {
        statusCode: 201,
        body: {
          id: 1,
          bill: 1,
          amount_due: '100.00',
          total_balance: '500.00',
          due_date: '2024-03-20',
          pay_date: '2024-03-15',
          status: 1,
          priority: 1
        }
      }).as('addDueBill');
      
      // Submit the form
      cy.get('[data-testid="submit-btn"]').click();
      
      // Wait for the POST request
      cy.wait('@addDueBill');
      
      // Wait for modal to close
      cy.get(".modal").should("not.exist");

      // Test adding a bank account instance
      cy.contains("Add Bank Account Instance").click();
      cy.get(".modal").should("be.visible");
      
      // Verify bank account select has options before selecting
      cy.get('[data-testid="bank-account-select"] option').should('have.length.at.least', 2);
      
      // Fill in all required fields for Add Bank Account Instance
      cy.get('[data-testid="bank-account-select"]').select("1", { force: true });
      cy.get('[data-testid="balance-input"]').type("1000.00");
      cy.get('[data-testid="date-input"]').type("2024-03-20");
      
      // Verify status select has options before selecting
      cy.get('[data-testid="status-select"] option').should('have.length.at.least', 2);
      
      // Fill in optional fields
      cy.get('[data-testid="status-select"]').select("1", { force: true });
      cy.get('[data-testid="priority-input"]').type("1");
      
      // Mock the POST request for adding a bank account instance
      cy.intercept('POST', '/api/bankaccountinstances/', {
        statusCode: 201,
        body: {
          id: 1,
          bank_account: 1,
          balance: '1000.00',
          due_date: '2024-03-20',
          status: 1,
          priority: 1
        }
      }).as('addBankInstance');
      
      // Submit the form
      cy.get('[data-testid="submit-btn"]').click();
      
      // Wait for the POST request
      cy.wait('@addBankInstance');
      
      // Wait for modal to close
      cy.get(".modal").should("not.exist");
    });
  });

  describe("Bank Accounts Management", () => {
    beforeEach(() => {
      cy.login("testuser", "testpass");
      cy.visit("/bankaccounts");
    });

    it("should manage bank accounts", () => {
      // Ensure we're on the bank accounts page
      cy.url().should("include", "/bankaccounts");

      // Wait for the page to be fully loaded
      cy.get("body").should("be.visible");

      // First, handle any open modals
      cy.get("body").then(($body) => {
        if ($body.find(".modal").length > 0) {
          // Try multiple ways to close the modal
          cy.get(".modal").then(() => {
            // Try clicking the close button
            cy.get(
              '.modal .btn-close, .modal .close-button, .modal button:contains("Close")'
            )
              .first()
              .click({ force: true });
            // Try clicking outside the modal
            cy.get("body").click(0, 0);
            // Try pressing Escape key
            cy.get("body").type("{esc}");
          });

          // Wait for modal to close and verify it's gone
          cy.wait(1000);
          cy.get(".modal").should("not.exist");
        }
      });

      // Additional wait to ensure everything is stable
      cy.wait(500);

      // Click Add Bank Account button
      cy.get("button.btn.btn-secondary")
        .contains("Add Bank Account")
        .click({ force: true });

      // Wait for the modal to be visible and verify its title
      cy.get(".modal").should("be.visible");
      cy.get(".modal-title").should("contain", "Add Bank Account");

      // Fill out the bank account form
      cy.get('input[name="name"]').type("Test Bank");
      cy.get('input[name="font_color"]').type("#000000");
      cy.get('input[name="url"]').type("https://testbank.com");

      // Click the Save button in the modal
      cy.get(".modal").contains("button", "Save").click();

      // Wait for the modal to close
      cy.get(".modal").should("not.exist");

      // Verify bank account was added
      cy.contains("Test Bank").should("be.visible");

      // Edit bank account
      cy.contains("Test Bank").parent().contains("Edit").click();
      cy.get('input[name="name"]').clear().type("Updated Bank");
      cy.contains("Save").click();

      // Verify edit
      cy.contains("Updated Bank").should("be.visible");

      // Delete bank account
      cy.contains("Updated Bank").parent().contains("Delete").click();
      cy.on("window:confirm", () => true);
      cy.contains("Updated Bank").should("not.exist");
    });
  });

  describe("Bills Management", () => {
    beforeEach(() => {
      cy.login("testuser", "testpass");
      cy.visit("/bills");
    });

    it("should manage bills", () => {
      // Add new bill
      cy.contains("Add Bill").click();
      cy.get('input[name="name"]').type("Test Bill");
      cy.get('input[name="default_amount_due"]').type("100");
      cy.get('input[name="url"]').type("https://testbill.com");
      cy.get('select[name="draft_account"]').select("1");
      cy.get('select[name="category"]').select("1");
      cy.get('select[name="recurrence"]').select("1");
      cy.contains("Save").click();

      // Verify bill was added
      cy.contains("Test Bill").should("be.visible");

      // Edit bill
      cy.contains("Test Bill").parent().contains("Edit").click();
      cy.get('input[name="name"]').clear().type("Updated Bill");
      cy.contains("Save").click();

      // Verify edit
      cy.contains("Updated Bill").should("be.visible");

      // Delete bill
      cy.contains("Updated Bill").parent().contains("Delete").click();
      cy.on("window:confirm", () => true);
      cy.contains("Updated Bill").should("not.exist");
    });
  });

  describe("Categories Management", () => {
    beforeEach(() => {
      cy.login("testuser", "testpass");
      cy.visit("/categories");
    });

    it("should manage categories", () => {
      // Add new category
      cy.contains("Add Category").click();
      cy.get('input[name="name"]').type("Test Category");
      cy.contains("Add").click();

      // Verify category was added
      cy.contains("Test Category").should("be.visible");

      // Edit category
      cy.contains("Test Category").parent().contains("Edit").click();
      cy.get('input[name="name"]').clear().type("Updated Category");
      cy.contains("Save").click();

      // Verify edit
      cy.contains("Updated Category").should("be.visible");

      // Delete category
      cy.contains("Updated Category").parent().contains("Delete").click();
      cy.on("window:confirm", () => true);
      cy.contains("Updated Category").should("not.exist");
    });
  });

  describe("Recurrences Management", () => {
    beforeEach(() => {
      cy.login("testuser", "testpass");
      cy.visit("/recurrences");
    });

    it("should manage recurrences", () => {
      // Add new recurrence
      cy.contains("Add Recurrence").click();
      cy.get('input[name="name"]').type("Test Recurrence");
      cy.get('input[name="interval"]').type("30");
      cy.contains("Add").click();

      // Verify recurrence was added
      cy.contains("Test Recurrence").should("be.visible");

      // Edit recurrence
      cy.contains("Test Recurrence").parent().contains("Edit").click();
      cy.get('input[name="name"]').clear().type("Updated Recurrence");
      cy.contains("Save").click();

      // Verify edit
      cy.contains("Updated Recurrence").should("be.visible");

      // Delete recurrence
      cy.contains("Updated Recurrence").parent().contains("Delete").click();
      cy.on("window:confirm", () => true);
      cy.contains("Updated Recurrence").should("not.exist");
    });
  });

  describe("Statuses Management", () => {
    beforeEach(() => {
      cy.login("testuser", "testpass");
      cy.visit("/statuses");
    });

    it("should manage statuses", () => {
      // Add new status
      cy.contains("Add Status").click();
      cy.get('input[name="name"]').type("Test Status");
      cy.get('input[name="highlight_color"]').type("#FF0000");
      cy.contains("Add").click();

      // Verify status was added
      cy.contains("Test Status").should("be.visible");

      // Edit status
      cy.contains("Test Status").parent().contains("Edit").click();
      cy.get('input[name="name"]').clear().type("Updated Status");
      cy.contains("Save").click();

      // Verify edit
      cy.contains("Updated Status").should("be.visible");

      // Delete status
      cy.contains("Updated Status").parent().contains("Delete").click();
      cy.on("window:confirm", () => true);
      cy.contains("Updated Status").should("not.exist");
    });
  });
});
