import { buildTestReportWorkbook } from '../../reporters/ExcelReporterHelper.cjs';
import type ExcelJS from 'exceljs';

const createMockWorkbook = () => {
  const rows: Array<Record<string, unknown>> = [];
  const worksheet = {
    addRow(row: Record<string, unknown>) {
      rows.push(row);
      return {
        getCell(key: string) {
          return { value: row[key] };
        }
      };
    },
    getRow(index: number) {
      const row = rows[index - 1];
      return {
        getCell(key: string) {
          return { value: row?.[key] };
        }
      };
    }
  };

  const mockWorksheet = {
    ...worksheet,
    getRow(index: number) {
      const row = index > 1 ? rows[index - 2] : undefined;
      return {
        getCell(key: string) {
          return { value: row?.[key] };
        }
      };
    }
  };

  return {
    addWorksheet(name: string) {
      return worksheet;
    },
    getWorksheet() {
      return mockWorksheet;
    }
  } as unknown as ExcelJS.Workbook;
};

describe('ExcelReporterHelper', () => {
  it('generates a workbook with a row for each test', () => {
    const workbook = buildTestReportWorkbook(
      [
        {
          testFilePath: 'tests/unit/cart.spec.ts',
          testResults: [
            { fullName: 'clears the cart', status: 'passed', duration: 5 },
            { fullName: 'adds a new item', status: 'passed', duration: 2 }
          ]
        }
      ],
      createMockWorkbook
    );

    const sheet = workbook.getWorksheet('Test Report');
    expect(sheet).toBeDefined();
    const firstRow = sheet?.getRow(2);
    expect(firstRow?.getCell('test').value).toBe('clears the cart');
    expect(firstRow?.getCell('status').value).toBe('passed');
    expect(firstRow?.getCell('duration').value).toBe(5);
  });
});
