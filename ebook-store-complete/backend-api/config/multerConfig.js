const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Configure file filter for allowed file types
const fileFilter = (req, file, cb) => {
  console.log('📁 [multer fileFilter] File received:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    encoding: file.encoding
  });

  // Allow PDF and common ebook formats
  const allowedMimes = [
    'application/pdf',
    'application/epub+zip',
    'application/x-mobipocket-ebook',
    'text/plain'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    console.log('✅ [multer fileFilter] MIME type allowed:', file.mimetype);
    cb(null, true);
  } else {
    console.log('❌ [multer fileFilter] MIME type rejected:', file.mimetype);
    cb(new Error('Only PDF, EPUB, MOBI, and TXT files are allowed'), false);
  }
};

// Configure size limits (100MB for book files)
const limits = {
  fileSize: 100 * 1024 * 1024 // 100MB
};

// Create multer upload instance for single file
const uploadSingle = multer({
  storage,
  fileFilter,
  limits
});

module.exports = {
  uploadSingle: uploadSingle.single('file'),
  storage,
  fileFilter,
  limits
};
