// 👇 REPLACE THIS WITH YOUR ACTUAL HUGGING FACE URL
const BASE_URL = "https://YOUR-HUGGING-FACE-URL.hf.space"; 

// Check if user is logged in
const userId = sessionStorage.getItem('userId');
if (!userId) {
    window.location.href = 'index.html';
}

async function analyzeFood() {
    const fileInput = document.getElementById('imageInput');
    const weight = document.getElementById('weight').value;
    const status = document.getElementById('status');
    const resultBox = document.getElementById('resultBox');

    if (!fileInput.files[0]) {
        alert("Please select an image first!");
        return;
    }

    status.innerText = "Analyzing... please wait...";
    resultBox.style.display = 'none';

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("userId", userId);
    formData.append("weight", weight);

    try {
        const response = await fetch(`${BASE_URL}/api/recognize`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            status.innerText = "";
            resultBox.style.display = 'block';
            
            // Update UI with Data
            document.getElementById('foodName').innerText = data.foodName;
            document.getElementById('confidence').innerText = (data.confidence * 100).toFixed(1) + "%";
            document.getElementById('summary').innerText = data.summary;

            // Fill Nutrition Info
            const nutList = document.getElementById('nutritionList');
            nutList.innerHTML = `
                <li>Calories: ${data.nutrition.calories} kcal</li>
                <li>Protein: ${data.nutrition.protein}g</li>
                <li>Carbs: ${data.nutrition.carbs}g</li>
                <li>Fat: ${data.nutrition.fat}g</li>
            `;

            // Refresh logs
            loadLogs();
        } else {
            status.innerText = "Error: " + (data.error || "Unknown error");
        }
    } catch (error) {
        console.error(error);
        status.innerText = "Failed to connect to server.";
    }
}

async function loadLogs() {
    const list = document.getElementById('historyList');
    try {
        const response = await fetch(`${BASE_URL}/api/food-logs?userId=${userId}`);
        const logs = await response.json();

        list.innerHTML = "";
        logs.forEach(log => {
            const date = new Date(log.timestamp).toLocaleDateString();
            const li = document.createElement('li');
            li.innerHTML = `<strong>${log.foodName}</strong> (${log.nutrition.calories} kcal) - <small>${date}</small>`;
            list.appendChild(li);
        });
    } catch (error) {
        console.error("Log Error:", error);
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Load logs when page opens
loadLogs();
