# Email Notification App - Deployment Guide

## 📋 Overview

This is a simple HTML/CSS/JavaScript application that sends email notifications by calling your API Service App. It collects a receiver email address and triggers the email notification system.

**Technology:** Static web application (HTML, CSS, JavaScript)  
**Deployment Target:** Azure Static Web Apps  
**Theme:** Light blue (same as Name-Age App)

---

## 🚀 Deployment Steps (Azure Portal UI Only)

### Prerequisites

1. A GitHub account with this repository
2. An Azure account (free tier works)
3. Your API Service App already deployed (needed for configuration)

---

### Step 1: Create Azure Static Web App

1. **Go to Azure Portal**

   - Open: https://portal.azure.com
   - Sign in to your account

2. **Create New Resource**

   - Click "+ Create a resource"
   - Search for "Static Web App"
   - Click "Create"

3. **Configure Basic Settings**

   - **Subscription:** Select your subscription
   - **Resource Group:** Create new or use existing (e.g., `user-data-system-rg`)
   - **Name:** `email-notification-app` (or your preferred name)
   - **Plan type:** Free
   - **Region:** Choose closest to you (e.g., East US, West Europe)

4. **Configure Deployment**

   - **Source:** GitHub
   - Click "Sign in with GitHub" (authorize if needed)
   - **Organization:** Your GitHub username
   - **Repository:** Select your repository
   - **Branch:** main

5. **Build Configuration**

   - **Build Presets:** Custom
   - **App location:** `email-notification-app`
   - **Api location:** (leave empty)
   - **Output location:** (leave empty)

6. **Review + Create**

   - Click "Review + create"
   - Click "Create"
   - Wait 2-3 minutes for deployment

7. **Get Your Website URL**
   - After deployment completes, click "Go to resource"
   - Find your URL (e.g., `https://kind-ocean-xyz123.azurestaticapps.net`)
   - **Save this URL** - this is your Email Notification App URL

---

### Step 2: Configure GitHub Secret

After Azure creates the Static Web App, you need to add the deployment token to GitHub:

1. **Get Deployment Token from Azure**

   - In Azure Portal, go to your Static Web App resource
   - Click "Manage deployment token" in the Overview page
   - Click "Copy" to copy the token
   - **Keep this safe** - you'll use it in next step

2. **Add Secret to GitHub**
   - Go to your GitHub repository
   - Click "Settings" tab
   - Click "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN_EMAIL_NOTIFICATION`
   - **Value:** Paste the deployment token from Azure
   - Click "Add secret"

---

### Step 3: Configure Application Settings (IMPORTANT!)

Your app needs to know your API Service URL:

1. **Get API Service URL**

   - Go to your API Service App in Azure Portal
   - Copy the URL (e.g., `https://your-api.azurewebsites.net`)

2. **Configure in Web App**

   - Open your Email Notification App website
   - In the "API Configuration" section
   - Enter your API Service URL (without `/api/email/send`)
   - Click "Test API Connection"
   - Should show green ✅ success message

3. **Test is Automatic**
   - The app saves your API URL in browser localStorage
   - You won't need to enter it again (unless you clear browser data)

---

### Step 4: Verify Deployment

1. **Check GitHub Actions**

   - Go to your GitHub repository
   - Click "Actions" tab
   - You should see a workflow running
   - Wait for green checkmark ✅
   - If red ❌, check the logs

2. **Test Your App**
   - Open your Static Web App URL
   - Enter your API Service URL
   - Click "Test API Connection"
   - Should show: "✅ Connection successful!"
   - Enter a receiver email address
   - Click "Send Email Notification"
   - Should show success message

---

## 🔧 Configuration Details

### Environment Variables

This app **does not use** Azure Static Web Apps configuration. Instead, it uses:

- **localStorage** to save API endpoint (configured by user in browser)
- This is intentional for simplicity

### How It Works

1. User opens the app
2. User configures API Service URL
3. App saves URL in browser localStorage
4. User enters receiver email
5. App sends POST request to API Service
6. API Service calls Java Email Service
7. Email sent to receiver

---

## 📝 API Integration

### Endpoints Used

#### 1. Health Check (Test Connection)

```
GET {API_URL}/api/health
```

**Response:**

```json
{
  "success": true,
  "message": "API is healthy"
}
```

#### 2. Send Email

```
POST {API_URL}/api/email/send
```

**Request Body:**

```json
{
  "receiverEmail": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

## 🐛 Troubleshooting

### Issue: Test Connection Fails

**Symptoms:** Red ❌ error message when testing connection

**Solutions:**

1. Check API Service URL is correct
2. Make sure API Service is deployed and running
3. Check API Service has CORS configured to allow your Static Web App URL
4. Open browser console (F12) to see detailed error
5. Verify API Service `/api/health` endpoint works

### Issue: Email Not Sending

**Symptoms:** Error when clicking "Send Email Notification"

**Solutions:**

1. Verify API connection works (green checkmark)
2. Check email address format is valid
3. Verify your Java Email Service is deployed
4. Check Azure Communication Service is configured
5. Verify database has data to send

### Issue: App Not Deploying

**Symptoms:** GitHub Actions workflow fails

**Solutions:**

1. Check GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN_EMAIL_NOTIFICATION` is set
2. Verify app location is `email-notification-app` in workflow
3. Check Azure Static Web App is created successfully
4. Look at GitHub Actions logs for specific error

### Issue: CORS Errors

**Symptoms:** Browser console shows CORS errors

**Solutions:**

1. Go to API Service App in Azure Portal
2. Click "CORS" in left menu
3. Add your Static Web App URL to allowed origins
4. Example: `https://kind-ocean-xyz123.azurestaticapps.net`
5. Click "Save"

---

## 🔄 Making Updates

### Update HTML/CSS/JavaScript

1. Edit files in `email-notification-app` folder
2. Test locally by opening `index.html` in browser
3. Commit and push to GitHub
4. GitHub Actions automatically deploys to Azure
5. Wait 2-3 minutes
6. Refresh your Static Web App URL

### Update API URL

1. Open your Static Web App
2. Change API Endpoint URL in the configuration section
3. Click outside the input box (auto-saves)
4. Test connection again

---

## 📊 Monitoring

### View Deployment History

1. Go to Azure Portal
2. Open your Static Web App resource
3. Click "Environments" → "Production"
4. See deployment history and status

### View Application Logs

1. Open browser console (F12)
2. Go to "Console" tab
3. See API request/response logs
4. Check for errors

---

## 🔐 Security Notes

- ✅ No secrets stored in code
- ✅ API URL configured by user (not hardcoded)
- ✅ HTTPS enforced by Azure Static Web Apps
- ✅ API calls use HTTPS
- ⚠️ Make sure to configure CORS in API Service
- ⚠️ Email validation is basic (API should validate too)

---

## 📚 Additional Resources

### Azure Static Web Apps Documentation

- https://docs.microsoft.com/azure/static-web-apps/

### GitHub Actions

- https://docs.github.com/actions

### Testing Locally

- Open `index.html` directly in browser
- Or use VS Code Live Server extension
- Configure API URL to your deployed API Service

---

## 🎯 Success Checklist

Before considering deployment complete, verify:

- [ ] Static Web App created in Azure
- [ ] GitHub secret configured
- [ ] GitHub Actions workflow runs successfully
- [ ] App loads in browser
- [ ] Test API Connection shows green ✅
- [ ] Can submit email address
- [ ] Success message appears
- [ ] Email actually received (check inbox/spam)
- [ ] CORS configured in API Service

---

## 💡 Tips

1. **Save API URL:** The app remembers your API URL using localStorage
2. **Test First:** Always test API connection before sending
3. **Check Console:** Use browser F12 console to debug
4. **CORS Issues:** Most common problem - configure in API Service
5. **Simple Design:** Intentionally simple for non-programmers
6. **Light Blue Theme:** Matches Name-Age App for consistency

---

**Need Help?** Check `SYSTEM_ARCHITECTURE.md` for complete system overview and how all apps connect together.
