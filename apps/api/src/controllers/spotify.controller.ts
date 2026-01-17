import { Request, Response } from 'express';
import { SpotifyService } from '../services/spotify.service';
import { logger } from '../utils/logger';

const spotifyService = new SpotifyService();

export class SpotifyController {

    // REDIRECT TO SPOTIFY (OR MOCK)
    static async login(req: Request, res: Response) {
        try {
            const url = spotifyService.getAuthUrl();
            res.redirect(url);
        } catch (error) {
            logger.error('Spotify Login Error', error);
            res.status(500).json({ error: 'Failed to initialize Spotify login' });
        }
    }

    // HANDLE CALLBACK
    static async callback(req: Request, res: Response) {
        const { code } = req.query;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Missing code parameter' });
        }

        try {
            const result = await spotifyService.handleCallback(code);
            // Redirect back to Admin Panel on success
            // In a real app, you might show a success page or close a popup
            res.send(`
                <h1>Spotify Connected! ✅</h1>
                <p>You can close this window.</p>
                <script>
                    window.opener.postMessage('spotify-connected', '*');
                    window.close();
                </script>
            `);
        } catch (error) {
            logger.error('Spotify Callback Error', error);
            res.status(500).send('<h1>Connection Failed ❌</h1>');
        }
    }

    // GET DEVICES
    static async getDevices(req: Request, res: Response) {
        try {
            const devices = await spotifyService.getDevices();
            res.json({ devices });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch devices' });
        }
    }

    // PLAY URI (Manual Trigger)
    static async play(req: Request, res: Response) {
        const { uri, deviceId } = req.body;
        if (!uri) return res.status(400).json({ error: 'URI is required' });

        try {
            await spotifyService.playUri(uri, deviceId);
            res.json({ success: true, message: `Playing ${uri}` });
        } catch (error) {
            res.status(500).json({ error: 'Start playback failed' });
        }
    }
}
