import ExcelJS from 'exceljs';

export interface SuiteResult {
  testFilePath: string;
  testResults: Array<{
    fullName: string;
    status: string;
    duration?: number | null;
  }>;
}

type WorkbookFactory = () => ExcelJS.Workbook;

export function buildTestReportWorkbook(
  suites: SuiteResult[],
  workbookFactory?: WorkbookFactory
): ExcelJS.Workbook;

export function createWorkbook(): ExcelJS.Workbook;
