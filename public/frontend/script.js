document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const registerBtn = document.getElementById('register-btn');
  const loginBtn = document.getElementById('login-btn');
  const authMessage = document.getElementById('auth-message');
  const authSection = document.getElementById('auth-section');
  const recommendationSection = document.getElementById('recommendation-section');
  const recommendationForm = document.getElementById('recommendation-form');
  const recommendationResult = document.getElementById('recommendation-result');
  const logoutBtn = document.getElementById('logout-btn');

  const saveBtn = document.getElementById('save-rec-btn');
  const downloadBtn = document.getElementById('download-rec-btn');
  const viewPastBtn = document.getElementById('view-past-rec-btn');
  const pastRecContainer = document.getElementById('past-recommendations');

  // LocalStorage Data
  let usersDB = JSON.parse(localStorage.getItem('usersDB') || '[]');
  let recommendationsDB = JSON.parse(localStorage.getItem('recommendationsDB') || '{}');
  let loggedInUserEmail = localStorage.getItem('loggedInUserEmail');

  let lastGeneratedRecommendation = null;

  // Save DB
  function saveDB() {
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
    localStorage.setItem('recommendationsDB', JSON.stringify(recommendationsDB));

    if (loggedInUserEmail) {
      localStorage.setItem('loggedInUserEmail', loggedInUserEmail);
    } else {
      localStorage.removeItem('loggedInUserEmail');
    }
  }

  // Render recommendation
  function renderRecommendation(rec) {
    if (!rec || !rec.fertilizers.length) {
      return `<p>No recommendations available.</p>`;
    }

    let html = `<h3>Recommendations for ${rec.crop.toUpperCase()} (${rec.growthStage})</h3>`;
    html += `<p><b>Location:</b> ${rec.location}</p>`;
    html += `<table>
      <thead>
        <tr>
          <th>Fertilizer</th>
          <th>Type</th>
          <th>Quantity (kg/ha)</th>
          <th>Timing</th>
        </tr>
      </thead>
      <tbody>`;

    rec.fertilizers.forEach(f => {
      html += `<tr>
        <td>${f.name}</td>
        <td>${f.type}</td>
        <td>${f.quantity}</td>
        <td>${f.timing}</td>
      </tr>`;
    });

    html += `</tbody></table>`;
    return html;
  }

  // Show past recommendations
  function showPastRecommendations() {
    pastRecContainer.innerHTML = '';

    if (!loggedInUserEmail || !recommendationsDB[loggedInUserEmail]?.length) {
      pastRecContainer.innerHTML = `<p>No past recommendations found.</p>`;
      return;
    }

    let html = `<h3>Past Recommendations</h3>`;

    recommendationsDB[loggedInUserEmail].forEach(rec => {
      html += `<div class="rec">
        <p><b>Date:</b> ${new Date(rec.generatedAt).toLocaleString()}</p>
        ${renderRecommendation(rec)}
      </div>`;
    });

    pastRecContainer.innerHTML = html;
  }

  // Download text file
  function downloadTextFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function generateTextDownloadContent(rec) {
    let text = `Fertilizer Recommendation
Crop: ${rec.crop}
Growth Stage: ${rec.growthStage}
Location: ${rec.location}

Fertilizers:
`;

    rec.fertilizers.forEach(f => {
      text += `- ${f.name} (${f.type}): ${f.quantity} kg/ha, Timing: ${f.timing}\n`;
    });

    return text;
  }

  // Initialize UI
  function initializeUI() {
    if (loggedInUserEmail) {
      authSection.style.display = 'none';
      recommendationSection.style.display = 'block';
      pastRecContainer.style.display = 'none';
    } else {
      authSection.style.display = 'block';
      recommendationSection.style.display = 'none';
    }
  }

  // Register
  registerBtn.addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!name || !email || !password) {
      authMessage.textContent = 'Fill all fields';
      return;
    }

    if (usersDB.find(u => u.email === email)) {
      authMessage.textContent = 'User already exists';
      return;
    }

    usersDB.push({ name, email, password });
    recommendationsDB[email] = [];
    loggedInUserEmail = email;
    saveDB();

    authMessage.textContent = 'Registered successfully';
    initializeUI();
  });

  // Login
  loginBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const user = usersDB.find(u => u.email === email && u.password === password);
    if (!user) {
      authMessage.textContent = 'Invalid credentials';
      return;
    }

    loggedInUserEmail = email;
    saveDB();
    initializeUI();
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    loggedInUserEmail = null;
    saveDB();
    initializeUI();
  });

  // Recommendation submit
  recommendationForm.addEventListener('submit', e => {
    e.preventDefault();

    const location = document.getElementById('location').value;
    const crop = document.getElementById('crop-select').value;
    const growthStage = document.getElementById('growth-stage').value;

    const fertilizers = [
      {
        name: 'Balanced NPK',
        type: 'Mixed',
        quantity: 40,
        timing: 'As per schedule'
      }
    ];

    lastGeneratedRecommendation = {
      location,
      crop,
      growthStage,
      fertilizers,
      generatedAt: new Date().toISOString()
    };

    recommendationResult.innerHTML = renderRecommendation(lastGeneratedRecommendation);
    saveBtn.style.display = 'inline-block';
    downloadBtn.style.display = 'inline-block';
  });

  // Save recommendation
  saveBtn.addEventListener('click', () => {
    recommendationsDB[loggedInUserEmail].push(lastGeneratedRecommendation);
    saveDB();
    alert('Saved successfully');
  });

  // Download recommendation
  downloadBtn.addEventListener('click', () => {
    const content = generateTextDownloadContent(lastGeneratedRecommendation);
    downloadTextFile(
      content,
      `Recommendation_${lastGeneratedRecommendation.crop}_${new Date().toISOString().slice(0, 10)}.txt`
    );
  });

  // View past
  viewPastBtn.addEventListener('click', showPastRecommendations);

  initializeUI();
});
