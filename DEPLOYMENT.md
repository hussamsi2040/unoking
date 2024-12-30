# Deployment Guide

This guide explains how to deploy the Uno King application to Azure using GitHub Actions.

## Prerequisites

1. Azure account with an active subscription
2. Two Azure Web Apps created:
   - uno-king-frontend (for the frontend)
   - uno-king-backend (for the backend)
3. GitHub repository with the source code
4. GitHub Actions enabled in the repository

## Setup Azure Web Apps

### Frontend Web App

1. Create a new Web App in Azure:
   ```bash
   az webapp create --name uno-king-frontend --resource-group your-resource-group --plan your-service-plan --runtime "node|18-lts"
   ```

2. Configure the following application settings:
   ```bash
   az webapp config appsettings set --name uno-king-frontend --resource-group your-resource-group --settings WEBSITE_NODE_DEFAULT_VERSION=18-lts
   ```

### Backend Web App

1. Create a new Web App in Azure:
   ```bash
   az webapp create --name uno-king-backend --resource-group your-resource-group --plan your-service-plan --runtime "node|18-lts"
   ```

2. Configure the following application settings:
   ```bash
   az webapp config appsettings set --name uno-king-backend --resource-group your-resource-group --settings \
     WEBSITE_NODE_DEFAULT_VERSION=18-lts \
     MONGODB_URI=your-mongodb-connection-string
   ```

## GitHub Actions Setup

1. Get the publish profiles for both web apps:
   ```bash
   az webapp deployment list-publishing-profiles --name uno-king-frontend --resource-group your-resource-group --xml
   az webapp deployment list-publishing-profiles --name uno-king-backend --resource-group your-resource-group --xml
   ```

2. Add the publish profiles as GitHub secrets:
   - Name: AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND
   - Name: AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND

3. The GitHub Actions workflow will automatically deploy both applications when changes are pushed to the main branch.

## Manual Deployment

If you need to deploy manually:

1. Build the applications:
   ```bash
   # Install dependencies
   npm install

   # Build shared package
   cd packages/shared
   npm run build

   # Build frontend
   cd ../frontend
   npm run build

   # Build backend
   cd ../backend
   npm run build
   ```

2. Deploy using Azure CLI:
   ```bash
   # Deploy frontend
   cd packages/frontend
   az webapp deployment source config-zip --src dist.zip --name uno-king-frontend --resource-group your-resource-group

   # Deploy backend
   cd ../backend
   az webapp deployment source config-zip --src dist.zip --name uno-king-backend --resource-group your-resource-group
   ```

## Troubleshooting

1. If the frontend shows a blank page, check that:
   - The web.config file is present in the frontend's public directory
   - The VITE_BACKEND_URL environment variable is set correctly

2. If the backend fails to start, check:
   - The web.config file is present in the backend's root directory
   - All environment variables are set correctly in the Azure Web App settings
   - The MongoDB connection string is valid

3. For Socket.IO connection issues:
   - Ensure WebSocket support is enabled in the Azure Web App
   - Check CORS settings in both frontend and backend
   - Verify the Socket.IO connection URL is correct

## Monitoring

Monitor your applications using Azure Application Insights:

1. Enable Application Insights in both web apps
2. Monitor:
   - Server response times
   - WebSocket connections
   - Error rates
   - User sessions

## Scaling

To handle more users:

1. Scale up the service plan if needed:
   ```bash
   az appservice plan update --name your-service-plan --resource-group your-resource-group --sku P1V2
   ```

2. Enable auto-scaling:
   ```bash
   az monitor autoscale create --resource-group your-resource-group --resource your-service-plan --name autoscale-plan --min-count 1 --max-count 5 --count 1
   ``` 