/**
 * Daily mystery audit check.
 *
 * 1. Reads the latest paradise_mystery_audit_data.json from Google Drive
 *    using a service account (no interactive login needed).
 * 2. Compares its content hash against data/last-hash.txt in this repo.
 * 3. If unchanged -> exits quietly, no email sent.
 * 4. If changed -> logs into the dashboard as a dedicated bot account (the
 *    dashboard now sits behind a login gate, so this step is required for
 *    Puppeteer to see anything other than the login screen), takes a
 *    whole-dashboard screenshot PLUS one individual screenshot per store
 *    that was newly added/updated in this run's "Sync audits from Drive"
 *    step (per data/last-sync-changes.json, written by sync-audits.js),
 *    emails all of them as attachments, and updates data/last-hash.txt.
 *
 *    Every screenshot injects the exact data snapshot this run fetched into
 *    local storage before rendering, so it can't be thrown off by any
 *    Drive read-after-write lag on the public fetch the dashboard itself uses.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

const DRIVE_FOLDER_ID = '1mG09RBRDtB3-WtLTnWpaPZ-LpDJCyB4X';
const DRIVE_FILE_NAME = 'paradise_mystery_audit_data.json';
const DASHBOARD_BASE_URL = 'https://paradise-sudo.github.io/paradise-mystery-audit-dashboard/';
const HASH_FILE = path.join(__dirname, '..', 'data', 'last-hash.txt');
const SYNC_CHANGES_PATH = path.join(__dirname, '..', 'data', 'last-sync-changes.json');
const SCREENSHOT_DIR = path.join(__dirname, '..');

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'kumar.ayush@paradisefoodcourt.in';
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const SERVICE_ACCOUNT_JSON = process.env.GDRIVE_SERVICE_ACCOUNT_JSON;
const BOT_EMAIL = process.env.BOT_EMAIL;
const BOT_PASSWORD = process.env.BOT_PASSWORD;

function hashContent(str){
  return crypto.createHash('sha256').update(str).digest('hex');
}

async function fetchDriveData(){
  if(!SERVICE_ACCOUNT_JSON){
    throw new Error('Missing GDRIVE_SERVICE_ACCOUNT_JSON secret.');
  }
  const credentials = JSON.parse(SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  const drive = google.drive({ version: 'v3', auth });

  const listRes = await drive.files.list({
    q: `name='${DRIVE_FILE_NAME}' and '${DRIVE_FOLDER_ID}' in parents and trashed=false`,
    fields: 'files(id,name,modifiedTime)'
  });
  const file = listRes.data.files && listRes.data.files[0];
  if(!file){
    throw new Error('No ' + DRIVE_FILE_NAME + ' found in the shared Drive folder. Has anyone run "Sync to Google Drive" at least once yet?');
  }
  const contentRes = await drive.files.get(
    { fileId: file.id, alt: 'media' },
    { responseType: 'text' }
  );
  return contentRes.data;
}

function readLastHash(){
  try{
    return fs.readFileSync(HASH_FILE, 'utf8').trim();
  }catch(e){
    return '';
  }
}
function writeLastHash(hash){
  fs.mkdirSync(path.dirname(HASH_FILE), { recursive: true });
  fs.writeFileSync(HASH_FILE, hash, 'utf8');
}

// Store codes that sync-audits.js added/replaced in this same job run.
// Local-only file, not committed — read here from the current run only.
function readChangedStoreCodes(){
  try{
    const raw = fs.readFileSync(SYNC_CHANGES_PATH, 'utf8').trim();
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  }catch(e){
    return [];
  }
}

async function waitForDashboardVisible(page, timeout){
  await page.waitForFunction(
    () => {
      const el = document.getElementById('appContent');
      return el && getComputedStyle(el).display !== 'none';
    },
    { timeout }
  );
}

async function loginBot(page, url){
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('#loginEmail', { timeout: 20000 });
  await page.type('#loginEmail', BOT_EMAIL, { delay: 20 });
  await page.type('#loginPassword', BOT_PASSWORD, { delay: 20 });
  await page.click('#loginBtn');
  await waitForDashboardVisible(page, 30000);
  // Give the initial data load + first render a moment to settle.
  await new Promise(resolve => setTimeout(resolve, 1500));
}

// Navigates to a given (already-authenticated-session) URL, injects the
// exact data snapshot this run fetched, reloads so it renders, waits for
// the dashboard to be visible, and screenshots it.
async function screenshotUrl(page, url, outputPath, dataJsonString){
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await waitForDashboardVisible(page, 30000);

  await page.evaluate((dataStr) => {
    window.localStorage.setItem('paradise_reports', dataStr);
  }, dataJsonString);
  await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });
  await waitForDashboardVisible(page, 30000);

  // Give Chart.js a moment to finish drawing all canvases.
  await new Promise(resolve => setTimeout(resolve, 2500));
  await page.screenshot({ path: outputPath, fullPage: true });
}

async function takeAllScreenshots(dataJsonString){
  if(!BOT_EMAIL || !BOT_PASSWORD){
    throw new Error('Missing BOT_EMAIL or BOT_PASSWORD secret — needed to log into the dashboard for the screenshot, since it now sits behind a login gate.');
  }

  const changedCodes = readChangedStoreCodes();
  const attachments = [];

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try{
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1000 });

    // Log in once; Firebase Auth's LOCAL persistence survives subsequent
    // navigations/reloads within this same page/browser context.
    await loginBot(page, DASHBOARD_BASE_URL + '?emailmode=1');

    // Whole-dashboard screenshot (as before).
    const overallPath = path.join(SCREENSHOT_DIR, 'dashboard-screenshot.png');
    await screenshotUrl(page, DASHBOARD_BASE_URL + '?emailmode=1', overallPath, dataJsonString);
    attachments.push({ filename: 'overall-dashboard.png', path: overallPath });

    // One individual screenshot per store that changed in this run.
    for (const code of changedCodes) {
      console.log('  Screenshotting changed store: ' + code);
      const storeUrl = DASHBOARD_BASE_URL + '?emailmode=1&view=store&entity=' + encodeURIComponent(code);
      const storePath = path.join(SCREENSHOT_DIR, 'store-' + code.replace(/[^A-Za-z0-9-]/g, '_') + '.png');
      await screenshotUrl(page, storeUrl, storePath, dataJsonString);
      attachments.push({ filename: code + '-report.png', path: storePath });
    }
  } finally {
    await browser.close();
  }

  return { attachments, changedCodes };
}

async function sendEmail(attachments, changedCodes){
  if(!GMAIL_USER || !GMAIL_APP_PASSWORD){
    throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD secret.');
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
  });
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const changedText = changedCodes.length
    ? 'New/updated store reports this run: ' + changedCodes.join(', ') + '.\n\n'
    : '';

  await transporter.sendMail({
    from: '"Kumar Ayush" <' + GMAIL_USER + '>',
    to: RECIPIENT_EMAIL,
    subject: 'Paradise Mystery Audit Dashboard — updated (' + today + ')',
    text:
      'New mystery audit data was detected this morning. ' +
      'See attached: the overall dashboard screenshot' +
      (changedCodes.length ? ', plus an individual screenshot for each newly added/updated store.' : '.') +
      '\n\n' + changedText +
      'Live dashboard: ' + DASHBOARD_BASE_URL,
    attachments,
  });
}

(async function main(){
  console.log('Fetching latest data from Google Drive...');
  const dataJsonString = await fetchDriveData();
  const currentHash = hashContent(dataJsonString);
  const lastHash = readLastHash();

  if(currentHash === lastHash){
    console.log('No change since last check. Skipping screenshot and email.');
    return;
  }

  console.log('New data detected. Logging in and taking screenshots (overall + changed stores)...');
  const { attachments, changedCodes } = await takeAllScreenshots(dataJsonString);

  console.log('Sending email to ' + RECIPIENT_EMAIL + ' with ' + attachments.length + ' attachment(s)...');
  await sendEmail(attachments, changedCodes);

  writeLastHash(currentHash);
  console.log('Done. Hash updated for tomorrow\'s comparison.');
})().catch(err => {
  console.error('daily-check failed:', err);
  process.exit(1);
});
