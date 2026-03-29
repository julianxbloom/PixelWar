const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Dossier pour sauvegarder les images
const imageDir = path.join(__dirname, 'images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir);
}

async function takeScreenshot() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const cookies = [
    {
      name: 'id',
      value: '113937883500129231761',
      domain: 'pixelwar.up.railway.app',
      path: '/',
    },
    {
      name: 'username',
      value: 'TwilightSparkle',
      domain: 'pixelwar.up.railway.app',
      path: '/',
    }
  ];

  await page.setCookie(...cookies);
  await page.goto('https://pixelwar.up.railway.app/grid', { waitUntil: 'networkidle2' });

  const filePath2 = path.join(imageDir, `pixelchallengeGrid-${Date.now()}.png`);

  await page.screenshot({ path: filePath2 }); // capture l'écran entier visible


  
  await page.waitForFunction(() => window.offscreenCanvas !== undefined, { timeout: 10000 });
  await new Promise(resolve => setTimeout(resolve, 1000));

  const dataUrl = await page.evaluate(() => {
      return window.offscreenCanvas.toDataURL("image/png");
  });

  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const filePath = path.join(imageDir, `pixelchallengeGrid-${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);

  console.log(`✅ Screenshot offscreen enregistré : ${filePath}`);

  //await page.waitForSelector('#pixelCanvas', { timeout: 10000 });
  
  await browser.close();
}

// Démarrage immédiat + répétition toutes les 10 minutes
takeScreenshot();
