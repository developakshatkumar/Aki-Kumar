
# DocAssist - Deployment Instructions

DocAssist is a privacy-first React application designed to explain medical reports, prescriptions, and general documents using the Gemini API.

## Local Development
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set your `API_KEY` in environment variables.
4. Run: `npm run dev`.

## Deployment to Cloud Run (Live App)

To host this application on a public URL via Google Cloud Run:

### 1. Containerize the App
Create a `Dockerfile` in the root directory:
```dockerfile
# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Build and Push to Artifact Registry
```bash
PROJECT_ID=$(gcloud config get-value project)
gcloud builds submit --tag gcr.io/$PROJECT_ID/docassist
```

### 3. Deploy to Cloud Run
```bash
gcloud run deploy docassist \
  --image gcr.io/$PROJECT_ID/docassist \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars API_KEY=YOUR_GEMINI_API_KEY
```

*Note: Replace `YOUR_GEMINI_API_KEY` with your actual Gemini API key from Google AI Studio.*

### 4. Access the Live URL
Once deployed, Cloud Run will provide a URL (e.g., `https://docassist-xyz.a.run.app`).

## Privacy & Security
- No server-side storage of documents.
- Analysis is transient and performed via Gemini Pro with Search grounding.
- Vault history is stored strictly in the user's browser `localStorage`.
- Use the **Redact** toggle for an extra layer of privacy before analysis.
