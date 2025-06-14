import fs from 'fs/promises';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { Worker,workerData } from 'worker_threads';
// import {client } from '../server';
import redis from 'redis';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
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
  // console.log(filePath.split('\\'));
  let new_path = "http://localhost:5200/" + filePath.split('\\').join('/');
  
  console.log("new_path:", new_path);
  
  const response = await fetch(new_path);
  // console.log("Response status:", response);
  
  const pdfData = await response.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  console.log( fullText.slice(0, 100)); // Log first 100 characters for debugging
  
  return fullText.slice(0, 4000); // Truncate if needed
}

async function summarizePDF(filePath) {
  const pdfText = await fetchPdfTextFromFile(filePath);
  console.log("Extracted PDF text:", pdfText.slice(0, 100)); // Log first 100 characters for debugging
  

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
  console.log("Response from OpenRouter:", data);
  
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