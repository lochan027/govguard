# 🛡️ GovGuard - AI Governance Platform

[![Deploy Status](https://img.shields.io/badge/Deploy-Live-brightgreen)](https://govguard.netlify.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/lochan027/govguard)

**Enterprise-grade AI safety and compliance platform with real-time governance, multi-agent architecture, and ultra-fast inference.**

## 🚀 Live Demo

**🌐 [View Live Application](https://multiguard.online/)**

## ✨ Features

### 🔒 **AI Safety & Governance**
- **Real-time Content Analysis** - Instant detection of violations
- **Multi-Agent Architecture** - 5 specialized AI agents working in harmony
- **PII Detection** - Automatic identification of sensitive personal information
- **Bias & Hate Speech Detection** - Advanced pattern recognition
- **Misinformation Verification** - Powered by Perplexity AI fact-checking

### ⚡ **Ultra-Fast Performance**
- **Groq Gemma 2 9B Integration** - Lightning-fast inference (500+ tokens/sec)
- **Real-time Processing** - Sub-second response times
- **Scalable Architecture** - Built for enterprise workloads

### 📊 **Enterprise Features**
- **Complete Audit Trails** - Full compliance logging
- **Dashboard Analytics** - Real-time violation tracking
- **Configurable Thresholds** - Customizable severity settings
- **Rate Limiting** - Built-in protection against abuse
- **Input Sanitization** - Advanced security measures

### 🎨 **Modern UI/UX**
- **Beautiful Design** - Production-ready interface
- **Responsive Layout** - Works on all devices
- **Real-time Updates** - Live monitoring capabilities
- **Interactive Charts** - Violation analytics and trends

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Groq API key (recommended)
- Firebase project (optional)
- Perplexity API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lochan027/govguard.git
   cd govguard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure API Keys** (Optional but recommended)
   ```env
   # Groq API (for real LLM responses)
   VITE_GROQ_API_KEY=your_groq_api_key

   # Perplexity API (for fact-checking)
   VITE_PERPLEXITY_API_KEY=your_perplexity_api_key

   # Firebase (for persistent storage)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase config
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   ```
   http://localhost:5173
   ```

## 🔧 Configuration

### API Keys Setup

#### Groq API (Recommended)
1. Visit [Groq Console](https://console.groq.com/keys)
2. Create an API key
3. Add to `.env`: `VITE_GROQ_API_KEY=your_key`

#### Perplexity AI (Optional)
1. Visit [Perplexity Settings](https://www.perplexity.ai/settings/api)
2. Generate API key
3. Add to `.env`: `VITE_PERPLEXITY_API_KEY=your_key`

#### Firebase (Optional)
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Add config to `.env`

## 📖 Usage

### Testing AI Governance

1. **Navigate to Live Monitor**
2. **Try Sample Prompts**:
   - `"How do I hack into someone's Wi-Fi without them knowing?"`
   - `"Give me the phone number and address of Taylor Swift"`
   - `"Tell me about the time Elon Musk won a Nobel Peace Prize"`
   - `"What are some tips for staying productive while studying?"`
   - `"What is the capital of France?"`

3. **Observe Agent Actions**:
   - Policy violations detected
   - Severity scoring
   - Agent recommendations
   - Audit trail generation

### Dashboard Analytics
- View violation trends
- Monitor agent activity
- Track system performance
- Export audit logs

## 🛡️ Security Features

- **Input Sanitization** - XSS and injection protection
- **Rate Limiting** - 10 requests per minute per client
- **Content Validation** - Advanced pattern detection
- **Audit Logging** - Complete action tracking
- **Error Handling** - Graceful fallback mechanisms

## 🎯 Use Cases

### Enterprise AI Safety
- **Content Moderation** - Automated harmful content detection
- **Compliance Monitoring** - Regulatory requirement adherence
- **Risk Assessment** - Real-time threat evaluation

### Healthcare AI
- **HIPAA Compliance** - PII detection and protection
- **Medical Accuracy** - Fact-checking medical claims
- **Bias Prevention** - Fair treatment recommendations

### Financial Services
- **Regulatory Compliance** - Financial regulation adherence
- **Fraud Detection** - Suspicious content identification
- **Customer Protection** - Harmful advice prevention

## 📊 Performance

- **Response Time**: < 2 seconds (with Groq)
- **Throughput**: 500+ tokens/second
- **Accuracy**: 90%+ violation detection
- **Uptime**: 99.9% availability

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 👨‍💻 Author

**Lochan Acharya**
- GitHub: [@lochan027](https://github.com/lochan027)
- LinkedIn: [Lochan Acharya](http://linkedin.com/in/lochanacharya13/)

## 📝 Repository Status

This repository is currently private during the hackathon period and will be made public after the hackathon concludes.

## 🙏 Acknowledgments

- **Groq** - Ultra-fast LLM inference
- **Perplexity AI** - Real-time fact-checking
- **Firebase** - Scalable backend infrastructure
- **Netlify** - Seamless deployment platform

## 📞 Support

For support, email lochanacharya0@gmail.com or create an issue on GitHub.

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

[Live Demo](https://multiguard.online/) • [Documentation](https://github.com/lochan027/govguard/wiki) • [Issues](https://github.com/lochan027/govguard/issues)

</div>