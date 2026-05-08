import { Router, Request, Response } from 'express';
import fetch from 'node-fetch';

const router = Router();

interface DeezerTrack {
  id: number;
}

interface DeezerTracklist {
  data: DeezerTrack[];
  total: number;
  next?: string;
}

/**
 * Deezer Proxy Routes
 */
router.get('/search/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const query = req.query['q'] || 'top';
    const index = req.query['index'] || '0';

    const endpoint = type === 'tracks' ? 'search' : `search/${type!.slice(0, -1)}`;

    const response = await fetch(`https://api.deezer.com/${endpoint}?q=${query}&index=${index}&limit=25`);
    const data = await response.json();

    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch from Deezer' });
  }
});

router.get('/track/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.deezer.com/track/${id}`);
    const track = await response.json();
    res.json(track);
  } catch {
    res.status(500).json({ error: 'Failed to fetch from Deezer' });
  }
});

router.get('/album/:id/tracks', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await fetch(`https://api.deezer.com/album/${id}/tracks`);
    const tracklist = (await response.json()) as DeezerTracklist;

    const trackPromises = tracklist.data.map((track: DeezerTrack) =>
      fetch(`https://api.deezer.com/track/${track.id}`).then(r => r.json())
    );

    const tracks = await Promise.all(trackPromises);
    res.json({ data: tracks });
  } catch (error) {
    console.error('Deezer album tracks error:', error);
    res.status(500).json({ error: 'Failed to fetch from Deezer' });
  }
});

router.get('/chart', async (req: Request, res: Response) => {
  try {
    const response = await fetch('https://api.deezer.com/chart');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Deezer chart error:', error);
    res.status(500).json({ error: 'Failed to fetch from Deezer' });
  }
});

export default router;
