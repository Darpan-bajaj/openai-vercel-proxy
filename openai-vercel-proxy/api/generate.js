export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Process POST request
  try {
    const { prompt, selection } = req.body;

    const systemPrompt = `You are an assistant helping a designer improve UI elements in Figma. Given user instructions and selected text elements, suggest how to rewrite them. Only return updated text.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Prompt: ${prompt}\n\nSelected elements:\n${JSON.stringify(
              selection
            )}`,
          },
        ],
      }),
    });

    const data = await response.json();
    let newTexts;
    try {
      newTexts = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      newTexts = selection.map((item) => ({
        name: item.name,
        newText: item.text + " (AI modified)",
      }));
    }

    res.status(200).json({ suggestions: newTexts });
  } catch (err) {
    res.status(500).json({ error: "Failed to call OpenAI" });
  }
}
