describe('Login Page Tests', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('render login page correctly', () => {
        cy.get('.login-container').should('be.visible');
    });



    it('test login with wrong credentials', () => {
        cy.visit('/login');
        cy.get('input[name="email"]').type('something@something.com');
        cy.get('input[name="password"]').type('something');
        cy.get('button[name="submit"]').click();
        cy.contains('Email of wachtwoord is niet juist').should('be.visible');
    });

    it('logs in successfully with valid credentials', () => {
        cy.get('[name="email"]').type('djeniz.bal@gmail.com');
        cy.get('[name="password"]').type('blablabla'); // Type a valid password
        cy.get('[name="submit"]').click();

        cy.url().should('include', '/home'); // Verify navigation
    });



    it('navigates to the activation page when clicking the Activate button', () => {
        cy.contains('Activate').click();

        cy.url().should('include', '/activate');
    });
});