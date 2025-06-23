// utils/ai_api.js

export default async function ai_api(messages) {
  const response = await fetch("http://localhost:5200/api/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages })
  });

  const data = await response.json();
  return { response: data.response };
}
