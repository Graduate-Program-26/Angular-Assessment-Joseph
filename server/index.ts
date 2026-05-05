import express from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;

// Path to the Angular build artifacts
const DIST_FOLDER = path.join(__dirname, '../dist/DeeJay/browser');
// Fallback if running from server/dist/index.js
const PROD_DIST_FOLDER = path.join(__dirname, '../../dist/DeeJay/browser');

const actualDistFolder = process.env['NODE_ENV'] === 'production' ? PROD_DIST_FOLDER : DIST_FOLDER;

app.use(cors());
app.use(express.json());

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
 * Deezer Proxy Routes
 */
app.get('/api/search/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const query = req.query['q'] || 'top';
    const index = req.query['index'] || '0';
    
    // Map internal types to Deezer endpoints
    const endpoint = type === 'tracks' ? 'search' : `search/${type.slice(0, -1)}`;
    
    const response = await fetch(`https://api.deezer.com/${endpoint}?q=${query}&index=${index}&limit=25`);
    const data = await response.json();
    
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch from Deezer' });
  }
});

app.get('/api/chart', async (req, res) => {
  try {
    const response = await fetch('https://api.deezer.com/chart');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Deezer chart error:', error);
    res.status(500).json({ error: 'Failed to fetch from Deezer' });
  }
});

// Production: Serve static files and handle Angular routing
if (process.env['NODE_ENV'] === 'production') {
  app.use(express.static(actualDistFolder));
  app.get('*', (req, res) => {
    res.sendFile(path.join(actualDistFolder, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`BFF Server running on http://localhost:${PORT}`);
  if (process.env['NODE_ENV'] === 'production') {
    console.log(`Serving static files from: ${actualDistFolder}`);
  }
});
