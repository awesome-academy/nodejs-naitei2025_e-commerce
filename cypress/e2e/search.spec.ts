describe('Search experience', () => {
  it('shows results for a query and reflows on different viewports', () => {
    cy.visit('/search?q=Áo');
    cy.contains('Kết quả tìm kiếm cho "Áo"').should('be.visible');
    cy.get('[data-cy^="product-card-"]').its('length').should('be.greaterThan', 0);
    cy.get('[data-cy^="product-card-"]').first().should('contain.text', 'Áo');

    cy.viewport('ipad-2');
    cy.contains('Kết quả tìm kiếm cho "Áo"').should('be.visible');
    cy.viewport('iphone-6');
    cy.get('[data-cy^="product-card-"]').first().should('exist');
  });
});
