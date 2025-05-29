const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Dossier pour sauvegarder les images
const imageDir = path.join(__dirname, 'images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir);
}

async function takeScreenshot() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Définir les cookies
  const cookies = [
    {
      name: 'id',
      value: '113937883500129231761',
      domain: 'pixelwar.up.railway.app',
      path: '/',
      httpOnly: false,
      secure: false,
    },
    {
      name: 'username',
      value: 'timTG01',
      domain: 'pixelwar.up.railway.app',
      path: '/',
      httpOnly: false,
      secure: false,
    },
  ];

  await page.setCookie(...cookies);

  // Accéder à la page
  await page.goto('https://pixelwar.up.railway.app/', { waitUntil: 'networkidle2' });

  // Attendre le canvas
  await page.waitForSelector('canvas', { timeout: 10000 });

  // Extraire l’image
  const dataUrl = await page.$eval('canvas', canvas => canvas.toDataURL('image/png'));
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Nom de fichier avec timestamp
  const now = new Date();
  const filePath = path.join(imageDir, `pixelwarGrid-${now.getDay()}d-${now.getHours()}h-${now.getMinutes()}m.png`);
  fs.writeFileSync(filePath, buffer);

  console.log(`✅ Screenshot enregistré : ${filePath}`);

  await browser.close();
}

// Exécuter immédiatement
takeScreenshot();

// Répéter toutes les 10 minutes
setInterval(takeScreenshot, 10 * 60 * 1000); // 600 000 ms
