import { createAuthPlugin } from "@agent-native/core/server";

// Email/password auth with optional Google OAuth (enabled automatically when
// GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set).
export default createAuthPlugin({
  rootAuth: false,
  workspaceAppPublicPaths: ["/", "/posts", "/sign-in", "/signup"],
  workspaceAppProtectedPaths: ["/studio"],
  marketing: {
    appName: "Fieldnotes",
    tagline: "A little more room to notice.",
    description: "A thoughtful journal for the stories, observations, and small details worth keeping.",
  },
  loginHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in — Fieldnotes</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg-primary: #09090b;
      --bg-secondary: #18181b;
      --bg-tertiary: #27272a;
      --text-primary: #fafafa;
      --text-secondary: #a1a1aa;
      --text-muted: #71717a;
      --border: #27272a;
      --accent: #fafafa;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.5; min-height: 100vh; }
    .container { min-height: 100vh; display: flex; }
    .left-panel { flex: 1; padding: 60px; display: flex; flex-direction: column; justify-content: center; max-width: 50%; cursor: pointer; }
    .right-panel { flex: 1; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; padding: 60px; }
    .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; cursor: pointer; }
    .logo-icon { width: 48px; height: 48px; background: var(--accent); border-radius: 12px; display: grid; place-items: center; }
    .logo-text { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; color: var(--text-primary); }
    .logo-text span { color: var(--accent); }
    .tagline { font-size: 48px; font-weight: 500; letter-spacing: -0.05em; line-height: 1.1; margin-bottom: 16px; }
    .tagline span { font-style: italic; color: var(--accent); }
    .description { font-size: 18px; color: var(--text-secondary); line-height: 1.6; max-width: 480px; }
    .form-card { width: 100%; max-width: 400px; }
    .tabs { display: flex; gap: 4px; margin-bottom: 32px; background: var(--bg-tertiary); padding: 4px; border-radius: 12px; }
    .tab { flex: 1; padding: 12px; text-align: center; cursor: pointer; border-radius: 8px; font-size: 14px; font-weight: 500; color: var(--text-muted); transition: all 0.2s; }
    .tab.active { background: var(--bg-secondary); color: var(--text-primary); }
    .form-group { margin-bottom: 20px; }
    label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: var(--text-secondary); }
    input { width: 100%; padding: 14px 16px; border: 1px solid var(--border); border-radius: 12px; font-size: 15px; background: var(--bg-tertiary); color: var(--text-primary); transition: all 0.2s; }
    input:focus { outline: none; border-color: var(--text-muted); }
    input::placeholder { color: var(--text-muted); }
    .confirm-password { display: none; }
    .confirm-password.show { display: block; }
    button { width: 100%; padding: 14px; background: var(--accent); color: var(--bg-primary); border: none; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 12px; border-radius: 12px; font-size: 14px; margin-bottom: 20px; display: none; border: 1px solid rgba(239, 68, 68, 0.2); }
    .error.show { display: block; }
    @media (max-width: 768px) {
      .container { flex-direction: column; }
      .left-panel { max-width: 100%; padding: 40px 20px; }
      .right-panel { max-width: 100%; padding: 40px 20px; }
      .tagline { font-size: 32px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="left-panel" onclick="window.location.href='/'">
      <div class="logo" onclick="event.stopPropagation(); window.location.href='/'">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#09090b" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <span class="logo-text">Fieldnotes<span>.</span></span>
      </div>
      <h1 class="tagline">A little more<br />room to <span>notice.</span></h1>
      <p class="description">Fieldnotes is a home for thoughtful stories about how we live, what we make, and the details that make a day feel like our own.</p>
    </div>
    <div class="right-panel">
      <div class="form-card">
        <div class="tabs">
          <div class="tab" id="signupTab">Create account</div>
          <div class="tab active" id="signinTab">Sign in</div>
        </div>
        <div id="error" class="error"></div>
        <form id="authForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required placeholder="••••••••">
          </div>
          <div class="form-group confirm-password" id="confirmGroup">
            <label for="confirmPassword">Confirm password</label>
            <input type="password" id="confirmPassword" placeholder="••••••••">
          </div>
          <button type="submit" id="submitBtn">Sign in</button>
        </form>
      </div>
    </div>
  </div>
  <script>
    let isLogin = true;
    const signupTab = document.getElementById('signupTab');
    const signinTab = document.getElementById('signinTab');
    const submitBtn = document.getElementById('submitBtn');
    const confirmGroup = document.getElementById('confirmGroup');
    const confirmPassword = document.getElementById('confirmPassword');
    const errorEl = document.getElementById('error');
    const form = document.getElementById('authForm');

    function updateUI() {
      if (isLogin) {
        signupTab.classList.remove('active');
        signinTab.classList.add('active');
        submitBtn.textContent = 'Sign in';
        confirmGroup.classList.remove('show');
        confirmPassword.required = false;
      } else {
        signupTab.classList.add('active');
        signinTab.classList.remove('active');
        submitBtn.textContent = 'Create account';
        confirmGroup.classList.add('show');
        confirmPassword.required = true;
      }
      errorEl.classList.remove('show');
    }

    signupTab.addEventListener('click', () => {
      isLogin = false;
      updateUI();
    });

    signinTab.addEventListener('click', () => {
      isLogin = true;
      updateUI();
    });

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.add('show');
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      submitBtn.disabled = true;
      errorEl.classList.remove('show');

      if (!isLogin) {
        const confirm = document.getElementById('confirmPassword').value;
        if (password !== confirm) {
          showError('Passwords do not match');
          submitBtn.disabled = false;
          return;
        }
      }

      try {
        if (isLogin) {
          const res = await fetch('/_agent-native/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (data.ok) {
            window.location.href = '/studio';
          } else {
            showError(data.error || 'Sign in failed');
          }
        } else {
          const res = await fetch('/_agent-native/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (data.ok) {
            const loginRes = await fetch('/_agent-native/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();
            if (loginData.ok) {
              window.location.href = '/studio';
            } else {
              showError(loginData.error || 'Account created but sign in failed');
            }
          } else {
            showError(data.error || 'Sign up failed');
          }
        }
      } catch (err) {
        showError('Network error. Please try again.');
      } finally {
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`,
});
