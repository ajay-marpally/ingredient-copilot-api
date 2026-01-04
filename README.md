# AI-Native Ingredient Intelligence Co-Pilot API

An AI-powered API that helps consumers understand food ingredients using Google Gemini for intelligent, human-level insights.

## Features

- **Text Analysis**: Analyze ingredient lists, OCR text, or free-form questions
- **Image Analysis**: Extract and analyze ingredients from product photos using Gemini Vision
- **Intent-First Reasoning**: Infers user concerns without explicit questions
- **Uncertainty Communication**: Honestly communicates what is known vs uncertain

## Quick Start

```bash
# 1. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Run server
python -m uvicorn app.main:app --reload --port 8000
```

## Get Your API Key

Get a free Google Gemini API key from: https://aistudio.google.com/app/apikey

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/
```

### Analyze Text
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "input_type": "ingredient_list",
    "content": ["sodium benzoate", "high fructose corn syrup", "citric acid"],
    "user_context": "trying to reduce sugar intake"
  }'
```

### Analyze Image
```bash
curl -X POST "http://localhost:8000/analyze/image" \
  -F "image=@product_label.jpg" \
  -F "user_context=I have a gluten allergy"
```

### Input Types

| Type | Description |
|------|-------------|
| `ingredient_list` | Array or comma-separated list of ingredients |
| `ocr_text` | Raw OCR-extracted text from a label |
| `free_text` | Free-form question about ingredients |

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Response Format

```json
{
  "summary": "Human-friendly 2-3 sentence insight",
  "key_concerns": ["List of main concerns"],
  "positives": ["Positive aspects"],
  "confidence_level": "high|medium|low",
  "uncertainty_notes": "What we can't determine",
  "ingredient_insights": [
    {
      "name": "Ingredient Name",
      "concern_level": "none|low|medium|high",
      "brief": "One-line explanation"
    }
  ],
  "reasoning_time_ms": 1250
}
```

## Project Structure

```
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Environment configuration
│   ├── models/
│   │   ├── request.py       # Input schemas
│   │   └── response.py      # Output schemas
│   ├── services/
│   │   ├── analyzer.py      # Analysis orchestration
│   │   └── gemini_provider.py  # Gemini API integration
│   └── prompts/
│       └── system_prompt.py # AI personality & rules
├── requirements.txt
├── .env.example
└── README.md
```

## License

MIT
