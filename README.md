🚀 Prompt-Craft

Craft better prompts with AI-powered assistance.
Prompt-Craft is a Next.js-based SaaS app designed to help students, founders, and developers build, refine, and share prompts with ease.

✨ Features

⚡ AI-Powered Prompt Assistance – Generate, refine, and optimize prompts

🎨 Beautiful UI – TailwindCSS, shadcn/ui, and custom animations (Background Beams, 404 JSON theme)

🔐 Authentication – Secure login with NextAuth.js

🎯 Dynamic Dashboard – Manage prompts, templates, and upcoming integrations

🛠️ Extensible Architecture – Modular, scalable, and developer-friendly

🌐 Deployed on Vercel – Fast, reliable, and production-ready

🏗️ Tech Stack

Framework: Next.js 14+ (App Router)

UI: TailwindCSS
 + shadcn/ui
 + Framer Motion

Auth: NextAuth.js

Deployment: Vercel

📂 Project Structure
src/
 ├── app/
 │   ├── api/auth/[...nextauth]/   # Authentication routes
 │   ├── dashboard/                # User dashboard
 │   ├── not-found.tsx             # Custom 404 page
 │   ├── globals.css               # Global styles
 │   └── layout.tsx                # Root layout
 │
 ├── components/                   # UI components
 │   └── ui/                       # Reusable design system
 │
 └── lib/                          # Helper functions

🚦 Getting Started
1. Clone the repo
git clone https://github.com/your-username/prompt-craft.git
cd prompt-craft

2. Install dependencies
npm install
# or
yarn install

3. Run locally
npm run dev


Your app will be running at http://localhost:3000
.

🖥️ Deployment

Easiest way: Deploy with Vercel
.
Connect your GitHub repo, and you’re live in minutes.

🛣️ Roadmap

 AI-powered prompt suggestion engine

 Save/share prompt collections

 Team collaboration mode

 Dark mode + theming system

 Billing/Subscriptions (Stripe)

🤝 Contributing

Contributions, issues, and feature requests are welcome!
Check out the issues
 page to get started.

📜 License

MIT License – free to use, modify, and distribute.

🔥 Built by Team AVATAQ.AI with a mission to help founders craft better prompts.