describe('Register flow', () => {
    it('creates account and shows status', () => {
        cy.visit('/register')

        cy.get('[data-testid="cookie-accept"]').click()

        const username = `user_${Date.now()}`

        cy.get('input[name="userName"]').type(username)
        cy.get('input[name="password"]').type('cytest123')

        cy.contains('Register').click()

        cy.contains('Account created').should('exist')

        cy.get('[data-testid="login-header"]').should('exist')
    })
})