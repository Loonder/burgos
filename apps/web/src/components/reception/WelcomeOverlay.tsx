import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeOverlayProps {
    message: string | null;
}

export const WelcomeOverlay = ({ message }: WelcomeOverlayProps) => {
    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: -20 }}
                        className="glass-dark p-12 rounded-3xl text-center border border-burgos-primary/30 shadow-[0_0_100px_rgba(208,178,160,0.2)]"
                    >
                        <h1 className="text-6xl md:text-8xl font-display font-bold text-burgos-primary bg-gradient-to-r from-burgos-primary via-burgos-light to-burgos-primary bg-clip-text text-transparent animate-gradient-x">
                            {message}
                        </h1>
                        <p className="mt-6 text-xl text-burgos-accent/80 font-sans tracking-wide">
                            Estamos preparando sua playlist favorita... 🎵
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
