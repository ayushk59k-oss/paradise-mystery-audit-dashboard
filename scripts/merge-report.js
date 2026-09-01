// Merges a freshly-extracted report into the dashboard's data file.
// Rule: one entry per store `code` per `month`. If a report for the same
// store+month already exists, it is replaced (re-audit / corrected upload).
// Otherwise the new report is appended.

function mergeReport(dashboardData, newReport) {
  if (!dashboardData.reports) dashboardData.reports = [];

  const idx = dashboardData.reports.findIndex(
    r => r.code === newReport.code && r.month === newReport.month
  );

  if (idx !== -1) {
    dashboardData.reports[idx] = newReport;
    return { action: 'replaced', index: idx };
  } else {
    dashboardData.reports.push(newReport);
    return { action: 'added', index: dashboardData.reports.length - 1 };
  }
}

module.exports = { mergeReport };
