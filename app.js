// Global API endpoints
let healthEndpoint = "";
let emailEndpoint = "";
let isAPITested = false;

// DOM Elements
const apiStatus = document.getElementById("apiStatus");
const testConnectionBtn = document.getElementById("testConnectionBtn");
const emailForm = document.getElementById("emailForm");
const receiverEmailInput = document.getElementById("receiverEmail");
const sendEmailBtn = document.getElementById("sendEmailBtn");
const responseMessage = document.getElementById("responseMessage");

// Load configuration on page load
window.addEventListener("DOMContentLoaded", async () => {
  await loadConfig();
});

async function loadConfig() {
  try {
    console.log("Loading API endpoints from Azure configuration...");

    // Get API endpoints from Azure Static Web App environment variables
    const configResponse = await fetch("/api/config");

    if (configResponse.ok) {
      const config = await configResponse.json();
      console.log("Config loaded successfully");

      healthEndpoint = config.healthEndpoint;
      emailEndpoint = config.emailEndpoint;

      if (healthEndpoint && emailEndpoint) {
        console.log("✅ API endpoints configured from Azure");
        apiStatus.innerHTML =
          '<div class="status-message status-success">✅ API endpoints loaded from Azure. Ready to test connection.</div>';
        testConnectionBtn.disabled = false;
        return;
      } else {
        console.error("❌ Environment variables not set in Azure");
        apiStatus.innerHTML =
          '<div class="status-message status-error">❌ API endpoints not configured. Please set API_HEALTH_ENDPOINT and API_EMAIL_ENDPOINT in Azure Static Web App settings.</div>';
        testConnectionBtn.disabled = true;
        return;
      }
    } else {
      throw new Error(
        `Config endpoint returned status ${configResponse.status}`
      );
    }
  } catch (error) {
    console.warn("⚠️ Azure config not available - using local development mode");
    console.log("Error details:", error.message);
    
    // For local development - hardcode the endpoints
    healthEndpoint = "https://test-project-api-service-cuasbtc2etdxcxb8.southeastasia-01.azurewebsites.net/api/health";
    emailEndpoint = "https://test-project-api-service-cuasbtc2etdxcxb8.southeastasia-01.azurewebsites.net/api/email/send";
    
    apiStatus.innerHTML =
      '<div class="status-message status-warning">⚠️ Running in local development mode. Using default API endpoints.</div>';
    testConnectionBtn.disabled = false;
    
    console.log("Local endpoints configured:");
    console.log("Health:", healthEndpoint);
    console.log("Email:", emailEndpoint);
  }
}

// Test API connection when button is clicked - Uses HEALTH endpoint
testConnectionBtn.addEventListener("click", async () => {
  testConnectionBtn.disabled = true;
  testConnectionBtn.innerHTML = '<span class="spinner"></span> Testing...';
  apiStatus.innerHTML = "";

  try {
    if (!healthEndpoint) {
      apiStatus.innerHTML =
        '<div class="status-message status-error">❌ Health endpoint not configured. Please check Azure environment variables.</div>';
      return;
    }

    console.log("Testing connection to:", healthEndpoint);

    const response = await fetch(healthEndpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        apiStatus.innerHTML =
          '<div class="status-message status-success">✅ API connection successful! Server is running. You can now send emails.</div>';
        isAPITested = true;
        console.log("Health check passed:", data);
      } else {
        apiStatus.innerHTML =
          '<div class="status-message status-warning">⚠️ API responded but health check failed.</div>';
        isAPITested = false;
      }
    } else {
      apiStatus.innerHTML = `<div class="status-message status-error">❌ API connection failed (Status: ${response.status})</div>`;
      isAPITested = false;
    }
  } catch (error) {
    console.error("Connection test error:", error);
    apiStatus.innerHTML =
      '<div class="status-message status-error">❌ Cannot connect to API. Please verify the endpoint is correct and the API is running.</div>';
    isAPITested = false;
  } finally {
    testConnectionBtn.disabled = false;
    testConnectionBtn.innerHTML = "🔌 Test API Connection";
  }
});

// Handle form submission - Uses EMAIL endpoint
emailForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const receiverEmail = receiverEmailInput.value.trim();

  // Validation
  if (!emailEndpoint) {
    showMessage(
      "❌ Email endpoint not configured. Please check Azure environment variables.",
      false
    );
    return;
  }

  if (!isAPITested) {
    showMessage(
      '⚠️ Please test API connection first by clicking "Test API Connection" button',
      false
    );
    apiStatus.innerHTML =
      '<div class="status-message status-warning">⚠️ Please click "Test API Connection" button above</div>';
    return;
  }

  if (!receiverEmail || !isValidEmail(receiverEmail)) {
    showMessage("Please enter a valid email address", false);
    return;
  }

  // Disable form
  sendEmailBtn.disabled = true;
  sendEmailBtn.innerHTML = '<span class="spinner"></span> Sending Email...';
  responseMessage.innerHTML = "";

  try {
    console.log("Sending email request to:", emailEndpoint);
    console.log("Receiver email:", receiverEmail);

    const response = await fetch(emailEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        receiverEmail: receiverEmail,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showMessage(`✅ Success! Email sent to ${receiverEmail}`, true);
      emailForm.reset();
    } else {
      showMessage(`❌ Error: ${data.message || "Failed to send email"}`, false);
    }
  } catch (error) {
    console.error("Email send error:", error);
    showMessage(
      "❌ Cannot connect to API. Please check connection and try again.",
      false
    );
  } finally {
    sendEmailBtn.disabled = false;
    sendEmailBtn.innerHTML = "📧 Send Email Notification";
  }
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showMessage(message, isSuccess) {
  responseMessage.innerHTML = `<div class="message ${
    isSuccess ? "success" : "error"
  }">${message}</div>`;

  if (isSuccess) {
    setTimeout(() => {
      responseMessage.innerHTML = "";
    }, 5000);
  }
}
