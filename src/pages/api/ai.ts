import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { question } = await request.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Missing question" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const apiKey = import.meta.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: question }],
        max_tokens: 100,
      }),
    });
    const data = await res.json();
    const answer =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't find an answer.";
    return new Response(JSON.stringify({ answer }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Failed to fetch answer" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
