# Deploying to Netlify with CLI

This guide provides step-by-step instructions for deploying your Flashcard Builder with Gesture Recognition to Netlify using the command line interface.

## Prerequisites

- Node.js and npm installed
- Git installed
- Netlify account

## Installation

1. Install the Netlify CLI globally:

```bash
npm install -g netlify-cli
```

2. Authenticate with Netlify:

```bash
netlify login
```

## Deployment Options

### Option 1: Quick Deploy (Recommended for First-time Setup)

For a quick deployment without configuring continuous deployment:

```bash
# Navigate to your project directory
cd flashcard-extension

# Deploy to Netlify
netlify deploy --prod
```

Follow the prompts to complete your deployment.

### Option 2: Set Up Continuous Deployment

For setting up continuous deployment with your Git repository:

```bash
# Navigate to your project directory
cd flashcard-extension

# Initialize a new Netlify site
netlify init
```

Follow the prompts to:
1. Create a new site or use an existing one
2. Connect to your GitHub repository
3. Configure build settings

## Build Settings

When prompted for build settings, use:

- **Build command**: `npm run build`
- **Publish directory**: `.`

## Custom Domain (Optional)

To set up a custom domain:

```bash
netlify domains:add yourdomain.com
```

Follow the prompts to configure DNS settings.

## Environment Variables (Optional)

To set environment variables:

```bash
netlify env:set KEY VALUE
```

## Deployment Status

To check the status of your deployment:

```bash
netlify status
```

## Troubleshooting

If you encounter issues:

```bash
# View Netlify logs
netlify logs

# Get site information
netlify sites:list

# Run build locally to test
netlify build
```

## Resources

- [Netlify CLI Documentation](https://docs.netlify.com/cli/get-started/)
- [Netlify Deployment Documentation](https://docs.netlify.com/site-deploys/overview/)