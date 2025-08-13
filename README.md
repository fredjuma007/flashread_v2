# 🚀 FlashRead - AI-Powered Article Summarizer

<div align="center">
  <img src="public/images/FlashRead.png" alt="FlashRead Logo" width="120" height="120">
  
  **Read faster. Understand more.**
  
  Transform lengthy articles and documents into clean, focused summaries in seconds.
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Groq](https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge)](https://groq.com/)
</div>

## ✨ Features

- **🔗 URL Summarization** - Paste any article URL and get instant summaries
- **📝 Text Processing** - Summarize any text content directly
- **⚡ Dual AI Engines** - Choose between RapidAPI and Groq for optimal results
- **📏 Flexible Length** - Quick, balanced, or detailed summaries
- **🎨 Beautiful UI** - Clean, responsive design with dark mode support
- **📱 Mobile First** - Optimized for all devices
- **🔒 Privacy Focused** - Local storage, no data tracking
- **📚 Smart History** - Access your previous summaries anytime
- **📄 Export Options** - Copy to clipboard or download as Markdown

## 🎯 Perfect For

- **Students** - Quickly understand research papers and articles
- **Professionals** - Stay updated with industry news efficiently  
- **Researchers** - Process large amounts of content faster
- **Content Creators** - Get key insights from competitor content
- **Anyone** - Who wants to read smarter, not harder

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys (see setup below)

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/flashread.git
cd flashread

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
\`\`\`

### Environment Setup

Create a \`.env.local\` file with your API keys:

\`\`\`env
# RapidAPI Key for Article Extractor and Summarizer
NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here

# Groq API Key for AI text summarization  
NEXT_PUBLIC_GROQ_KEY=your_groq_key_here
\`\`\`

### Getting API Keys

#### 🔑 RapidAPI Key
1. Visit [RapidAPI Article Extractor](https://rapidapi.com/restyler/api/article-extractor-and-summarizer)
2. Sign up and subscribe to the API
3. Copy your X-RapidAPI-Key

#### 🔑 Groq API Key
1. Go to [Groq Console](https://console.groq.com/keys)
2. Create an account and generate an API key
3. Copy your API key

### Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) and start summarizing! 🎉

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Clean, consistent icons

### AI & APIs
- **Groq** - Lightning-fast AI inference
- **RapidAPI** - Article extraction and summarization
- **AI SDK** - Unified AI integration

### Features
- **Sonner** - Beautiful toast notifications
- **next-themes** - Dark mode support
- **Radix UI** - Accessible primitives

## 📱 Screenshots

<div align="center">
  <img src="docs/screenshot-desktop.png" alt="Desktop View" width="600">
  <br>
  <em>Desktop Experience</em>
  <br><br>
  <img src="docs/screenshot-mobile.png" alt="Mobile View" width="300">
  <br>
  <em>Mobile Experience</em>
</div>

## 🎨 Design Philosophy

FlashRead is built with a **mobile-first**, **accessibility-focused** approach:

- **Orange-dominant theme** - Energetic and modern
- **Responsive design** - Beautiful on all screen sizes
- **Intuitive UX** - No learning curve required
- **Fast performance** - Optimized for speed
- **Privacy first** - Your data stays with you

## 🔧 Usage

### URL Summarization
1. Select **URL** mode
2. Paste any article URL
3. Choose your preferred summary length
4. Select processing engine (RapidAPI recommended for URLs)
5. Click **Summarize** ✨

### Text Summarization  
1. Select **Text** mode
2. Paste your content
3. Adjust length and engine settings
4. Get your summary instantly

### Advanced Options
- **Quick (3-4 sentences)** - For rapid overviews
- **Balanced (6-8 sentences)** - Perfect middle ground
- **Detailed (10-12 sentences)** - Comprehensive analysis

## 🤝 Contributing

We love contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (\`git checkout -b feature/amazing-feature\`)
3. **Commit** your changes (\`git commit -m 'Add amazing feature'\`)
4. **Push** to the branch (\`git push origin feature/amazing-feature\`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind for styling
- Ensure mobile responsiveness
- Add proper accessibility attributes
- Test on multiple devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vercel** - For the amazing deployment platform
- **shadcn** - For the beautiful component library
- **Groq** - For lightning-fast AI inference
- **RapidAPI** - For reliable article extraction
- **The Open Source Community** - For inspiration and tools

## 📞 Support

Having issues? We're here to help!

- 🐛 **Bug Reports** - [Open an issue](https://github.com/yourusername/flashread/issues)
- 💡 **Feature Requests** - [Start a discussion](https://github.com/yourusername/flashread/discussions)
- 📧 **Email** - support@flashread.app
- 🐦 **Twitter** - [@FlashReadApp](https://twitter.com/FlashReadApp)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/flashread)

1. Click the deploy button above
2. Connect your GitHub account
3. Add your environment variables
4. Deploy! 🎉

### Manual Deployment

\`\`\`bash
# Build the project
npm run build

# Start production server
npm start
\`\`\`

## 📊 Roadmap

- [ ] **PDF Support** - Summarize PDF documents
- [ ] **Batch Processing** - Multiple URLs at once
- [ ] **Custom Prompts** - Personalized summarization styles
- [ ] **Team Collaboration** - Share summaries with your team
- [ ] **Browser Extension** - Summarize any page with one click
- [ ] **API Access** - Integrate FlashRead into your apps

---

<div align="center">
  <p>Made with ❤️ by <strong>Fred Juma</strong></p>
  <p>
    <a href="https://flashread.app">Website</a> •
    <a href="https://twitter.com/FlashReadApp">Twitter</a> •
    <a href="mailto:support@flashread.app">Email</a>
  </p>
</div>
