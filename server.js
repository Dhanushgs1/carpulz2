import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const PDFS_DIR = path.join(UPLOADS_DIR, 'pdfs');
const GALLERY_INT_DIR = path.join(UPLOADS_DIR, 'gallery_interior');
const GALLERY_EXT_DIR = path.join(UPLOADS_DIR, 'gallery_exterior');
const GALLERY_LGT_DIR = path.join(UPLOADS_DIR, 'gallery_lights');
const CARS_FILE = path.join(DATA_DIR, 'cars.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const HOME_FILE = path.join(DATA_DIR, 'home.json');

// Ensure directories and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
if (!fs.existsSync(PDFS_DIR)) fs.mkdirSync(PDFS_DIR, { recursive: true });
if (!fs.existsSync(GALLERY_INT_DIR)) fs.mkdirSync(GALLERY_INT_DIR, { recursive: true });
if (!fs.existsSync(GALLERY_EXT_DIR)) fs.mkdirSync(GALLERY_EXT_DIR, { recursive: true });
if (!fs.existsSync(GALLERY_LGT_DIR)) fs.mkdirSync(GALLERY_LGT_DIR, { recursive: true });

const sampleCars = [
  {
    id: 'car-1',
    brand: 'Hyundai',
    model: 'Creta',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80',
    price_range: 'Rs. 10.99 - 19.99 Lakh*',
    description: 'Upgrade your Creta from safe basics to premium features with sleek styling, advanced lighting, and modern interiors.',
    reels: [],
    faq: [],
    rating: 4.7,
    reviewCount: 1120
  }
];

if (!fs.existsSync(CARS_FILE)) {
  fs.writeFileSync(CARS_FILE, JSON.stringify(sampleCars, null, 2));
}

if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(HOME_FILE)) {
  const defaultHome = {
    faqs: [
      { q: "What services do you offer?", a: "We provide complete car transformations including base-to-top variant conversions, premium interior upgrades, and exterior enhancements." },
      { q: "How long does a typical transformation take?", a: "Most upgrades are completed within 4-7 working days depending on the package complexity." }
    ]
  };
  fs.writeFileSync(HOME_FILE, JSON.stringify(defaultHome, null, 2));
}

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
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch (e) { resolve({}); }
    });
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
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
  '.pdf': 'application/pdf'
};

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsed.pathname;

  // Static File Serving for /uploads and /public
  if (pathname.startsWith('/uploads/') || pathname === '/favicon.ico') {
    const isUpload = pathname.startsWith('/uploads/');
    const baseDir = isUpload ? DATA_DIR : PUBLIC_DIR;
    const relativePath = isUpload ? pathname : path.join('/', pathname);
    const filePath = path.join(baseDir, relativePath);
    
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, X-Filename' 
    });
    return res.end();
  }

  // API: List Uploaded Images
  if (pathname === '/api/images' && req.method === 'GET') {
    try {
      // Return images from both /uploads and /uploads/images
      const baseFiles = fs.readdirSync(UPLOADS_DIR).filter(f => fs.lstatSync(path.join(UPLOADS_DIR, f)).isFile());
      const imageSubFiles = fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR) : [];
      
      const images = [
        ...baseFiles.filter(f => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f)).map(f => `/uploads/${f}`),
        ...imageSubFiles.filter(f => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f)).map(f => `/uploads/images/${f}`)
      ];
      return sendJSON(res, 200, images);
    } catch (e) {
      return sendJSON(res, 500, { error: 'Failed to list images' });
    }
  }

  // API: Upload (detect type)
  if (pathname === '/api/upload' && req.method === 'POST') {
    try {
      const filename = req.headers['x-filename'] || `upload-${Date.now()}`;
      const safeName = filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const ext = path.extname(safeName).toLowerCase();
      
      let subDir = 'images';
      let targetDir = IMAGES_DIR;
      
      if (ext === '.pdf') {
        subDir = 'pdfs';
        targetDir = PDFS_DIR;
      }
      
      const targetPath = path.join(targetDir, safeName);
      const buffer = await readBodyRaw(req);
      fs.writeFileSync(targetPath, buffer);
      
      return sendJSON(res, 200, { 
        success: true, 
        url: `http://localhost:${PORT}/uploads/${subDir}/${safeName}` 
      });
    } catch (e) {
      return sendJSON(res, 500, { error: 'Upload failed' });
    }
  }

  // API: Get Cars
  if (pathname === '/api/cars' && req.method === 'GET') {
    const cars = JSON.parse(fs.readFileSync(CARS_FILE, 'utf8'));
    return sendJSON(res, 200, cars);
  }

  // API: Save Cars
  if (pathname === '/api/cars' && req.method === 'POST') {
    const body = await readBodyJSON(req);
    fs.writeFileSync(CARS_FILE, JSON.stringify(body, null, 2));
    return sendJSON(res, 200, { success: true, message: 'Cars updated!' });
  }

  // API: Get Leads
  if (pathname === '/api/leads' && req.method === 'GET') {
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    return sendJSON(res, 200, leads);
  }

  // API: Get Home Settings
  if (pathname === '/api/home' && req.method === 'GET') {
    const home = JSON.parse(fs.readFileSync(HOME_FILE, 'utf8'));
    return sendJSON(res, 200, home);
  }

  // API: Save Home Settings
  if (pathname === '/api/home' && req.method === 'POST') {
    const body = await readBodyJSON(req);
    fs.writeFileSync(HOME_FILE, JSON.stringify(body, null, 2));
    return sendJSON(res, 200, { success: true, message: 'Home settings updated!' });
  }

  // API: Export Full Data (Download)
  if (pathname === '/api/export' && req.method === 'GET') {
    const cars = JSON.parse(fs.readFileSync(CARS_FILE, 'utf8'));
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const combined = { cars, leads };
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename=carpulz-data.json',
      'Access-Control-Allow-Origin': '*',
    });
    return res.end(JSON.stringify(combined, null, 2));
  }

  // API: Save Lead
  if (pathname === '/api/leads' && req.method === 'POST') {
    const body = await readBodyJSON(req);
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const newLead = {
      id: `lead-${Date.now()}`,
      ...body,
      timestamp: new Date().toISOString()
    };
    leads.unshift(newLead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
    return sendJSON(res, 200, { success: true, lead: newLead });
  }

  // API: Delete Lead
  if (pathname === '/api/leads/delete' && req.method === 'POST') {
    const { id } = await readBodyJSON(req);
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
    const updated = leads.filter(l => l.id !== id);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(updated, null, 2));
    return sendJSON(res, 200, { success: true });
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
