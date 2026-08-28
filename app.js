/* ================= CONFIG ================= */
const GOOGLE_CLIENT_ID = '404954767828-pc79i2vf3iss26nin391c9v9f27pf2gu.apps.googleusercontent.com';
const DRIVE_FOLDER_ID = '1mG09RBRDtB3-WtLTnWpaPZ-LpDJCyB4X';
const DRIVE_FILE_NAME = 'paradise_mystery_audit_data.json';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

/* ---------- Master store mapping ---------- */
const MASTER = JSON.parse(document.getElementById('master-data').textContent);
const MASTER_BY_CODE = {};
MASTER.forEach(m => MASTER_BY_CODE[m.code] = m);

/* ---------- Logo ---------- */
const LOGO_B64 = document.getElementById('logo-data').textContent.trim();
document.getElementById('logoImg').src = 'data:image/png;base64,' + LOGO_B64;

/* ---------- Seed data: the 3 real audited stores ---------- */
const SEED_REPORTS = [
{code:'S1129', month:'Aug 2026', overall:79,
 sections:{'Ambience':93,'Order Taking':65,'F&B Quality':100,'Billing':85,'Recommendation':75},
 serving:[['Reshmi Kebab','8:15 PM','8:28 PM',13],['Nizami Biryani','8:15 PM','8:36 PM',21]],
 detail:{
  'Ambience':[['Welcome & comfortable',1,1],['Placards/lighting working',1,1],['No flies/insects',2,2],['Entrance/counter clean',2,2],['AC comfortable',1,1],['Music volume comfortable',0,1],['Restroom maintained',3,3],['Cleaning chart updated',2,2],['No tissues on floor',1,1],['Signage clean & lit',1,1]],
  'Order Taking':[['Greeted promptly',0,1],['Staff attentive',1,1],['Guided to table',0,1],['Water bottle pre-placed',0,1],['Menu presented',1,1],['Suggestive selling done',0,1],['Order repeated correctly',1,1],['Staff introduced self',0,1],['Loyalty pass recommended',0,1],['Dish announced before serving',0,2],['Satisfaction checked',2,2],['Finger bowl w/ lemon',2,2],['Table cleared in 5 min',2,2],['Staff well groomed',2,2]],
  'F&B Quality':[['Quality standards met',2,2],['Taste satisfactory',2,2],['Correct condiments',1,1]],
  'Billing':[['Hassle free',2,2],['Contact details taken',0,1],['Billed within 90s',2,2],['Multiple payment options',1,1],['Bill/receipt issued',5,5],['Feedback via SMS/Google',0,1],['Staff thanked at end',1,1]],
  'Recommendation':[['Memorable service',2,2],['Likelihood to recommend',7,10]]
 },
 comments:{
  'Ambience':'Signage well-lit and visible; entrance clean; hygiene satisfactory; AC comfortable; seating well organised, clutter-free. However, no music was playing. Washroom clean, hygienic, all fixtures working.',
  'Order Taking':'No staff at entrance to greet, table selected ourselves. Menus placed, well maintained. No pre-placed water bottle, had to request one. Mounika did not introduce herself but was attentive, responsive, pleasant smile. Order repeated correctly, spice level accommodated. Dishes not proactively announced before serving. No loyalty pass or offers mentioned.',
  'F&B Quality':'Both dishes served as ordered, appropriate portion size, satisfactory presentation and taste. Served at suitable temperature, correct cutlery/tissues/condiments provided.',
  'Billing':'Billing process smooth, accurate, prompt. Cash accepted, correct bill provided. No issues with billing or revenue leakage. No contact number requested. No SMS/Google feedback request made. Staff thanked us at the end.',
  'Recommendation':'Positives: clean, tidy, well-maintained outlet; signage visible; menus well maintained; staff attentive and courteous; order repeated correctly with spice accommodation; food served correctly with good taste/portion/temperature; billing smooth and accurate; staff well-groomed; finger bowl provided, table cleared promptly. Negatives: no greeting at entrance, no pre-placed water, no staff introduction, no suggestive selling or loyalty pass, dishes not announced before serving, no feedback request during billing.'
 }},
{code:'S1101-05', month:'Aug 2026', overall:66,
 sections:{'Ambience':67,'Order Taking':56,'F&B Quality':75,'Billing':69,'Recommendation':75},
 serving:[['Fry Piece Chicken Biryani','8:06 PM','8:15 PM',9],['Nizami Chicken Biryani','8:20 PM','8:25 PM',5],['Falooda','8:37 PM','8:42 PM',5]],
 detail:{
  'Ambience':[['Welcome & comfortable',1,1],['Placards/lighting working',1,1],['No flies/insects',2,2],['Entrance/counter clean',2,2],['AC comfortable',1,1],['Music volume comfortable',1,1],['Restroom maintained',0,3],['Cleaning chart updated',0,2],['No tissues on floor',1,1],['Signage clean & lit',1,1]],
  'Order Taking':[['Greeted promptly',1,1],['Staff attentive',1,1],['Guided to table',1,1],['Water bottle pre-placed',0,1],['Water preference asked',1,1],['Menu presented',1,1],['Suggestive selling done',0,1],['Order repeated correctly',0,1],['Staff introduced self',0,1],['Loyalty pass recommended',0,1],['Dish announced before serving',0,2],['Satisfaction checked',0,2],['Finger bowl w/ lemon',0,2],['Table cleared in 5 min',2,2],['Staff well groomed',2,2]],
  'F&B Quality':[['Quality standards met',2,2],['Hot/cold served right temp',2,2],['Taste satisfactory',0,2],['Correct condiments',1,1],['Takeaway packing norms',1,1]],
  'Billing':[['Hassle free',2,2],['Contact details taken',0,1],['Billed within 90s',0,2],['Multiple payment options',1,1],['Bill/receipt issued',5,5],['Feedback via SMS/Google',0,1],['Staff thanked at end',1,1]],
  'Recommendation':[['Memorable service',2,2],['Likelihood to recommend',7,10]]
 },
 comments:{
  'Ambience':'Signage well maintained and illuminated, promotional placards impressive. Security checked belongings at entrance. Female staff greeted proactively with folded hands, escorted to table, helped charge phone (tipped Rs 30 via UPI). AC maintained, music played. Washroom door not well maintained, floor wet and had visible stains though fixtures worked. Cleaning checklist displayed but not updated.',
  'Order Taking':'Staff proactively assisted with table and took order. Confirmed item availability, recommended Nizami vs Fry Piece options. No water bottle pre-placed, staff asked and brought chilled water. Order not repeated or serving time proactively informed - had to ask; informed ~10 min, served on time. Recommended ice cream/Falooda when asked but did not proactively suggest food items. No loyalty pass info given. Table not cleared proactively after meal; finger bowl only on request.',
  'F&B Quality':'Appearance satisfactory, served at appropriate temperature. Taste could be improved; portion size could be increased for two people. Mirchi ka Salaan was noticeably sour and did not complement the biryani. Remaining food packed properly in branded packaging.',
  'Billing':'Billing requested ~9:05 PM, hassle-free with multiple payment options. Paid cash, staff returned correct change. Billing time on receipt incorrectly recorded as 8:07 PM instead of actual 9:07 PM. No feedback requested. Staff helped charge phone, accepted Rs 30 UPI tip.',
  'Recommendation':'Positives: well-groomed staff, impressive signage/placards, appealing greeting gesture, satisfactory service, well-maintained ambiance. Negatives: no preplaced water bottle, incorrect bill timestamp, restroom door/cleaning chart not maintained, no self-suggested items/loyalty pass/offers, order not repeated or dishes named before serving, no satisfaction check, finger bowl only on request.'
 }},
{code:'S1142', month:'Aug 2026', overall:64,
 sections:{'Ambience':53,'Order Taking':61,'F&B Quality':100,'Billing':69,'Recommendation':58},
 serving:[['Chicken Tikka Kebab','7:48 PM','7:57 PM',9],['Nizami Chicken Biryani','7:48 PM','7:57 PM',9]],
 detail:{
  'Ambience':[['Welcome & comfortable',1,1],['Placards/lighting working',0,1],['No flies/insects',2,2],['Entrance/counter clean',2,2],['AC comfortable',1,1],['Music volume comfortable',1,1],['Restroom maintained',0,3],['Cleaning chart updated',0,2],['No tissues on floor',0,1],['Signage clean & lit',1,1]],
  'Order Taking':[['Greeted promptly',0,1],['Staff attentive',1,1],['Guided to table',0,1],['Water bottle pre-placed',1,1],['Menu presented',1,1],['Veg/non-veg asked',1,1],['Suggestive selling done',0,1],['Order repeated correctly',0,1],['Staff introduced self',0,1],['Loyalty pass recommended',0,1],['Dish announced before serving',2,2],['Staff pleasing smile',0,1],['Finger bowl w/ lemon',0,2],['Table cleared in 5 min',2,2],['Staff well groomed',2,2]],
  'F&B Quality':[['Quality standards met',2,2],['Hot/cold served right temp',2,2],['Taste satisfactory',2,2],['Correct condiments',1,1]],
  'Billing':[['Hassle free',0,2],['Contact details taken',0,1],['Billed within 90s',2,2],['Multiple payment options',1,1],['Bill/receipt issued',5,5],['Feedback via SMS/Google',0,1],['Staff thanked at end',1,1]],
  'Recommendation':[['Memorable service',0,2],['Likelihood to recommend',7,10]]
 },
 comments:{
  'Ambience':'Exterior signage well-lit, properly maintained. Indoor temperature comfortable, soft music playing. Water bottle available at each table. Restroom needs improvement: WC flush not operational (notice displayed), wash-area cabinet damaged. Tissue and biryani rice observed on dining floor; table had visible stain. Two ceiling lights not functioning.',
  'Order Taking':'No staff available to greet or assist with seating; table chosen independently. Staff said "Yes, sir" without greeting, did not introduce herself. Recommended mutton over chicken; used phone while taking order (felt unprofessional). Revised order (mutton to chicken) not clearly reconfirmed. No proactive veg/non-veg enquiry or offer-of-the-day communication; had to ask. Finger bowl only provided after request.',
  'F&B Quality':'Nizami Biryani flavorful, well-prepared, rich in taste. Chicken Tikka Kebab tender, well-cooked, enjoyable. Highly satisfied with food quality, taste, presentation and portion.',
  'Billing':'Bill folder initially provided without the bill inside. Total ₹827, paid ₹1,000 cash — initially only ₹70 returned instead of ₹173, corrected after flagging to Laxmi who apologised and coordinated with billing counter. Contact number not requested or recorded. All major payment options available.',
  'Recommendation':'Positives: clean well-lit signage, comfortable temperature, appropriate music volume, water bottle already on table, food served hot and well-presented, tasty biryani and kebab, cutlery/tissues/condiments provided. Negatives: no staff greeting or seating assistance, unprofessional phone use while ordering, revised order not reconfirmed, no proactive recommendations or offers, restroom WC flush broken and countertop damaged, dining area cleanliness lapses, billing change discrepancy needing correction.'
 }}
];

const SECTION_NAMES = ['Ambience','Order Taking','F&B Quality','Billing','Recommendation'];

/* ---------- App state ---------- */
let state = {
  reports: [],
  thresholds: {pass: 80, review: 60},
  view: 'central',
  entity: null
};

/* ---------- Attach master fields to a report by code ---------- */
function enrich(r){
  const m = MASTER_BY_CODE[r.code] || {};
  return Object.assign({name: m.name || r.code, am: m.am || 'Unassigned', rm: m.rm || 'Unassigned', region: m.region || 'Unassigned', type: m.type || 'Unassigned'}, r);
}

/* ================= GOOGLE SIGN-IN ================= */
let tokenClient = null;
let accessToken = null;
let userEmail = null;

function initGoogleAuth(){
  if(typeof google === 'undefined' || !google.accounts){
    setTimeout(initGoogleAuth, 300);
    return;
  }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: DRIVE_SCOPE + ' email profile openid',
    callback: () => {}
  });
}
function requestAccessToken(interactive){
  return new Promise((resolve, reject) => {
    if(!tokenClient){ reject(new Error('Google auth not ready yet, try again in a moment.')); return; }
    tokenClient.callback = async (resp) => {
      if(resp.error){ reject(new Error(resp.error)); return; }
      accessToken = resp.access_token;
      try{
        const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {headers:{Authorization:'Bearer '+accessToken}}).then(r=>r.json());
        userEmail = info.email || null;
      }catch(e){ userEmail = null; }
      renderAuthBox();
      resolve(accessToken);
    };
    tokenClient.requestAccessToken({prompt: accessToken ? '' : 'consent'});
  });
}
function signOut(){
  if(accessToken){
    google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  userEmail = null;
  renderAuthBox();
}
function renderAuthBox(){
  const box = document.getElementById('authBox');
  if(userEmail){
    box.innerHTML = '<span class="pill">Signed in: ' + userEmail + '</span>';
    const out = document.createElement('button');
    out.textContent = 'Sign out';
    out.onclick = signOut;
    box.appendChild(out);
  } else {
    box.innerHTML = '';
    const btn = document.createElement('button');
    btn.id = 'signInBtn';
    btn.textContent = 'Sign in with Google';
    btn.onclick = () => requestAccessToken(true).catch(e => flashStatus('Sign-in failed: ' + e.message, true));
    box.appendChild(btn);
  }
}

/* ---------- Persistence: local (window.storage if available, else localStorage) ---------- */
function hasClaudeStorage(){
  return typeof window.storage !== 'undefined' && window.storage && typeof window.storage.get === 'function';
}
async function loadLocal(){
  try{
    let raw = null;
    if(hasClaudeStorage()){
      const res = await window.storage.get('paradise_reports');
      raw = res ? res.value : null;
    } else {
      raw = localStorage.getItem('paradise_reports');
    }
    if(raw){
      const parsed = JSON.parse(raw);
      state.reports = parsed.reports || [];
      state.thresholds = parsed.thresholds || state.thresholds;
    } else {
      state.reports = SEED_REPORTS.map(enrich);
    }
  }catch(e){
    state.reports = SEED_REPORTS.map(enrich);
  }
}
async function saveLocal(showMsg){
  const payload = JSON.stringify({reports: state.reports, thresholds: state.thresholds});
  try{
    if(hasClaudeStorage()){
      await window.storage.set('paradise_reports', payload);
    } else {
      localStorage.setItem('paradise_reports', payload);
    }
    if(showMsg) flashStatus('Saved to this browser.', false);
  }catch(e){
    if(showMsg) flashStatus('Could not save locally: ' + e.message, true);
  }
}
function flashStatus(text, isErr){
  const msg = document.getElementById('storageMsg');
  msg.textContent = text;
  msg.className = 'status-msg ' + (isErr ? 'err' : 'ok');
}

/* ================= GOOGLE DRIVE (REST API) ================= */
async function driveFindFile(token){
  const q = encodeURIComponent("name='" + DRIVE_FILE_NAME + "' and '" + DRIVE_FOLDER_ID + "' in parents and trashed=false");
  const res = await fetch('https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id,name)', {
    headers: {Authorization: 'Bearer ' + token}
  });
  if(!res.ok) throw new Error('Drive search failed (' + res.status + ')');
  const data = await res.json();
  return (data.files && data.files[0]) || null;
}
async function driveCreateFile(token, contentStr){
  const boundary = 'paradise_boundary_314159265';
  const metadata = {name: DRIVE_FILE_NAME, parents: [DRIVE_FOLDER_ID], mimeType: 'application/json'};
  const body =
    '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) + '\r\n' +
    '--' + boundary + '\r\nContent-Type: application/json\r\n\r\n' + contentStr + '\r\n' +
    '--' + boundary + '--';
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/related; boundary=' + boundary},
    body
  });
  if(!res.ok) throw new Error('Drive create failed (' + res.status + ')');
  return res.json();
}
async function driveUpdateFile(token, fileId, contentStr){
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media', {
    method: 'PATCH',
    headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'},
    body: contentStr
  });
  if(!res.ok) throw new Error('Drive update failed (' + res.status + ')');
  return res.json();
}
async function driveDownloadFile(token, fileId){
  const res = await fetch('https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media', {
    headers: {Authorization: 'Bearer ' + token}
  });
  if(!res.ok) throw new Error('Drive download failed (' + res.status + ')');
  return res.text();
}
async function driveSave(){
  try{
    flashStatus('Signing in / checking access…', false);
    const token = await requestAccessToken(true);
    flashStatus('Syncing to Google Drive…', false);
    const payload = JSON.stringify({reports: state.reports, thresholds: state.thresholds});
    const existing = await driveFindFile(token);
    if(existing){
      await driveUpdateFile(token, existing.id, payload);
    } else {
      await driveCreateFile(token, payload);
    }
    flashStatus('Synced to Google Drive.', false);
  }catch(e){
    flashStatus('Drive sync failed: ' + e.message, true);
  }
}
async function driveLoad(){
  try{
    flashStatus('Signing in / checking access…', false);
    const token = await requestAccessToken(true);
    flashStatus('Loading from Google Drive…', false);
    const existing = await driveFindFile(token);
    if(!existing){ flashStatus('No backup file found in the Drive folder yet.', true); return; }
    const text = await driveDownloadFile(token, existing.id);
    const parsed = JSON.parse(text);
    state.reports = parsed.reports || [];
    state.thresholds = parsed.thresholds || state.thresholds;
    await saveLocal(false);
    document.getElementById('thPass').value = state.thresholds.pass;
    document.getElementById('thReview').value = state.thresholds.review;
    renderReportList();
    renderAll();
    flashStatus('Loaded from Google Drive.', false);
  }catch(e){
    flashStatus('Could not load from Drive: ' + e.message, true);
  }
}

/* ---------- Filtering by view ---------- */
function filteredReports(){
  const list = state.reports;
  if(state.view === 'central' || !state.entity) return list;
  if(state.view === 'store') return list.filter(r => r.code === state.entity);
  if(state.view === 'am') return list.filter(r => r.am === state.entity);
  if(state.view === 'rm') return list.filter(r => r.rm === state.entity);
  if(state.view === 'region') return list.filter(r => r.region === state.entity);
  if(state.view === 'type') return list.filter(r => r.type === state.entity);
  return list;
}

/* ---------- Rendering: report list panel ---------- */
function renderReportList(){
  const el = document.getElementById('reportList');
  el.innerHTML = '';
  if(state.reports.length === 0){
    el.innerHTML = '<p class="small-note">No reports yet.</p>';
    return;
  }
  state.reports.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'report-row';
    row.innerHTML = '<span>' + r.month + ' &middot; ' + r.code + ' ' + (r.name||'') + '</span>' +
      '<span style="display:flex;align-items:center;gap:10px;"><strong>' + r.overall + '%</strong></span>';
    const rm = document.createElement('button');
    rm.className = 'iconbtn danger';
    rm.textContent = '✕';
    rm.setAttribute('aria-label','Remove report');
    rm.onclick = () => { state.reports.splice(i,1); renderReportList(); renderAll(); saveLocal(false); };
    row.querySelector('span:last-child').appendChild(rm);
    el.appendChild(row);
  });
}

/* ---------- View tabs ---------- */
const TAB_DEFS = [
  ['central','Central'],['region','Region'],['rm','Zonal manager'],
  ['am','Area manager'],['type','Store type'],['store','Store']
];
function renderTabs(){
  const el = document.getElementById('viewTabs');
  el.innerHTML = '';
  TAB_DEFS.forEach(([key,label]) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = key === state.view ? 'active' : '';
    b.onclick = () => { state.view = key; state.entity = null; renderEntityPicker(); renderAll(); };
    el.appendChild(b);
  });
}
function entityOptionsFor(view){
  const set = new Set();
  state.reports.forEach(r => {
    if(view === 'am') set.add(r.am);
    if(view === 'rm') set.add(r.rm);
    if(view === 'region') set.add(r.region);
    if(view === 'type') set.add(r.type);
    if(view === 'store') set.add(r.code);
  });
  return [...set];
}
function renderEntityPicker(){
  const row = document.getElementById('entityPickerRow');
  const sel = document.getElementById('entityPicker');
  if(state.view === 'central'){ row.style.display = 'none'; return; }
  const opts = entityOptionsFor(state.view);
  row.style.display = opts.length ? 'flex' : 'none';
  sel.innerHTML = '';
  opts.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o; opt.textContent = o;
    sel.appendChild(opt);
  });
  if(opts.length){ state.entity = opts[0]; }
  sel.onchange = () => { state.entity = sel.value; renderAll(); };
}

/* ---------- Overview metrics ---------- */
function classify(v){
  if(v >= state.thresholds.pass) return 'pass';
  if(v >= state.thresholds.review) return 'review';
  return 'fail';
}
function renderMetrics(list){
  const el = document.getElementById('metricRow');
  el.innerHTML = '';
  if(list.length === 0){
    el.innerHTML = '<p class="small-note">No reports in this view yet.</p>';
    return;
  }
  const avgOverall = Math.round(list.reduce((a,r)=>a+r.overall,0)/list.length);
  const cls = classify(avgOverall);
  const clsLabel = cls === 'pass' ? 'Pass' : cls === 'review' ? 'Review' : 'Fail';
  const items = [
    ['Overall score', avgOverall + '%', '<span class="badge ' + cls + '">' + clsLabel + '</span>'],
    ['Stores in view', list.length, ''],
    ['Highest store', Math.max(...list.map(r=>r.overall)) + '%', ''],
    ['Lowest store', Math.min(...list.map(r=>r.overall)) + '%', '']
  ];
  items.forEach(([label,val,extra]) => {
    const c = document.createElement('div');
    c.className = 'metric';
    c.innerHTML = '<p class="lbl">' + label + '</p><p class="val">' + val + '</p>' + (extra||'');
    el.appendChild(c);
  });
}

/* ---------- Section chart ---------- */
let secChartInstance;
function renderSectionChart(list){
  const avg = SECTION_NAMES.map(s => {
    const vals = list.map(r => r.sections[s]).filter(v => v !== undefined);
    return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
  });
  if(secChartInstance) secChartInstance.destroy();
  secChartInstance = new Chart(document.getElementById('secChart'), {
    type: 'bar',
    data: {labels: SECTION_NAMES, datasets: [{label:'Score %', data: avg, backgroundColor:'#5c1414', borderRadius:4, maxBarThickness:44}]},
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'}}},
      onClick:(evt,els)=>{
        if(!els.length) return;
        const sec = SECTION_NAMES[els[0].index];
        const pf = document.getElementById('passFailBox');
        const pass = list.filter(r => (r.sections[sec]||0) >= 75);
        const fail = list.filter(r => (r.sections[sec]||0) < 75);
        pf.innerHTML = '<p style="margin:4px 0;"><strong>' + sec + '</strong> &middot; reference 75%</p>' +
          '<p style="color:var(--pass);margin:2px 0;">Passed: ' + (pass.map(r=>r.name+' ('+r.sections[sec]+'%)').join(', ') || 'none') + '</p>' +
          '<p style="color:var(--fail);margin:2px 0;">Failed: ' + (fail.map(r=>r.name+' ('+r.sections[sec]+'%)').join(', ') || 'none') + '</p>';
      }
    }
  });
  document.getElementById('passFailBox').textContent = 'Click a bar above to see which stores passed or failed that section.';
}

/* ---------- Serving time table ---------- */
function renderServing(list){
  const el = document.getElementById('servingRows');
  el.innerHTML = '';
  list.forEach(r => (r.serving||[]).forEach(([p,o,sv,m]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + r.name + '</td><td>' + p + '</td><td>' + o + '</td><td>' + sv + '</td><td>' + m + '</td>';
    el.appendChild(tr);
  }));
  if(!el.children.length){ el.innerHTML = '<tr><td colspan="5" class="small-note">No serving-time data in this view.</td></tr>'; }
}

/* ---------- Rollup chart (AM / RM / Region) — always from full dataset ---------- */
let rollupChartInstance;
function renderRollupChart(){
  function avgObj(groupFn){
    const g = {};
    state.reports.forEach(r => { const k = groupFn(r); (g[k]=g[k]||[]).push(r.overall); });
    const out = {};
    Object.entries(g).forEach(([k,v]) => out[k] = Math.round(v.reduce((a,b)=>a+b,0)/v.length));
    return out;
  }
  const amA = avgObj(r=>r.am), rmA = avgObj(r=>r.rm), regA = avgObj(r=>r.region);
  const labels = [
    ...Object.keys(amA).map(k=>'AM: '+k),
    ...Object.keys(rmA).map(k=>'RM: '+k),
    ...Object.keys(regA).map(k=>'Region: '+k)
  ];
  const data = [...Object.values(amA), ...Object.values(rmA), ...Object.values(regA)];
  if(rollupChartInstance) rollupChartInstance.destroy();
  if(!labels.length) return;
  rollupChartInstance = new Chart(document.getElementById('rollupChart'), {
    type:'bar',
    data:{labels, datasets:[{label:'Avg overall %', data, backgroundColor:'#1baf7a', borderRadius:4, maxBarThickness:28}]},
    options:{indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{min:0,max:100,ticks:{callback:v=>v+'%'}}}}
  });
}

/* ---------- Store type chart — always from full dataset ---------- */
let typeChartInstance;
function renderTypeChart(){
  const types = [...new Set(state.reports.map(r=>r.type))];
  const colors = ['#2a78d6','#eb6834','#1baf7a','#eda100','#4a3aa7'];
  const datasets = types.map((t,i) => {
    const list = state.reports.filter(r=>r.type===t);
    const data = SECTION_NAMES.map(sec => {
      const vals = list.map(r=>r.sections[sec]).filter(v=>v!==undefined);
      return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
    });
    return {label:t, data, backgroundColor: colors[i%colors.length], borderRadius:4, maxBarThickness:22};
  });
  if(typeChartInstance) typeChartInstance.destroy();
  if(!datasets.length) return;
  typeChartInstance = new Chart(document.getElementById('typeChart'), {
    type:'bar',
    data:{labels:SECTION_NAMES, datasets},
    options:{responsive:true, maintainAspectRatio:false, scales:{y:{min:0,max:100,ticks:{callback:v=>v+'%'}}},
      plugins:{legend:{display:true, position:'bottom', labels:{boxWidth:10, font:{size:11}}}}}
  });
}

/* ---------- Marks cut ---------- */
function renderCutList(list){
  const el = document.getElementById('cutList');
  el.innerHTML = '';
  const cutMap = {};
  list.forEach(r => {
    Object.entries(r.detail||{}).forEach(([sec,qs]) => {
      qs.forEach(([label,score,max]) => {
        const key = sec + ' — ' + label;
        if(!cutMap[key]) cutMap[key] = {lost:0, instances:0, misses:0};
        cutMap[key].lost += (max-score);
        cutMap[key].instances += 1;
        if(score < max) cutMap[key].misses += 1;
      });
    });
  });
  const top = Object.entries(cutMap).filter(([k,v])=>v.lost>0).sort((a,b)=>b[1].lost-a[1].lost).slice(0,10);
  if(!top.length){ el.innerHTML = '<p class="small-note">No data in this view.</p>'; return; }
  top.forEach(([k,v]) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid #f1ebe3;font-size:12.5px;';
    row.innerHTML = '<span>' + k + '</span><span style="color:var(--fail);white-space:nowrap;">missed ' + v.misses + '/' + v.instances + ' &middot; -' + v.lost + ' pts</span>';
    el.appendChild(row);
  });
  return cutMap;
}

/* ---------- Comments accordion ---------- */
function renderComments(list){
  const el = document.getElementById('commentsAcc');
  el.innerHTML = '';
  if(!list.length){ el.innerHTML = '<p class="small-note">No reports in this view.</p>'; return; }
  list.forEach(r => {
    const card = document.createElement('div');
    card.className = 'acc-card';
    const head = document.createElement('div');
    head.className = 'acc-head';
    head.textContent = r.code + ' · ' + r.name + ' — ' + r.overall + '%';
    const body = document.createElement('div');
    body.className = 'acc-body';
    SECTION_NAMES.forEach(sec => {
      const txt = (r.comments||{})[sec];
      if(!txt) return;
      const p = document.createElement('p');
      p.style.cssText = 'font-size:12.5px;margin:8px 0 2px;';
      p.innerHTML = '<strong>' + sec + ':</strong> <span style="color:var(--ink-soft);">' + txt + '</span>';
      body.appendChild(p);
    });
    head.onclick = () => body.classList.toggle('open');
    card.appendChild(head); card.appendChild(body);
    el.appendChild(card);
  });
}

/* ---------- Word cloud (hybrid: frequency + curated synonym map) ---------- */
const STOPWORDS = new Set(['the','a','an','and','or','but','was','were','is','are','be','been','being','to','of','in','on','at','for','with','staff','store','outlet','restaurant','visit','during','we','our','us','they','their','it','its','this','that','also','had','has','have','did','do','does','as','so','not','no','table','food','item','items','order','ordered']);
const NEGATIVE_PHRASES = [
  [/no (\w+ )?greet\w*/gi, 'no greeting'],
  [/not (well[- ])?maintained/gi, 'not maintained'],
  [/not updated/gi, 'not updated'],
  [/no (pre[- ]?placed )?water bottle/gi, 'no water bottle'],
  [/did not introduce|no.{0,15}introduc\w*/gi, 'no introduction'],
  [/no loyalty pass/gi, 'no loyalty pass'],
  [/not (proactively )?announc\w*/gi, 'not announced'],
  [/sour/gi, 'sour taste'],
  [/damaged|broken/gi, 'damaged fixture'],
  [/unprofessional/gi, 'unprofessional'],
  [/stain\w*/gi, 'stains'],
  [/no.{0,20}feedback/gi, 'no feedback request'],
  [/incorrect.{0,15}(change|amount|bill)/gi, 'billing error'],
  [/on request only|only.{0,10}request/gi, 'service only on request'],
  [/wet floor/gi, 'wet floor'],
  [/not (clearly )?repeat\w*|not reconfirm\w*/gi, 'order not repeated']
];
const POSITIVE_PHRASES = [
  [/well[- ]groomed/gi, 'well-groomed'],
  [/well[- ]maintained/gi, 'well-maintained'],
  [/clean\w*/gi, 'clean'],
  [/attentive/gi, 'attentive'],
  [/courteous/gi, 'courteous'],
  [/professional/gi, 'professional'],
  [/tasty|flavorful|rich in taste/gi, 'tasty'],
  [/satisf\w+/gi, 'satisfactory'],
  [/comfortable/gi, 'comfortable'],
  [/hygienic/gi, 'hygienic'],
  [/prompt\w*/gi, 'prompt'],
  [/welcom\w*/gi, 'welcoming'],
  [/responsive/gi, 'responsive'],
  [/well[- ]lit/gi, 'well-lit'],
  [/proactiv\w*/gi, 'proactive service']
];
function buildCloud(list){
  const allText = [];
  list.forEach(r => Object.values(r.comments||{}).forEach(t => allText.push(t)));
  const combined = allText.join(' . ');
  const posCounts = {}, negCounts = {};
  NEGATIVE_PHRASES.forEach(([re,label]) => {
    const m = combined.match(re);
    if(m) negCounts[label] = (negCounts[label]||0) + m.length;
  });
  POSITIVE_PHRASES.forEach(([re,label]) => {
    const m = combined.match(re);
    if(m) posCounts[label] = (posCounts[label]||0) + m.length;
  });
  const words = combined.toLowerCase().replace(/[^a-z\s'-]/g,' ').split(/\s+/).filter(w => w.length>3 && !STOPWORDS.has(w));
  const freq = {};
  words.forEach(w => freq[w] = (freq[w]||0)+1);
  return {pos: posCounts, neg: negCounts, freq};
}
function renderCloud(el, counts){
  el.innerHTML = '';
  const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,14);
  if(!entries.length){ el.innerHTML = '<span class="small-note">Not enough comment data yet.</span>'; return; }
  const max = Math.max(...entries.map(e=>e[1]));
  entries.forEach(([w,c]) => {
    const size = 12 + (c/max)*13;
    const span = document.createElement('span');
    span.style.fontSize = size + 'px';
    span.style.fontWeight = size > 20 ? '700' : '500';
    span.textContent = w;
    el.appendChild(span);
  });
}

/* ---------- AI recommendations ---------- */
const REC_LIBRARY = [
  {match:'Order Taking — Staff introduced self', priority:'High', section:'Order Taking',
   title:'Introduce a standard greeting & introduction script',
   action:'Train front-of-house to greet within 30 seconds of arrival and have serving staff introduce themselves by name when taking the order.'},
  {match:'Order Taking — Suggestive selling done', priority:'High', section:'Order Taking',
   title:'Build suggestive selling & loyalty pass into the order flow',
   action:'Add a scripted prompt staff must use at order-taking: recommend one add-on item and mention the loyalty pass, every visit.'},
  {match:'Billing — Contact details taken', priority:'High', section:'Billing',
   title:'Capture contact details and request feedback at billing',
   action:'Make contact capture and a feedback link mandatory steps in the billing SOP, not optional.'},
  {match:'Ambience — Restroom maintained', priority:'Medium', section:'Ambience',
   title:'Fix restroom maintenance and enforce cleaning chart logging',
   action:'Raise maintenance tickets for flagged stores immediately; make cleaning-chart sign-off a shift-close checklist item, spot-checked by the AM.'},
  {match:'Order Taking — Dish announced before serving', priority:'Medium', section:'Order Taking',
   title:'Announce dishes before placing on the table',
   action:'Reinforce in server training: name the dish out loud when placing it, a standard hospitality cue.'},
  {match:'Order Taking — Finger bowl w/ lemon', priority:'Medium', section:'Order Taking',
   title:'Offer the finger bowl proactively, not on request',
   action:'Add finger bowl service as an automatic post-meal step, no guest prompt needed.'}
];
function renderRecommendations(list, cutMap){
  const el = document.getElementById('recList');
  el.innerHTML = '';
  if(!list.length || !cutMap){ el.innerHTML = '<p class="small-note">No data in this view yet.</p>'; return; }
  const applicable = REC_LIBRARY.filter(r => cutMap[r.match] && cutMap[r.match].misses > 0);
  const recScores = list.map(r => (r.detail && r.detail['Recommendation'] && r.detail['Recommendation'][1]) ? r.detail['Recommendation'][1][1] : null).filter(v=>v!==null);
  const extras = [];
  if(recScores.length && recScores.every(v => v <= 7)){
    extras.push({priority:'Low', section:'Recommendation', title:'Investigate the recommendation-score ceiling',
      action:'Likelihood-to-recommend is capped at 7/10 across every visited store despite decent F&B scores — suggests service-experience gaps, not food, are the limiting factor. Re-audit after fixing the items above to see if it moves.'});
  }
  const finalList = [...applicable.map(r => ({priority:r.priority, section:r.section, title:r.title, action:r.action,
      evidence: cutMap[r.match] ? ('Missed in ' + cutMap[r.match].misses + '/' + cutMap[r.match].instances + ' visits in this view.') : ''})),
    ...extras];
  if(!finalList.length){ el.innerHTML = '<p class="small-note">No systemic issues detected in this view — scores look consistent.</p>'; return; }
  finalList.forEach(r => {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML =
      '<div class="rec-top"><p class="title">' + r.title + '</p>' +
      '<div style="display:flex;gap:6px;flex-shrink:0;"><span class="tag ' + r.priority + '">' + r.priority + '</span><span class="tag section">' + r.section + '</span></div></div>' +
      (r.evidence ? '<p><strong>Evidence: </strong>' + r.evidence + '</p>' : '') +
      '<p><strong>Action: </strong>' + r.action + '</p>';
    el.appendChild(card);
  });
}

/* ---------- Store detail accordion with play button ---------- */
function renderStoreAccordion(list){
  const el = document.getElementById('storeAccordion');
  el.innerHTML = '';
  if(!list.length){ el.innerHTML = '<p class="small-note">No reports in this view.</p>'; return; }
  list.forEach(r => {
    const card = document.createElement('div');
    card.className = 'acc-card';
    const head = document.createElement('div');
    head.className = 'acc-head';
    head.innerHTML = '<span>' + r.code + ' &middot; ' + r.name + ' <span class="small-note">(' + r.am + ' / ' + r.rm + ')</span></span>' +
      '<span style="display:flex;align-items:center;gap:10px;"><span>' + r.overall + '%</span></span>';
    const body = document.createElement('div');
    body.className = 'acc-body';
    Object.entries(r.detail||{}).forEach(([sec,qs]) => {
      const t = document.createElement('p');
      t.style.cssText = 'font-size:13px;font-weight:700;margin:10px 0 4px;color:var(--maroon-dark);';
      t.textContent = sec;
      body.appendChild(t);
      qs.forEach(([label,score,max]) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;font-size:12.5px;padding:3px 0;color:' + (score<max ? 'var(--fail)' : 'var(--ink-soft)') + ';';
        row.innerHTML = '<span>' + label + '</span><span>' + score + '/' + max + '</span>';
        body.appendChild(row);
      });
    });
    const playBtn = document.createElement('button');
    playBtn.className = 'playbtn';
    playBtn.setAttribute('aria-label','Play breakdown');
    playBtn.textContent = '▶';
    playBtn.onclick = (e) => {
      e.stopPropagation();
      const open = body.classList.toggle('open');
      playBtn.textContent = open ? '❚❚' : '▶';
    };
    head.querySelector('span:last-child').appendChild(playBtn);
    card.appendChild(head); card.appendChild(body);
    el.appendChild(card);
  });
}

/* ---------- Master render ---------- */
function renderAll(){
  const list = filteredReports();
  renderMetrics(list);
  renderSectionChart(list);
  renderServing(list);
  renderRollupChart();
  renderTypeChart();
  const cutMap = renderCutList(list);
  renderComments(list);
  const cloud = buildCloud(list);
  renderCloud(document.getElementById('posCloud'), Object.keys(cloud.pos).length ? cloud.pos : cloud.freq);
  renderCloud(document.getElementById('negCloud'), Object.keys(cloud.neg).length ? cloud.neg : {});
  renderRecommendations(list, cutMap);
  renderStoreAccordion(list);
}

/* ---------- Upload handlers ---------- */
document.getElementById('pdfInput').addEventListener('change', (e) => {
  const note = document.getElementById('pdfNote');
  const names = [...e.target.files].map(f=>f.name).join(', ');
  note.style.display = 'block';
  note.textContent = 'Received: ' + names + '. PDF reports need to be sent to Claude in chat for extraction into the structured format — this uploader stores the filename as a placeholder only. Once extracted, add the record via CSV.';
});
document.getElementById('csvInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      try{
        results.data.forEach(row => {
          const rec = enrich({
            code: row.store_code || row.code,
            month: row.month || 'Unknown',
            overall: Number(row.overall) || 0,
            sections: {
              'Ambience': Number(row.ambience) || 0,
              'Order Taking': Number(row.order_taking) || 0,
              'F&B Quality': Number(row.fnb_quality) || 0,
              'Billing': Number(row.billing) || 0,
              'Recommendation': Number(row.recommendation) || 0
            },
            serving: [],
            detail: {},
            comments: {}
          });
          state.reports.push(rec);
        });
        renderReportList();
        renderAll();
        saveLocal(true);
      }catch(err){
        flashStatus('CSV parse error: ' + err.message, true);
      }
    }
  });
});

/* ---------- Wire up buttons ---------- */
document.getElementById('saveLocalBtn').addEventListener('click', () => saveLocal(true));
document.getElementById('driveSaveBtn').addEventListener('click', driveSave);
document.getElementById('driveLoadBtn').addEventListener('click', driveLoad);
document.getElementById('applyThBtn').addEventListener('click', () => {
  state.thresholds.pass = Number(document.getElementById('thPass').value) || 80;
  state.thresholds.review = Number(document.getElementById('thReview').value) || 60;
  renderAll();
  saveLocal(false);
  flashStatus('Thresholds applied: Pass ≥' + state.thresholds.pass + '%, Review ≥' + state.thresholds.review + '%.', false);
});
document.getElementById('signInBtn').addEventListener('click', () => requestAccessToken(true).catch(e => flashStatus('Sign-in failed: ' + e.message, true)));

/* ---------- Init ---------- */
(async function init(){
  initGoogleAuth();
  await loadLocal();
  document.getElementById('thPass').value = state.thresholds.pass;
  document.getElementById('thReview').value = state.thresholds.review;
  renderTabs();
  renderEntityPicker();
  renderReportList();
  renderAll();
})();
