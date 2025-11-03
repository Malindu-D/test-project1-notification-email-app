// Global API endpoint
let API_ENDPOINT = '';
let isAPITested = false;

// DOM Elements
const apiStatus = document.getElementById('apiStatus');
const testConnectionBtn = document.getElementById('testConnectionBtn');
const emailForm = document.getElementById('emailForm');
const receiverEmailInput = document.getElementById('receiverEmail');
const sendEmailBtn = document.getElementById('sendEmailBtn');
const responseMessage = document.getElementById('responseMessage');

// Load configuration on page load
window.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
});

async function loadConfig() {
    try {
        // Try to get API endpoint from Azure Static Web App configuration
        const configResponse = await fetch('/api/config');
        
        if (configResponse.ok) {
            const config = await configResponse.json();
            API_ENDPOINT = config.apiEndpoint;
            
            if (API_ENDPOINT) {
                console.log('API Endpoint loaded from Azure config:', API_ENDPOINT);
                apiStatus.innerHTML = '<div class="status-message status-success"> API endpoint loaded from Azure configuration</div>';
                testConnectionBtn.disabled = false;
                return;
            }
        }
        
        // If we reach here, Azure config not available (running locally)
        console.log('Azure config not available - running locally');
        apiStatus.innerHTML = '<div class="status-message status-warning"> Running locally. Please enter API endpoint manually below and test connection.</div>';
        
        // Create manual input for local testing
        createManualApiInput();
        
    } catch (error) {
        console.error('Configuration load error:', error);
        console.log('Falling back to manual input for local testing');
        apiStatus.innerHTML = '<div class="status-message status-warning"> Running locally. Please enter API endpoint manually below and test connection.</div>';
        createManualApiInput();
    }
}

function createManualApiInput() {
    const statusSection = document.querySelector('.api-test-section');
    
    // Check if manual input already exists
    if (document.getElementById('manualApiInput')) return;
    
    const manualInputHtml = `
        <div id="manualApiInput" style="margin-top: 15px;">
            <label for="apiEndpointInput" style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 500;">
                API Endpoint URL:
            </label>
            <input 
                type="text" 
                id="apiEndpointInput" 
                placeholder="https://your-api.azurewebsites.net"
                style="width: 100%; padding: 12px; border: 2px solid #4A90E2; border-radius: 8px; font-size: 14px; margin-bottom: 10px;"
            />
        </div>
    `;
    
    statusSection.insertAdjacentHTML('beforeend', manualInputHtml);
    
    const apiInput = document.getElementById('apiEndpointInput');
    
    // Enable test button when user enters URL
    apiInput.addEventListener('input', () => {
        const url = apiInput.value.trim();
        if (url) {
            API_ENDPOINT = url;
            testConnectionBtn.disabled = false;
        } else {
            testConnectionBtn.disabled = true;
        }
    });
}

// Test API connection when button is clicked
testConnectionBtn.addEventListener('click', async () => {
    testConnectionBtn.disabled = true;
    testConnectionBtn.innerHTML = '<span class="spinner"></span> Testing...';
    apiStatus.innerHTML = '';

    try {
        const baseUrl = API_ENDPOINT.replace(/\/$/, '');
        const healthUrl = `${baseUrl}/api/health`;

        console.log('Testing connection to:', healthUrl);

        const response = await fetch(healthUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                apiStatus.innerHTML = '<div class="status-message status-success"> API connection successful! You can now send emails.</div>';
                isAPITested = true;
            } else {
                apiStatus.innerHTML = '<div class="status-message status-warning"> API responded but returned error.</div>';
                isAPITested = false;
            }
        } else {
            apiStatus.innerHTML = `<div class="status-message status-error"> API connection failed (Status: ${response.status})</div>`;
            isAPITested = false;
        }
    } catch (error) {
        console.error('Connection test error:', error);
        apiStatus.innerHTML = '<div class="status-message status-error"> Cannot connect to API. Please check the URL and try again.</div>';
        isAPITested = false;
    } finally {
        testConnectionBtn.disabled = false;
        testConnectionBtn.innerHTML = ' Test API Connection';
    }
});

// Handle form submission
emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const receiverEmail = receiverEmailInput.value.trim();

    // Validation
    if (!API_ENDPOINT) {
        showMessage(' Please enter API endpoint and test connection first', false);
        return;
    }

    if (!isAPITested) {
        showMessage(' Please test API connection first by clicking "Test API Connection" button', false);
        apiStatus.innerHTML = '<div class="status-message status-warning"> Please click "Test API Connection" button above</div>';
        return;
    }

    if (!receiverEmail || !isValidEmail(receiverEmail)) {
        showMessage('Please enter a valid email address', false);
        return;
    }

    // Disable form
    sendEmailBtn.disabled = true;
    sendEmailBtn.innerHTML = '<span class="spinner"></span> Sending Email...';
    responseMessage.innerHTML = '';

    try {
        const baseUrl = API_ENDPOINT.replace(/\/$/, '');
        const emailUrl = `${baseUrl}/api/email/send`;

        console.log('Sending email request to:', emailUrl);
        console.log('Receiver email:', receiverEmail);

        const response = await fetch(emailUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                receiverEmail: receiverEmail
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showMessage(` Success! Email sent to ${receiverEmail}`, true);
            emailForm.reset();
        } else {
            showMessage(` Error: ${data.message || 'Failed to send email'}`, false);
        }
    } catch (error) {
        console.error('Email send error:', error);
        showMessage(' Cannot connect to API. Please check connection and try again.', false);
    } finally {
        sendEmailBtn.disabled = false;
        sendEmailBtn.innerHTML = ' Send Email Notification';
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(message, isSuccess) {
    responseMessage.innerHTML = `<div class="message ${isSuccess ? 'success' : 'error'}">${message}</div>`;
    
    if (isSuccess) {
        setTimeout(() => {
            responseMessage.innerHTML = '';
        }, 5000);
    }
}
