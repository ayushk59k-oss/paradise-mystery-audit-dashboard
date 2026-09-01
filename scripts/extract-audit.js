const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { SECTIONS } = require('./template');

// ---- text cleanup ----
function cleanText(raw) {
  // strip the repeated page-header banner ("Aug 2026 | <store> ... TG"),
  // which can wrap across 2 lines for stores with longer addresses
  let text = raw.replace(/\n[A-Z][a-z]+ \d{4} \| [\s\S]{0,400}? TG\n/g, '\n');
  return text
    .split('\n')
    .filter(line => {
      const t = line.trim();
      if (!t) return true;
      if (/^copyright/i.test(t)) return false;
      if (/^--\s*\d+\s*of\s*\d+\s*--$/i.test(t)) return false;
      if (/^\d+:\d{2}(\s*\/\s*\d+:\d{2})?$/.test(t)) return false; // video player timestamps
      return true;
    })
    .join('\n');
}

function findScoreAfter(text, fromIdx, toIdx) {
  const boundary = toIdx === -1 ? text.length : toIdx;
  const slice = text.slice(fromIdx, boundary);

  // Anchor tightly on the "N/A / Yes / No" options block that immediately
  // follows every scored question, then only look a short distance past it
  // for a score fraction. This prevents runaway matches into unrelated
  // later text (an address, a later question, a leaked header) when a
  // question has no score because N/A was selected.
  const optionsMatch = slice.match(/N\/A\s*\n\s*Yes\s*\n\s*No\s*\n/);
  if (optionsMatch) {
    const searchFrom = optionsMatch.index + optionsMatch[0].length;
    const lookahead = slice.slice(searchFrom, searchFrom + 20);
    const m = lookahead.match(/^\s*(\d+)\s*\/\s*(\d+)/);
    return m ? { earned: parseInt(m[1], 10), possible: parseInt(m[2], 10) } : null;
  }

  // The 1-10 recommendation scale question has no N/A/Yes/No block —
  // anchor on its enumerated "0\n1\n2...\n10\n" option list instead.
  const scaleMatch = slice.match(/(?:^|\n)0\s*\n1\s*\n2\s*\n3\s*\n4\s*\n5\s*\n6\s*\n7\s*\n8\s*\n9\s*\n10\s*\n/);
  if (scaleMatch) {
    const searchFrom = scaleMatch.index + scaleMatch[0].length;
    const lookahead = slice.slice(searchFrom, searchFrom + 20);
    const m = lookahead.match(/^\s*(\d+)\s*\/\s*(\d+)/);
    return m ? { earned: parseInt(m[1], 10), possible: parseInt(m[2], 10) } : null;
  }

  return null;
}

function extractSections(text) {
  const detail = {};
  const sectionsOut = {};
  const comments = {};

  // locate each section header's start index, in template order
  const sectionIdx = SECTIONS.map(s => ({
    key: s.key,
    idx: text.indexOf(s.match),
  }));

  SECTIONS.forEach((sectionDef, i) => {
    const startIdx = sectionIdx[i].idx;
    if (startIdx === -1) {
      console.warn(`  ! Section not found: ${sectionDef.key}`);
      return;
    }
    const endIdx = i + 1 < SECTIONS.length && sectionIdx[i + 1].idx !== -1
      ? sectionIdx[i + 1].idx
      : text.length;
    const sectionText = text.slice(startIdx, endIdx);

    // locate each question within this section's text window
    const qPositions = sectionDef.questions.map(q => ({
      ...q,
      idx: sectionText.indexOf(q.match),
    }));

    const rows = [];
    let earnedSum = 0, possibleSum = 0;

    qPositions.forEach((q, qi) => {
      if (q.idx === -1) {
        console.warn(`    ! Question not found in ${sectionDef.key}: "${q.match}"`);
        return;
      }
      const nextIdx = qi + 1 < qPositions.length && qPositions[qi + 1].idx !== -1
        ? qPositions[qi + 1].idx
        : sectionText.length;
      const score = findScoreAfter(sectionText, q.idx, nextIdx);
      if (score === null) {
        // N/A - excluded from detail + denominator, matches existing schema behavior
        return;
      }
      rows.push([q.label, score.earned, score.possible]);
      earnedSum += score.earned;
      possibleSum += score.possible;
    });

    detail[sectionDef.key] = rows;
    sectionsOut[sectionDef.key] = possibleSum > 0
      ? Math.round((earnedSum / possibleSum) * 100)
      : 0;

    // extract comment: from comment match text to end of section
    const cIdx = sectionText.indexOf(sectionDef.comment.match);
    if (cIdx !== -1) {
      let commentText = sectionText.slice(cIdx + sectionDef.comment.match.length);
      // strip leading punctuation/newline, stop at "File Upload" marker if present
      commentText = commentText.replace(/^[.\s]+/, '');
      const fileUploadIdx = commentText.search(/\n?\d+\.\s*File Upload/);
      if (fileUploadIdx !== -1) commentText = commentText.slice(0, fileUploadIdx);
      commentText = commentText.replace(/\n+/g, ' ').trim();
      comments[sectionDef.key] = commentText;
    } else {
      console.warn(`    ! Comment not found in ${sectionDef.key}`);
      comments[sectionDef.key] = '';
    }
  });

  const overallEarned = Object.values(detail).flat().reduce((s, r) => s + r[1], 0);
  const overallPossible = Object.values(detail).flat().reduce((s, r) => s + r[2], 0);
  const overall = overallPossible > 0 ? Math.round((overallEarned / overallPossible) * 100) : 0;

  return { detail, sections: sectionsOut, comments, overall, overallEarned, overallPossible };
}

function extractOverview(text) {
  const out = {};

  const dateMatch = text.match(/Date of Audit\s*\n?\s*(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) out.auditDate = dateMatch[1];

  const billMatch = text.match(/Bill No\.?:?\s*([A-Z0-9]+)\s*\n?\s*Bill Amount:?\s*₹?([\d,]+)/i);
  if (billMatch) {
    out.billNo = billMatch[1];
    out.billAmount = billMatch[2];
  }

  const staffMatch = text.match(/interacted with during your visit\s*\n(.+?)\n/);
  if (staffMatch) out.staffMention = staffMatch[1].trim();

  // items ordered block: between "Items Ordered" and "Please mention the names"
  const itemsMatch = text.match(/Items Ordered\s*\n([\s\S]*?)\n7\./);
  if (itemsMatch) {
    out.itemsOrderedRaw = itemsMatch[1].trim();
  }

  // serving time free-text (order taking process, "order taking time & order serving time")
  const servingMatch = text.match(/order serving time for each ordered items\?\s*\n(.+?)\n\d+\./s);
  if (servingMatch) out.servingRaw = servingMatch[1].trim();

  return out;
}

function parseClockTime(str) {
  const m = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

// Strategy 0: any item line with exactly two clock times on it — take the
// absolute difference between them as the serving time, regardless of what
// words (if any) connect the two times. This is deliberately wording-
// independent so it isn't broken by reports phrasing things differently
// ("received at" vs "served at" vs anything else) — it only needs two times
// to be present on the same line.
function parseTwoTimesPerLine(servingRaw) {
  const results = [];
  servingRaw.split('\n').forEach(line => {
    const m = line.match(/^\s*\d+\.\s*(.+)$/);
    if (!m) return;
    const rest = m[1];
    const times = [...rest.matchAll(/\d{1,2}:\s?\d{2}\s*[AP]M/gi)].map(t => t[0]);
    if (times.length !== 2) return;

    const dashIdx = rest.search(/\s-\s/);
    const firstTimeIdx = rest.search(/\d{1,2}:\s?\d{2}\s*[AP]M/i);
    const item = (dashIdx !== -1 ? rest.slice(0, dashIdx) : rest.slice(0, firstTimeIdx)).trim();
    if (!item) return;

    const t1 = parseClockTime(times[0].replace(/\s+/g, ''));
    const t2 = parseClockTime(times[1].replace(/\s+/g, ''));
    if (t1 === null || t2 === null) return;
    let delta = Math.abs(t2 - t1);
    if (delta > 12 * 60) delta = 24 * 60 - delta; // guard against a midnight-spanning pair
    results.push([item, delta]);
  });
  return results;
}

function extractServeLines(servingRaw) {
  const lines = [];
  const re = /(\d{1,2}:\d{2}\s*[AP]M)\s*[–-]\s*([^\n]*?served[^\n]*)/gi;
  let m;
  while ((m = re.exec(servingRaw)) !== null) {
    lines.push({ time: m[1], desc: m[2] });
  }
  return lines;
}

function wordOverlap(itemName, desc) {
  const itemWords = itemName.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const descLower = desc.toLowerCase();
  return itemWords.filter(w => descLower.includes(w)).length;
}

// Serving time = order-served time minus order-taken time.
// Two report phrasings are seen in practice:
//   1. Direct duration: "...served within 15 minutes" — used as-is.
//   2. Clock timestamps: "8:15 PM – order taken... 8:28 PM – X was served."
//      — serving time is computed as the difference between the two clock times.
// For (2), when multiple dishes share generic words (e.g. two "Chicken ..."
// items), each item is matched to whichever unclaimed serve-line has the
// HIGHEST word overlap with its name, not just the first line containing any
// one shared word — this avoids mismatching two dishes that share a word.
function parseServing(servingRaw, itemsOrderedRaw) {
  if (!servingRaw) return [];

  // Strategy 0: any item line with exactly two clock times — try first,
  // most precise, wording-independent (no cross-reference to items list needed).
  const twoTimes = parseTwoTimesPerLine(servingRaw);
  if (twoTimes.length) return twoTimes;

  const items = [];
  if (itemsOrderedRaw) {
    itemsOrderedRaw.split('\n').forEach(line => {
      const m = line.match(/^\d+\.\s*(.+)$/);
      if (!m) return;
      const name = m[1].trim().replace(/\s*[–-]\s*\d+\s*qty\s*$/i, '').trim();
      if (name) items.push(name);
    });
  }
  if (!items.length) return [];

  const results = [];

  // Strategy 1: direct "X minutes" phrasing.
  items.forEach(item => {
    const words = item.split(/\s+/).filter(w => w.length > 3).sort((a, b) => b.length - a.length);
    for (const w of words) {
      const re = new RegExp(w + '[^.]*?(\\d+)\\s*minutes', 'i');
      const m = servingRaw.match(re);
      if (m) { results.push([item, parseInt(m[1], 10)]); break; }
    }
  });
  if (results.length) return results;

  // Strategy 2: clock-timestamp phrasing — served time minus order-taken time,
  // matching each item to its best-overlap unclaimed serve-line.
  const orderTakenMatch = servingRaw.match(/(\d{1,2}:\d{2}\s*[AP]M)[^\n]*?order (?:was )?taken/i);
  const orderTakenTime = orderTakenMatch ? parseClockTime(orderTakenMatch[1]) : null;
  if (orderTakenTime === null) return [];

  const serveLines = extractServeLines(servingRaw);
  const usedIdx = new Set();
  items.forEach(item => {
    let bestIdx = -1, bestScore = 0;
    serveLines.forEach((line, idx) => {
      if (usedIdx.has(idx)) return;
      const score = wordOverlap(item, line.desc);
      if (score > bestScore) { bestScore = score; bestIdx = idx; }
    });
    if (bestIdx !== -1) {
      usedIdx.add(bestIdx);
      const servedTime = parseClockTime(serveLines[bestIdx].time);
      if (servedTime !== null) {
        let delta = servedTime - orderTakenTime;
        if (delta < 0) delta += 24 * 60; // guard against midnight rollover
        results.push([item, delta]);
      }
    }
  });
  return results;
}

async function extractAudit(pdfBuffer, storeCode, storeMaster) {
  const parser = new PDFParse({ data: pdfBuffer });
  const result = await parser.getText();
  const cleaned = cleanText(result.text);

  // use only the detailed pass: from the first "1. OVERVIEW" marker onward
  const overviewIdx = cleaned.indexOf('1. OVERVIEW');
  if (overviewIdx === -1) throw new Error('Could not locate detailed pass (1. OVERVIEW marker not found)');
  const detailedText = cleaned.slice(overviewIdx);

  const { detail, sections, comments, overall } = extractSections(detailedText);
  const overview = extractOverview(detailedText);
  const serving = parseServing(overview.servingRaw, overview.itemsOrderedRaw);

  const master = storeMaster.find(s => s.code === storeCode);
  if (!master) {
    console.warn(`  ! Store code ${storeCode} not found in store master`);
  }

  const monthLabel = overview.auditDate
    ? new Date(overview.auditDate).toLocaleString('en-US', { month: 'short', year: 'numeric' })
    : null;

  const report = {
    name: master ? master.name : storeCode,
    am: master ? master.am : null,
    rm: master ? master.rm : null,
    region: master ? master.region : null,
    type: master ? master.type : null,
    code: storeCode,
    month: monthLabel,
    overall,
    sections,
    serving,
    detail,
    comments,
  };

  return report;
}

module.exports = { extractAudit, cleanText, extractSections, extractOverview };
