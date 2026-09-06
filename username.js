const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory array to store submissions during runtime
const submissions = [];

// ==========================================
// 1. PUBLIC-FACING PAGE (Route: /)
// ==========================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Instagram Username Request 💜</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Poppins', sans-serif;
        }

        body {
          background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          color: #333;
        }

        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 40px 30px;
          border-radius: 24px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          text-align: center;
          max-width: 450px;
          width: 100%;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        h1 {
          font-size: 1.8rem;
          color: #4a154b;
          margin-bottom: 25px;
          font-weight: 600;
        }

        .btn-container {
          display: flex;
          justify-content: center;
          gap: 20px;
          position: relative;
          min-height: 60px;
          margin-top: 10px;
        }

        button {
          padding: 12px 30px;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.3s ease, box-shadow 0.3s ease;
          outline: none;
        }

        #yes-btn {
          background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
          color: white;
          box-shadow: 0 4px 15px rgba(131, 58, 180, 0.4);
        }

        #yes-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(131, 58, 180, 0.6);
        }

        #no-btn {
          background: #e0e0e0;
          color: #555;
          position: relative;
          transition: 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .playful-msg {
          font-size: 0.9rem;
          color: #e1306c;
          margin-top: 15px;
          min-height: 24px;
          font-weight: 500;
        }

        .hidden {
          display: none !important;
        }

        .fade-in {
          animation: fadeIn 0.5s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 20px;
        }

        input[type="text"] {
          padding: 14px 20px;
          font-size: 1rem;
          border: 2px solid #ddd;
          border-radius: 50px;
          outline: none;
          transition: border-color 0.3s ease;
          text-align: center;
        }

        input[type="text"]:focus {
          border-color: #833ab4;
        }

        .success-box {
          margin-top: 20px;
        }

        .success-box h2 {
          color: #833ab4;
          font-size: 1.6rem;
          margin-bottom: 10px;
        }

        .success-box p {
          color: #666;
          font-size: 1.1rem;
        }
      </style>
    </head>
    <body>

      <div class="container" id="main-card">
        <h1 id="main-question">Can I get your Instagram Username? 💜</h1>
        
        <!-- Step 1: Prompt buttons -->
        <div id="prompt-section">
          <div class="btn-container" id="btn-container">
            <button id="yes-btn">YES</button>
            <button id="no-btn">NO</button>
          </div>
          <div class="playful-msg" id="playful-msg"></div>
        </div>

        <!-- Step 2: Input Section (Initially Hidden) -->
        <div id="input-section" class="hidden fade-in">
          <div class="input-group">
            <label for="username-input" style="font-weight: 500; color: #555;">Enter your Instagram Username:</label>
            <input type="text" id="username-input" placeholder="@username" autocomplete="off">
            <button id="submit-btn" style="background: linear-gradient(135deg, #833ab4, #fd1d1d); color: white;">Submit</button>
          </div>
        </div>

        <!-- Step 3: Success Section (Initially Hidden) -->
        <div id="success-section" class="hidden fade-in">
          <div class="success-box">
            <h2>Thank you! 💜</h2>
            <p id="displayed-username" style="font-weight: 600; color: #e1306c; margin-top: 5px;"></p>
          </div>
        </div>
      </div>

      <script>
        const yesBtn = document.getElementById('yes-btn');
        const noBtn = document.getElementById('no-btn');
        const playfulMsg = document.getElementById('playful-msg');
        
        const promptSection = document.getElementById('prompt-section');
        const inputSection = document.getElementById('input-section');
        const successSection = document.getElementById('success-section');
        
        const usernameInput = document.getElementById('username-input');
        const submitBtn = document.getElementById('submit-btn');
        const displayedUsername = document.getElementById('displayed-username');

        const messages = [
          "Are you sure? 😏",
          "Think again! 🙈",
          "Wrong button! 😜",
          "Pretty please? 🥺",
          "You can't escape! 🏃‍♂️",
          "Give it a chance! ✨"
        ];

        // Playful NO button movement
        noBtn.addEventListener('mouseover', moveNoButton);
        noBtn.addEventListener('click', function(e) {
          e.preventDefault();
          moveNoButton();
        });

        function moveNoButton() {
          const randomX = (Math.random() - 0.5) * 180;
          const randomY = (Math.random() - 0.5) * 80;

          noBtn.style.transform = 'translate(' + randomX + 'px, ' + randomY + 'px)';
          
          const randomMsg = messages[Math.floor(Math.random() * messages.length)];
          playfulMsg.textContent = randomMsg;
        }

        // YES button clicked
        yesBtn.addEventListener('click', function() {
          promptSection.classList.add('hidden');
          inputSection.classList.remove('hidden');
          usernameInput.focus();
        });

        // Submit button clicked
        submitBtn.addEventListener('click', handleSubmission);
        usernameInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') handleSubmission();
        });

        async function handleSubmission() {
          let val = usernameInput.value.trim();
          if (!val) {
            alert('Please enter your Instagram username!');
            return;
          }

          if (!val.startsWith('@')) {
            val = '@' + val;
          }

          try {
            const response = await fetch('/api/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: val })
            });
            
            const data = await response.json();
            if (data.success) {
              inputSection.classList.add('hidden');
              successSection.classList.remove('hidden');
              displayedUsername.textContent = 'Instagram Username: ' + val;
            }
          } catch (err) {
            console.error('Error submitting username:', err);
          }
        }
      </script>
    </body>
    </html>
  `);
});

// ==========================================
// 2. SEPARATE ADMIN DASHBOARD (Route: /admin)
// ==========================================
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Dashboard - Submissions 💜</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Poppins', sans-serif;
        }

        body {
          background: #f4f5f7;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          color: #333;
        }

        .admin-card {
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          max-width: 600px;
          width: 100%;
        }

        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #f1f1f1;
          padding-bottom: 15px;
        }

        h2 {
          color: #4a154b;
          font-size: 1.5rem;
        }

        .badge {
          background: #833ab4;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .table-container {
          max-height: 350px;
          overflow-y: auto;
          border: 1px solid #eee;
          border-radius: 12px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background: #fafafa;
          color: #444;
          font-weight: 600;
        }

        td {
          color: #555;
        }

        .refresh-btn {
          margin-top: 20px;
          background: linear-gradient(135deg, #833ab4, #fd1d1d);
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 50px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .refresh-btn:hover {
          opacity: 0.9;
        }
      </style>
    </head>
    <body>

      <div class="admin-card">
        <div class="header-flex">
          <h2>📋 Admin Submissions</h2>
          <span class="badge" id="sub-count">0 Submissions</span>
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Time Submitted</th>
              </tr>
            </thead>
            <tbody id="submissions-tbody">
              <tr><td colspan="2" style="text-align: center; color: #999;">Loading...</td></tr>
            </tbody>
          </table>
        </div>

        <button class="refresh-btn" onclick="loadSubmissions()">Refresh List</button>
      </div>

      <script>
        async function loadSubmissions() {
          try {
            const res = await fetch('/api/submissions');
            const data = await res.json();
            
            const subCount = document.getElementById('sub-count');
            const submissionsTbody = document.getElementById('submissions-tbody');

            subCount.textContent = data.length + ' Submissions';
            
            if (data.length === 0) {
              submissionsTbody.innerHTML = '<tr><td colspan="2" style="text-align: center; color: #999;">No submissions yet</td></tr>';
              return;
            }

            submissionsTbody.innerHTML = data.map(function(item) {
              return '<tr><td style="font-weight: 500; color: #e1306c;">' + item.username + '</td><td>' + item.time + '</td></tr>';
            }).join('');
          } catch (err) {
            console.error('Error loading submissions:', err);
          }
        }

        // Load on page open
        loadSubmissions();
      </script>
    </body>
    </html>
  `);
});

// ==========================================
// 3. API ENDPOINTS
// ==========================================
app.post('/api/submit', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username cannot be empty' });
  }

  const newEntry = {
    username,
    time: new Date().toLocaleString()
  };

  submissions.unshift(newEntry);
  res.json({ success: true, message: 'Saved successfully', submissions });
});

app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Start server
app.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
});
