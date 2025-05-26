const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Exemple de cookie à définir
  const cookies = [{
    name: 'id',
    value: '113937883500129231761',
    domain: 'pixelwarf1.up.railway.app', // important, le domaine doit correspondre au site
    path: '/',
    httpOnly: false,
    secure: false,
  },
  {
    name: 'username',
    value: 'gTG01',
    domain: 'pixelwarf1.up.railway.app',
    path: '/',
    httpOnly: false,
    secure: false,
  },
  ];

  // Définit les cookies AVANT d'aller sur la page
  await page.setCookie(...cookies);

  // Maintenant on charge la page, les cookies seront pris en compte
  await page.goto('https://pixelwarf1.up.railway.app/', { waitUntil: 'networkidle2' });

  // Ton code pour récupérer le canvas etc.
  await page.waitForSelector('canvas', { timeout: 10000 });

  // Récupérer la dataURL PNG du canvas
  const dataUrl = await page.$eval('canvas', canvas => canvas.toDataURL('image/png'));

  // Enlever "data:image/png;base64,"
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

  // Convertir en buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // Écrire dans un fichier PNG
  fs.writeFileSync(`pixelwarGrid-${Date.now()}.png`, buffer);

  console.log('Image PNG enregistrée en canvas_image.png');

  await browser.close();
})();
