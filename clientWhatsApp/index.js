const fs = require("fs");
const qrcode = require("qrcode-terminal");
const { Client }= require("whatsapp-web.js");
const qrImg = require("qr-image");

const SESSION_FILE_PATH = "./session.json";

const setupClientWhatsApp = () => {
  let sessionData;
  if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = JSON.parse(
      fs.readFileSync(SESSION_FILE_PATH, {
        encoding: "utf8",
        flag: "r",
      })
    );
  }

  const client = new Client({
    session: sessionData,
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox','--disable-extensions','--disable-gpu',  '--ignore-certificate-errors-spki-list', '--ignore-certificate-errors', '--no-experiments'],
      executablePath: '/opt/google/chrome/google-chrome'
    },
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36"
  });

  client.on("authenticated", (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
      if (err) {
        console.error(err);
      }
    });
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
   // console.log(qr);
    fs.unlinkSync("./qr_whatsapp.png");
    const qr_svg = qrImg.image(qr, {type: "png"});
    const stream = fs.createWriteStream("qr_whatsapp.png")
    qr_svg.pipe(stream);
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.on("message", (message) => {
    console.log(message.body);
  });
  return client;
};

module.exports =  setupClientWhatsApp;
