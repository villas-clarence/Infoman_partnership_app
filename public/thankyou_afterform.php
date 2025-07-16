<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Thank You - Aniya Registration</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f3f5f9;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .thank-you-container {
      background: #ffffff;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 500px;
    }
    h1 {
      color: #2e8b57;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.1rem;
      color: #444;
      margin-bottom: 2rem;
    }
    .custom-id {
      font-size: 1.3rem;
      font-weight: 700;
      color: #2e8b57;
      margin-bottom: 2rem;
    }
    .btn-group a,
    .btn-group button {
      display: inline-block;
      margin: 0 0.5rem;
      padding: 0.75rem 1.5rem;
      background-color: #2e8b57;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-size: 1rem;
      transition: background 0.3s ease;
      border: none;
      cursor: pointer;
    }
    .btn-group a:hover,
    .btn-group button:hover {
      background-color: #256d45;
    }
  </style>
</head>
<body>
  <div class="thank-you-container">
    <h1>🎉 Thank You!</h1>
    <p>Your registration with Aniya has been successfully submitted.</p>
    <div class="custom-id">
      Your Unique ID: 
      <?php
        if (isset($_GET['custom_id'])) {
          echo htmlspecialchars($_GET['custom_id']);
        } else {
          echo 'N/A';
        }
      ?>
    </div>
    <div class="btn-group">
      <a href="partnership_smallscale.html">Go to Partnership Dashboard</a>
      <button onclick="window.location.href='aniya_registration_form.html'">Edit Registration</button>
    </div>
  </div>
</body>
</html>
