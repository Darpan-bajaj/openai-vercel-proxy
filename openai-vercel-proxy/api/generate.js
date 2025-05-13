export default async function handler(req, res) {
  // ✅ Allow requests from any origin (for development)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { prompt, selection } = req.body;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an assistant helping a designer improve UI elements in Figma. Given user instructions and selected text elements, suggest how to rewrite them. Return a JSON array of { name, newText }."
          },
          {
            role: "user",
            content: `Prompt: ${prompt}\n\nSelected elements:\n${JSON.stringify(selection)}`
          }
        ]
      })
    });

    const data = await openaiRes.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
}
