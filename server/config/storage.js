import path from 'path';
import fs from 'fs';

const __dirname = path.resolve();

// In Railway, mounting a volume at /app/storage is typical
// We allow override via STORAGE_PATH env var
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
  
  // If we are in production and the volume data.json doesn't exist yet,
  // copy the initial one from the repository
  if (process.env.NODE_ENV === 'production' && !fs.existsSync(STORAGE_CONFIG.dataPath)) {
    console.log('📦 Initializing persistent volume with default data.json...');
    if (fs.existsSync(localDataPath)) {
      fs.copyFileSync(localDataPath, STORAGE_CONFIG.dataPath);
      console.log('✅ Default data.json copied to volume.');
    } else {
      console.error('❌ Could not find local data.json to initialize volume!');
    }
  }
};
