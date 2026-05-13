import { GdprConsent } from '@/components/GdprConsent'

describe('GdprConsent', () => {
    it('shows banner when no consent cookie exists', () => {
        cy.clearCookies()

        cy.mount(<GdprConsent />)

        cy.contains('privacy_notice.exe').should('exist')
        cy.contains('Accept').should('exist')
    })
    it('hides banner when user accepts cookies', () => {
        cy.clearCookies()

        cy.mount(<GdprConsent />)

        cy.get('[data-testid="cookie-accept"]').click()

        cy.contains('privacy_notice.exe').should('not.exist')
    })
})