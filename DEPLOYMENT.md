# Deployment Guide

This document explains how to deploy Petpasshealth to production.

## Automated Deployment with GitHub Actions

The repository includes a GitHub Actions workflow that automatically builds and deploys your app.

### Setup Instructions

#### 1. **Create a Vercel Account**
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub
- Import this repository

#### 2. **Get Vercel Secrets**
After importing on Vercel, you'll get:
- `VERCEL_TOKEN` - Your personal access token
- `VERCEL_ORG_ID` - Your organization ID
- `VERCEL_PROJECT_ID` - Your project ID

#### 3. **Add GitHub Secrets**
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `VERCEL_TOKEN` (from Vercel)
   - `VERCEL_ORG_ID` (from Vercel)
   - `VERCEL_PROJECT_ID` (from Vercel)
   - `GEMINI_API_KEY` (your Google Gemini API key)

#### 4. **Deploy**
- Push to `main` branch
- GitHub Actions automatically builds and deploys to Vercel
- Your app will be live at: `https://your-project.vercel.app`

## Manual Deployment

### Local Build
```bash
npm install
npm run build
npm start
```

### Deploy with Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

## Alternative Deployment Platforms

### **Railway** (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect GitHub
3. Deploy from repo

### **Heroku**
```bash
heroku create your-app-name
heroku config:set GEMINI_API_KEY=your_key
git push heroku main
```

### **DigitalOcean App Platform**
1. Go to [digitalocean.com](https://digitalocean.com)
2. Create App from repo
3. Set environment variables
4. Deploy

## Environment Variables

Make sure these are set in production:
- `GEMINI_API_KEY` - Your Google Gemini API key

## Monitoring

After deployment:
- Check deployment logs on your platform
- Monitor app performance
- Set up error tracking (e.g., Sentry)

## Troubleshooting

### Build Fails
- Check GitHub Actions logs
- Verify all dependencies: `npm install`
- Check TypeScript errors: `npm run lint`

### App Won't Start
- Verify `GEMINI_API_KEY` is set
- Check server.ts for errors
- Review platform logs

### API Key Issues
- Ensure API key is set in secrets, not in code
- Check Gemini API quota
- Verify key permissions
