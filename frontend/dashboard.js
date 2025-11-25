// 👇 REPLACE THIS WITH YOUR HUGGING FACE URL (No trailing slash)
const BASE_URL = "https://rocky200416-food-calorie-tracker.hf.space";

document.addEventListener('DOMContentLoaded', () => {
    // Particles Configuration
    particlesJS('particles-js', {
        particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.2, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: true }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } }
        },
        retina_detect: true
    });

    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'index.html';
        return;
    }

    const imageInput = document.getElementById('image-input');
    const weightSelect = document.getElementById('weight');
    const analyzeBtn = document.getElementById('analyze-btn');
    const preview = document.getElementById('preview');
    const result = document.getElementById('result');
    const foodLogs = document.getElementById('food-logs');
    const logoutBtn = document.getElementById('logout-btn');
    const searchLogs = document.getElementById('search-logs');
    const filterWeight = document.getElementById('filter-weight');

    // Load History Logs
    function loadLogs() {
        fetch(`${BASE_URL}/api/food-logs?userId=${userId}`)
            .then(response => response.json())
            .then(logs => {
                foodLogs.innerHTML = '';
                
                // Filter Logic
                const searchTerm = searchLogs.value.toLowerCase();
                const weightFilter = filterWeight.value;

                let filteredLogs = logs.filter(log => {
                    const matchesSearch = log.foodName.toLowerCase().includes(searchTerm);
                    const matchesWeight = weightFilter === 'all' || log.nutrition.calories * (100/log.weight) === 0 ? true : true; // Simplified for demo
                    return matchesSearch; 
                });

                filteredLogs.forEach(log => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <div class="log-info">
                            <strong>${log.foodName}</strong>
                            <small>${new Date(log.timestamp).toLocaleDateString()}</small>
                        </div>
                        <div class="log-stats">
                            <span>🔥 ${log.nutrition.calories} kcal</span>
                            <button class="remove-log" onclick="deleteLog('${log.id}')">×</button>
                        </div>
                    `;
                    foodLogs.appendChild(li);
                });
            })
            .catch(error => console.error('Error loading logs:', error));
    }

    // Image Preview
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            preview.innerHTML = '';
            preview.appendChild(img);
        }
    });

    // Analyze Function
    analyzeBtn.addEventListener('click', () => {
        const file = imageInput.files[0];
        if (!file) {
            alert("Please upload an image first!");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', userId);
        formData.append('weight', weightSelect.value);

        result.innerHTML = '<div class="loading-spinner">Analyzing Cosmos... 🪐</div>';
        analyzeBtn.disabled = true;

        fetch(`${BASE_URL}/api/recognize`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            analyzeBtn.disabled = false;
            
            if (data.error) {
                result.innerHTML = `<p class="error-text">${data.error}</p>`;
            } else {
                // ✨ THIS IS THE NEW LAYOUT CODE ✨
                result.innerHTML = `
                    <div class="result-card animate-module">
                        <div class="result-header">
                            <h3>${data.foodName.replace(/_/g, ' ')}</h3>
                            <span class="confidence-badge">${(data.confidence * 100).toFixed(1)}% Match</span>
                        </div>

                        <div class="nutrition-grid">
                            <div class="nutri-item calorie-box">
                                <span class="icon">🔥</span>
                                <span class="value">${data.nutrition.calories}</span>
                                <span class="label">Calories</span>
                            </div>
                            <div class="nutri-item">
                                <span class="icon">🍗</span>
                                <span class="value">${data.nutrition.protein}g</span>
                                <span class="label">Protein</span>
                            </div>
                            <div class="nutri-item">
                                <span class="icon">🍞</span>
                                <span class="value">${data.nutrition.carbs}g</span>
                                <span class="label">Carbs</span>
                            </div>
                            <div class="nutri-item">
                                <span class="icon">🥑</span>
                                <span class="value">${data.nutrition.fat}g</span>
                                <span class="label">Fats</span>
                            </div>
                        </div>

                        <div class="summary-box">
                            <h4>📝 Knowledge Base</h4>
                            <p>${data.summary}</p>
                        </div>
                    </div>
                `;
                loadLogs(); // Refresh history
            }
        })
        .catch(error => {
            console.error(error);
            analyzeBtn.disabled = false;
            result.innerHTML = '<p class="error-text">Failed to contact the mothership (Backend Error).</p>';
        });
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userId');
        window.location.href = 'index.html';
    });

    // Initial Load
    loadLogs();
});
