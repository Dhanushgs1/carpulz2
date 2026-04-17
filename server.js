import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const PDFS_DIR = path.join(UPLOADS_DIR, 'pdfs');
const CARS_FILE = path.join(DATA_DIR, 'cars.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const HOME_FILE = path.join(DATA_DIR, 'home.json');

[DATA_DIR, PUBLIC_DIR, UPLOADS_DIR, IMAGES_DIR, PDFS_DIR,
  path.join(UPLOADS_DIR, 'gallery_interior'),
  path.join(UPLOADS_DIR, 'gallery_exterior'),
  path.join(UPLOADS_DIR, 'gallery_lights')
].forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

const sampleCars = [{
  id: 'car-1', brand: 'Hyundai', model: 'Creta', badge: 'Popular',
  image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80',
  price_range: 'Rs. 10.99 - 19.99 Lakh*',
  description: 'Upgrade your Creta from safe basics to premium features.',
  reels: [], faq: [], rating: 4.7, reviewCount: 1120
}];

if (!fs.existsSync(CARS_FILE)) fs.writeFileSync(CARS_FILE, JSON.stringify(sampleCars, null, 2));
if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(HOME_FILE)) fs.writeFileSync(HOME_FILE, JSON.stringify({
  faqs: [
    { q: "What services do you offer?", a: "Complete car transformations." },
    { q: "How long does a transformation take?", a: "4-7 working days." }
  ]
}, null, 2));

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data, null, 2));
}

function readBodyJSON(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch (e) { resolve({}); } });
    req.on('error', reject);
  });
}

function readBodyRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const MIME_TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4',
  '.pdf': 'application/pdf', '.webp': 'image/webp'
};

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsed.pathname;

  if (pathname.startsWith('/uploads/')) {
    const filePath = path.join(DATA_DIR, pathname);
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Filename' });
    return res.end();
  }

  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'Carpulz API running' }));
  }

  if (pathname === '/api/images' && req.method === 'GET') {
    const baseFiles = fs.readdirSync(UPLOADS_DIR).filter(f => fs.lstatSync(path.join(UPLOADS_DIR, f)).isFile());
    const imageSubFiles = fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR) : [];
    const images = [
      ...baseFiles.filter(f => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f)).map(f => `${BASE_URL}/uploads/${f}`),
      ...imageSubFiles.filter(f => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f)).map(f => `${BASE_URL}/uploads/images/${f}`)
    ];
    return sendJSON(res, 200, images);
  }

  if (pathname === '/api/upload' && req.method === 'POST') {
    const filename = req.headers['x-filename'] || `upload-${Date.now()}`;
    const safeName = filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const ext = path.extname(safeName).toLowerCase();
    const subDir = ext === '.pdf' ? 'pdfs' : 'images';
    const targetDir = ext === '.pdf' ? PDFS_DIR : IMAGES_DIR;
    const targetPath = path.join(targetDir, safeName);
    const buffer = await readBodyRaw(req);
    fs.writeFileSync(targetPath, buffer);
    return sendJSON(res, 200, { success: true, url: `${BASE_URL}/uploads/${subDir}/${safeName}` });
  }

  if (pathname === '/api/cars' && req.method === 'GET') return sendJSON(res, 200, JSON.parse(fs.readFileSync(CARS_FILE, 'utf8')));
  if (pathname === '/api/cars' && req.method === 'POST') {
    const body = await readBodyJSON(req);
    fs.writeFileSync(CARS_FILE, JSON.stringify(body, null, 2));
    return sendJSON(res, 200, { success: true });
  }

  if (pathname === '/api/leads' && req.method === 'GET') return sendJSON(res, 200, JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')));
  if (pathname === '/api/leads' && req.method === 'POST') {
    const body = await readBodyJSON(req);
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const newLead = { id: `lead-${Date.now()}`, ...body, timestamp: new Date().toISOString() };
    leads.unshift(newLead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    return sendJSON(res, 200, { success: true, lead: newLead });
  }

  if (pathname === '/api/leads/delete' && req.method === 'POST') {
    const { id } = await readBodyJSON(req);
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads.filter(l => l.id !== id), null, 2));
    return sendJSON(res, 200, { success: true });
  }

  if (pathname === '/api/home' && req.method === 'GET') return sendJSON(res, 200, JSON.parse(fs.readFileSync(HOME_FILE, 'utf8')));
  if (pathname === '/api/home' && req.method === 'POST') {
    const body = await readBodyJSON(req);
    fs.writeFileSync(HOME_FILE, JSON.stringify(body, null, 2));
    return sendJSON(res, 200, { success: true });
  }

  if (pathname === '/api/export' && req.method === 'GET') {
    const combined = { cars: JSON.parse(fs.readFileSync(CARS_FILE, 'utf8')), leads: JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')) };
    res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename=carpulz-data.json', 'Access-Control-Allow-Origin': '*' });
    return res.end(JSON.stringify(combined, null, 2));
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});