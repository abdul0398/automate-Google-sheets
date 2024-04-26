import "dotenv/config";
import {
  GetSpreadSheet,
  GetSpreadSheetValues,
  updateSheetWithNewPasswords,
} from "./googleApiHandler.js";
import { changePassword } from "./wordPressHandler.js";

async function main() {
  const obj = {};
  const spreadsheetId = "1r0nStIZ99VOqUXysxNa2Rz-93WZj9oBDUFAZ46M7iYI";
  const sheetName = "Sheet1";

  try {
    const info = await GetSpreadSheet(spreadsheetId);
    if (!info) {
      console.log("No Sheet found with this id" + spreadsheetId);
      return;
    }
    const data = await GetSpreadSheetValues(spreadsheetId, sheetName);
    const rows = data?.values?.slice(1);


    if (!rows || rows.length === 0) {
      console.log("No data found in the sheet =>  " + sheetName);
      return;
    }

    console.log("Processing data from Google Sheet");

    rows.forEach((row) => {
      if (obj[row[0]]) {
        obj[row[0]] = {};
      }
      obj[row[0]] = {
        adminMail: row[1],
        appPassword: row[2],
        password: row[3],
        lastUpdated: row[4],
        Error: row[5],
      };
    });


    for (let key in obj) {
      if (obj[key].appPassword?.length < 20) {
        console.log(
          "App password is not provided or invalid for this site: ",
          key
        );
        continue;
      }

      console.log("Processing WordPress site: ", key);

      const randomPassword = Math.random().toString(36).slice(-8);

      console.log(
        "Random password generated for this site is: ",
        randomPassword
      );

      const { password, adminMail, appPassword } = obj[key];
      const statusChangePass = await changePassword(
        key,
        adminMail,
        appPassword,
        randomPassword
      );
      if (!statusChangePass.success) {
        console.log("Error changing password for user: ", adminMail);
        obj[key].Error = "Error";
        continue;
      }
      obj[key].Error = "Success";
      obj[key].password = randomPassword;
      obj[key].lastUpdated = new Date().toLocaleDateString('en-SG')
    }

    const statusSheetUpdate = await updateSheetWithNewPasswords(
      spreadsheetId,
      sheetName,
      obj
    );
    if (!statusSheetUpdate) {
      console.log("Error updating sheet with new passwords");
    }
  } catch (error) {
    console.log("Something went wrong", error.message);
  }
}

export default main;
