import React, { useState, useEffect } from 'react';
import { getAllJobs, getWorkers } from '../services/api';

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [jobsRes, workersRes] = await Promise.all([
                getAllJobs(),
                getWorkers()
            ]);
            setJobs(jobsRes.data);
            setWorkers(workersRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const completed = jobs.filter(j => j.status === 'COMPLETED').length;
    const failed = jobs.filter(j => j.status === 'FAILED').length;
    const pending = jobs.filter(j => j.status === 'PENDING').length;
    const running = jobs.filter(j => j.status === 'RUNNING').length;
    const healthyWorkers = workers.filter(w => w.status === 'HEALTHY').length;

    if (loading) return <div style={{color:'#00d4ff', padding:'2rem'}}>Loading...</div>;

    return (
        <div>
            <h1 className="page-title">⚡ FaultShield Dashboard</h1>

            {/* Stats */}
            <div className="grid-4" style={{marginBottom:'1.5rem'}}>
                <div className="stat-card">
                    <div className="stat-value">{jobs.length}</div>
                    <div className="stat-label">Total Jobs</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{color:'#2ed573'}}>{completed}</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{color:'#ff4757'}}>{failed}</div>
                    <div className="stat-label">Failed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{color:'#ffa502'}}>{pending + running}</div>
                    <div className="stat-label">In Progress</div>
                </div>
            </div>

            <div className="grid-2">
                {/* Worker Health */}
                <div className="card">
                    <h2 style={{marginBottom:'1rem', color:'#0f172a'}}>
                        Worker Health — {healthyWorkers}/{workers.length} Healthy
                    </h2>
                    {workers.length === 0 ? (
                        <p style={{color:'#1e3a5f'}}>No workers registered yet</p>
                    ) : (
                        workers.map(worker => (
                            <div key={worker.id}
                                className={`worker-card ${worker.status?.toLowerCase()}`}
                                style={{marginBottom:'0.75rem'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <strong>{worker.id}</strong>
                                    <span className={`badge badge-${worker.status?.toLowerCase()}`}>
                                        {worker.status}
                                    </span>
                                </div>
                                <div style={{color:'#1e3a5f', fontSize:'0.8rem', marginTop:'0.5rem'}}>
                                    Active Jobs: {worker.activeJobs} |
                                    Health Score: {(worker.healthScore * 100).toFixed(0)}% |
                                    Missed Beats: {worker.missedHeartbeats}
                                </div>
                                <div className="score-bar">
                                    <div className="score-fill" style={{
                                        width: `${worker.healthScore * 100}%`,
                                        background: worker.status === 'HEALTHY' ? '#2ed573' :
                                                   worker.status === 'SUSPECT' ? '#ffa502' : '#ff4757'
                                    }}/>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent Jobs */}
                <div className="card">
                    <h2 style={{marginBottom:'1rem', color:'#0f172a'}}>Recent Jobs</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Worker</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.slice(0, 10).map(job => (
                                <tr key={job.id}>
                                    <td>{job.name}</td>
                                    <td>{job.priority}</td>
                                    <td>
                                        <span className={`badge badge-${job.status?.toLowerCase()}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td style={{color:'#1e3a5f'}}>{job.workerId || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;