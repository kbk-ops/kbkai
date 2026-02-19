const API_URL = "https://script.google.com/macros/s/AKfycbxZau2YMqBX4aWpx4xnJlPxVBk-69dDjsXMkYFrcenfBsDMQC74E-n_4TMyJlNxFGBz/exec";

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('error');

let currentUsername = "";

// Helper to show/hide loader
function toggleLoading(isLoading) {
    loader.style.display = isLoading ? 'block' : 'none';
    errorMsg.innerText = "";
}

// STEP 1: Check Username
document.getElementById('nextBtn').addEventListener('click', async () => {
    const idNum = document.getElementById('idNumber').value.trim();
    if (!idNum) return;

    toggleLoading(true);

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
            errorMsg.innerText = result.message;
        }
    } catch (e) {
        errorMsg.innerText = "Connection error. Try again.";
    } finally {
        toggleLoading(false);
    }
});

// STEP 2: Login or Save PIN
document.getElementById('loginBtn').addEventListener('click', async () => {
    const pinVal = document.getElementById('pin').value.trim();
    if (pinVal.length !== 6) {
        errorMsg.innerText = "Please enter a 6-digit PIN.";
        return;
    }

    toggleLoading(true);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', username: currentUsername, pin: pinVal })
        });
        const result = await response.json();

        if (result.status === "success") {
            // Set session
            localStorage.setItem('userSession', Date.now());
            localStorage.setItem('username', currentUsername);
            window.location.href = "https://kbk-ops.github.io/kbkai/user/dashboard";
        } else {
            errorMsg.innerText = result.message;
        }
    } catch (e) {
        errorMsg.innerText = "Error processing login.";
    } finally {
        toggleLoading(false);
    }
});
