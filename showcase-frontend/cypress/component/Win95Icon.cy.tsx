import { Win95Icon } from '@/components/Win95Icon'

describe('Win95Icon', () => {
    it('renders image correctly', () => {
        cy.mount(
            <Win95Icon src="/Home.png" alt="home icon" />
        )

        cy.get('img')
            .should('have.attr', 'src')
            .and('include', 'Home.png')

        cy.get('img')
            .should('have.attr', 'alt', 'home icon')
    })
})