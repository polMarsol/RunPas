import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// ── DOM ──────────────────────────────────────────────────────────────────────

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #rp-auth-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      background: #FF6B35;
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,.35);
      transition: background .2s;
    }
    #rp-auth-btn:hover { background: #e55a25; }

    #rp-modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.6);
      z-index: 2000;
      align-items: center;
      justify-content: center;
    }
    #rp-modal-overlay.open { display: flex; }

    #rp-modal {
      background: #1e1e2e;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 32px;
      width: 100%;
      max-width: 380px;
      color: #eee;
      font-family: inherit;
    }
    #rp-modal h2 { margin: 0 0 20px; font-size: 20px; color: #FF6B35; }

    .rp-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .rp-tab {
      flex: 1; padding: 8px; border: 1px solid #444; border-radius: 8px;
      background: transparent; color: #aaa; cursor: pointer; font-size: 14px;
    }
    .rp-tab.active { background: #FF6B35; border-color: #FF6B35; color: #fff; font-weight: 600; }

    .rp-field { margin-bottom: 14px; }
    .rp-field label { display: block; font-size: 12px; color: #aaa; margin-bottom: 4px; }
    .rp-field input {
      width: 100%; padding: 9px 12px; border-radius: 8px;
      border: 1px solid #444; background: #111; color: #eee;
      font-size: 14px; box-sizing: border-box;
    }
    .rp-field input:focus { outline: none; border-color: #FF6B35; }

    #rp-submit {
      width: 100%; padding: 10px; background: #FF6B35; color: #fff;
      border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
      cursor: pointer; margin-top: 4px;
    }
    #rp-submit:hover { background: #e55a25; }
    #rp-submit:disabled { background: #666; cursor: not-allowed; }

    #rp-msg { margin-top: 12px; font-size: 13px; text-align: center; min-height: 18px; }
    #rp-msg.error { color: #f87171; }
    #rp-msg.success { color: #4ade80; }

    #rp-close {
      float: right; background: none; border: none; color: #aaa;
      font-size: 20px; cursor: pointer; line-height: 1;
    }
    #rp-close:hover { color: #fff; }
  `;
  document.head.appendChild(style);
}

function buildModal() {
  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'rp-modal-overlay';
  overlay.innerHTML = `
    <div id="rp-modal">
      <button id="rp-close" aria-label="Tancar">&times;</button>
      <h2>RunPas</h2>
      <div class="rp-tabs">
        <button class="rp-tab active" data-tab="login">Entrar</button>
        <button class="rp-tab" data-tab="register">Registrar-se</button>
      </div>
      <div id="rp-tab-login">
        <div class="rp-field">
          <label>Email</label>
          <input id="rp-login-email" type="email" placeholder="correu@exemple.com" autocomplete="email">
        </div>
        <div class="rp-field">
          <label>Contrasenya</label>
          <input id="rp-login-pass" type="password" placeholder="••••••••" autocomplete="current-password">
        </div>
      </div>
      <div id="rp-tab-register" style="display:none">
        <div class="rp-field">
          <label>Nom d'usuari</label>
          <input id="rp-reg-username" type="text" placeholder="el_teu_nom">
        </div>
        <div class="rp-field">
          <label>Email</label>
          <input id="rp-reg-email" type="email" placeholder="correu@exemple.com" autocomplete="email">
        </div>
        <div class="rp-field">
          <label>Contrasenya</label>
          <input id="rp-reg-pass" type="password" placeholder="mínim 6 caràcters" autocomplete="new-password">
        </div>
      </div>
      <button id="rp-submit">Entrar</button>
      <div id="rp-msg"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Floating button
  const btn = document.createElement('button');
  btn.id = 'rp-auth-btn';
  btn.textContent = 'Inicia sessió';
  document.body.appendChild(btn);

  return { overlay, btn };
}

// ── Logic ─────────────────────────────────────────────────────────────────────

function setMsg(text, type = '') {
  const el = document.getElementById('rp-msg');
  el.textContent = text;
  el.className = type;
}

function setLoading(loading) {
  const btn = document.getElementById('rp-submit');
  btn.disabled = loading;
  btn.textContent = loading ? 'Carregant...' : (currentTab === 'login' ? 'Entrar' : 'Registrar-se');
}

let currentTab = 'login';

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.rp-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('rp-tab-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('rp-tab-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('rp-submit').textContent = tab === 'login' ? 'Entrar' : 'Registrar-se';
  setMsg('');
}

async function handleSubmit() {
  setMsg('');
  if (currentTab === 'login') {
    const email = document.getElementById('rp-login-email').value.trim();
    const password = document.getElementById('rp-login-pass').value;
    if (!email || !password) return setMsg('Omple tots els camps.', 'error');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message, 'error');
    closeModal();
  } else {
    const username = document.getElementById('rp-reg-username').value.trim();
    const email = document.getElementById('rp-reg-email').value.trim();
    const password = document.getElementById('rp-reg-pass').value;
    if (!username || !email || !password) return setMsg('Omple tots els camps.', 'error');
    if (password.length < 6) return setMsg('La contrasenya ha de tenir mínim 6 caràcters.', 'error');
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { username } }
    });
    setLoading(false);
    if (error) return setMsg(error.message, 'error');
    setMsg('Compte creat! Revisa el teu email per confirmar-lo.', 'success');
  }
}

function openModal() {
  document.getElementById('rp-modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('rp-modal-overlay').classList.remove('open');
  setMsg('');
}

function updateAuthButton(user) {
  const btn = document.getElementById('rp-auth-btn');
  if (user) {
    const name = user.user_metadata?.username || user.email.split('@')[0];
    btn.textContent = `👤 ${name}`;
    btn.onclick = async () => {
      await supabase.auth.signOut();
    };
  } else {
    btn.textContent = 'Inicia sessió';
    btn.onclick = openModal;
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  injectStyles();
  const { overlay, btn } = buildModal();

  // Tab switching
  document.querySelectorAll('.rp-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Submit
  document.getElementById('rp-submit').addEventListener('click', handleSubmit);

  // Enter key
  overlay.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });

  // Close
  document.getElementById('rp-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  // Initial session
  const { data: { session } } = await supabase.auth.getSession();
  updateAuthButton(session?.user ?? null);

  // Auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    updateAuthButton(session?.user ?? null);
  });

  // Floating button default action
  btn.onclick = openModal;
}

document.addEventListener('DOMContentLoaded', init);
