import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '../data.json');

const DEFAULT_PASSWORD = 'password123';

async function setInitialPassword() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Only update if not already set or if explicitly resetting
    data.admin.passwordHash = hash;

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    console.log('✅ Admin password set correctly.');
    console.log(`🔑 Default password: ${DEFAULT_PASSWORD}`);
    console.log('⚠️  Please login and change your password immediately.');

  } catch (error) {
    console.error('❌ Failed to set init password:', error);
  }
}

setInitialPassword();
