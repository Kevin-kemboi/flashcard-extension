# Netlify Deployment Steps

Follow these steps to deploy your Flashcard Builder Extension's demo site to Netlify:

## Step 1: Prepare for Deployment

The following files have been created/modified to prepare for Netlify deployment:

- `index.html` - Landing page for the Netlify site
- `netlify.toml` - Configuration for Netlify build and redirects
- `_redirects` - Additional redirect rules for Netlify
- `.github/workflows/netlify-deploy.yml` - GitHub Actions workflow for automatic deployment
- `NETLIFY_DEPLOYMENT.md` - Detailed deployment instructions

## Step 2: Sign up for Netlify

If you haven't already:
1. Create an account at [netlify.com](https://www.netlify.com/)
2. Sign in to your account

## Step 3: Deploy Manually

### Option A: Deploy via Netlify Site

1. Go to [Netlify New Site](https://app.netlify.com/start)
2. Choose "Import an existing project"
3. Connect to your GitHub repository
4. Configure the build as follows:
   - Build command: `npm run build`
   - Publish directory: `.`
5. Click "Deploy site"

### Option B: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Login to your Netlify account:
   ```
   netlify login
   ```

3. Initialize Netlify site:
   ```
   netlify init
   ```

4. Deploy to production:
   ```
   netlify deploy --prod
   ```

## Step 4: Configure GitHub Actions (Optional)

To set up automatic deployments:

1. In Netlify, go to User settings > Applications > Personal access tokens
2. Create a new personal access token
3. Copy the token

4. In GitHub, go to your repository settings > Secrets > Actions
5. Add two new repository secrets:
   - `NETLIFY_AUTH_TOKEN`: Your personal access token
   - `NETLIFY_SITE_ID`: Your Netlify site ID (found in Site settings > General)

## Step 5: Update Domain Settings (Optional)

1. In Netlify, go to Site settings > Domain management
2. Configure your custom domain if desired

## Step 6: Verify Deployment

1. Check that the main page loads at your Netlify URL
2. Verify that the gesture test works at `/gesture-core/test.html`
3. Test all functionality of the demo site

## Additional Notes

- The site is configured to use the root directory as the publish directory
- The site will rebuild automatically when you push to the main branch if GitHub Actions is configured
- You can view deployment logs in the Netlify dashboard
- If you update the code, run `npm run build` before deploying again manually

## URLs After Deployment

- Main site: `https://[your-site-name].netlify.app/`
- Gesture test: `https://[your-site-name].netlify.app/gesture-core/test.html`