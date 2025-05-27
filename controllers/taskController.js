import fs from 'fs/promises';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import * as dotenv from 'dotenv';
import JobSchema from '../models/JobModel.js';
dotenv.config();

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
  console.log("Summary:\n\n", ret);
  return {data:data,pdf_text:pdfText,summary:ret};
}

export default async function summarizeTask(req, res) {    
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
    const summary = await summarizePDF(filePath);
    res.status(200).json({ message: "Summary completed","summary":summary });
  } catch (error) {
    res.status(500).json({ error: "Error summarizing PDF" });
  }
}
