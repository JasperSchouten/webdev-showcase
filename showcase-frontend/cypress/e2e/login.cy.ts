describe('Login page', () => {
    it('shows validation and inputs', () => {
        cy.visit('/login')

        cy.get('[data-testid="cookie-accept"]').click()

        cy.get('[data-testid="username-input"]')
            .type('testuser')
            .should('have.value', 'testuser')

        cy.get('[data-testid="password-input"]')
            .type('testpass')
            .should('have.value', 'testpass')

        cy.get('[data-testid="login-button"]').click()

        cy.contains(/Logging in|Invalid|Success/i).should('exist')
    })
})