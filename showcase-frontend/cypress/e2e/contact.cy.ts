describe('Contact form', () => {
    it('submits form successfully', () => {
        cy.visit('/contact')

        cy.get('[data-testid="cookie-accept"]').click()

        cy.get('#firstName').type('John')
        cy.get('#lastName').type('Doe')
        cy.get('#email').type('john@test.com')
        cy.get('#phone').type('123456')

        cy.contains('Send').click()

        cy.contains(/Sending|success/i).should('exist')
    })
})