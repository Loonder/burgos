import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext'; // Use shared context

interface ExperienceEvent {
    client: {
        name: string;
    };
    action: 'welcome';
}

export const useExperience = () => {
    const socket = useSocket(); // access shared socket
    const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!socket) return;

        const handleWelcome = (data: ExperienceEvent) => {
            console.log('Experience Event:', data);

            // 1. Show Visual Message
            setWelcomeMessage(`Bem-vinda, ${data.client.name} ✨`);

            // 2. Play Local Audio
            try {
                const audio = new Audio('/sounds/welcome.mp3');
                audio.play().catch(err => console.error('Audio play failed:', err));
            } catch (err) {
                console.error('Audio initialization failed', err);
            }

            // 3. Clear message after 10 seconds (or audio duration)
            setTimeout(() => {
                setWelcomeMessage(null);
            }, 8000);
        };

        socket.on('experience:welcome', handleWelcome);

        return () => {
            socket.off('experience:welcome', handleWelcome);
        };
    }, [socket]);

    return { welcomeMessage };
};
