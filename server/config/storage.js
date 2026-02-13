import path from 'path';
import fs from 'fs';

const __dirname = path.resolve();

const storageRoot = process.env.STORAGE_PATH || (process.env.NODE_ENV === 'production' ? '/app/storage' : path.join(__dirname, 'server'));

export const STORAGE_CONFIG = {
  root: storageRoot,
  dataPath: path.join(storageRoot, 'data.json'),
  uploadsDir: path.join(storageRoot, 'uploads'),
};

// Ensure uploads directory exists
export const ensureStorageExists = () => {
  if (!fs.existsSync(STORAGE_CONFIG.uploadsDir)) {
    console.log(`Creating uploads directory at: ${STORAGE_CONFIG.uploadsDir}`);
    fs.mkdirSync(STORAGE_CONFIG.uploadsDir, { recursive: true });
  }
};

export const syncInitialData = () => {
  const localDataPath = path.join(__dirname, 'server', 'data.json');
  const localUploadsDir = path.join(__dirname, 'server', 'uploads');
  
  if (process.env.NODE_ENV === 'production') {
    // 1. Sync data.json if missing on volume
    if (!fs.existsSync(STORAGE_CONFIG.dataPath)) {
      console.log('📦 Initializing persistent volume with default data.json...');
      if (fs.existsSync(localDataPath)) {
        fs.copyFileSync(localDataPath, STORAGE_CONFIG.dataPath);
        console.log('✅ Default data.json copied to volume.');
      }
    }

    // 2. Sync uploads folder content (Restores existing Bio and Portfolio media)
    if (fs.existsSync(localUploadsDir)) {
      const files = fs.readdirSync(localUploadsDir);
      let syncCount = 0;
      files.forEach(file => {
        if (file === '.DS_Store') return;
        const src = path.join(localUploadsDir, file);
        const dest = path.join(STORAGE_CONFIG.uploadsDir, file);
        
        // Only copy if it doesn't already exist in the volume
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(src, dest);
          syncCount++;
        }
      });
      if (syncCount > 0) {
        console.log(`✅ Synced ${syncCount} existing uploads to persistent volume.`);
      }
    }
  }
};
