describe('Account flows', () => {
  beforeEach(() => {
    cy.visit('/account');
  });

  it('toggles to registration and validates password confirmation', () => {
    cy.contains('Đăng ký ngay').click();
    cy.contains('Đăng ký').should('be.visible');

    cy.get('input[placeholder="Nhập email"]').clear().type('tester@example.com');
    cy.get('input[placeholder="Nhập họ và tên"]').clear().type('Test User');
    cy.get('input[placeholder="Nhập số điện thoại"]').clear().type('0901234567');
    cy.get('input[placeholder="Nhập mật khẩu"]').clear().type('secret123');
    cy.get('input[placeholder="Nhập lại mật khẩu"]').clear().type('mismatch');

    cy.contains('Đăng ký').click();
    cy.contains('Mật khẩu xác nhận không khớp').should('be.visible');
  });

  it('displays login prompt by default', () => {
    cy.contains('Đăng nhập để truy cập tài khoản của bạn').should('be.visible');
    cy.contains('Đăng nhập').should('be.visible');
  });
});
