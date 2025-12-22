describe('Global layout', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows the header navigation, search bar and responsive controls', () => {
    cy.get('header').within(() => {
      cy.contains('Store').should('be.visible');
      cy.contains('Trang chủ').should('be.visible');
      cy.get('input[placeholder="Tìm kiếm sản phẩm..."]').should('be.visible');
    });

    cy.viewport(1280, 720);
    cy.get('header nav').should('be.visible');

    cy.viewport('iphone-6');
    cy.get('header form input[placeholder="Tìm kiếm sản phẩm..."]').should('be.visible');
    cy.contains('Sản phẩm').should('be.visible');
  });

  it('renders the footer with company info and legal links', () => {
    cy.get('footer').within(() => {
      cy.contains('UNIQLO').should('exist');
      cy.contains('Liên hệ').should('exist');
      cy.contains('Chính sách bảo mật').should('exist');
      cy.contains('Điều khoản sử dụng').should('exist');
    });
  });
});
