describe('Home page', () => {
    it('loads successfully', () => {
        cy.visit('/')

        cy.get('[data-testid="cookie-accept"]').should('exist')
        cy.contains('Jasper Schouten').should('exist')
        cy.contains('Skills').should('exist')
    })
})