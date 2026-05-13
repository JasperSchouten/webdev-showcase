import { Taskbar } from '@/components/Taskbar'

describe('Taskbar', () => {
    it('renders navigation links', () => {
        cy.mount(<Taskbar />)

        cy.contains('Start').should('exist')
        cy.contains('contact.exe').should('exist')
        cy.contains('login.exe').should('exist')
    })
})