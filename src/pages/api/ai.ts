import type { APIContext } from 'astro';

export const prerender = false;

export async function POST({ request }: APIContext) {
  try {
    const { question } = await request.json();
    if (!question) {
      return new Response(JSON.stringify({ error: 'No question provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const apiKey = import.meta.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing API key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Answer the question concisely.' },
          { role: 'user', content: question }
        ],
        max_tokens: 100
      })
    });
    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content?.trim() || '';
    return new Response(JSON.stringify({ answer }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'AI request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
