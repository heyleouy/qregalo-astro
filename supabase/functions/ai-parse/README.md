# AI Parse Edge Function

Edge function that parses natural language gift queries into structured intent.

## Environment Variables

- `OPENAI_API_KEY`: OpenAI API key (required for OpenAI provider)
- `OPENAI_MODEL`: Model to use (default: "gpt-4o-mini")
- `LLM_PROVIDER`: Provider to use - "openai" or "local" (default: "openai")

## Usage

```bash
curl -X POST https://your-project.supabase.co/functions/v1/ai-parse \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "regalo para mi hermana de 25 años que le gusta la tecnología"}'
```

## Response

```json
{
  "intent": "gift_search",
  "keywords": ["hermana", "tecnología", "25 años"],
  "categories": ["tecnología"],
  "price_range": { "min": null, "max": null },
  "age_range": { "min": 25, "max": 25 },
  "notes": ""
}
```
