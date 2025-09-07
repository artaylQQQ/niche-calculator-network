import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const { question } = await request.json().catch(() => ({ }));
  if (!question) {
    return new Response(JSON.stringify({ error: 'Missing question' }), {
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
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that answers calculator questions concisely.' },
          { role: 'user', content: question }
        ],
        max_tokens: 150
      })
    });
    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || '';
    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'AI request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
