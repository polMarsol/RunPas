---
layout: page
title: Perfil
permalink: /profile/
order: 3
---

<div id="profile-noauth" style="display:none">
  <div class="rp-empty">
    <div class="rp-empty__icon">👤</div>
    <div class="rp-empty__title">Has d'iniciar sessió</div>
    <p>Accedeix al teu perfil des del botó d'inici de sessió.</p>
  </div>
</div>

<div id="profile-app" style="display:none">

  <!-- Header perfil -->
  <div style="display:flex; align-items:center; gap:24px; margin-bottom:32px; flex-wrap:wrap;">
    <div style="position:relative; cursor:pointer;" id="avatar-wrapper" title="Canviar avatar">
      <img id="profile-avatar" src="" alt="Avatar"
        style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid var(--rp-orange);background:var(--rp-surface2);"
        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 88 88%22><rect width=%2288%22 height=%2288%22 fill=%22%231a1a2e%22/><text x=%2244%22 y=%2256%22 text-anchor=%22middle%22 font-size=%2236%22 fill=%22%23FF6B35%22>🏃</text></svg>'">
      <div style="position:absolute;bottom:0;right:0;background:var(--rp-orange);border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;">✏️</div>
      <input type="file" id="avatar-input" accept="image/*" style="display:none">
    </div>
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <h2 id="profile-username" style="margin:0;font-family:var(--rp-font-display);font-size:1.8rem;font-weight:800;text-transform:uppercase;"></h2>
        <button id="edit-username-btn" class="rp-btn rp-btn--ghost" style="padding:4px 12px;font-size:.75rem;">Editar</button>
      </div>
      <div id="profile-email" style="color:var(--rp-muted);font-size:.85rem;margin-top:4px;"></div>
      <div style="margin-top:10px;">
        <button class="rp-btn rp-btn--strava" id="strava-btn" style="opacity:.5;cursor:not-allowed;font-size:.8rem;" disabled>
          🔗 Connecta Strava (pròximament)
        </button>
      </div>
    </div>
  </div>

  <!-- Edit username inline -->
  <div id="edit-username-form" style="display:none;margin-bottom:24px;">
    <div class="rp-form" style="padding:16px;">
      <div style="display:flex;gap:10px;align-items:center;">
        <input id="new-username" type="text" placeholder="Nou nom d'usuari" style="flex:1;background:var(--rp-bg);border:1px solid var(--rp-border);border-radius:8px;padding:8px 12px;color:var(--rp-text);font-size:.9rem;">
        <button class="rp-btn rp-btn--primary" id="save-username-btn" style="padding:8px 16px;">Desar</button>
        <button class="rp-btn rp-btn--ghost" id="cancel-username-btn" style="padding:8px 16px;">Cancel·lar</button>
      </div>
      <div id="username-msg" style="font-size:.8rem;margin-top:8px;"></div>
    </div>
  </div>

  <!-- Stats -->
  <div class="rp-stats" style="margin-bottom:32px;">
    <div class="rp-stat">
      <div class="rp-stat__value" id="stat-total-races">—</div>
      <div class="rp-stat__label">Curses</div>
    </div>
    <div class="rp-stat">
      <div class="rp-stat__value" id="stat-total-km">—</div>
      <div class="rp-stat__label">Km totals</div>
    </div>
    <div class="rp-stat">
      <div class="rp-stat__value" id="stat-best-5k">—</div>
      <div class="rp-stat__label">Millor 5K</div>
    </div>
    <div class="rp-stat">
      <div class="rp-stat__value" id="stat-best-10k">—</div>
      <div class="rp-stat__label">Millor 10K</div>
    </div>
    <div class="rp-stat">
      <div class="rp-stat__value" id="stat-best-mitja">—</div>
      <div class="rp-stat__label">Millor Mitja</div>
    </div>
    <div class="rp-stat">
      <div class="rp-stat__value" id="stat-best-maro">—</div>
      <div class="rp-stat__label">Millor Marató</div>
    </div>
  </div>

  <!-- Les meves curses -->
  <h2 class="rp-section-title">Les meves <span>curses</span></h2>
  <div id="my-races"><div class="rp-spinner"></div></div>

</div>

<script type="module">
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

function fmtTime(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
}
function fmtPace(s, km) {
  const p = Math.round(s/km);
  return `${Math.floor(p/60)}'${String(p%60).padStart(2,'0')}" /km`;
}

async function loadProfile(userId) {
  const { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();
  const { data: races } = await sb
    .from('races').select('*, race_categories(name,slug)')
    .eq('user_id', userId).order('race_date', { ascending: false });

  // Header
  document.getElementById('profile-username').textContent = profile?.username ?? 'Corredor';
  document.getElementById('new-username').value = profile?.username ?? '';
  document.getElementById('profile-email').textContent = (await sb.auth.getUser()).data.user?.email ?? '';
  if (profile?.avatar_url) document.getElementById('profile-avatar').src = profile.avatar_url;

  // Stats
  const totalRaces = races?.length ?? 0;
  const totalKm = races?.reduce((s,r) => s + parseFloat(r.distance_km), 0) ?? 0;
  document.getElementById('stat-total-races').textContent = totalRaces;
  document.getElementById('stat-total-km').textContent = totalKm.toFixed(1);

  const best = (slug) => {
    const cat = races?.filter(r => r.race_categories?.slug === slug);
    if (!cat?.length) return '—';
    return fmtTime(Math.min(...cat.map(r => r.time_seconds)));
  };
  document.getElementById('stat-best-5k').textContent = best('5k');
  document.getElementById('stat-best-10k').textContent = best('10k');
  document.getElementById('stat-best-mitja').textContent = best('mitja');
  document.getElementById('stat-best-maro').textContent = best('maro');

  // Race list
  const el = document.getElementById('my-races');
  if (!races?.length) {
    el.innerHTML = `<div class="rp-empty">
      <div class="rp-empty__icon">🏃</div>
      <div class="rp-empty__title">Encara no tens curses</div>
      <p><a href="/RunPas/races/">Afegeix la teva primera cursa</a></p>
    </div>`;
    return;
  }

  el.innerHTML = races.map(r => `
    <div class="rp-race-card">
      <div class="rp-race-card__info">
        <div class="rp-race-card__name">${r.name || r.race_categories?.name || 'Cursa'}</div>
        <div class="rp-race-card__meta">${r.race_categories?.name ?? '—'} · ${r.distance_km} km · ${r.race_date}${r.elevation_m ? ' · ↑'+r.elevation_m+'m' : ''}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
        <div class="rp-race-card__time">${fmtTime(r.time_seconds)}</div>
        <div class="rp-race-card__pace">${fmtPace(r.time_seconds, r.distance_km)}</div>
        <button onclick="deleteRace('${r.id}')" style="font-size:.7rem;color:var(--rp-muted);background:none;border:none;cursor:pointer;padding:0;">🗑 Eliminar</button>
      </div>
    </div>
  `).join('');
}

window.deleteRace = async (id) => {
  if (!confirm('Eliminar aquesta cursa?')) return;
  await sb.from('races').delete().eq('id', id);
  const { data: { session } } = await sb.auth.getSession();
  loadProfile(session.user.id);
};

// Edit username
document.getElementById('edit-username-btn').addEventListener('click', () => {
  document.getElementById('edit-username-form').style.display = 'block';
  document.getElementById('new-username').focus();
});
document.getElementById('cancel-username-btn').addEventListener('click', () => {
  document.getElementById('edit-username-form').style.display = 'none';
});
document.getElementById('save-username-btn').addEventListener('click', async () => {
  const username = document.getElementById('new-username').value.trim();
  const msg = document.getElementById('username-msg');
  if (!username) { msg.style.color='#f87171'; msg.textContent='El nom no pot estar buit.'; return; }
  const { data: { user } } = await sb.auth.getUser();
  const { error } = await sb.from('profiles').update({ username }).eq('id', user.id);
  if (error) { msg.style.color='#f87171'; msg.textContent=error.message; return; }
  document.getElementById('profile-username').textContent = username;
  document.getElementById('edit-username-form').style.display = 'none';
  msg.textContent = '';
});

// Avatar upload
document.getElementById('avatar-wrapper').addEventListener('click', () => {
  document.getElementById('avatar-input').click();
});
document.getElementById('avatar-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const { data: { user } } = await sb.auth.getUser();
  const path = `${user.id}/avatar.${file.name.split('.').pop()}`;
  const { error: upErr } = await sb.storage.from('avatars').upload(path, file, { upsert: true });
  if (upErr) { alert('Error pujant avatar: ' + upErr.message); return; }
  const { data: { publicUrl } } = sb.storage.from('avatars').getPublicUrl(path);
  await sb.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
  document.getElementById('profile-avatar').src = publicUrl + '?t=' + Date.now();
});

// Init
const { data: { session } } = await sb.auth.getSession();
if (!session) {
  document.getElementById('profile-noauth').style.display = 'block';
} else {
  document.getElementById('profile-app').style.display = 'block';
  loadProfile(session.user.id);
}

sb.auth.onAuthStateChange((_e, sess) => {
  if (sess) {
    document.getElementById('profile-noauth').style.display = 'none';
    document.getElementById('profile-app').style.display = 'block';
    loadProfile(sess.user.id);
  } else {
    document.getElementById('profile-app').style.display = 'none';
    document.getElementById('profile-noauth').style.display = 'block';
  }
});
</script>
