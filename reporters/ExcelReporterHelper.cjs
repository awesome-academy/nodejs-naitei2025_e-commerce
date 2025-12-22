const path = require('path');

const createWorkbook = () => {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'jest';
  workbook.created = new Date();
  return workbook;
};

const buildTestReportWorkbook = (suites, workbookFactory = createWorkbook) => {
  const workbook = workbookFactory();
  const sheet = workbook.addWorksheet('Test Report');

  sheet.columns = [
    { header: 'Suite', key: 'suite', width: 60 },
    { header: 'Test', key: 'test', width: 80 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Duration (ms)', key: 'duration', width: 20 }
  ];

  suites.forEach((suite) => {
    suite.testResults.forEach((test) => {
      sheet.addRow({
        suite: path.relative(process.cwd(), suite.testFilePath),
        test: test.fullName,
        status: test.status,
        duration: test.duration ?? ''
      });
    });
  });

  return workbook;
};

module.exports = {
  buildTestReportWorkbook,
  createWorkbook
};
