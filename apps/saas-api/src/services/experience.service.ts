import { io } from '../index';
import { SpotifyService } from './spotify.service';
import { logger } from '../utils/logger';
import { pool } from '../config/database';

export class ExperienceService {
    private spotifyService: SpotifyService;

    constructor() {
        this.spotifyService = new SpotifyService();
    }

    async welcomeClient(clientId: string) {
        try {
            // 1. Fetch Client Details & Preferences
            const clientQuery = `
                SELECT u.name, cp.favorite_music, cp.spotify_track_uri
                FROM users u
                LEFT JOIN client_preferences cp ON u.id = cp.client_id
                WHERE u.id = $1
            `;
            const result = await pool.query(clientQuery, [clientId]);

            if (result.rows.length === 0) {
                logger.warn(`Experience: Client ${clientId} not found for welcome.`);
                return;
            }

            const client = result.rows[0];
            logger.info(`Experience: Welcoming ${client.name}`);

            // 2. Emit UI Event (Display Name + Play Local Audio)
            io.emit('experience:welcome', {
                client: { name: client.name },
                action: 'welcome'
            });

            // 3. Trigger Spotify (if preference exists)
            if (client.spotify_track_uri) {
                logger.info(`Experience: Queueing music for ${client.name} -> ${client.spotify_track_uri}`);
                await this.spotifyService.playUri(client.spotify_track_uri);
            } else if (client.favorite_music) {
                // Fallback: search or use default playlist (mock logic for now could just log)
                logger.info(`Experience: No URI, but likes ${client.favorite_music}`);
            }

        } catch (error) {
            logger.error('Error in welcomeClient', error);
        }
    }
}
