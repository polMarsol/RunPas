---
layout: page
title: Curses
permalink: /races/
icon: fas fa-running
order: 1
---

<div id="races-add-section" style="display:none; margin-bottom: 28px;">
  <h2 class="rp-section-title">Nova <span>cursa</span></h2>
  <div class="rp-form">
    <div class="rp-form__grid">
      <div class="rp-field">
        <label>Nom de la cursa</label>
        <input id="r-name" type="text" placeholder="Cursa de Montjuïc 2026">
      </div>
      <div class="rp-field">
        <label>Categoria</label>
        <select id="r-category">
          <option value="1">5K</option>
          <option value="2">10K</option>
          <option value="3">Mitja Marató</option>
          <option value="4">Marató</option>
          <option value="5">Trail</option>
          <option value="6">Ultra</option>
        </select>
      </div>
      <div class="rp-field">
        <label>Distància (km)</label>
        <input id="r-km" type="number" step="0.01" placeholder="10.00">
      </div>
      <div class="rp-field">
        <label>Temps (hh:mm:ss)</label>
        <input id="r-time" type="text" placeholder="0:45:30">
      </div>
      <div class="rp-field">
        <label>Data</label>
        <input id="r-date" type="date">
      </div>
      <div class="rp-field">
        <label>Desnivell (m) — opcional</label>
        <input id="r-elevation" type="number" placeholder="250">
      </div>
    </div>
    <div style="margin-top: 16px; display:flex; gap: 10px; align-items:center;">
      <button class="rp-btn rp-btn--primary" id="r-submit">Desar cursa</button>
      <span id="r-msg" style="font-size:.85rem; color: var(--rp-muted);"></span>
    </div>
  </div>
</div>

<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
  <h2 class="rp-section-title" style="margin-bottom:0">Totes les <span>curses</span></h2>
  <button class="rp-btn rp-btn--primary" id="races-new-btn" style="display:none">+ Nova cursa</button>
</div>

<div id="races-list"><div class="rp-spinner"></div></div>

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
function parseTime(str) {
  const parts = str.trim().split(':').map(Number);
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
  if (parts.length === 2) return parts[0]*60 + parts[1];
  return NaN;
}

async function loadRaces() {
  const el = document.getElementById('races-list');
  const { data, error } = await sb
    .from('races')
    .select('*, profiles(username), race_categories(name)')
    .order('race_date', { ascending: false });

  if (error || !data?.length) {
    el.innerHTML = `<div class="rp-empty">
      <div class="rp-empty__icon">🏃</div>
      <div class="rp-empty__title">Encara no hi ha curses</div>
      <p>Inicia sessió i afegeix la teva primera cursa!</p>
    </div>`;
    return;
  }

  el.innerHTML = data.map(r => `
    <div class="rp-race-card">
      <div class="rp-race-card__info">
        <div class="rp-race-card__name">${r.name || r.race_categories?.name || 'Cursa'} <span style="font-weight:400; color:var(--rp-muted)">· ${r.profiles?.username ?? ''}</span></div>
        <div class="rp-race-card__meta">${r.race_categories?.name ?? '—'} · ${r.distance_km} km · ${r.race_date}${r.elevation_m ? ' · ↑'+r.elevation_m+'m' : ''}</div>
      </div>
      <div>
        <div class="rp-race-card__time">${fmtTime(r.time_seconds)}</div>
        <div class="rp-race-card__pace">${fmtPace(r.time_seconds, r.distance_km)}</div>
      </div>
    </div>
  `).join('');
}

// Auth state
const { data: { session } } = await sb.auth.getSession();
if (session) {
  document.getElementById('races-new-btn').style.display = 'inline-flex';
}

sb.auth.onAuthStateChange((_e, sess) => {
  document.getElementById('races-new-btn').style.display = sess ? 'inline-flex' : 'none';
  document.getElementById('races-add-section').style.display = 'none';
});

// Toggle form
document.getElementById('races-new-btn').addEventListener('click', () => {
  const el = document.getElementById('races-add-section');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  document.getElementById('r-date').valueAsDate = new Date();
});

// Submit
document.getElementById('r-submit').addEventListener('click', async () => {
  const msg = document.getElementById('r-msg');
  const name = document.getElementById('r-name').value.trim();
  const category_id = parseInt(document.getElementById('r-category').value);
  const distance_km = parseFloat(document.getElementById('r-km').value);
  const time_seconds = parseTime(document.getElementById('r-time').value);
  const race_date = document.getElementById('r-date').value;
  const elevation_m = document.getElementById('r-elevation').value || null;

  if (!distance_km || isNaN(time_seconds) || !race_date) {
    msg.style.color = '#f87171';
    msg.textContent = 'Omple distància, temps i data.';
    return;
  }

  const { data: { user } } = await sb.auth.getUser();
  if (!user) { msg.textContent = 'Has d\'iniciar sessió.'; return; }

  msg.style.color = 'var(--rp-muted)';
  msg.textContent = 'Desant...';

  const { error } = await sb.from('races').insert({
    user_id: user.id, name, category_id, distance_km, time_seconds, race_date,
    elevation_m: elevation_m ? parseFloat(elevation_m) : null
  });

  if (error) { msg.style.color = '#f87171'; msg.textContent = error.message; return; }

  msg.style.color = '#4ade80';
  msg.textContent = '✓ Cursa desada!';
  document.getElementById('races-add-section').style.display = 'none';
  loadRaces();
});

loadRaces();
</script>
