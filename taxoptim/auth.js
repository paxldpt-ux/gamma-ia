/* ── Gamma IA Auth ── */
const GammaAuth = {

  getUser() {
    try { return JSON.parse(localStorage.getItem('gamma_user')); } catch { return null; }
  },
  setUser(u) { localStorage.setItem('gamma_user', JSON.stringify(u)); },
  logout() { localStorage.removeItem('gamma_user'); window.location.href = 'index.html'; },
  isLogged() { return !!this.getUser(); },

  /* Appel depuis les pages protégées */
  requireAuth(onSuccess) {
    if (this.isLogged()) { onSuccess && onSuccess(this.getUser()); return; }
    this.showModal(onSuccess);
  },

  /* ── Modal ── */
  showModal(onSuccess) {
    if (document.getElementById('gamma-auth-modal')) return;
    const el = this._buildModal();
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; el.querySelector('.auth-card').style.transform = 'translateY(0)'; });
    this._bindModal(el, onSuccess);
  },

  _buildModal() {
    const el = document.createElement('div');
    el.id = 'gamma-auth-modal';
    el.innerHTML = `
<style>
#gamma-auth-modal {
  position:fixed;inset:0;z-index:9999;
  background:rgba(2,6,15,0.88);backdrop-filter:blur(18px);
  display:flex;align-items:center;justify-content:center;
  padding:1.5rem;opacity:0;transition:opacity .35s ease;
}
.auth-card {
  background:#08111e;border:1px solid rgba(110,154,181,0.2);
  border-radius:18px;padding:2.5rem 2rem;width:100%;max-width:420px;
  box-shadow:0 40px 100px rgba(0,0,0,.7);
  transform:translateY(24px);transition:transform .4s cubic-bezier(.22,1,.36,1);
}
.auth-logo { display:flex;align-items:center;gap:.5rem;justify-content:center;margin-bottom:1.75rem; }
.auth-logo-g { font-family:Georgia,serif;font-style:italic;font-size:1.8rem;color:#6e9ab5; }
.auth-logo-t { font-family:'Segoe UI',sans-serif;font-weight:600;font-size:1.05rem;color:#edf2ff; }
.auth-logo-t em { font-style:normal;color:#6b7fa0;font-weight:400; }
.auth-title { font-family:'Segoe UI',sans-serif;font-size:1.3rem;font-weight:700;color:#edf2ff;text-align:center;margin-bottom:.4rem; }
.auth-sub { font-size:.82rem;color:#6b7fa0;text-align:center;margin-bottom:1.75rem; }

/* Social buttons */
.auth-social { display:flex;flex-direction:column;gap:.75rem;margin-bottom:1.25rem; }
.auth-social-btn {
  display:flex;align-items:center;justify-content:center;gap:.75rem;
  padding:.7rem 1rem;border-radius:10px;font-size:.88rem;font-weight:600;
  cursor:pointer;border:1px solid rgba(110,154,181,0.25);
  background:rgba(255,255,255,0.04);color:#edf2ff;
  transition:background .2s,border-color .2s;
}
.auth-social-btn:hover { background:rgba(255,255,255,0.08);border-color:rgba(110,154,181,0.45); }
.auth-social-btn svg { width:20px;height:20px;flex-shrink:0; }
.auth-social-btn.apple-btn { color:#edf2ff; }

/* Divider */
.auth-divider { display:flex;align-items:center;gap:.75rem;margin:1.25rem 0; }
.auth-divider-line { flex:1;height:1px;background:rgba(110,154,181,0.12); }
.auth-divider-text { font-size:.75rem;color:#6b7fa0; }

/* Form */
.auth-field { margin-bottom:1rem; }
.auth-label { display:block;font-size:.78rem;font-weight:500;color:#a2bfd4;margin-bottom:.4rem; }
.auth-input-wrap { position:relative; }
.auth-input {
  width:100%;padding:.7rem 1rem;border-radius:9px;
  background:rgba(255,255,255,0.05);border:1px solid rgba(110,154,181,0.2);
  color:#edf2ff;font-size:.9rem;outline:none;transition:border-color .2s;
}
.auth-input:focus { border-color:rgba(110,154,181,0.55); }
.auth-input::placeholder { color:#3a4f68; }
.auth-toggle-pw {
  position:absolute;right:.75rem;top:50%;transform:translateY(-50%);
  background:none;border:none;cursor:pointer;color:#6b7fa0;padding:.2rem;font-size:.85rem;
}

/* Password strength */
.pw-strength { margin-top:.4rem;display:none; }
.pw-bars { display:flex;gap:3px;margin-bottom:.3rem; }
.pw-bar { flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,0.08);transition:background .3s; }
.pw-bar.weak   { background:#ef4444; }
.pw-bar.medium { background:#f59e0b; }
.pw-bar.strong { background:#22c55e; }
.pw-text { font-size:.72rem;color:#6b7fa0; }

/* Submit */
.auth-submit {
  width:100%;padding:.8rem;border-radius:10px;
  background:#6e9ab5;color:#050a12;
  font-size:.92rem;font-weight:700;border:none;cursor:pointer;
  transition:background .2s,transform .15s;margin-top:.5rem;
}
.auth-submit:hover { background:#a2bfd4; }
.auth-submit:active { transform:scale(.98); }
.auth-submit:disabled { opacity:.5;cursor:default; }

/* Toggle */
.auth-switch { text-align:center;margin-top:1.25rem;font-size:.8rem;color:#6b7fa0; }
.auth-switch a { color:#a2bfd4;cursor:pointer;font-weight:500; }

/* Error */
.auth-error { background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:.6rem .9rem;font-size:.8rem;color:#fca5a5;margin-bottom:.75rem;display:none; }

/* Close */
.auth-close { position:absolute;top:1rem;right:1rem;background:none;border:none;color:#6b7fa0;cursor:pointer;font-size:1.2rem;padding:.3rem; }
#gamma-auth-modal { position:fixed; }
.auth-card { position:relative; }
.auth-legal { font-size:.7rem;color:#3a4f68;text-align:center;margin-top:1rem; }
</style>

<div class="auth-card">
  <button class="auth-close" id="auth-close">✕</button>
  <div class="auth-logo">
    <span class="auth-logo-g">γ</span>
    <span class="auth-logo-t">Gamma <em>IA</em></span>
  </div>
  <h2 class="auth-title" id="auth-title">Créer votre compte</h2>
  <p class="auth-sub" id="auth-sub">Accédez à l'agent fiscal IA et au simulateur</p>

  <div class="auth-social">
    <button class="auth-social-btn" id="btn-google">
      <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      Continuer avec Google
    </button>
    <button class="auth-social-btn apple-btn" id="btn-apple">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
      Continuer avec Apple
    </button>
  </div>

  <div class="auth-divider">
    <div class="auth-divider-line"></div>
    <span class="auth-divider-text">ou par email</span>
    <div class="auth-divider-line"></div>
  </div>

  <div class="auth-error" id="auth-error"></div>

  <div class="auth-field" id="field-name" style="display:none">
    <label class="auth-label">Prénom</label>
    <div class="auth-input-wrap">
      <input class="auth-input" type="text" id="auth-name" placeholder="Votre prénom" autocomplete="given-name"/>
    </div>
  </div>

  <div class="auth-field">
    <label class="auth-label">Email</label>
    <div class="auth-input-wrap">
      <input class="auth-input" type="email" id="auth-email" placeholder="votre@email.com" autocomplete="email"/>
    </div>
  </div>

  <div class="auth-field">
    <label class="auth-label">Mot de passe</label>
    <div class="auth-input-wrap">
      <input class="auth-input" type="password" id="auth-password" placeholder="8 caractères minimum" autocomplete="new-password"/>
      <button class="auth-toggle-pw" id="toggle-pw" tabindex="-1" type="button">👁</button>
    </div>
    <div class="pw-strength" id="pw-strength">
      <div class="pw-bars">
        <div class="pw-bar" id="pb1"></div>
        <div class="pw-bar" id="pb2"></div>
        <div class="pw-bar" id="pb3"></div>
        <div class="pw-bar" id="pb4"></div>
      </div>
      <span class="pw-text" id="pw-text"></span>
    </div>
  </div>

  <button class="auth-submit" id="auth-submit">Créer mon compte</button>

  <div class="auth-switch" id="auth-switch">
    Déjà un compte ? <a id="auth-toggle">Se connecter</a>
  </div>

  <p class="auth-legal">En créant un compte vous acceptez nos <a href="mentions-legales.html" style="color:#6b7fa0">mentions légales</a> et notre <a href="mentions-legales.html#rgpd" style="color:#6b7fa0">politique RGPD</a>.</p>
</div>`;
    return el;
  },

  _bindModal(el, onSuccess) {
    let isLogin = false;

    const close = () => {
      el.style.opacity = '0';
      el.querySelector('.auth-card').style.transform = 'translateY(24px)';
      setTimeout(() => el.remove(), 350);
    };

    el.querySelector('#auth-close').onclick = close;
    el.addEventListener('click', e => { if (e.target === el) close(); });

    // Toggle register / login
    el.querySelector('#auth-toggle').onclick = () => {
      isLogin = !isLogin;
      el.querySelector('#auth-title').textContent = isLogin ? 'Se connecter' : 'Créer votre compte';
      el.querySelector('#auth-sub').textContent = isLogin ? 'Content de vous revoir !' : 'Accédez à l\'agent fiscal IA et au simulateur';
      el.querySelector('#field-name').style.display = isLogin ? 'none' : 'block';
      el.querySelector('#auth-submit').textContent = isLogin ? 'Se connecter' : 'Créer mon compte';
      el.querySelector('#auth-toggle').textContent = isLogin ? 'Créer un compte' : 'Se connecter';
      el.querySelector('#auth-switch').innerHTML = isLogin
        ? 'Pas encore de compte ? <a id="auth-toggle">Créer un compte</a>'
        : 'Déjà un compte ? <a id="auth-toggle">Se connecter</a>';
      el.querySelector('#auth-toggle').onclick = arguments.callee.bind(this);
      el.querySelector('#auth-error').style.display = 'none';
      el.querySelector('#auth-password').setAttribute('autocomplete', isLogin ? 'current-password' : 'new-password');
      el.querySelector('#pw-strength').style.display = isLogin ? 'none' : '';
    };

    // Password show/hide
    el.querySelector('#toggle-pw').onclick = () => {
      const pw = el.querySelector('#auth-password');
      pw.type = pw.type === 'password' ? 'text' : 'password';
    };

    // Password strength
    el.querySelector('#auth-password').addEventListener('input', e => {
      if (isLogin) return;
      const v = e.target.value;
      el.querySelector('#pw-strength').style.display = v ? 'block' : 'none';
      const score = this._pwScore(v);
      const bars = [el.querySelector('#pb1'), el.querySelector('#pb2'), el.querySelector('#pb3'), el.querySelector('#pb4')];
      const cls = score <= 1 ? 'weak' : score <= 2 ? 'medium' : 'strong';
      const labels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];
      bars.forEach((b, i) => { b.className = 'pw-bar' + (i < score ? ' ' + cls : ''); });
      el.querySelector('#pw-text').textContent = labels[score] || '';
    });

    // Submit
    el.querySelector('#auth-submit').onclick = async () => {
      await this._submit(el, isLogin, onSuccess, close);
    };
    [el.querySelector('#auth-email'), el.querySelector('#auth-password'), el.querySelector('#auth-name')]
      .forEach(i => i && i.addEventListener('keydown', e => { if (e.key === 'Enter') el.querySelector('#auth-submit').click(); }));

    // Google
    el.querySelector('#btn-google').onclick = () => this._googleSignIn(el, onSuccess, close);

    // Apple (requires Apple Dev — show info)
    el.querySelector('#btn-apple').onclick = () => {
      this._showError(el, 'Apple Sign In nécessite un compte Apple Developer. Utilisez Google ou email/mot de passe.');
    };
  },

  async _submit(el, isLogin, onSuccess, close) {
    const btn = el.querySelector('#auth-submit');
    const email = el.querySelector('#auth-email').value.trim();
    const password = el.querySelector('#auth-password').value;
    const name = el.querySelector('#auth-name')?.value.trim() || '';

    if (!email || !password) return this._showError(el, 'Veuillez remplir tous les champs.');
    if (!isLogin && password.length < 8) return this._showError(el, 'Mot de passe : 8 caractères minimum.');

    btn.disabled = true;
    btn.textContent = '...';

    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Erreur serveur');
      this.setUser({ email: data.email, name: data.name, token: data.token });
      close();
      onSuccess && onSuccess(this.getUser());
    } catch(e) {
      this._showError(el, e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = isLogin ? 'Se connecter' : 'Créer mon compte';
    }
  },

  _googleSignIn(el, onSuccess, close) {
    // Store current page so auth-callback.html can redirect back
    try { sessionStorage.setItem('gamma_auth_redirect', window.location.pathname + window.location.search); } catch(e) {}
    window.location.href = '/api/auth/google/url';
  },

  _initGoogle() {},

  _pwScore(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 4);
  },

  _showError(el, msg) {
    const e = el.querySelector('#auth-error');
    e.textContent = msg;
    e.style.display = 'block';
  }
};
