import JobSchema from '../models/JobModel.js';
import { Worker, workerData } from 'worker_threads';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
// import redis from 'redis';
// import {client} from '../server.js'; // Assuming you have a server.js file that exports the Redis client

// const client = redis.createClient({url:process.env.REDIS_URL});
// client.connect().catch(err => {
//   console.error('Redis connection error:', err);
// });

// client.on('connect', () => {
//   console.log('Connected to Redis');
// });

// client.on('end', () => {
//   console.log('Redis client connection closed');
// });

const workerPath = path.resolve('./controllers/workerThread.js');
// console.log('Worker Path:', workerPath);

export async function summarizeTask(req, res) {
    const taskId = uuidv4();
    const job = await JobSchema.findById(req.params.id)
    if (!job) {
        res.status(404).json({ error: "Job not found" });
    }
    const filePath = job.file;
    if (!filePath) {
        res.status(400).json({ error: "File path is required" });
    }
    console.log(filePath)
  try {
    await client.set(`task:${taskId}`, "NULL")
    new Worker(workerPath, {workerData: { filePath: filePath, taskId: taskId }});
    res.status(200).json({ message: "Summarizing","taskId":taskId });
  } catch (error) {
    res.status(500).json({ error: "Error summarizing PDF" });
  }
}

export async function getTaskResult(req, res) {
  const taskId = req.params.id;
  if (!taskId) {
    return res.status(400).json({ error: "Task ID is required" });
  }

  try {
    const result = await client.get(`task:${taskId}`);
    if (!result) {
      res.status(404).json({ error: "Task result not found" });
    }
    if(result === "NULL") {
      return res.status(202).json({ message: "Task is still processing" });
    }
    return res.status(200).json(JSON.parse(result));
  } catch (error) {
    console.error("Error retrieving task result:", error);
    return res.status(500).json({ error: "Error retrieving task result" });
  }
}