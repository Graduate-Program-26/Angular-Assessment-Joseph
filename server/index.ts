import express, { Request, Response } from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import Modular Routes
import authRoutes from './routes/auth.routes.js';
import deezerRoutes from './routes/deezer.routes.js';
import syncRoutes from './routes/sync.routes.js';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Path to the Angular build artifacts
const DIST_FOLDER = path.join(__dirname, '../dist/DeeJay/browser');
const PROD_DIST_FOLDER = path.join(__dirname, '../../dist/DeeJay/browser');
const actualDistFolder = process.env['NODE_ENV'] === 'production' ? PROD_DIST_FOLDER : DIST_FOLDER;

// Initialize Firebase Admin
if (process.env['FIREBASE_SERVICE_ACCOUNT']) {
  try {
    const serviceAccount = JSON.parse(process.env['FIREBASE_SERVICE_ACCOUNT']);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env['FIREBASE_DATABASE_URL']
    });
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
  }
}

/**
 * Register Modular Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api', deezerRoutes);
app.use('/api/sync', syncRoutes);

// Production: Serve static files and handle Angular routing
if (process.env['NODE_ENV'] === 'production') {
  app.use(express.static(actualDistFolder));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(actualDistFolder, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`BFF Server running on http://localhost:${PORT}`);
});
