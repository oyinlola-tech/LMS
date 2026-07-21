import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { logger } from '../core/loggers';

const templatePath = path.join(__dirname, '..', 'templates', 'certificates', 'certificate.html');
const signatureDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads', 'signatures');

const svgToDataUrl = (svg) => {
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/\"/g, '%22');
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
};

const buildSignatureDataUrl = (name) => {
  const safeName = String(name || 'Signature').slice(0, 40);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="120" viewBox="0 0 420 120">
      <rect width="420" height="120" fill="transparent"/>
      <text x="10" y="80"
        font-family="\"Brush Script MT\", \"Segoe Script\", \"Lucida Handwriting\", cursive"
        font-size="64"
        fill="#334155"
        letter-spacing="1">${safeName}</text>
    </svg>
  `;
  return svgToDataUrl(svg);
};

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const sanitizeSvgPathData = (value) => {
  const pathData = String(value || '').replace(/\s+/g, ' ').trim();
  if (!/^[MmLlHhVvCcSsQqTtAaZz0-9,.\-+\s]+$/.test(pathData)) {
    const preview = pathData
      .slice(0, 120)
      .replace(/[\r\n\t]/g, ' ')
      .replace(/[^\x20-\x7E]/g, '?');
    const suffix = pathData.length > 120 ? '…' : '';
    throw new Error(
      `Invalid SVG path data generated for signature stroke. Invalid data preview: "${preview}${suffix}"`
    );
  }
  return pathData;
};

const renderTemplate = (template, data) => {
  const ifRegex = /\{\{#if\s+([A-Z0-9_]+)\}\}([\s\S]*?)(\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
  let output = template.replace(ifRegex, (match, key, truthy, _elseBlock, falsy) => {
    const value = data[key];
    if (value) return truthy;
    return falsy || '';
  });

  const escapeRegex = /\{\{escapeHtml\s+([A-Z0-9_]+)\}\}/g;
  output = output.replace(escapeRegex, (match, key) => {
    const value = data[key];
    return value === undefined || value === null ? '' : escapeHtml(value);
  });

  const varRegex = /\{\{([A-Z0-9_]+)\}\}/g;
  output = output.replace(varRegex, (match, key) => {
    const value = data[key];
    return value === undefined || value === null ? '' : String(value);
  });

  return output;
};

const buildCertificateHtml = (data = {}) => {
  const template = fs.readFileSync(templatePath, 'utf8');
  return renderTemplate(template, data);
};

const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 60);

const buildSignaturePngDataUrl = async (name) => {
  const trimmedName = String(name ?? '').trim();
  if (!trimmedName) return '';
  const inputName = trimmedName;
  const fileName = `${slugify(inputName) || 'signature'}.png`;
  const outputPath = path.join(signatureDir, fileName);
  fs.mkdirSync(signatureDir, { recursive: true });

  if (!fs.existsSync(outputPath)) {
    const lockPath = `${outputPath}.lock`;
    let lockFd;
    let browser;
    try {
      lockFd = fs.openSync(lockPath, 'wx');
      const seed = inputName.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const jitter = (min, max, n) => {
        const x = Math.sin(seed + n) * 10000;
        return min + (x - Math.floor(x)) * (max - min);
      };
      const strokeA = `M5 70 C 40 ${jitter(10, 40, 1).toFixed(1)}, 80 ${jitter(10, 60, 2).toFixed(1)}, 130 68
        S 220 ${jitter(20, 70, 3).toFixed(1)}, 300 72
        S 380 ${jitter(10, 60, 4).toFixed(1)}, 460 64`;
      const strokeB = `M10 86 C 60 ${jitter(40, 90, 5).toFixed(1)}, 120 ${jitter(30, 80, 6).toFixed(1)}, 180 84
        S 280 ${jitter(30, 90, 7).toFixed(1)}, 360 88
        S 430 ${jitter(30, 90, 8).toFixed(1)}, 470 82`;
      const safeStrokeA = sanitizeSvgPathData(strokeA);
      const safeStrokeB = sanitizeSvgPathData(strokeB);
      const launchOptions: any = {};
      if (process.env.PUPPETEER_DISABLE_SANDBOX === 'true') {
        launchOptions.args = ['--no-sandbox', '--disable-setuid-sandbox'];
      }
      browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      const safeNameHtml = escapeHtml(inputName);
      const html = `
        <html>
          <head>
            <style>
              body { margin:0; background:transparent; }
              .sig {
                font-family: "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive;
                font-size: 64px;
                color: #334155;
                padding: 8px 16px;
                white-space: nowrap;
              }
              svg { position:absolute; left:0; top:0; }
            </style>
          </head>
          <body>
            <svg width="520" height="140" viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg">
              <path d="${safeStrokeA}" stroke="rgba(51,65,85,0.35)" stroke-width="2.2" fill="none" stroke-linecap="round"/>
              <path d="${safeStrokeB}" stroke="rgba(51,65,85,0.22)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
            </svg>
            <div class="sig">${safeNameHtml}</div>
          </body>
        </html>
      `;
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const element = await page.$('.sig');
      await element.screenshot({ path: outputPath, type: 'png', omitBackground: true });
    } catch (err) {
      if (err && err.code !== 'EEXIST') throw err;
      const maxWaitMs = 5000;
      const pollMs = 100;
      const start = Date.now();
      let ready = false;
      while (!ready) {
        try {
          await fs.promises.access(outputPath, fs.constants.F_OK);
          ready = true;
        } catch (accessErr) {
          if (Date.now() - start > maxWaitMs) {
            throw new Error(`Timed out waiting for signature file creation: ${fileName}`);
          }
          await new Promise((resolve) => setTimeout(resolve, pollMs));
        }
      }
    } finally {
      if (browser) await browser.close();
      if (lockFd !== undefined) {
        fs.closeSync(lockFd);
        try {
          fs.unlinkSync(lockPath);
        } catch (cleanupErr) {
          if (!cleanupErr || cleanupErr.code !== 'ENOENT') {
            logger.warn(`Failed to remove lock file ${lockPath}`, cleanupErr);
          }
        }
      }
    }
  }

  const data = fs.readFileSync(outputPath);
  return `data:image/png;base64,${data.toString('base64')}`;
};

export { buildCertificateHtml, buildSignatureDataUrl, buildSignaturePngDataUrl };
