import { google } from "googleapis";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const sheets = google.sheets("v4");

async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
  });
  const authToken = await auth.getClient();
  return authToken;
}

async function getSpreadSheet({ spreadsheetId, auth }) {
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    auth,
  });
  return res;
}

async function getSpreadSheetValues({ spreadsheetId, auth, sheetName }) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    auth,
    range: sheetName,
  });
  return res;
}

async function GetSpreadSheet(spreadsheetId) {
  try {
    const auth = await getAuthToken();
    const response = await getSpreadSheet({
      spreadsheetId,
      auth,
    });
    return JSON.stringify(response.data, null, 2);
  } catch (error) {
    console.log(error.message);
    return false;
  }
}

async function GetSpreadSheetValues(spreadsheetId, sheetName) {
  try {
    const auth = await getAuthToken();
    const response = await getSpreadSheetValues({
      spreadsheetId,
      sheetName,
      auth,
    });
    return response.data;
  } catch (error) {
    console.log(error.message);
    return false;
  }
}

async function batchUpdateValues(spreadsheetId, sheetName, values) {
  const auth = await getAuthToken();
  const sheets = google.sheets({ version: "v4", auth });
  const range = `${sheetName}!A1:Z`; // Update the range to cover all rows

  const resource = {
    valueInputOption: "USER_ENTERED",
    data: [
      {
        range: range,
        values: values,
      },
    ],
  };

  try {
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: spreadsheetId,
      requestBody: resource,
    });
    if (
      response.data.totalUpdatedCells === 0 ||
      !response.data.totalUpdatedCells
    ) {
      throw new Error("No cells updated");
    }
    console.log(`${response.data.totalUpdatedCells} cells updated.`);
    console.log("############Google Sheet updated successfully###############");
    return response.data;
  } catch (error) {
    console.error("Error updating values:", error);
    return false;
  }
}

async function updateSheetWithNewPasswords(spreadsheetId, sheetName, obj) {
  console.log("Updating Google Sheet with new passwords");
  try {
    // Prepare updated values array for Google Sheet
    const updatedValues = [
      ["URL", "Username", "Email", "Password", "Admin Mail", "App Password"],
      ...Object.entries(obj).map(([key, value]) => [
        key,
        value.username,
        value.email,
        value.password,
        value.adminMail,
        value.appPassword,
      ]),
    ];

    // Update Google Sheet with new passwords
    const status = await batchUpdateValues(
      spreadsheetId,
      sheetName,
      updatedValues
    );
    if (!status) {
      throw new Error("Error updating Google Sheet");
    }
    return status;
  } catch (error) {
    console.log("Error updating Google Sheet:", error.message);
    return false;
  }
}

export {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues,
  GetSpreadSheetValues,
  GetSpreadSheet,
  batchUpdateValues,
  updateSheetWithNewPasswords,
};
