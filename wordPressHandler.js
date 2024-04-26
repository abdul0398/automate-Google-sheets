
import axios from "axios";
import https from "https";
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});


async function changePassword(url, adminMail, appPassword, newpassword) {
  const secret = Buffer.from(`${adminMail}:${appPassword}`).toString("base64");
  const URL = url.startsWith("http") ? url : `https://${url}`;

  try {
    const userData = await axios.get(URL + "/wp-json/wp/v2/users", {
      httpsAgent,
      headers: {
        Authorization: `Basic ${secret}`,
      },
    });
    const users = userData.data;
    if(users.length === 0) {
      console.log("No users found in the WordPress site");
      return { success: false, error: "No users found in the WordPress site" };
    }
    console.log(users.length, " Users found in the WordPress site:", url);
    for (let user of users) {
      console.log("Changing password for user: ", user.name);
      const id = user.id;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await axios({
        method: "post",
        url: `${URL}/wp-json/wp/v2/users/${id}`,
        httpsAgent,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${secret}`,
        },
        data: {
          password: newpassword,
        },
      });
    }
    return { success: true};
  } catch (error) {
    console.error("Error during password change:", error.message);
    return { success: false, error: error.message };
  }
}
export { changePassword };
