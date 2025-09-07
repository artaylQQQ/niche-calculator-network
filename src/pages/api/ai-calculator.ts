import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;
    let result = "";
    if (apiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
                "Eres una calculadora. Resuelve la operación y devuelve solo el resultado.",
            },
            { role: "user", content: query },
          ],
        }),
      });
      const data = await res.json();
      result = data.choices?.[0]?.message?.content?.trim() ?? "";
    } else {
      try {
        // eslint-disable-next-line no-new-func
        result = String(Function(`"use strict";return (${query})`)());
      } catch {
        result = "Error";
      }
    }
    return new Response(JSON.stringify({ result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Error" }), {
      status: 500,
    });
  }
};
