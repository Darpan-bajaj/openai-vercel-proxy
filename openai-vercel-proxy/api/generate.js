export default async function handler(req, res) {
  // ✅ Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Now your main logic
  const { prompt, selection } = req.body;

  const messages = [
    {
      role: "system",
      content: "You are an assistant that helps designers improve text on UI elements inside Figma."
    },
    {
      role: "user",
      content: `Prompt: ${prompt}\n\nSelection:\n${JSON.stringify(selection)}`
    }
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages
    })
  });

  const data = await response.json();

  let suggestions;
  try {
    suggestions = JSON.parse(data.choices[0].message.content);
  } catch (e) {
    suggestions = selection.map((item) => ({
      name: item.name,
      newText: item.text + " (AI modified)"
    }));
  }

  res.status(200).json({ suggestions });
}
