const express = require("express");
const setupClientWhatsApp = require("./clientWhatsApp");
const fs = require("fs");

const client = setupClientWhatsApp();
client.initialize();

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const state = await client.getState();
    res.json({
      message: `Client status:  ${state}`,
      code: 200,
    });
  } catch (error) {
    return res.status(500).json({
      error: `You do not have an active session please visit /qr`,
      code: 404,
    });
  }
});

app.get("/qr", async (req, res) => {
  try {
    // const state = await client.getState();
    const img = fs.readFileSync("./qr_whatsapp.png");
    res.writeHead(200, {"Content-Type": "image/png"});
    res.end(img, "binary");
    // res.json({
    //   message: `Client status:  ${state}`,
    //   code: 200,
    // });
  } catch (error) {
    return res.status(500).json({
      error: `Error getting state ${error}`,
      code: 500,
    });
  }
});

app.post("/restart", async (req, res) => {
  try {
    await client.destroy();
    await client.initialize();
    const state = await client.getState();
    return res.json({
      message: `Client status:  ${state}`,
      code: 200,
    });
  } catch (error) {
    return res.status(500).json({
      error: `Error resetting state ${error}`,
      code: 500,
    });
  }
});

app.post("/send", async (req, res) => {
  try {
    const { number, message } = req.body;
    if (!number || !message) {
      return res.status(400).json({
        error: "Number and message are required",
        code: 400,
      });
    }

    const chatId = number.substring(1) + "@c.us";
    await client.sendMessage(chatId, message);

    return res.json({
      message: `message sent successfully to: ${number}`,
      code: 200,
    });
  } catch (error) {
    return res.status(500).json({
      error: `Error sending message ${error}`,
      code: 500,
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
