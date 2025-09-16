# Google Sheets Integration Setup

## Step 1: Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default code with this:

```javascript
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Use your existing spreadsheet ID
    const SPREADSHEET_ID = '1RjIKFW1S7r04knuZTuKEd8-b9ChfK92OvHPPq53xv0c';
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Get the first sheet
    const sheet = spreadsheet.getSheets()[0];
    
    // Prepare row data - timestamp first, then all form fields
    const rowData = [
      new Date().toLocaleString("en-US", {timeZone: "America/Chicago"}), // Column 1: Timestamp (CST)
      data.orderNumber,        // Column 2: Order Number
      data.storeId,           // Column 3: Store ID
      data.storeName,         // Column 4: Store Name
      data.city,              // Column 5: City
      data.quantity,          // Column 6: Quantity
      data.dateNeeded,        // Column 7: Date Needed
      data.currentStock,      // Column 8: Current Stock
      data.managerName,       // Column 9: Manager Name
      data.contactNo          // Column 10: Contact Number
    ];
    
    // Insert new row at row 2 (right under headers)
    sheet.insertRowBefore(2);
    sheet.getRange(2, 1, 1, 10).setValues([rowData]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 2: Deploy as Web App

1. Click "Deploy" → "New deployment"
2. Choose "Web app"
3. Set "Execute as" to "Me"
4. Set "Who has access" to "Anyone"
5. Click "Deploy"
6. Copy the Web app URL

## Step 3: Update JavaScript

1. Open `js/abesmain.js`
2. Find this line: `const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';`
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` with your actual Web app URL

## Step 4: Test

1. Open your `abes.html` page
2. Click "Buy Now"
3. Fill out the form
4. Submit
5. Check your existing spreadsheet for new data

## Notes

- The script now uses your existing spreadsheet ID: `1RjIKFW1S7r04knuZTuKEd8-b9ChfK92OvHPPq53xv0c`
- No new spreadsheets will be created
- All data goes to your existing spreadsheet
- Make sure your spreadsheet has the correct headers: Timestamp, Order Number, Store ID, Store Name, City, Quantity, Date Needed, Current Stock, Manager Name, Contact Number 