import { Router } from 'express';
import { SpotifyController } from '../controllers/spotify.controller';

const router = Router();

router.get('/auth', SpotifyController.login);
router.get('/callback', SpotifyController.callback);
router.get('/devices', SpotifyController.getDevices);
router.post('/play', SpotifyController.play);

export default router;
