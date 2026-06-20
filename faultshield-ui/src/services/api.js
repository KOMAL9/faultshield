import axios from 'axios';

const JOB_SERVICE = 'http://localhost:8081';
const SCHEDULER_SERVICE = 'http://localhost:8082';
const WORKER_SERVICE = 'http://localhost:8083';

// Job APIs
export const submitJob = (job) => 
    axios.post(`${JOB_SERVICE}/api/jobs/submit`, job);

export const getAllJobs = () => 
    axios.get(`${JOB_SERVICE}/api/jobs`);

export const getJobsByStatus = (status) => 
    axios.get(`${JOB_SERVICE}/api/jobs/status/${status}`);

// Scheduler APIs
export const getWorkers = () =>
    axios.get(`${SCHEDULER_SERVICE}/api/scheduler/workers`);

export const getHealthyWorkers = () =>
    axios.get(`${SCHEDULER_SERVICE}/api/scheduler/workers/healthy`);

export const getSchedulingDecisions = () => 
    axios.get(`${SCHEDULER_SERVICE}/api/scheduler/decisions`);

// Worker APIs
export const getWorkerStatus = () => 
    axios.get(`${WORKER_SERVICE}/api/workers/status`);

export const simulateFailure = (port) =>
    axios.post(`http://localhost:${port}/api/workers/simulate-failure`);

export const restoreWorker = (port) =>
    axios.post(`http://localhost:${port}/api/workers/restore`);

// Experiment APIs
export const runStrategyComparison = (strategy, jobCount) =>
    axios.post(`${JOB_SERVICE}/api/experiments/strategy-comparison?strategy=${strategy}&jobCount=${jobCount}`);

export const runFailureRateExperiment = (failureRate, jobCount) =>
    axios.post(`${JOB_SERVICE}/api/experiments/failure-rate?failureRate=${failureRate}&jobCount=${jobCount}`);

export const getAllExperiments = () =>
    axios.get(`${JOB_SERVICE}/api/experiments`);

export const getComparisonResults = () =>
    axios.get(`${JOB_SERVICE}/api/experiments/comparison`);