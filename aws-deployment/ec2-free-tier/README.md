# 🚀 AWS EC2 Free Tier Deployment Guide

Deploy GovGuard AI Governance Platform on AWS EC2 Free Tier (t2.micro) for **FREE** for 12 months.

## 💰 Cost Breakdown
- **EC2 t2.micro**: FREE for 12 months (750 hours/month)
- **EBS Storage**: 30 GB FREE for 12 months
- **Data Transfer**: 15 GB outbound FREE per month
- **Estimated Monthly Cost**: $0 for first year, ~$8-12/month after

## 🎯 What You'll Get
- ✅ Production-ready GovGuard deployment
- ✅ SSL certificate with Let's Encrypt
- ✅ Nginx reverse proxy
- ✅ PM2 process management
- ✅ Automatic deployments
- ✅ Monitoring and logging

## 📋 Prerequisites

1. **AWS Account** (with free tier eligibility)
2. **Domain name** (optional, can use EC2 public IP)
3. **Local machine** with SSH client

## 🚀 Step-by-Step Deployment

### Step 1: Launch EC2 Instance

1. **Go to AWS Console**
   - Navigate to EC2 Dashboard
   - Click "Launch Instance"

2. **Configure Instance**
   ```
   Name: govguard-production
   AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
   Instance Type: t2.micro (Free tier eligible)
   Key Pair: Create new or use existing
   Security Group: Create new with HTTP, HTTPS, SSH access
   Storage: 30 GB gp3 (Free tier eligible)
   ```

3. **Security Group Rules**
   ```
   SSH (22): Your IP
   HTTP (80): 0.0.0.0/0
   HTTPS (443): 0.0.0.0/0
   Custom (3000): 0.0.0.0/0 (for Node.js app)
   ```

### Step 2: Connect to Instance

```bash
# Download your key pair and set permissions
chmod 400 your-key-pair.pem

# Connect to instance
ssh -i your-key-pair.pem ubuntu@your-ec2-public-ip
```

### Step 3: Server Setup

Run the automated setup script:

```bash
# Download and run setup script
curl -o setup.sh https://raw.githubusercontent.com/your-repo/govguard/main/aws-deployment/ec2-free-tier/setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

Or follow manual steps below:

#### Manual Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install additional tools
sudo apt install -y nginx git curl unzip

# Install PM2 globally
sudo npm install -g pm2

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 4: Deploy Application

```bash
# Clone repository
git clone https://github.com/your-username/govguard.git
cd govguard

# Install dependencies
npm install

# Create production environment file
sudo nano .env.production
```

Add your environment variables:
```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_PERPLEXITY_API_KEY=your_perplexity_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

```bash
# Build application
npm run build

# Start with PM2
pm2 start npm --name "govguard" -- start
pm2 save
pm2 startup
```

### Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/govguard
```

Copy the Nginx configuration from `nginx.conf` file.

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/govguard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL (Optional)

If you have a domain:

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Configuration Files

All configuration files are provided in this directory:
- `setup.sh` - Automated setup script
- `nginx.conf` - Nginx configuration
- `ecosystem.config.js` - PM2 configuration
- `deploy.sh` - Deployment script

## 📊 Monitoring

### Check Application Status
```bash
# PM2 status
pm2 status
pm2 logs govguard

# Nginx status
sudo systemctl status nginx

# System resources
htop
df -h
```

### CloudWatch Integration
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

## 🔄 Deployment Updates

Use the deployment script for updates:

```bash
# Run deployment script
./aws-deployment/ec2-free-tier/deploy.sh
```

## 🛡️ Security Best Practices

1. **Firewall Setup**
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   ```

2. **Automatic Updates**
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure unattended-upgrades
   ```

3. **Fail2Ban** (Optional)
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

## 🚨 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   pm2 logs govguard
   npm run build
   ```

2. **Nginx errors**
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Out of memory**
   ```bash
   # Add swap space
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## 📈 Performance Optimization

### For t2.micro limitations:

1. **Enable swap** (as shown above)
2. **Optimize build process**
   ```bash
   # Build locally and upload dist folder
   npm run build
   scp -r dist/ ubuntu@your-ec2-ip:/home/ubuntu/govguard/
   ```

3. **Use CDN** for static assets
4. **Enable Nginx caching**

## 💡 Cost Optimization Tips

1. **Stop instance when not needed**
   ```bash
   # Stop instance (keeps EBS storage)
   aws ec2 stop-instances --instance-ids i-1234567890abcdef0
   ```

2. **Use Elastic IP** (optional, $0.005/hour when not attached)

3. **Monitor usage**
   - Set up billing alerts
   - Use AWS Cost Explorer

## 🔗 Access Your Application

After deployment:
- **HTTP**: `http://your-ec2-public-ip`
- **HTTPS**: `https://yourdomain.com` (if SSL configured)

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs govguard`
2. Verify Nginx: `sudo nginx -t`
3. Check system resources: `htop`
4. Review security groups in AWS Console

---

Your GovGuard AI Governance Platform is now running on AWS EC2 Free Tier! 🎉