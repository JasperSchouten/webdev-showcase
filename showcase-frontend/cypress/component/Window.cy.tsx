import { Window } from '@/components/Window'

describe('Window component', () => {
    it('renders title and children', () => {
        cy.mount(
            <Window title="test.exe">
                <div>hello world</div>
            </Window>
        )

        cy.contains('test.exe').should('exist')
        cy.contains('hello world').should('exist')
        cy.contains('X').should('exist')
    })
})