describe('Search page Tests', () => {
    beforeEach(() => {
        cy.visit('/login');
        cy.get('[name="email"]').type('djeniz.bal@gmail.com');
        cy.get('[name="password"]').type('blablabla');
        cy.get('[name="submit"]').click();

        cy.url().should('include', '/home');
        cy.visit('/chatoverview');
    });

    it('should render the ChatOverviewPage correctly', () => {
        cy.contains('Chat Overzicht').should('be.visible');
        cy.get('.ant-card').should('have.length', 3);
        cy.contains('Wout').should('be.visible');
        cy.contains('Lotte').should('be.visible');
    });

    it('should allow the user to click on a chat card to navigate to the chat', () => {
        cy.get('.ant-card').first().click();
        cy.url().should('include', '/chat');
        cy.get('.messageList').should('exist');
    });
    it('should allow the user to click on a chat card to navigate to the chatsuggestion', () => {
        cy.get('.ant-card').last().click();
        cy.url().should('include', '/chatsuggestion');
        cy.get('.ant-btn-bewerk').should('exist');
    });
});
