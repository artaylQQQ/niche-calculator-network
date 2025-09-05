import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { question } = await request.json();
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing OpenAI API key." }), {
      status: 500,
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful calculator that responds with concise answers.",
          },
          { role: "user", content: question },
        ],
      }),
    });
    const data = await response.json();
    const answer =
      data.choices?.[0]?.message?.content?.trim() || "Unable to compute.";
    return new Response(JSON.stringify({ answer }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Request failed." }), {
      status: 500,
    });
  }
};
