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

// crude parse of "1. Item Name – Nqty" lines + serving free text into [[item, minutes]] pairs
// best-effort only: if it can't confidently find a number of minutes per item, returns []
function parseServing(servingRaw, itemsOrderedRaw) {
  if (!servingRaw) return [];
  const items = [];
  if (itemsOrderedRaw) {
    itemsOrderedRaw.split('\n').forEach(line => {
      const m = line.match(/\d+\.\s*(.+?)\s*[–-]\s*\d*\s*qty/i);
      if (m) items.push(m[1].trim());
    });
  }
  const results = [];
  items.forEach(item => {
    // try each significant word in the item name (longest first) against
    // "<word...> served/within N minutes" - best-effort, skips generic words
    const words = item.split(' ').filter(w => w.length > 3).sort((a, b) => b.length - a.length);
    for (const w of words) {
      const re = new RegExp(w + '[^.]*?(\\d+)\\s*minutes', 'i');
      const m = servingRaw.match(re);
      if (m) {
        results.push([item, parseInt(m[1], 10)]);
        break;
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
