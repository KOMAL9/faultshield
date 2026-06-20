import React, { useState, useEffect } from 'react';
import { getWorkers, simulateFailure, restoreWorker } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

const LiveEventLog = () => {
    const [workers, setWorkers] = useState([]);
    const { connected, liveEvents } = useWebSocket();
    const [localEvents, setLocalEvents] = useState([
        { type: 'INFO', message: 'FaultShield monitoring started', time: new Date().toLocaleTimeString() }
    ]);

    const fetchWorkers = async () => {
        try {
            const res = await getWorkers();
            setWorkers(res.data.sort((a, b) => a.id.localeCompare(b.id)));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchWorkers();
        const interval = setInterval(fetchWorkers, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (liveEvents.length > 0) {
            const event = liveEvents[0];
            setLocalEvents(prev => [{
                type: event.type?.includes('FAULT') ? 'fault' :
                      event.type?.includes('COMPLETED') ? 'complete' : 'info',
                message: event.message,
                time: new Date().toLocaleTimeString()
            }, ...prev].slice(0, 100));
        }
    }, [liveEvents]);

    const handleSimulateFailure = async (workerId, port) => {
        try {
            await simulateFailure(port);
            setLocalEvents(prev => [{
                type: 'fault',
                message: `⚠️ Failure simulated on ${workerId}`,
                time: new Date().toLocaleTimeString()
            }, ...prev]);
            fetchWorkers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRestore = async (workerId, port) => {
        try {
            await restoreWorker(port);
            setLocalEvents(prev => [{
                type: 'complete',
                message: `✅ Worker ${workerId} restored`,
                time: new Date().toLocaleTimeString()
            }, ...prev]);
            fetchWorkers();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h1 className="page-title">Live Event Log</h1>

            {/* WebSocket Status */}
            <div style={{marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                <div style={{
                    width:'10px', height:'10px', borderRadius:'50%',
                    background: connected ? '#2ed573' : '#ff4757',
                    boxShadow: connected ? '0 0 8px #2ed573' : 'none'
                }}/>
                <span style={{color:'#1e3a5f', fontSize:'0.85rem'}}>
                    {connected ? 'WebSocket Connected — Live Updates Active' : 'Connecting...'}
                </span>
            </div>

            <div className="grid-2">
                {/* Worker Controls */}
                <div className="card">
                    <h2 style={{marginBottom:'1rem', color:'#0f172a'}}>
                        Worker Controls
                    </h2>
                    {workers.length === 0 ? (
                        <p style={{color:'#1e3a5f'}}>No workers registered</p>
                    ) : (
                        workers.map(worker => (
                            <div key={worker.id}
                                className={`worker-card ${worker.status?.toLowerCase()}`}
                                style={{marginBottom:'1rem'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
                                    <div>
                                        <strong>{worker.id}</strong>
                                        <span className={`badge badge-${worker.status?.toLowerCase()}`}
                                            style={{marginLeft:'0.5rem'}}>
                                            {worker.status}
                                        </span>
                                    </div>
                                </div>
                                <div style={{fontSize:'0.8rem', color:'#1e3a5f', marginBottom:'0.75rem'}}>
                                    Health: {(worker.healthScore * 100).toFixed(0)}% |
                                    Jobs: {worker.activeJobs} |
                                    Missed: {worker.missedHeartbeats}
                                </div>
                                <div style={{display:'flex', gap:'0.5rem'}}>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleSimulateFailure(worker.id, worker.port)}
                                        disabled={worker.status === 'DEAD'}
                                        style={{flex:1, fontSize:'0.8rem'}}>
                                        💀 Simulate Failure
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleRestore(worker.id, worker.port)}
                                        disabled={worker.status === 'HEALTHY'}
                                        style={{flex:1, fontSize:'0.8rem'}}>
                                        ✅ Restore
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Event Log */}
                <div className="card">
                    <h2 style={{marginBottom:'1rem', color:'#0f172a'}}>
                        Live Events
                        <span style={{fontSize:'0.75rem', color:'#1e3a5f', marginLeft:'0.5rem'}}>
                            ({localEvents.length} events)
                        </span>
                    </h2>
                    <div style={{maxHeight:'500px', overflowY:'auto'}}>
                        {localEvents.map((event, idx) => (
                            <div key={idx} className={`event-item ${event.type}`}>
                                <span style={{color:'#1e3a5f', fontSize:'0.75rem'}}>{event.time}</span>
                                <div>{event.message}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveEventLog;