const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');

const ALLOWED_EXTENSIONS = [
  // Images
  '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff',
  // Documents / CAD
  '.pdf', '.dwg', '.dxf', '.rvt', '.ifc', '.skp', '.pln',
  // 3D & Models
  '.obj', '.fbx', '.blend', '.3ds', '.max', '.dae', '.gltf', '.glb',
  // Archives
  '.zip', '.rar', '.7z',
  // Videos
  '.mp4', '.mov', '.avi', '.mkv'
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.params.projectId || req.params.id || 'general';
    const targetDir = path.join(config.uploadDir, 'projects', projectId.toString());

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File format ${ext} is not supported. Supported extensions: images, CAD (DWG/DXF/PDF), 3D models, archives and videos.`));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxUploadSizeMb * 1024 * 1024
  },
  fileFilter
});

module.exports = upload;
