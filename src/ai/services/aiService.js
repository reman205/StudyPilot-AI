const API_URL_KEY = "studypilot_api_url";
const API_KEY_KEY = "studypilot_api_key";
const MODEL_KEY = "studypilot_ai_model";

function getAIConfig() {
  const apiUrl = localStorage.getItem(API_URL_KEY)?.trim();
  const apiKey = localStorage.getItem(API_KEY_KEY)?.trim();
  const model =
    localStorage.getItem(MODEL_KEY)?.trim() || "gpt-4o-mini";

  if (!apiUrl) {
    throw new Error(
      "AI API URL is missing. Add it from the Settings page."
    );
  }

  if (!apiKey) {
    throw new Error(
      "AI API key is missing. Add it from the Settings page."
    );
  }

  return {
    apiUrl,
    apiKey,
    model,
  };
}

function extractResponseText(data) {
  if (typeof data === "string") {
    return data;
  }

  if (data?.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  if (data?.choices?.[0]?.text) {
    return data.choices[0].text;
  }

  if (data?.output_text) {
    return data.output_text;
  }

  if (Array.isArray(data?.output)) {
    const text = data.output
      .flatMap((item) => item?.content || [])
      .map((item) => item?.text || "")
      .filter(Boolean)
      .join("\n");

    if (text) {
      return text;
    }
  }

  if (data?.response) {
    return data.response;
  }

  if (data?.message) {
    return data.message;
  }

  throw new Error("The AI provider returned an unsupported response format.");
}

export async function generateAIResponse({
  systemPrompt,
  userPrompt,
  temperature = 0.4,
  maxTokens = 1800,
}) {
  const { apiUrl, apiKey, model } = getAIConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        `AI request failed with status ${response.status}.`;

      throw new Error(errorMessage);
    }

    return extractResponseText(data);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "The AI request took too long. Check the API URL and your internet connection."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function saveAIConfig({ apiUrl, apiKey, model }) {
  if (apiUrl !== undefined) {
    localStorage.setItem(API_URL_KEY, apiUrl.trim());
  }

  if (apiKey !== undefined) {
    localStorage.setItem(API_KEY_KEY, apiKey.trim());
  }

  if (model !== undefined) {
    localStorage.setItem(MODEL_KEY, model.trim());
  }
}

export function loadAIConfig() {
  return {
    apiUrl: localStorage.getItem(API_URL_KEY) || "",
    apiKey: localStorage.getItem(API_KEY_KEY) || "",
    model: localStorage.getItem(MODEL_KEY) || "gpt-4o-mini",
  };
}

export function clearAIConfig() {
  localStorage.removeItem(API_URL_KEY);
  localStorage.removeItem(API_KEY_KEY);
  localStorage.removeItem(MODEL_KEY);
}