/**
 * One place for AI provider setup, model IDs and JSON parsing.
 * Both API routes go through generateJson() so prompt-building is the only
 * thing that differs between them.
 */
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

// Override with env vars to switch model without a code change.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Gemini 3.x uses thinking_level instead of thinking_budget. These prompts are
// structured generation, not deep reasoning, so keep latency (and cost) down.
const THINKING_LEVEL = process.env.GEMINI_THINKING_LEVEL || 'LOW';

export const useOpenAI = () => process.env.AI_PROVIDER === 'openai';

export const activeModel = () => (useOpenAI() ? OPENAI_MODEL : GEMINI_MODEL);

/**
 * Returns the API key for the configured provider, or null if it is missing.
 */
export const getApiKey = () =>
  (useOpenAI() ? process.env.OPENAI_API_KEY : process.env.GEMINI_API_KEY) || null;

// Clients are created once per warm lambda instead of once per request.
let geminiClient;
let openaiClient;

const gemini = (apiKey) => (geminiClient ??= new GoogleGenAI({ apiKey }));
const openai = (apiKey) => (openaiClient ??= new OpenAI({ apiKey }));

/**
 * Parses a model response into JSON, tolerating markdown fences and the
 * single-element array the models occasionally wrap objects in.
 */
export const parseJsonResponse = (text) => {
  if (!text) throw new Error('Tomt svar fra AI-modellen');

  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Kunne ikke tolke JSON fra AI-modellen: ${cleaned.slice(0, 200)}`);
  }

  return Array.isArray(parsed) ? parsed[0] : parsed;
};

/**
 * Sends a prompt to the configured provider and returns parsed JSON.
 *
 * @param {string} prompt
 * @param {object} [responseSchema] Gemini response schema; also nudges OpenAI via json_object.
 */
export const generateJson = async (prompt, responseSchema) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API key not configured');

  if (useOpenAI()) {
    const completion = await openai(apiKey).chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    return parseJsonResponse(completion.choices[0]?.message?.content);
  }

  const result = await gemini(apiKey).models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      thinkingLevel: THINKING_LEVEL,
      ...(responseSchema ? { responseSchema } : {}),
    },
  });

  return parseJsonResponse(result.text);
};
