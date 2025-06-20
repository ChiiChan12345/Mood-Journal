import 'react-native-dotenv'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export async function getMoodSummaryFromOpenAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a mood tracking assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });
  let data: any = null;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Failed to parse OpenAI response: ' + e);
  }
  if (!response.ok) {
    throw new Error('OpenAI error: ' + (data?.error?.message || response.statusText));
  }
  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error('OpenAI error: No summary returned.');
  }
  return data.choices[0].message.content.trim();
}

export async function getMoodSummaryFromHuggingFace(prompt: string): Promise<string> {
  const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });
  let data: any = null;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error('Failed to parse Hugging Face response: ' + e);
  }
  if (!response.ok) {
    throw new Error('Hugging Face error: ' + (data?.error || response.statusText));
  }
  if (!Array.isArray(data) || !data[0]?.generated_text) {
    throw new Error('Hugging Face error: No summary returned.');
  }
  return data[0].generated_text.trim();
} 