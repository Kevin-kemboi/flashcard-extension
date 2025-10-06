# Netlify Deployment Guide

This document provides detailed instructions for deploying the Flashcard Builder with Gesture Recognition to Netlify.

## Prerequisites

- GitHub account
- Netlify account
- Basic knowledge of Git commands

## Manual Deployment

### Step 1: Fork or Clone the Repository

```bash
git clone https://github.com/Kevin-kemboi/flashcard-extension.git
cd flashcard-extension
```

### Step 2: Install Dependencies and Build

```bash
npm install
npm run build
```

### Step 3: Deploy to Netlify using the Netlify CLI

Install the Netlify CLI if you haven't already:

```bash
npm install -g netlify-cli
```

Login to your Netlify account:

```bash
netlify login
```

Deploy to Netlify:

```bash
netlify deploy --prod
```

Follow the prompts to complete the deployment.

## Automatic Deployment with GitHub

### Step 1: Connect Repository to Netlify

1. Log in to your Netlify account
2. Click "New site from Git"
3. Connect to GitHub and select your repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `.`
5. Click "Deploy site"

### Step 2: Configure Netlify Build Settings

1. Go to Site settings > Build & deploy
2. Under Build settings, ensure:
   - Base directory: not set (root of project)
   - Build command: `npm run build`
   - Publish directory: `.`

### Step 3: Set Up Environment Variables (if needed)

1. Go to Site settings > Build & deploy > Environment
2. Add any required environment variables

## Setting up Continuous Deployment with GitHub Actions

This repository includes a GitHub Actions workflow for automatic deployment. To use it:

1. In your Netlify dashboard, go to User settings > Applications > Personal access tokens
2. Generate a new personal access token
3. In your GitHub repository, go to Settings > Secrets > New repository secret
4. Add the following secrets:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
   - `NETLIFY_SITE_ID`: Your Netlify site API ID (found in Site settings > General > Site details > API ID)

Now, every push to the main branch will trigger a deployment to Netlify.

## Testing Your Deployment

Once deployed, your site will be available at a URL provided by Netlify (e.g., `https://your-site-name.netlify.app`).

To test the gesture recognition demo, visit:
`https://your-site-name.netlify.app/gesture-core/test.html`

## Troubleshooting

If you encounter issues with your deployment:

1. Check the build logs in Netlify for errors
2. Ensure all dependencies are correctly installed
3. Verify that the build process is working locally
4. Check that the correct publish directory is specified

For more help, visit [Netlify Support](https://www.netlify.com/support/).