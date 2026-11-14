const fs = require('fs');
const path = require('path');
const config = require('../config/env');

class StorageService {
  constructor() {
    this.uploadDir = config.uploadDir;
    this.ensureBaseDirectory();
  }

  ensureBaseDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  getFilePath(storageKey) {
    return path.resolve(this.uploadDir, storageKey);
  }

  fileExists(storageKey) {
    const filePath = this.getFilePath(storageKey);
    return fs.existsSync(filePath);
  }

  async deleteFile(storageKey) {
    try {
      const filePath = this.getFilePath(storageKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch (error) {
      console.error(`Failed to delete file at storage key ${storageKey}:`, error);
      return false;
    }
  }
}

module.exports = new StorageService();
