const path = require('path');
const { buildTestReportWorkbook } = require('./ExcelReporterHelper.cjs');

const sanitizeFileName = (value) =>
  value.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');

class ExcelReporter {
  constructor(globalConfig, options = {}) {
    this.options = {
      outputDir: process.cwd(),
      baseFilename: 'TestReport',
      perSuite: false,
      ...options
    };
  }

  async onRunComplete(_contexts, results) {
    if (this.options.perSuite) {
      await Promise.all(
        results.testResults.map(async (suite) => {
          const workbook = buildTestReportWorkbook([suite]);
          const suiteName = sanitizeFileName(
            path.relative(process.cwd(), suite.testFilePath).replace(/\.[^.]+$/, '')
          );
          const fileName = `${this.options.baseFilename}-${suiteName}.xlsx`;
          const filePath = path.resolve(this.options.outputDir, fileName);
          await workbook.xlsx.writeFile(filePath);
          console.log(`Jest Excel report written to ${filePath}`);
        })
      );
      return;
    }

    const workbook = buildTestReportWorkbook(results.testResults);
    const filePath = path.resolve(this.options.outputDir, `${this.options.baseFilename}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    console.log(`Jest Excel report written to ${filePath}`);
  }
}

module.exports = ExcelReporter;
