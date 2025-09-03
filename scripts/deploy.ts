//npm install ssh2-sftp-client --save-dev


import 'dotenv/config';
import Client from 'ssh2-sftp-client';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sftp = new Client();

const config = {
  host: process.env.PREVIEW_SFTP_HOST,
  port: 22,
  username: process.env.PREVIEW_SFTP_USERNAME,
  password: process.env.PREVIEW_SFTP_KEY, 
};

const localDir = path.join(__dirname, '../dist');
const remoteDir = './website/'; 

async function uploadDir(local : string, remote : string) {
    try {
      await sftp.connect(config);
      console.log('✅ Verbunden mit SFTP - 25%');
  
      try {
        await sftp.rmdir(remote, true); 
      } catch (err) {
        console.log('ℹ️ Kein altes Remote-Verzeichnis zum Löschen.');
      }
      console.log("✅Verzeichnis gelöscht - 50%");
  
      await sftp.mkdir(remote, true);
      console.log("✅Zugang bereit - 75%");
      await sftp.uploadDir(local, remote);
      console.log('✅ Upload abgeschlossen - 100%');
    } catch (err) {
      console.error('❌ Fehler beim Upload:', err.message);
    } finally {
      sftp.end();
    }
  }
  
  uploadDir(localDir, remoteDir);