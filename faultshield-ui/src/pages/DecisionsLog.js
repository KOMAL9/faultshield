import React, { useState, useEffect } from 'react';
import { getSchedulingDecisions } from '../services/api';

const DecisionsLog = () => {
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDecisions = async () => {
        try {
            const res = await getSchedulingDecisions();
            setDecisions(Array.isArray(res.data) ? res.data : [res.data]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDecisions();
        const interval = setInterval(fetchDecisions, 5000);
        return () => clearInterval(interval);
    }, []);

    const avgScore = decisions.length > 0
        ? (decisions.reduce((a, b) => a + b.criticalityScore, 0) / decisions.length).toFixed(2)
        : 0;

    const failoverCount = decisions.filter(d => d.strategyUsed === 'FAILOVER').length;
    const retryCount = decisions.filter(d => d.strategyUsed === 'RETRY').length;
    const avgLatency = decisions.length > 0
        ? Math.round(decisions.reduce((a, b) => a + b.decisionLatencyMs, 0) / decisions.length)
        : 0;

    if (loading) return <div style={{color:'#00d4ff', padding:'2rem'}}>Loading...</div>;

    return (
        <div>
            <h1 className="page-title">Scheduling Decisions Log</h1>

            {/* Stats */}
            <div className="grid-4" style={{marginBottom:'1.5rem'}}>
                <div className="stat-card">
                    <div className="stat-value">{decisions.length}</div>
                    <div className="stat-label">Total Decisions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{color:'#ffa502'}}>{avgScore}</div>
                    <div className="stat-label">Avg Criticality Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{color:'#ff4757'}}>{failoverCount}</div>
                    <div className="stat-label">FAILOVER Decisions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{color:'#2ed573'}}>{avgLatency}ms</div>
                    <div className="stat-label">Avg Decision Latency</div>
                </div>
            </div>

            {/* Decisions Table */}
            <div className="card">
                <h2 style={{marginBottom:'1rem', color:'#0f172a'}}>
                    CAAS Decision Timeline
                    <span style={{fontSize:'0.75rem', color:'#1e3a5f', marginLeft:'0.5rem'}}>
                        (auto-refreshes every 5s)
                    </span>
                </h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Job ID</th>
                            <th>Worker</th>
                            <th>Score</th>
                            <th>Strategy</th>
                            <th>Algorithm</th>
                            <th>Latency</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {decisions.map(decision => (
                            <tr key={decision.id}>
                                <td style={{fontFamily:'monospace', fontSize:'0.75rem', color:'#1e3a5f'}}>
                                    {decision.jobId?.substring(0, 8)}...
                                </td>
                                <td style={{color:'#00d4ff'}}>{decision.workerId}</td>
                                <td>
                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                                        <span style={{
                                            color: decision.criticalityScore > 0.7 ? '#ff4757' :
                                                   decision.criticalityScore > 0.4 ? '#ffa502' : '#2ed573'
                                        }}>
                                            {decision.criticalityScore}
                                        </span>
                                        <div className="score-bar" style={{width:'60px', margin:0}}>
                                            <div className="score-fill" style={{
                                                width:`${decision.criticalityScore * 100}%`,
                                                background: decision.criticalityScore > 0.7 ? '#ff4757' : '#00d4ff'
                                            }}/>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${decision.strategyUsed === 'FAILOVER' ? 'badge-failed' : 'badge-running'}`}>
                                        {decision.strategyUsed}
                                    </span>
                                </td>
                                <td>
                                    <span className="badge badge-healthy">
                                        {decision.schedulingStrategy}
                                    </span>
                                </td>
                                <td style={{color:'#1e3a5f'}}>{decision.decisionLatencyMs}ms</td>
                                <td style={{color:'#1e3a5f', fontSize:'0.75rem'}}>
                                    {new Date(decision.timestamp).toLocaleTimeString()}
                                </td>
                            </tr>
                        ))}
                        {decisions.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{color:'#1e3a5f', textAlign:'center', padding:'2rem'}}>
                                    No scheduling decisions yet — submit a job to see CAAS in action
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DecisionsLog;