import fs from 'fs/promises';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import * as dotenv from 'dotenv';
import { Worker,workerData } from 'worker_threads';
// import {client } from '../server';
import redis from 'redis';

dotenv.config();

const client = redis.createClient({url:process.env.REDIS_URL});
client.connect().catch(err => {
  console.error('Redis connection error:', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('end', () => {
  console.log('Redis client connection closed');
});

async function fetchPdfTextFromFile(filePath) {
  const pdfData = await fs.readFile(filePath);

  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText.slice(0, 4000); // Truncate if needed
}

async function summarizePDF(filePath) {
  const pdfText = await fetchPdfTextFromFile(filePath);

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "google/gemma-3-27b-it:free",
      "messages": [
        {
          "role": "user",
          "content": `Please give me a very in depth and detailed summary of the following PDF content:\n\n${pdfText}`
        }
      ]
    })
  });

  const data = await resp.json();
  const ret = data.choices[0].message.content;
  // console.log("Summary:\n\n", ret);
  return {data:data,pdf_text:pdfText,summary:ret};
}

async function workerTask(taskId,filePath){
    if (!taskId) {
        console.error("Task ID is required");
        return;
    }
    var data = await summarizePDF(filePath)
    await client.set(`task:${taskId}`, JSON.stringify(data), (err) => {
        if (err) {
            console.error("Error saving task result to Redis:", err);
        } else {
            console.log(`Task ${taskId} result saved to Redis`);
        }
    });
}
workerTask(workerData.taskId, workerData.filePath);
// parentPort.on('message', (data) => {
//   workerTask(data.taskId,data.filePath);
// });