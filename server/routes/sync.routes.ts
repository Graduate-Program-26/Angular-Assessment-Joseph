import { Router, Response } from 'express';
import admin from 'firebase-admin';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';

export interface Track {
  id: number;
  title: string;
  duration: number;
  preview: string;
  type: 'track';
  explicit_lyrics?: boolean;
  artist: {
    id: number;
    name: string;
    picture?: string;
    picture_small?: string;
    picture_medium?: string;
    picture_big?: string;
  };
  album: Album;
}
export interface Album {
  id: number;
  title: string;
  cover_medium: string;
  cover_small: string;
  cover_big: string;
  tracklist: string;
  artist: {
    name: string;
  };
  type: 'album';
  tracks: {data: Track[], total: number};
}
export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: string;
  createdBy: string;
}

const router = Router();

/**
 * Cloud Sync Routes
 */
router.post('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { history } = req.body;
    const uid = req.user!.uid;

    await admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('history')
      .doc('latest')
      .set({ items: history, lastSynced: admin.firestore.FieldValue.serverTimestamp() });

    res.json({ success: true });
  } catch (error) {
    console.error('History sync error:', error);
    res.status(500).json({ error: 'Failed to sync history' });
  }
});

router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const doc = await admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('history')
      .doc('latest')
      .get();

    res.json(doc.exists ? doc.data() : { items: [] });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.post('/playlists', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { playlists } = req.body;
    const uid = req.user!.uid;

    const batch = admin.firestore().batch();
    const userPlaylistsRef = admin.firestore().collection('users').doc(uid).collection('playlists');

    playlists.forEach((playlist: Playlist) => {
      const ref = userPlaylistsRef.doc(playlist.id);
      batch.set(ref, { ...playlist, lastSynced: admin.firestore.FieldValue.serverTimestamp() });
    });

    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    console.error('Playlist sync error:', error);
    res.status(500).json({ error: 'Failed to sync playlists' });
  }
});

router.get('/playlists', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const snapshot = await admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('playlists')
      .get();

    const playlists = snapshot.docs.map(doc => doc.data());
    res.json({ playlists });
  } catch (error) {
    console.error('Playlist fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

export default router;
