describe('Search page Tests', () => {
    beforeEach(() => {
        cy.visit('/login');
        cy.get('[name="email"]').type('djeniz.bal@gmail.com');
        cy.get('[name="password"]').type('blablabla');
        cy.get('[name="submit"]').click();

        cy.url().should('include', '/home');
        cy.visit('/search');
    });
    it('should load the search page with all necessary elements', () => {
        cy.get('input[placeholder="Zoek gebruikers..."]').should('be.visible');
        cy.contains('Sorteren op:').should('be.visible');
        cy.get('input[type="radio"]').should('have.length', 2);
    });
});
