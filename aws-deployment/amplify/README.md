# AWS Amplify Deployment

AWS Amplify provides the easiest way to deploy your React application with built-in CI/CD.

## 🚀 Quick Deployment

### Method 1: Amplify Console (Recommended)

1. **Go to AWS Amplify Console**
   - Visit: https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"

2. **Connect Repository**
   - Choose GitHub/GitLab/Bitbucket
   - Select your GovGuard repository
   - Choose the main branch

3. **Configure Build Settings**
   - Amplify will auto-detect the build settings
   - The `amplify.yml` file in this folder will be used automatically

4. **Add Environment Variables**
   ```
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

5. **Deploy**
   - Click "Save and deploy"
   - Wait for deployment to complete (~5-10 minutes)

### Method 2: Amplify CLI

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize Project**
   ```bash
   amplify init
   ```
   
   Configuration:
   ```
   ? Enter a name for the project: govguard
   ? Initialize the project with the above configuration? Yes
   ? Select the authentication method you want to use: AWS profile
   ? Please choose the profile you want to use: default
   ```

3. **Add Hosting**
   ```bash
   amplify add hosting
   ```
   
   Choose:
   ```
   ? Select the plugin module to execute: Amazon CloudFront and S3
   ? Select the environment setup: PROD (S3 with CloudFront using HTTPS)
   ? hosting bucket name: govguard-hosting-bucket
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   amplify publish
   ```

## 🔧 Configuration

### Environment Variables

Add these in the Amplify Console under "Environment variables":

```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
VITE_PERPLEXITY_API_KEY=pplx-your_perplexity_key_here
VITE_PERPLEXITY_MODEL=sonar
VITE_PERPLEXITY_API_URL=https://api.perplexity.ai/chat/completions
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RATE_LIMIT_REQUESTS=10
VITE_RATE_LIMIT_WINDOW=60000
VITE_MAX_PROMPT_LENGTH=5000
```

### Custom Domain

1. **In Amplify Console**
   - Go to "Domain management"
   - Click "Add domain"
   - Enter your domain (e.g., govguard.yourdomain.com)
   - Follow DNS configuration steps

2. **SSL Certificate**
   - Amplify automatically provisions SSL certificates
   - No additional configuration needed

## 📊 Features

- ✅ **Automatic CI/CD**: Deploys on every push to main branch
- ✅ **SSL Certificate**: Automatic HTTPS with custom domains
- ✅ **Global CDN**: CloudFront distribution included
- ✅ **Branch Deployments**: Deploy different branches to different URLs
- ✅ **Environment Variables**: Secure storage of API keys
- ✅ **Build Logs**: Detailed logs for troubleshooting
- ✅ **Rollback**: Easy rollback to previous deployments

## 💰 Cost

- **Free Tier**: 1,000 build minutes/month, 15 GB served/month
- **Paid**: $0.01 per build minute, $0.15 per GB served
- **Typical Cost**: $1-5/month for small to medium applications

## 🔍 Monitoring

### CloudWatch Integration
- Build logs automatically sent to CloudWatch
- Set up alarms for failed builds
- Monitor application performance

### Access Logs
```bash
amplify console analytics
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check build logs in Amplify Console
   # Ensure all environment variables are set
   # Verify package.json scripts
   ```

2. **Environment Variables Not Working**
   ```bash
   # Ensure variables start with VITE_
   # Redeploy after adding variables
   # Check case sensitivity
   ```

3. **Custom Domain Issues**
   ```bash
   # Verify DNS settings
   # Wait for DNS propagation (up to 48 hours)
   # Check domain ownership verification
   ```

## 🔄 CI/CD Pipeline

The deployment automatically triggers on:
- Push to main branch
- Pull request merges
- Manual deployment from console

### Build Process
1. Install dependencies (`npm ci`)
2. Run build command (`npm run build`)
3. Deploy to S3
4. Invalidate CloudFront cache
5. Update DNS (if custom domain)

## 📈 Scaling

Amplify automatically handles:
- **Traffic Spikes**: CloudFront CDN scales automatically
- **Global Distribution**: Edge locations worldwide
- **Caching**: Optimized caching strategies
- **Compression**: Automatic gzip compression

## 🔐 Security

- **HTTPS Only**: All traffic encrypted
- **Security Headers**: Configured in amplify.yml
- **WAF Integration**: Optional Web Application Firewall
- **Access Control**: IAM-based permissions

---

Your GovGuard application will be available at:
`https://main.d1234567890.amplifyapp.com` (or your custom domain)