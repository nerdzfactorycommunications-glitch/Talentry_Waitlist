# Google Sheets Form Integration

This project submits the waitlist form to a Google Apps Script webhook URL.

## 1) Create the target Google Sheet

- Create a new sheet in Google Sheets (for example: `Talentry Waitlist`).
- Keep the first tab name as `Sheet1` (or update the script below).

## 2) Create Apps Script webhook

1. In that Google Sheet, open **Extensions -> Apps Script**.
2. Replace the default code with:

```javascript
function doPost(e) {
  const SHEET_NAME = 'Sheet1';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  const data = JSON.parse(e.postData.contents || '{}');
  const headers = [
    'fullName',
    'businessName',
    'whatsapp',
    'email',
    'staffCount',
    'sector',
    'challenge',
    'submittedAt',
  ];

  // Auto-create headers if row 1 is empty.
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  const row = headers.map((key) => data[key] ?? '');
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 3) Deploy as Web App

1. Click **Deploy -> New deployment**.
2. Type: **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone**.
5. Deploy and copy the **Web app URL**.

## 4) Add URL to this project

1. Create `.env` in the project root (same level as `package.json`).
2. Add:

```bash
VITE_GOOGLE_SHEETS_WEBHOOK_URL=YOUR_WEB_APP_URL_HERE
```

You can copy from `.env.example`.

## 5) Run and test

- Start app: `npm run dev`
- Submit the waitlist form.
- A new row should appear in the Google Sheet.

---

If headers already exist, the script keeps them and only appends rows.
