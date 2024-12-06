describe('Login Page Tests', () => {
    beforeEach(() => {
        // visit login page
        cy.visit('http://localhost:3000/login');
    });

    it('render login page correctly', () => {
        // Check if the login form is visible
        cy.get('.login-container').should('be.visible');
    });

    //
    //
    // it('test login with wrong credentials', () => {
    //     // Enter invalid email and password
    //     cy.visit('/login');
    //     cy.get('input[name="email"]').type('something@something.com');
    //     cy.get('input[name="password"]').type('something');
    //
    //     // Submit the form
    //     cy.get('button[htmltype="submit"]').click();
    //
    //     // Check if error message is shown
    //     cy.contains('Email of wachtwoord is niet juist').should('be.visible');
    // });
    //
    // it('test login with valid credentials', () => {
    //     // checks login with valid credentials
    //     cy.get('input[name="email"]').type('djeniz.bal@gmail.com');
    //     cy.get('input[name="password"]').type('blablabla');
    //
    //     cy.get('button[htmltype="submit"]').click();
    //     cy.window().its('localStorage').invoke('getItem', 'sessionToken').should('equal', 'valid-session-token');
    //     cy.url().should('include', '/home');
    // });


    it('navigates to the activation page when clicking the Activate button', () => {
        // Click on the "Activate" button
        cy.contains('Activate').click();

        cy.url().should('include', '/activate');
    });
});