import React, { useState, useEffect } from 'react';
import { runStrategyComparison, runFailureRateExperiment, getAllExperiments } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

const ExperimentRunner = () => {
    const [experiments, setExperiments] = useState([]);
    const [jobCount, setJobCount] = useState(5);
    const [failureRate, setFailureRate] = useState(0.1);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('strategy');

    const fetchExperiments = async () => {
        try {
            const res = await getAllExperiments();
            setExperiments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchExperiments();
        const interval = setInterval(fetchExperiments, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleStrategyExperiment = async (strategy) => {
        setLoading(true);
        try {
            await runStrategyComparison(strategy, jobCount);
            fetchExperiments();
        } catch (err) {
            alert('Error running experiment');
        } finally {
            setLoading(false);
        }
    };

    const handleFailureExperiment = async () => {
        setLoading(true);
        try {
            await runFailureRateExperiment(failureRate, jobCount);
            fetchExperiments();
        } catch (err) {
            alert('Error running experiment');
        } finally {
            setLoading(false);
        }
    };

    const strategyData = ['CAAS', 'FIFO', 'ROUND_ROBIN'].map(strategy => {
        const exps = experiments.filter(e => e.strategy === strategy && e.status === 'COMPLETED');
        return {
            strategy,
            avgCompleted: exps.length > 0 ? Math.round(exps.reduce((a, b) => a + b.totalCompleted, 0) / exps.length) : 0,
            avgFailed: exps.length > 0 ? Math.round(exps.reduce((a, b) => a + b.totalFailed, 0) / exps.length) : 0,
        };
    });

    const failureData = experiments
        .filter(e => e.name.includes('Failure Rate'))
        .slice(0, 5)
        .map(e => ({
            name: `${(e.failureRate * 100).toFixed(0)}%`,
            completed: e.totalCompleted,
            failed: e.totalFailed
        }));

    const tabStyle = (tab) => ({
        background: activeTab === tab ? '#2563eb' : '#ffffff',
        color: activeTab === tab ? '#ffffff' : '#0f172a',
        border: '1px solid #e4e4e7',
        fontWeight: activeTab === tab ? 600 : 500,
    });

    const tooltipStyle = {
        background: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '8px',
        color: '#0f172a',
        fontSize: '0.8rem'
    };

    return (
        <div>
            <h1 className="page-title">Experiment Runner</h1>

            {/* Tabs */}
            <div style={{display:'flex', gap:'0.5rem', marginBottom:'1.5rem'}}>
                {['strategy', 'failure'].map(tab => (
                    <button key={tab} className="btn"
                        onClick={() => setActiveTab(tab)}
                        style={tabStyle(tab)}>
                        {tab === 'strategy' ? '📊 Strategy Comparison' : '💥 Failure Rate'}
                    </button>
                ))}
            </div>

            {activeTab === 'strategy' && (
                <div className="grid-2">
                    <div className="card">
                        <h2 style={{marginBottom:'0.5rem', color:'#0f172a', fontSize:'1rem', fontWeight:600}}>
                            Experiment 1: Strategy Comparison
                        </h2>
                        <p style={{color:'#52525b', fontSize:'0.85rem', marginBottom:'1.25rem'}}>
                            Compare CAAS vs FIFO vs Round Robin on {jobCount} jobs
                        </p>
                        <div className="form-group">
                            <label>Job Count: {jobCount}</label>
                            <input type="range" min="5" max="10" value={jobCount}
                                onChange={e => setJobCount(parseInt(e.target.value))}
                                style={{width:'100%', accentColor:'#2563eb'}}/>
                        </div>
                        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
                            {['CAAS', 'FIFO', 'ROUND_ROBIN'].map(strategy => (
                                <button key={strategy}
                                    className="btn btn-primary"
                                    onClick={() => handleStrategyExperiment(strategy)}
                                    disabled={loading}
                                    style={{flex:1}}>
                                    Run {strategy}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h2 style={{marginBottom:'1rem', color:'#0f172a', fontSize:'1rem', fontWeight:600}}>Results</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={strategyData} margin={{left:10}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7"/>
                                <XAxis dataKey="strategy" stroke="#52525b" fontSize={12}/>
                                <YAxis stroke="#52525b" fontSize={12}>
                                    <Label value="Avg Jobs" angle={-90} position="insideLeft" style={{fill:'#52525b', fontSize:11}}/>
                                </YAxis>
                                <Tooltip contentStyle={tooltipStyle}/>
                                <Legend/>
                                <Bar dataKey="avgCompleted" fill="#16a34a" name="Completed" radius={[4,4,0,0]}/>
                                <Bar dataKey="avgFailed" fill="#dc2626" name="Failed" radius={[4,4,0,0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                        <div style={{textAlign:'center', fontSize:'11px', color:'#52525b', marginTop:'4px'}}>Scheduling Strategy</div>
                    </div>
                </div>
            )}

            {activeTab === 'failure' && (
                <div className="grid-2">
                    <div className="card">
                        <h2 style={{marginBottom:'0.5rem', color:'#0f172a', fontSize:'1rem', fontWeight:600}}>
                            Experiment 2: Failure Rate Impact
                        </h2>
                        <p style={{color:'#52525b', fontSize:'0.85rem', marginBottom:'1.25rem'}}>
                            Test system resilience under {(failureRate * 100).toFixed(0)}% failure rate
                        </p>
                        <div className="form-group">
                            <label>Failure Rate: {(failureRate * 100).toFixed(0)}%</label>
                            <input type="range" min="0" max="0.5" step="0.1"
                                value={failureRate}
                                onChange={e => setFailureRate(parseFloat(e.target.value))}
                                style={{width:'100%', accentColor:'#2563eb'}}/>
                        </div>
                        <div className="form-group">
                            <label>Job Count: {jobCount}</label>
                            <input type="range" min="5" max="10" value={jobCount}
                                onChange={e => setJobCount(parseInt(e.target.value))}
                                style={{width:'100%', accentColor:'#2563eb'}}/>
                        </div>
                        <button className="btn btn-primary"
                            onClick={handleFailureExperiment}
                            disabled={loading}
                            style={{width:'100%'}}>
                            {loading ? 'Running...' : '🚀 Run Experiment'}
                        </button>
                    </div>

                    <div className="card">
                        <h2 style={{marginBottom:'1rem', color:'#0f172a', fontSize:'1rem', fontWeight:600}}>Results</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={failureData} margin={{left:10}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7"/>
                                <XAxis dataKey="name" stroke="#52525b" fontSize={12}/>
                                <YAxis stroke="#52525b" fontSize={12}>
                                    <Label value="Jobs" angle={-90} position="insideLeft" style={{fill:'#52525b', fontSize:11}}/>
                                </YAxis>
                                <Tooltip contentStyle={tooltipStyle}/>
                                <Legend/>
                                <Bar dataKey="completed" fill="#16a34a" name="Completed" radius={[4,4,0,0]}/>
                                <Bar dataKey="failed" fill="#dc2626" name="Failed" radius={[4,4,0,0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                        <div style={{textAlign:'center', fontSize:'11px', color:'#52525b', marginTop:'4px'}}>Failure Rate</div>
                    </div>
                </div>
            )}

            {/* Experiment History */}
            <div className="card" style={{marginTop:'1.25rem'}}>
                <h2 style={{marginBottom:'1rem', color:'#0f172a', fontSize:'1rem', fontWeight:600}}>
                    Experiment History
                </h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Strategy</th>
                            <th>Jobs</th>
                            <th>Completed</th>
                            <th>Failed</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {experiments.map(exp => (
                            <tr key={exp.id}>
                                <td style={{color:'#0f172a'}}>{exp.name}</td>
                                <td><span className="badge badge-running">{exp.strategy}</span></td>
                                <td style={{color:'#0f172a'}}>{exp.jobCount}</td>
                                <td style={{color:'#16a34a', fontWeight:600}}>{exp.totalCompleted}</td>
                                <td style={{color:'#dc2626', fontWeight:600}}>{exp.totalFailed}</td>
                                <td>
                                    <span className={`badge badge-${exp.status === 'COMPLETED' ? 'completed' : 'running'}`}>
                                        {exp.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {experiments.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{color:'#52525b', textAlign:'center', padding:'2rem'}}>
                                    No experiments run yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExperimentRunner;
