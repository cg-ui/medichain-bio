<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7ea3240c-d871-4302-ad0f-a678ac243d26

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure environment variables in `.env.local` or use `.env.example` as a template:
   - `MONGODB_URI` for MongoDB Atlas cloud metadata storage
   - `JWT_SECRET` for signing JWT tokens
   - `PINATA_JWT` for Pinata/IPFS uploads (server-side only)
   - `VITE_CLOUD_PROVIDER` to label the cloud backup provider in records
3. Run the app:
   `npm run dev`

## New Cloud + GAN Privacy Features
- Cloud backup endpoint added at `/api/cloud/backup` for secure metadata storage.
- Real AI-generated privacy summaries now run on the server using Gemini/Google GenAI when `GEMINI_API_KEY` is configured.
- Upload flow supports cloud metadata backup plus blockchain/IPFS recording.
