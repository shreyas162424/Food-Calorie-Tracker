// 👇 REPLACE THIS WITH YOUR ACTUAL HUGGING FACE URL
const BASE_URL = "https://YOUR-HUGGING-FACE-URL.hf.space"; 

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    if (!username || !password) {
        message.innerText = "Please fill in all fields.";
        return;
    }

    message.innerText = "Logging in...";

    try {
        const response = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save userId to session storage so dashboard can use it
            sessionStorage.setItem('userId', data.userId);
            sessionStorage.setItem('username', username);
            window.location.href = 'dashboard.html';
        } else {
            message.innerText = data.error || "Login failed";
            message.style.color = "red";
        }
    } catch (error) {
        console.error("Login Error:", error);
        message.innerText = "Server error. Check console.";
    }
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    if (!username || !password) {
        message.innerText = "Please fill in all fields.";
        return;
    }

    message.innerText = "Registering...";

    try {
        const response = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            message.innerText = "Registration successful! You can now login.";
            message.style.color = "green";
        } else {
            message.innerText = data.error || "Registration failed";
            message.style.color = "red";
        }
    } catch (error) {
        console.error("Register Error:", error);
        message.innerText = "Server error. Check console.";
    }
}
