# 🚀 AWS Deployment Guide for GovGuard AI Governance Platform

This guide provides multiple AWS deployment options for the GovGuard AI Governance Platform.

## 🏗️ Deployment Options

### Option 1: AWS Amplify (Recommended for Frontend)
- **Best for**: Quick deployment with CI/CD
- **Cost**: ~$1-5/month for small apps
- **Features**: Automatic builds, custom domains, SSL

### Option 2: AWS S3 + CloudFront
- **Best for**: Static hosting with global CDN
- **Cost**: ~$0.50-2/month
- **Features**: Global distribution, high performance

### Option 3: AWS EC2 with Docker
- **Best for**: Full control and scalability
- **Cost**: ~$8-20/month (t3.micro to t3.small)
- **Features**: Complete server control, custom configurations

### Option 4: AWS ECS Fargate (Serverless Containers)
- **Best for**: Production-grade serverless deployment
- **Cost**: Pay per use (~$10-30/month)
- **Features**: Auto-scaling, managed infrastructure

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js 18+** and npm
4. **Docker** (for containerized deployments)

## 🚀 Quick Start - AWS Amplify Deployment

### Step 1: Install AWS Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify configure
```

### Step 2: Initialize Amplify
```bash
amplify init
```

### Step 3: Add Hosting
```bash
amplify add hosting
# Choose: Amazon CloudFront and S3
```

### Step 4: Deploy
```bash
npm run build
amplify publish
```

## 📁 File Structure
```
aws-deployment/
├── README.md                 # This file
├── amplify/                  # AWS Amplify configuration
├── cloudformation/           # CloudFormation templates
├── docker/                   # Docker configurations
├── ecs/                      # ECS deployment files
├── s3-cloudfront/           # S3 + CloudFront setup
└── scripts/                 # Deployment scripts
```

## 🔧 Environment Variables for AWS

Create a `.env.production` file:
```env
# Groq API Configuration
VITE_GROQ_API_KEY=your_groq_api_key

# Perplexity API Configuration
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
VITE_PERPLEXITY_MODEL=sonar
VITE_PERPLEXITY_API_URL=https://api.perplexity.ai/chat/completions

# Firebase Configuration (if using)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Security Configuration
VITE_RATE_LIMIT_REQUESTS=10
VITE_RATE_LIMIT_WINDOW=60000
VITE_MAX_PROMPT_LENGTH=5000
```

## 🔒 Security Considerations

1. **API Keys**: Store in AWS Systems Manager Parameter Store or AWS Secrets Manager
2. **CORS**: Configure properly for your domain
3. **Rate Limiting**: Implement AWS WAF for additional protection
4. **SSL/TLS**: Always use HTTPS in production

## 📊 Cost Estimation

| Service | Monthly Cost (USD) | Use Case |
|---------|-------------------|----------|
| Amplify | $1-5 | Small to medium apps |
| S3 + CloudFront | $0.50-2 | Static hosting |
| EC2 t3.micro | $8-12 | Basic server |
| ECS Fargate | $10-30 | Serverless containers |

## 🚨 Important Notes

- **API Keys**: Never commit API keys to version control
- **Environment**: Use different environments for dev/staging/prod
- **Monitoring**: Set up CloudWatch for monitoring and alerts
- **Backup**: Regular backups of any persistent data

## 📞 Support

For deployment issues:
1. Check AWS CloudWatch logs
2. Review AWS documentation
3. Contact AWS Support if needed

---

Choose the deployment option that best fits your needs and follow the specific guide in the respective folder.