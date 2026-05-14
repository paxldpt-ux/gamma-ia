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
  background:rgba(17,24,39,0.5);backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;
  padding:1.5rem;opacity:0;transition:opacity .35s ease;
}
.auth-card {
  background:#fff;border:1px solid rgba(17,24,39,0.09);
  border-radius:18px;padding:2.5rem 2rem;width:100%;max-width:420px;
  box-shadow:0 24px 80px rgba(0,0,0,.15),0 4px 16px rgba(0,0,0,.08);
  transform:translateY(24px);transition:transform .4s cubic-bezier(.22,1,.36,1);
}
.auth-logo { display:flex;align-items:center;gap:.5rem;justify-content:center;margin-bottom:1.75rem; }
.auth-logo-g { font-family:Georgia,serif;font-style:italic;font-size:1.8rem;color:#1e3a5f; }
.auth-logo-t { font-family:'Segoe UI',sans-serif;font-weight:700;font-size:1.05rem;color:#111827; }
.auth-logo-t em { font-style:normal;color:#9ca3af;font-weight:400; }
.auth-title { font-family:'Segoe UI',sans-serif;font-size:1.25rem;font-weight:700;color:#111827;text-align:center;margin-bottom:.4rem; }
.auth-sub { font-size:.82rem;color:#6b7280;text-align:center;margin-bottom:1.75rem; }

/* Social buttons */
.auth-social { display:flex;flex-direction:column;gap:.75rem;margin-bottom:1.25rem; }
.auth-social-btn {
  display:flex;align-items:center;justify-content:center;gap:.75rem;
  padding:.7rem 1rem;border-radius:10px;font-size:.88rem;font-weight:600;
  cursor:pointer;border:1px solid rgba(17,24,39,0.1);
  background:#fff;color:#111827;
  transition:background .2s,border-color .2s,box-shadow .2s;
  box-shadow:0 1px 3px rgba(0,0,0,0.06);
}
.auth-social-btn:hover { background:#f8f9fc;border-color:rgba(17,24,39,0.18);box-shadow:0 2px 8px rgba(0,0,0,0.08); }
.auth-social-btn svg { width:20px;height:20px;flex-shrink:0; }

/* Divider */
.auth-divider { display:flex;align-items:center;gap:.75rem;margin:1.25rem 0; }
.auth-divider-line { flex:1;height:1px;background:rgba(17,24,39,0.07); }
.auth-divider-text { font-size:.75rem;color:#9ca3af; }

/* Form */
.auth-field { margin-bottom:1rem; }
.auth-label { display:block;font-size:.78rem;font-weight:500;color:#374151;margin-bottom:.4rem; }
.auth-input-wrap { position:relative; }
.auth-input {
  width:100%;padding:.7rem 1rem;border-radius:9px;
  background:#f8f9fc;border:1px solid rgba(17,24,39,0.1);
  color:#111827;font-size:.9rem;outline:none;transition:border-color .2s,box-shadow .2s;
  font-family:inherit;
}
.auth-input:focus { border-color:#1e3a5f;box-shadow:0 0 0 3px rgba(30,58,95,0.1);background:#fff; }
.auth-input::placeholder { color:#c4cad5; }
.auth-toggle-pw {
  position:absolute;right:.75rem;top:50%;transform:translateY(-50%);
  background:none;border:none;cursor:pointer;color:#9ca3af;padding:.2rem;font-size:.85rem;
}

/* Password strength */
.pw-strength { margin-top:.4rem;display:none; }
.pw-bars { display:flex;gap:3px;margin-bottom:.3rem; }
.pw-bar { flex:1;height:3px;border-radius:2px;background:rgba(17,24,39,0.07);transition:background .3s; }
.pw-bar.weak   { background:#ef4444; }
.pw-bar.medium { background:#f59e0b; }
.pw-bar.strong { background:#22c55e; }
.pw-text { font-size:.72rem;color:#9ca3af; }

/* Submit */
.auth-submit {
  width:100%;padding:.8rem;border-radius:10px;
  background:#1e3a5f;color:#fff;
  font-size:.92rem;font-weight:700;border:none;cursor:pointer;font-family:inherit;
  transition:background .2s,transform .15s;margin-top:.5rem;
}
.auth-submit:hover { background:#2d6499; }
.auth-submit:active { transform:scale(.98); }
.auth-submit:disabled { opacity:.5;cursor:default; }

/* Toggle */
.auth-switch { text-align:center;margin-top:1.25rem;font-size:.8rem;color:#6b7280; }
.auth-switch a { color:#1e3a5f;cursor:pointer;font-weight:600; }

/* Error */
.auth-error { background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:.6rem .9rem;font-size:.8rem;color:#dc2626;margin-bottom:.75rem;display:none; }

/* Close */
.auth-close { position:absolute;top:1rem;right:1rem;background:none;border:none;color:#9ca3af;cursor:pointer;font-size:1.2rem;padding:.3rem;transition:color .2s; }
.auth-close:hover { color:#374151; }
#gamma-auth-modal { position:fixed; }
.auth-card { position:relative; }
.auth-legal { font-size:.7rem;color:#c4cad5;text-align:center;margin-top:1rem; }
.auth-legal a { color:#9ca3af; }
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

    // Sur page protégée (agent/estimation), fermer = retour accueil
    const isProtectedPage = window.location.pathname.includes('agent-conseil') || window.location.pathname.includes('estimation');
    const close = () => {
      if (isProtectedPage) { window.location.href = 'index.html'; return; }
      el.style.opacity = '0';
      el.querySelector('.auth-card').style.transform = 'translateY(24px)';
      setTimeout(() => el.remove(), 350);
    };

    // Sur page protégée, pas de croix ni clic extérieur pour fermer
    if (isProtectedPage) {
      el.querySelector('#auth-close').style.display = 'none';
    } else {
      el.querySelector('#auth-close').onclick = close;
      el.addEventListener('click', e => { if (e.target === el) close(); });
    }

    // Toggle register / login
    const toggle = () => {
      isLogin = !isLogin;
      el.querySelector('#auth-title').textContent = isLogin ? 'Se connecter' : 'Créer votre compte';
      el.querySelector('#auth-sub').textContent = isLogin ? 'Content de vous revoir !' : 'Accédez à l\'agent fiscal IA et au simulateur';
      el.querySelector('#field-name').style.display = isLogin ? 'none' : 'block';
      el.querySelector('#auth-submit').textContent = isLogin ? 'Se connecter' : 'Créer mon compte';
      el.querySelector('#auth-switch').innerHTML = isLogin
        ? 'Pas encore de compte ? <a id="auth-toggle" style="color:#a2bfd4;cursor:pointer;font-weight:500">Créer un compte</a>'
        : 'Déjà un compte ? <a id="auth-toggle" style="color:#a2bfd4;cursor:pointer;font-weight:500">Se connecter</a>';
      el.querySelector('#auth-toggle').onclick = toggle;
      el.querySelector('#auth-error').style.display = 'none';
      el.querySelector('#auth-password').setAttribute('autocomplete', isLogin ? 'current-password' : 'new-password');
      el.querySelector('#pw-strength').style.display = isLogin ? 'none' : '';
    };
    el.querySelector('#auth-toggle').onclick = toggle;

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
  },

  /* ── Nav account widget ── */
  initNav() {
    if (document.getElementById('gamma-account-wrap')) { this._updateNavState(); return; }

    // Inject nav styles
    if (!document.getElementById('gamma-nav-styles')) {
      const s = document.createElement('style');
      s.id = 'gamma-nav-styles';
      s.textContent = `
#gamma-account-wrap { position:relative; }
.gna-btn {
  font-size:.78rem;font-weight:600;letter-spacing:.03em;
  color:#fff;background:#1e3a5f;border:none;border-radius:8px;
  padding:.42rem 1.1rem;cursor:pointer;transition:background .2s;
}
.gna-btn:hover { background:#2d6499; }
.gna-pill {
  display:none;align-items:center;gap:.5rem;cursor:pointer;
  padding:.28rem .65rem .28rem .32rem;border-radius:20px;
  border:1px solid rgba(17,24,39,0.1);background:rgba(17,24,39,0.04);
  transition:background .2s,border-color .2s;
}
.gna-pill:hover { background:rgba(17,24,39,0.07);border-color:rgba(17,24,39,0.18); }
.gna-avatar {
  width:26px;height:26px;border-radius:50%;
  background:linear-gradient(135deg,#1e3a5f,#2d6499);
  color:#fff;font-size:.72rem;font-weight:700;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
}
.gna-name { font-size:.82rem;font-weight:500;color:#111827;max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.gna-chevron { width:12px;height:12px;color:#9ca3af;transition:transform .2s; }
.gna-pill.open .gna-chevron { transform:rotate(180deg); }
.gna-dropdown {
  position:absolute;top:calc(100% + .9rem);right:0;z-index:500;
  background:#fff;border:1px solid rgba(17,24,39,0.08);
  border-radius:14px;padding:.5rem;min-width:230px;
  box-shadow:0 4px 24px rgba(0,0,0,0.1),0 1px 4px rgba(0,0,0,0.06);
  opacity:0;transform:translateY(-8px);pointer-events:none;
  transition:opacity .22s,transform .22s;
}
.gna-dropdown.open { opacity:1;transform:translateY(0);pointer-events:auto; }
.gna-header { display:flex;align-items:center;gap:.75rem;padding:.4rem .5rem .85rem; }
.gna-avatar-lg {
  width:40px;height:40px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,#1e3a5f,#2d6499);
  color:#fff;font-size:1.05rem;font-weight:700;
  display:flex;align-items:center;justify-content:center;
}
.gna-dname { font-size:.88rem;font-weight:600;color:#111827; }
.gna-demail { font-size:.73rem;color:#6b7280;margin-top:.15rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:155px; }
.gna-badge { display:inline-block;font-size:.63rem;font-weight:600;padding:.1rem .5rem;border-radius:10px;background:rgba(30,58,95,0.07);color:#1e3a5f;border:1px solid rgba(30,58,95,0.12);margin-top:.3rem; }
.gna-sep { height:1px;background:rgba(17,24,39,0.07);margin:.4rem 0; }
.gna-link {
  display:flex;align-items:center;gap:.6rem;padding:.46rem .6rem;
  border-radius:8px;font-size:.82rem;color:#374151;
  text-decoration:none;cursor:pointer;border:none;background:none;width:100%;text-align:left;
  transition:background .15s,color .15s;
}
.gna-link:hover { background:rgba(17,24,39,0.04);color:#111827; }
.gna-link.danger { color:#6b7280; }
.gna-link.danger:hover { background:rgba(239,68,68,0.06);color:#dc2626; }
.gna-link svg { width:15px;height:15px;flex-shrink:0;opacity:.6; }
      `;
      document.head.appendChild(s);
    }

    // Build widget
    const wrap = document.createElement('div');
    wrap.id = 'gamma-account-wrap';
    wrap.innerHTML = `
      <button class="gna-btn" id="gna-signin-btn">Se connecter</button>
      <div class="gna-pill" id="gna-pill">
        <div class="gna-avatar" id="gna-av"></div>
        <span class="gna-name" id="gna-nm"></span>
        <svg class="gna-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="gna-dropdown" id="gna-dropdown">
        <div class="gna-header">
          <div class="gna-avatar-lg" id="gna-av-lg"></div>
          <div>
            <div class="gna-dname" id="gna-dn"></div>
            <div class="gna-demail" id="gna-de"></div>
            <span class="gna-badge">Compte gratuit</span>
          </div>
        </div>
        <div class="gna-sep"></div>
        <a class="gna-link" href="compte.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          Mon compte
        </a>
        <a class="gna-link" href="agent-conseil.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M8 8h5"/></svg>
          Agent fiscal IA
        </a>
        <a class="gna-link" href="estimation.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Simulateur
        </a>
        <div class="gna-sep"></div>
        <button class="gna-link danger" id="gna-logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Déconnexion
        </button>
      </div>`;

    // Append to nav-right (or nav)
    const target = document.querySelector('.nav-right') || document.querySelector('nav');
    if (target) target.appendChild(wrap);

    // Events
    document.getElementById('gna-signin-btn').onclick = () => this.showModal(() => this.initNav());
    document.getElementById('gna-logout').onclick = () => this.logout();

    const pill = document.getElementById('gna-pill');
    const drop = document.getElementById('gna-dropdown');
    pill.onclick = () => { pill.classList.toggle('open'); drop.classList.toggle('open'); };
    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) { pill.classList.remove('open'); drop.classList.remove('open'); }
    });

    this._updateNavState();
  },

  _updateNavState() {
    const u = this.getUser();
    const btn  = document.getElementById('gna-signin-btn');
    const pill = document.getElementById('gna-pill');
    if (!btn || !pill) return;
    if (u) {
      const initials = ((u.name || u.email)[0]).toUpperCase();
      btn.style.display = 'none';
      pill.style.display = 'flex';
      ['gna-av','gna-av-lg'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=initials; });
      const nm = document.getElementById('gna-nm'); if(nm) nm.textContent = u.name || u.email.split('@')[0];
      const dn = document.getElementById('gna-dn'); if(dn) dn.textContent = u.name || u.email.split('@')[0];
      const de = document.getElementById('gna-de'); if(de) de.textContent = u.email;
    } else {
      btn.style.display = '';
      pill.style.display = 'none';
    }
  }
};
