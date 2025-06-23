import dotenv from 'dotenv';
dotenv.config();


async function ai_api(prompt) {
  const apiKey = process.env.API_KEY; // Replace with your actual OpenRouter API key

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1:free",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();
  // console.log("Response from OpenRouter:", data);
  
  const aiMessage = await data.choices?.[0]?.message?.content || "No response from AI";

  return { response: aiMessage };
}

export default ai_api;