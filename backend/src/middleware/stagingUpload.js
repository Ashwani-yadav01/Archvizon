const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetDir = path.join(config.uploadDir, 'staging');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `original_${baseName}_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Only image files (.jpg, .jpeg, .png, .webp) are supported for Virtual Staging. Received ${ext}`));
  }
};

const stagingUpload = multer({
  storage,
  limits: {
    fileSize: config.maxUploadSizeMb * 1024 * 1024
  },
  fileFilter
});

module.exports = stagingUpload;
