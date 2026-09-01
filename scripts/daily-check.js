/**
 * Daily mystery audit check.
 *
 * 1. Reads the latest paradise_mystery_audit_data.json from Google Drive
 *    using a service account (no interactive login needed).
 * 2. Compares its content hash against data/last-hash.txt in this repo.
 * 3. If unchanged -> exits quietly, no email sent.
 * 4. If changed -> opens the live dashboard in a headless browser, injects
 *    the fresh data into its local storage, takes a full-page screenshot,
 *    emails it as an attachment, and updates data/last-hash.txt.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

const DRIVE_FOLDER_ID = '1mG09RBRDtB3-WtLTnWpaPZ-LpDJCyB4X';
const DRIVE_FILE_NAME = 'paradise_mystery_audit_data.json';
const DASHBOARD_URL = 'https://paradise-sudo.github.io/paradise-mystery-audit-dashboard/?emailmode=1';
const HASH_FILE = path.join(__dirname, '..', 'data', 'last-hash.txt');
const SCREENSHOT_PATH = path.join(__dirname, '..', 'dashboard-screenshot.png');

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'kumar.ayush@paradisefoodcourt.in';
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const SERVICE_ACCOUNT_JSON = process.env.GDRIVE_SERVICE_ACCOUNT_JSON;

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

async function screenshotDashboard(dataJsonString){
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try{
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1000 });
    await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle0', timeout: 60000 });

    // Inject the fresh data into the page's local storage, then reload so the dashboard renders it.
    await page.evaluate((dataStr) => {
      window.localStorage.setItem('paradise_reports', dataStr);
    }, dataJsonString);
    await page.reload({ waitUntil: 'networkidle0', timeout: 60000 });

    // Give Chart.js a moment to finish drawing all canvases.
    await new Promise(resolve => setTimeout(resolve, 2500));

    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  } finally {
    await browser.close();
  }
}

async function sendEmail(){
  if(!GMAIL_USER || !GMAIL_APP_PASSWORD){
    throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD secret.');
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
  });
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  await transporter.sendMail({
    from: '"Kumar Ayush" <' + GMAIL_USER + '>',
    to: RECIPIENT_EMAIL,
    subject: 'Paradise Mystery Audit Dashboard — updated (' + today + ')',
    text: 'New mystery audit data was detected this morning. See attached screenshot of the full dashboard.\n\nLive dashboard: ' + DASHBOARD_URL,
    attachments: [{ filename: 'paradise-mystery-audit-dashboard.png', path: SCREENSHOT_PATH }]
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

  console.log('New data detected. Rendering dashboard and taking screenshot...');
  await screenshotDashboard(dataJsonString);

  console.log('Sending email to ' + RECIPIENT_EMAIL + '...');
  await sendEmail();

  writeLastHash(currentHash);
  console.log('Done. Hash updated for tomorrow\'s comparison.');
})().catch(err => {
  console.error('daily-check failed:', err);
  process.exit(1);
});
