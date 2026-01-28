import type { AIProvider } from "./types.js";
import { OpenAIProvider } from "./openai-provider.js";
import { DeepSeekProvider } from "./deepseek-provider.js";
import { LocalProvider } from "./local-provider.js";
import { AI_PROVIDERS } from "@qregalo/shared";

export function createAIProvider(providerName?: string): AIProvider {
  const provider = providerName || process.env.LLM_PROVIDER || AI_PROVIDERS.OPENAI;

  switch (provider) {
    case AI_PROVIDERS.OPENAI:
      return new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      });
    case AI_PROVIDERS.DEEPSEEK:
      return new DeepSeekProvider({
        apiKey: process.env.DEEPSEEK_API_KEY,
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      });
    case AI_PROVIDERS.LOCAL:
      return new LocalProvider();
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
