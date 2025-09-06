import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const { question } = await request.json();
  if (!question) {
    return new Response(JSON.stringify({ error: "Missing question" }), {
      status: 400,
    });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
    });
  }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
        max_tokens: 120,
      }),
    });
    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content?.trim() ?? "";
    return new Response(JSON.stringify({ answer }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
    });
  }
};
