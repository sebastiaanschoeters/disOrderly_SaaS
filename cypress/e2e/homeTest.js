describe('HomePage E2E Test', () => {
    beforeEach(() => {
        cy.visit('/login');
        cy.get('[name="email"]').type('djeniz.bal@gmail.com');
        cy.get('[name="password"]').type('blablabla');
        cy.get('[name="submit"]').click();

        cy.url().should('include', '/home');
        });

    it('verifies profile information and buttons', () => {
        cy.contains('Mensen vinden').should('be.visible').click();
        cy.url().should('include', '/search');
        cy.go('back');

        cy.contains('Chats').should('be.visible').click();
        cy.url().should('include', '/chatoverview');


        cy.go('back');
    });


    it('should navigate to profile personal page when settings button is clicked', () => {
        cy.contains('h2', 'Instellingen')
            .should('exist')
            .should('be.visible');


        cy.contains('h2', 'Instellingen').click();


        cy.url().should('include', '/profilePersonal');
    });

    it('should navigate to profile edit page when avatar is clicked', () => {
        cy.get('div')
            .contains(localStorage.getItem('name'))
            .should('be.visible')
            .should('have.css', 'cursor', 'pointer');

        cy.get('div')
            .contains(localStorage.getItem('name'))
            .click();

        cy.url().should('include', '/profileEdit');
    });

    it('logs out the user and redirects to login', () => {
        cy.contains('Afmelden').click();
        cy.url().should('include', '/login');
        cy.window().then((window) => {
            expect(window.localStorage.getItem('userEmail')).to.be.null;
            expect(window.localStorage.getItem('user_id')).to.be.null;
        });
    });
});