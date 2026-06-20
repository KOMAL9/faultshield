import React, { useState, useEffect } from 'react';
import { getAllJobs } from '../services/api';

const JobMonitor = () => {
    const [jobs, setJobs] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        try {
            const res = await getAllJobs();
            setJobs(res.data.reverse());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 3000);
        return () => clearInterval(interval);
    }, []);

    const filtered = filter === 'ALL' ? jobs : jobs.filter(j => j.status === filter);

    const statusCounts = {
        ALL: jobs.length,
        PENDING: jobs.filter(j => j.status === 'PENDING').length,
        RUNNING: jobs.filter(j => j.status === 'RUNNING').length,
        COMPLETED: jobs.filter(j => j.status === 'COMPLETED').length,
        FAILED: jobs.filter(j => j.status === 'FAILED').length,
    };

    if (loading) return <div style={{color:'#00d4ff', padding:'2rem'}}>Loading...</div>;

    return (
        <div>
            <h1 className="page-title">Live Job Monitor</h1>

            {/* Filter Tabs */}
            <div style={{display:'flex', gap:'0.5rem', marginBottom:'1.5rem'}}>
                {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                        key={status}
                        className="btn"
                        onClick={() => setFilter(status)}
                        style={{
                            background: filter === status ? '#2563eb' : '#ffffff',
    color: filter === status ? '#ffffff' : '#0f172a',
    border: `1px solid ${filter === status ? '#2563eb' : '#e4e4e7'}`
                        }}>
                        {status} ({count})
                    </button>
                ))}
            </div>

            {/* Job Cards */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1rem'}}>
                {filtered.map(job => (
                    <div key={job.id} className="card" style={{
                        borderLeft: `3px solid ${
                            job.status === 'COMPLETED' ? '#2ed573' :
                            job.status === 'FAILED' ? '#ff4757' :
                            job.status === 'RUNNING' ? '#00d4ff' : '#1e2d40'
                        }`
                    }}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                            <strong style={{color:'#0f172a'}}>{job.name}</strong>
                            <span className={`badge badge-${job.status?.toLowerCase()}`}>
                                {job.status}
                            </span>
                        </div>
                        <div style={{fontSize:'0.8rem', color:'#1e3a5f'}}>
                            <div>Priority: {job.priority} | Depth: {job.dependencyDepth}</div>
                            <div>Worker: {job.workerId || 'Not assigned'}</div>
                            <div>Created: {new Date(job.createdAt).toLocaleTimeString()}</div>
                            {job.criticalityScore > 0 && (
                                <div style={{marginTop:'0.5rem'}}>
                                    <div style={{marginBottom:'0.25rem'}}>
                                        Score: {job.criticalityScore}
                                    </div>
                                    <div className="score-bar">
                                        <div className="score-fill" style={{
                                            width:`${job.criticalityScore * 100}%`,
                                            background: job.criticalityScore > 0.7 ? '#ff4757' : '#00d4ff'
                                        }}/>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div style={{color:'#1e3a5f', padding:'2rem'}}>No jobs found</div>
                )}
            </div>
        </div>
    );
};

export default JobMonitor;