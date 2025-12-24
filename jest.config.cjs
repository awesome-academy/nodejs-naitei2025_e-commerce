const tsJestPresets = require('ts-jest/presets');
const tsjPreset = tsJestPresets.defaultsESM;
const tsJestGlobals = tsjPreset.globals?.['ts-jest'] ?? {};

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  ...tsjPreset,
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['<rootDir>/tests/unit/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      ...tsJestGlobals,
      tsconfig: 'tsconfig.jest.json'
    }
  },
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  reporters: [
    'default',
    ['<rootDir>/reporters/ExcelReporter.cjs', { perSuite: true, baseFilename: 'TestReport' }]
  ]
};
