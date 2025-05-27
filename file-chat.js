import fetch from 'node-fetch';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

async function fetchPdfText(pdfUrl) {
  const response = await fetch(pdfUrl);
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

  return fullText.slice(0, 4000); // Limit characters to fit model input size
}

async function summarizePDF(pdfUrl) {
  const pdfText = await fetchPdfText(pdfUrl);

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "YOUR TOKEN!",
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
//   console.log(pdfText);
}

// Example usage:
summarizePDF("http://localhost:5200/public/uploads/1746966603604_1.semi%20structured%20Test.pdf");
