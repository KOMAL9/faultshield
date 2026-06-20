import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const useWebSocket = () => {
    const [connected, setConnected] = useState(false);
    const [jobUpdates, setJobUpdates] = useState([]);
    const [liveEvents, setLiveEvents] = useState([]);
    const clientRef = useRef(null);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);

                client.subscribe('/topic/job-updates', (message) => {
                    const data = JSON.parse(message.body);
                    setJobUpdates(prev => [data, ...prev].slice(0, 50));
                });

                client.subscribe('/topic/live-events', (message) => {
                    const data = JSON.parse(message.body);
                    setLiveEvents(prev => [data, ...prev].slice(0, 100));
                });
            },
            onDisconnect: () => setConnected(false),
        });

        client.activate();
        clientRef.current = client;

        return () => client.deactivate();
    }, []);

    return { connected, jobUpdates, liveEvents };
};

export default useWebSocket;