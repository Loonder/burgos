import axios from 'axios';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export class SpotifyService {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;
    private isMockMode: boolean;

    constructor() {
        this.clientId = process.env.SPOTIFY_CLIENT_ID || 'mock_client_id';
        this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || 'mock_client_secret';
        this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/api/spotify/callback';
        this.isMockMode = process.env.SPOTIFY_MOCK_MODE === 'true';
    }

    getAuthUrl(): string {
        if (this.isMockMode) {
            // In mock mode, we just redirect back to our callback with a fake code
            return `${this.redirectUri}?code=mock_auth_code_123`;
        }

        const scopes = [
            'user-read-playback-state',
            'user-modify-playback-state',
            'user-read-currently-playing',
            'app-remote-control',
            'streaming'
        ].join(' ');

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            scope: scopes,
            redirect_uri: this.redirectUri,
        });

        return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
    }

    async handleCallback(code: string) {
        if (this.isMockMode) {
            logger.info('Spotify Mock: Handling callback with code', code);
            const mockTokens = {
                access_token: 'mock_access_token_' + Date.now(),
                refresh_token: 'mock_refresh_token_' + Date.now(),
                expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
            };
            await this.saveTokens(mockTokens);
            return { success: true, mode: 'mock' };
        }

        // Real Implementation
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', code);
            params.append('redirect_uri', this.redirectUri);

            const tokenResponse = await axios.post(SPOTIFY_TOKEN_URL, params, {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, refresh_token, expires_in } = tokenResponse.data;
            const expiresAt = new Date(Date.now() + expires_in * 1000);

            await this.saveTokens({ access_token, refresh_token, expires_at: expiresAt.toISOString() });

            return { success: true, mode: 'real' };
        } catch (error) {
            logger.error('Error in Spotify Callback', error);
            throw new Error('Failed to authenticate with Spotify');
        }
    }

    async getDevices() {
        if (this.isMockMode) {
            return [
                { id: 'mock_device_1', name: 'Barbearia Sound System (Mock)', type: 'Speaker', is_active: true },
                { id: 'mock_device_2', name: 'Reception Tablet (Mock)', type: 'Tablet', is_active: false }
            ];
        }

        const token = await this.getAccessToken();
        if (!token) throw new Error('Not authenticated with Spotify');

        try {
            const response = await axios.get(`${SPOTIFY_API_URL}/me/player/devices`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.devices;
        } catch (error) {
            logger.error('Error fetching Spotify devices', error);
            throw error;
        }
    }

    async playUri(uri: string, deviceId?: string) {
        if (this.isMockMode) {
            logger.info(`Spotify Mock: Playing URI ${uri} on device ${deviceId || 'default'}`);
            return { status: 'playing', uri, deviceId };
        }

        const token = await this.getAccessToken();
        if (!token) throw new Error('Not authenticated');

        try {
            const query = deviceId ? `?device_id=${deviceId}` : '';
            await axios.put(`${SPOTIFY_API_URL}/me/player/play${query}`, {
                context_uri: uri.includes('playlist') || uri.includes('album') ? uri : undefined,
                uris: uri.includes('track') ? [uri] : undefined,
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            logger.error('Error playing Spotify URI', error);
            // Don't crash flow if play fails (e.g. no active device)
        }
    }

    private async saveTokens(tokens: any) {
        const query = `
            INSERT INTO system_config (key, value, description)
            VALUES ($1, $2, $3)
            ON CONFLICT (key) 
            DO UPDATE SET value = $2, updated_at = NOW()
        `;
        await pool.query(query, ['spotify_auth', JSON.stringify(tokens), 'Spotify Request Tokens']);
    }

    private async getAccessToken(): Promise<string | null> {
        const query = `SELECT value FROM system_config WHERE key = 'spotify_auth'`;
        const result = await pool.query(query);

        if (result.rows.length === 0) return null;

        const auth = result.rows[0].value;

        // Mock token check
        if (auth.access_token.startsWith('mock_')) {
            return auth.access_token;
        }

        const now = new Date();
        const expiresAt = new Date(auth.expires_at);

        if (now >= expiresAt) {
            return await this.refreshAccessToken(auth.refresh_token);
        }

        return auth.access_token;
    }

    private async refreshAccessToken(refreshToken: string): Promise<string | null> {
        if (this.isMockMode) {
            logger.info('Spotify Mock: Refreshing token');
            const newMsg = 'mock_access_token_refreshed_' + Date.now();
            // Ideally save this new token
            return newMsg;
        }

        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', refreshToken);

            const response = await axios.post(SPOTIFY_TOKEN_URL, params, {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { access_token, expires_in } = response.data;
            const newRefreshToken = response.data.refresh_token || refreshToken;
            const expiresAt = new Date(Date.now() + expires_in * 1000);

            await this.saveTokens({
                access_token,
                refresh_token: newRefreshToken,
                expires_at: expiresAt.toISOString()
            });

            return access_token;
        } catch (error) {
            logger.error('Error refreshing Spotify token', error);
            return null;
        }
    }
}
