const API_URL = "https://script.google.com/macros/s/AKfycbyD_7CU1eSOk9Rtf7BALw-VhWt9CQo3iEPpVsUfZtJOHRJyrdufiFQv8sGcvd8P_fnwKg/exec";

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('error');

let currentUsername = "";

// Show/hide loader
function toggleLoading(isLoading) {
    loader.style.display = isLoading ? 'block' : 'none';
}

// Display error message
function showError(message) {
    errorMsg.style.color = "red";
    errorMsg.innerText = message;
}

// STEP 1: Check Username
document.getElementById('nextBtn').addEventListener('click', async () => {
    const idNum = document.getElementById('idNumber').value.trim();
    if (!idNum) {
        showError("Please enter your username.");
        return;
    }

    toggleLoading(true);
    errorMsg.innerText = "";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'checkUser', username: idNum })
        });
        const result = await response.json();

        if (result.status === "success") {
            currentUsername = idNum;
            step1.style.display = 'none';
            step2.style.display = 'block';
            document.getElementById('pinLabel').innerText = result.hasPin ? "Enter PIN" : "Create 6-digit PIN";
        } else {
            showError(result.message || "Username not found.");
        }
    } catch (e) {
        showError("Connection error. Try again.");
    } finally {
        toggleLoading(false);
    }
});

// STEP 2: Login or Save PIN
document.getElementById('loginBtn').addEventListener('click', async () => {
    const pinVal = document.getElementById('pin').value.trim();
    if (pinVal.length !== 6) {
        showError("Please enter a 6-digit PIN.");
        return;
    }

    toggleLoading(true);
    errorMsg.innerText = "";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username: currentUsername, pin: pinVal })
        });
        const result = await response.json();

        if (result.status === "success") {
            localStorage.setItem('userSession', Date.now());
            localStorage.setItem('username', currentUsername);
            window.location.href = "https://kbk-ops.github.io/kbkai/partner/dashboard";
        } else {
            showError(result.message || "Incorrect PIN.");
        }
    } catch (e) {
        showError("Error processing login.");
    } finally {
        toggleLoading(false);
    }
});
