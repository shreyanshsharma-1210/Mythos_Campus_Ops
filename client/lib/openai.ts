const API_KEY = import.meta.env.VITE_AZURE_OPENAI_API_KEY as string;
const ENDPOINT = (import.meta.env.VITE_AZURE_OPENAI_ENDPOINT as string)?.replace(/\/$/, "");
const API_VERSION = (import.meta.env.VITE_AZURE_OPENAI_API_VERSION as string) ?? "2024-12-01-preview";
const DEPLOYMENT = (import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT as string) ?? "gpt-4-1-mini";

const AZURE_URL = `${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;

async function azureChat(messages: object[], maxTokens = 800): Promise<string> {
  const res = await fetch(AZURE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": API_KEY,
    },
    body: JSON.stringify({ messages, max_tokens: maxTokens, temperature: 0.3 }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Azure OpenAI Error Body:", err);
    throw new Error(`Azure OpenAI ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content as string;
}

export const callGPT = (systemPrompt: string, userMessage: string, maxTokens = 800): Promise<string> =>
  azureChat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    maxTokens
  );

export const callGPTWithImage = (
  systemPrompt: string,
  userMessage: string,
  base64Image: string,
  mimeType = "image/jpeg",
  maxTokens = 1000
): Promise<string> =>
  azureChat(
    [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userMessage },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
              detail: "high",
            },
          },
        ],
      },
    ],
    maxTokens
  );

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
  });
