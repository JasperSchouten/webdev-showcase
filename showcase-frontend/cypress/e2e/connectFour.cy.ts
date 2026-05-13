describe('Connect Four', () => {
    it('creates a game and shows code', () => {
        cy.visit('/connectFour')

        cy.contains('Create Game').click()

        cy.contains('Code:').should('not.contain', '-')
    })
})