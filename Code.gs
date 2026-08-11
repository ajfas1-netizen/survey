/**
 * Operate Bigger - pre-session readiness check
 * Google Apps Script bound to its OWN responses Google Sheet.
 * Do NOT reuse the PBSO feedback sheet or deployment. New sheet, new deployment.
 *
 * WHAT IT DOES
 *   doPost -> appends one response as a row
 *   doGet  -> returns the roster and aggregates as JSON for readiness-results.html
 *
 * SETUP (5 minutes, steps in README.md)
 *   1. New Google Sheet. Extensions > Apps Script. Paste this file.
 *   2. Change READ_KEY below to anything you like.
 *   3. Run setupHeaders() once, authorize when prompted.
 *   4. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 *   5. Copy the /exec URL into WEB_APP_URL in readiness.html AND readiness-results.html.
 */

var SHEET_NAME = 'Responses';

/**
 * Gate on the readout. The form itself never needs this.
 * The results page is on public GitHub Pages, and this data has your client's
 * staff names on it, so the roster only comes back when the key matches.
 * Change this to something only you know.
 */
var READ_KEY = 'TKKDsTqdEDY';

var HEADERS = [
  'Timestamp','Name','Role','RoleOther','SkillNow','Tools','Account','Wants'
];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

/** Run once from the editor to create the header row. */
function setupHeaders() {
  var sh = sheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

var CONTENT_FIELDS = ['name','role','roleOther','skillNow','tools','account','wants'];

function isBlank_(p) {
  for (var i = 0; i < CONTENT_FIELDS.length; i++) {
    if (String(p[CONTENT_FIELDS[i]] || '').trim() !== '') return false;
  }
  return true;
}

/** WRITE: append a submission. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return json_({ ok: false, error: 'Server busy, please tap send again.' });
  }

  try {
    var p = JSON.parse(e.postData.contents);
    if (isBlank_(p)) {
      return json_({ ok: false, error: 'Empty submission, nothing was saved.' });
    }
    var sh = sheet_();
    sh.appendRow([
      new Date(),
      p.name || '', p.role || '', p.roleOther || '',
      p.skillNow || '', p.tools || '', p.account || '', p.wants || ''
    ]);
    SpreadsheetApp.flush();
    return json_({ ok: true, count: sh.getLastRow() - 1 });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** READ: roster plus aggregates for the readout page. */
function doGet(e) {
  var key = (e && e.parameter && e.parameter.key) || '';
  var sh = sheet_();
  var last = sh.getLastRow();

  if (key !== READ_KEY) {
    // No key, no names. Count only, so a stray visitor learns nothing useful.
    return json_({ ok: false, locked: true, count: Math.max(0, last - 1) });
  }

  if (last < 2) {
    return json_({ ok: true, count: 0, avgSkill: 0, coreCount: 0, amplifierCount: 0,
      paidCount: 0, noAccountCount: 0, tools: {}, people: [] });
  }

  var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var col = {}; HEADERS.forEach(function (h, i) { col[h] = i; });

  var sSkill = 0, cSkill = 0, core = 0, amp = 0, paid = 0, none = 0;
  var tools = {};
  var people = [];

  rows.forEach(function (r) {
    var s = num_(r[col.SkillNow]);
    if (s !== null) {
      sSkill += s; cSkill++;
      if (s <= 5) core++; else amp++;
    }

    var acct = String(r[col.Account] || '');
    if (acct.indexOf('Yes') === 0) paid++;
    if (acct.indexOf('No account') === 0) none++;

    String(r[col.Tools] || '').split(',').forEach(function (part) {
      var t = part.trim(); if (!t) return;
      tools[t] = (tools[t] || 0) + 1;
    });

    var role = String(r[col.Role] || '').trim();
    var roleOther = String(r[col.RoleOther] || '').trim();

    people.push({
      when: r[col.Timestamp],
      name: String(r[col.Name] || '').trim(),
      role: role || roleOther || '',
      roleNote: (role && roleOther) ? roleOther : '',
      skill: s,
      tools: String(r[col.Tools] || '').trim(),
      account: acct,
      wants: String(r[col.Wants] || '').trim()
    });
  });

  return json_({
    ok: true,
    count: rows.length,
    avgSkill: cSkill ? sSkill / cSkill : 0,
    coreCount: core,
    amplifierCount: amp,
    paidCount: paid,
    noAccountCount: none,
    tools: tools,
    people: people
  });
}

function num_(x) {
  if (x === '' || x === null || x === undefined) return null;
  var v = parseFloat(x);
  return isNaN(v) ? null : v;
}
