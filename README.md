✨ AI Social Media Caption Generator
A modern and attractive AI-powered tool to generate engaging social media captions using Google Gemini API. Built with React, TypeScript, TailwindCSS, and shadcn/ui, this tool is perfect for marketers, influencers, and creators who want to save time and craft impactful content with a single click.

🚀 Features
🔮 Google Gemini Pro API Integration

🎯 Generates captions based on:

Post Purpose (e.g. Promotion, Motivation)

Target Audience (e.g. Youth, Entrepreneurs)

Platform Style (e.g. Instagram, Twitter)

💡 Clean, minimal UI with beach-dark aesthetic

⚡ Instant, real-time response from AI

📱 Mobile-responsive layout

🧠 Technologies Used
React + TypeScript

Vite (for fast build)

TailwindCSS + shadcn/ui

Google Gemini API (via @google/generative-ai)

🔧 Setup Instructions
1. Clone the Repo
bash
Copy
Edit
git clone https://github.com/your-username/caption-generator.git
cd caption-generator
2. Install Dependencies
nginx
Copy
Edit
npm install
3. Get Google Gemini API Key
Visit: https://aistudio.google.com/app/apikey

Click on Create API Key

Copy the key

4. Create .env File
In the root directory, create a .env file and add:

ini
Copy
Edit
VITE_GEMINI_API_KEY=your_api_key_here
⚠️ Never share this key publicly.

🧪 Run Locally
arduino
Copy
Edit
npm run dev
Then open your browser: http://localhost:5173

📁 Project Structure
bash
Copy
Edit
src/
├── components/         # Reusable UI components
├── assets/             # Logo and icons
├── App.tsx             # Main UI + functionality
├── main.tsx            # React entry point
├── index.css           # Tailwind + custom styles
.env                    # Gemini API Key
vite.config.ts          # Vite config
🧠 Gemini API Info
Endpoint used:
https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent

SDK:
@google/generative-ai

💡 Future Improvements
Export caption as text/image

Screenshots:
https://github.com/iamaksu65-tech/caption-generator/blob/367fd740b5166280f3cb9ac4ce06dcd055474b29/Screenshot%20(48).png
https://github.com/iamaksu65-tech/caption-generator/blob/4cb78c28100ec48e0a632e3a68903e4a42dce5b2/Screenshot%20(49).png
> 












