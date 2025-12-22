describe('Cart and checkout flow', () => {
  it('allows a visitor to add a product to the cart and advance through checkout steps', () => {
    cy.visit('/men');
    cy.get('[data-cy^="product-card-"]').first().click();
    cy.contains('Thêm vào giỏ hàng').click();

    cy.visit('/cart');
    cy.contains('Giỏ hàng').should('exist');
    cy.contains('Tiến hành thanh toán').click();

    cy.url().should('include', '/checkout');

    cy.get('input[name="fullName"]').type('Nguyen Van A');
    cy.get('input[name="phone"]').type('0901234567');
    cy.get('input[name="email"]').type('nguyenvana@example.com');
    cy.get('input[name="address"]').type('123 Nguyễn Huệ');
    cy.get('select[name="city"]').select('ho-chi-minh');
    cy.get('select[name="district"]').select('quan-1');
    cy.get('select[name="ward"]').select('phuong-1');

    cy.contains('Tiếp tục').click();
    cy.contains('Phương thức thanh toán').should('be.visible');

    cy.contains('Tiếp tục').click();
    cy.contains('Xác nhận đơn hàng').should('be.visible');
    cy.contains('Đặt hàng').should('be.visible');
  });
});
