# Deploy to Netlify
# This script helps you deploy your flashcard extension to Netlify

# Check if netlify-cli is installed
if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Host "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
}

# Build the project first
Write-Host "Building the project..."
npm run build

# Check if we're logged in to Netlify
$netlifyStatus = netlify status 2>&1
if ($netlifyStatus -like "*You're not logged in*") {
    Write-Host "You need to log in to Netlify first."
    netlify login
}

# Prompt for deployment type
$deployOption = Read-Host "Choose deployment type: 
1. Quick deploy (production) 
2. Deploy draft (preview) 
3. Initialize new site 
Enter option number"

switch ($deployOption) {
    1 {
        Write-Host "Deploying to production..."
        netlify deploy --prod
    }
    2 {
        Write-Host "Deploying preview..."
        netlify deploy
    }
    3 {
        Write-Host "Initializing new site..."
        netlify init
    }
    default {
        Write-Host "Invalid option selected. Exiting."
        exit 1
    }
}

Write-Host "Deployment process completed!"
Write-Host "Don't forget to check your deployment at your Netlify dashboard."