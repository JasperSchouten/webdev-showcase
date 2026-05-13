describe('Connect Four auth flow', () => {
    it('redirects unauthenticated users to login', () => {
        cy.visit('/connectFour')

        cy.url().should('include', '/login')

        cy.contains('You need to log in to play Connect Four')
            .should('exist')

        cy.get('[data-testid="login-header"]').should('exist')
    })

    it('allows logged in user to create a game', () => {
        cy.visit('/login')

        cy.get('[data-testid="cookie-accept"]').click()

        cy.get('[data-testid="username-input"]')
            .type('cyuser')

        cy.get('[data-testid="password-input"]')
            .type('cytest123')

        cy.get('[data-testid="login-button"]').click()

        cy.visit('/connectFour')

        cy.contains('Connected').should('exist')

        cy.contains('Create Game').click()

        cy.contains('Code:')
            .should('not.contain', '-')
    })
})

