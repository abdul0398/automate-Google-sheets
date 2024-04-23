import express from "express";
import cron from "node-cron";
import main from "./main.js";

const app = express();
const PORT = process.env.PORT || 8080;

cron.schedule("0 0 * * 0", async () =>  {
  await main();
});


app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await main();
});
