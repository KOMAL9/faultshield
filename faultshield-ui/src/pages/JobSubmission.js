import React, { useState, useEffect } from 'react';
import { submitJob, getHealthyWorkers, getAllJobs } from '../services/api';

const JobSubmission = () => {
    const [form, setForm] = useState({
        name: '',
        priority: 5,
        dependencyDepth: 0,
        hoursUntilDeadline: 12,
        workflowId: ''
    });
    const [submitted, setSubmitted] = useState(null);
    const [loading, setLoading] = useState(false);
    const [avgWorkerLoad, setAvgWorkerLoad] = useState(0);
    const [actualScore, setActualScore] = useState(null);

    useEffect(() => {
        const fetchWorkerLoad = () => {
            getHealthyWorkers()
                .then(res => {
                    const workers = res.data;
                    if (workers && workers.length > 0) {
                        const avg = workers.reduce((sum, w) => sum + (w.activeJobs || 0), 0) / workers.length;
                        setAvgWorkerLoad(avg);
                    }
                })
                .catch(() => {});
        };
        fetchWorkerLoad();
        const interval = setInterval(fetchWorkerLoad, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!submitted) return;
        setActualScore(null);
        const poll = setInterval(() => {
            getAllJobs()
                .then(res => {
                    const job = res.data.find(j => j.id === submitted.id);
                    if (job && job.criticalityScore > 0) {
                        setActualScore(job.criticalityScore);
                        clearInterval(poll);
                    }
                })
                .catch(() => {});
        }, 1000);
        return () => clearInterval(poll);
    }, [submitted]);

    const priorityScore = form.priority / 10.0;
    const dependencyScore = Math.min(form.dependencyDepth / 10.0, 1.0);
    const deadlineScore = form.hoursUntilDeadline <= 0
        ? 1.0
        : Math.max(0.1, 1.0 - (form.hoursUntilDeadline / 24.0));
    const workerLoadScore = Math.min(avgWorkerLoad / 10.0, 1.0);

    const score = Math.round(
        ((0.35 * priorityScore) + (0.30 * deadlineScore) + (0.20 * dependencyScore) + (0.15 * workerLoadScore)) * 100
    ) / 100;

    const strategy = score > 0.7 ? 'FAILOVER' : 'RETRY';
    const scoreColor = score > 0.7 ? '#ff4757' : score > 0.4 ? '#ffa502' : '#2ed573';

    const handleSubmit = async () => {
        if (!form.name) return alert('Please enter a job name');
        setLoading(true);
        try {
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + form.hoursUntilDeadline);
            const deadlineStr = deadline.toISOString().slice(0, 19);

            const res = await submitJob({
                name: form.name,
                priority: form.priority,
                dependencyDepth: form.dependencyDepth,
                deadline: deadlineStr,
                workflowId: form.workflowId || `workflow-${Date.now()}`
            });
            setSubmitted(res.data);
        } catch (err) {
            alert('Error submitting job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="page-title">Submit Job</h1>
            <div className="grid-2">
                {/* Form */}
                <div className="card">
                    <h2 style={{marginBottom:'1rem', color:'#0f172a'}}>Job Details</h2>

                    <div className="form-group">
                        <label>Job Name</label>
                        <input
                            type="text"
                            placeholder="e.g. DataProcessingJob"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Priority (1-10) — Current: {form.priority}</label>
                        <input
                            type="range" min="1" max="10"
                            value={form.priority}
                            onChange={e => setForm({...form, priority: parseInt(e.target.value)})}
                            style={{width:'100%', accentColor:'#00d4ff'}}
                        />
                    </div>

                    <div className="form-group">
                        <label>Dependency Depth (0-10) — Current: {form.dependencyDepth}</label>
                        <input
                            type="range" min="0" max="10"
                            value={form.dependencyDepth}
                            onChange={e => setForm({...form, dependencyDepth: parseInt(e.target.value)})}
                            style={{width:'100%', accentColor:'#00d4ff'}}
                        />
                    </div>

                    <div className="form-group">
                        <label>Deadline Urgency (hours until deadline) — Current: {form.hoursUntilDeadline}h</label>
                        <input
                            type="range" min="0" max="24"
                            value={form.hoursUntilDeadline}
                            onChange={e => setForm({...form, hoursUntilDeadline: parseInt(e.target.value)})}
                            style={{width:'100%', accentColor:'#00d4ff'}}
                        />
                        <div style={{fontSize:'0.75rem', color:'#64748b', marginTop:'0.25rem'}}>
                            0h = overdue (score 1.0) → 24h = far future (score 0.1)
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Workflow ID (optional)</label>
                        <input
                            type="text"
                            placeholder="Leave blank to auto-generate"
                            value={form.workflowId}
                            onChange={e => setForm({...form, workflowId: e.target.value})}
                        />
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{width:'100%', marginTop:'0.5rem', padding:'0.8rem'}}>
                        {loading ? 'Submitting...' : '🚀 Submit Job'}
                    </button>
                </div>

                {/* Criticality Preview */}
                <div>
                    <div className="card" style={{marginBottom:'1rem'}}>
                        <h2 style={{marginBottom:'1rem', color:'#0f172a'}}>
                            CAAS Score Preview
                        </h2>
                        <div style={{textAlign:'center', padding:'1rem'}}>
                            <div style={{
                                fontSize:'4rem',
                                fontWeight:'700',
                                color: scoreColor
                            }}>
                                {score}
                            </div>
                            <div style={{color:'#1e3a5f', marginBottom:'1rem'}}>
                                Criticality Score
                            </div>
                            <div className="score-bar" style={{marginBottom:'1rem'}}>
                                <div className="score-fill" style={{
                                    width:`${score * 100}%`,
                                    background: scoreColor
                                }}/>
                            </div>
                            <span className={`badge ${score > 0.7 ? 'badge-failed' : 'badge-running'}`}
                                style={{fontSize:'1rem', padding:'0.5rem 1rem'}}>
                                Strategy: {strategy}
                            </span>
                        </div>

                        <div style={{marginTop:'1rem', padding:'1rem',
                            background:'#f0f4f8', borderRadius:'8px',
                            fontSize:'0.82rem', color:'#334155', textAlign:'center', fontFamily:'monospace'}}>
                            Score = α×Priority + β×Deadline + γ×Dependency + δ×WorkerLoad = <span style={{color:'#0284c7', fontWeight:'600'}}>{score}</span>
                        </div>
                    </div>

                    {submitted && (
                        <div className="card" style={{borderColor:'#2ed573'}}>
                            <h3 style={{color:'#2ed573', marginBottom:'0.5rem'}}>
                                ✅ Job Submitted!
                            </h3>
                            <div style={{fontSize:'0.8rem', color:'#1e3a5f'}}>
                                <div>ID: {submitted.id}</div>
                                <div>Status: {submitted.status}</div>
                                <div>Created: {new Date(submitted.createdAt).toLocaleTimeString()}</div>
                                <div style={{marginTop:'0.5rem'}}>
                                    CAAS Score:{' '}
                                    {actualScore !== null
                                        ? <strong style={{color: actualScore > 0.7 ? '#ff4757' : actualScore > 0.4 ? '#ffa502' : '#2ed573'}}>{actualScore}</strong>
                                        : <span style={{color:'#94a3b8'}}>Calculating...</span>
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobSubmission;
