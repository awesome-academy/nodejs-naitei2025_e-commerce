// ***********************************************************
// This example support file is processed and loaded automatically
// before your test files.
// You can put global configuration and behavior that modifies Cypress here.
// ***********************************************************

import './commands';

// Prevent failures from unrelated runtime exceptions
Cypress.on('uncaught:exception', () => false);
