import "dotenv/config";
import {
  GetSpreadSheet,
  GetSpreadSheetValues,
  updateSheetWithNewPasswords,
} from "./googleApiHandler.js";
import { changePassword } from "./wordPressHandler.js";

async function main() {
  const obj = {};
  const spreadsheetId = "1tW1PVXcHAids7fQ-GGdFoIdiLTelgCpj35mFdSSOkpU";
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
        username: row[1],
        email: row[2],
        password: row[3],
        adminMail: row[4],
        appPassword: row[5],
      };
    });

    for (let key in obj) {
      console.log("Processing WordPress site: ", key);

      const randomPassword = Math.random().toString(36).slice(-8);
      
      console.log("Random password generated for this site is: ", randomPassword)

      const { username, email, password, adminMail, appPassword } = obj[key];
      const statusChangePass = await changePassword(
        key,
        adminMail,
        appPassword,
        randomPassword
      );
      if (!statusChangePass.success) {
        console.log(
          "Error changing password for user: ",
          username,
          " with email: ",
          email
        );
        continue;
      }
      obj[key].password = randomPassword;

      const statusSheetUpdate = await updateSheetWithNewPasswords(
        spreadsheetId,
        sheetName,
        obj
      );
      if (!statusSheetUpdate) {
        console.log(
          "Error updating Google Sheet for user: ",
          username,
          " with email: ",
          email
        );
        continue;
      }
    }
  } catch (error) {
    console.log("Something went wrong", error.message);
  }
}

export default main;