import type { APIRoute } from "astro";
import * as tf from "@tensorflow/tfjs";

function tryTensorflow(expression: string): string | null {
  const tokens = expression.match(/-?\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.length % 2 === 0) return null;
  try {
    let result = tf.scalar(parseFloat(tokens[0]));
    for (let i = 1; i < tokens.length; i += 2) {
      const op = tokens[i];
      const next = tf.scalar(parseFloat(tokens[i + 1]));
      switch (op) {
        case "+":
          result = result.add(next);
          break;
        case "-":
          result = result.sub(next);
          break;
        case "*":
          result = result.mul(next);
          break;
        case "/":
          result = result.div(next);
          break;
        default:
          return null;
      }
    }
    const value = result.dataSync()[0];
    return Number.isFinite(value) ? String(value) : null;
  } catch {
    return null;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query } = await request.json();
    const math = tryTensorflow(query);
    if (math !== null) {
      return new Response(JSON.stringify({ result: math }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No AI service configured" }),
        { status: 500 }
      );
    }
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
            content: "You are a calculator. Solve the operation and return only the result.",
          },
          { role: "user", content: query },
        ],
      }),
    });
    const data = await res.json();
    const result = data.choices?.[0]?.message?.content?.trim() ?? "";
    return new Response(JSON.stringify({ result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Error" }), {
      status: 500,
    });
  }
};
