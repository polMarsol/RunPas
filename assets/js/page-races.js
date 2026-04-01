import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

function fmtTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}
function fmtPace(s, km) {
  const p = Math.round(s / km);
  return `${Math.floor(p / 60)}'${String(p % 60).padStart(2, '0')}" /km`;
}
function parseTime(str) {
  const parts = str.trim().split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return NaN;
}

async function loadRaces() {
  const el = document.getElementById('races-list');
  const { data, error } = await sb
    .from('races')
    .select('*, profiles(username), race_categories(name)')
    .order('race_date', { ascending: false });

  if (error || !data?.length) {
    el.innerHTML = `
      <div class="rp-empty">
        <div class="rp-empty__icon">&#127939;</div>
        <div class="rp-empty__title">Encara no hi ha curses</div>
        <p>Inicia sessi\xf3 i afegeix la teva primera cursa!</p>
      </div>`;
    return;
  }

  el.innerHTML = data.map(r => `
    <div class="rp-race-card">
      <div class="rp-race-card__info">
        <div class="rp-race-card__name">
          ${r.name || r.race_categories?.name || 'Cursa'}
          <span style="font-weight:400;color:var(--rp-muted)">\xb7 ${r.profiles?.username ?? ''}</span>
        </div>
        <div class="rp-race-card__meta">
          ${r.race_categories?.name ?? '\u2014'} \xb7 ${r.distance_km} km \xb7 ${r.race_date}
          ${r.elevation_m ? ' \xb7 \u2191' + r.elevation_m + 'm' : ''}
        </div>
      </div>
      <div>
        <div class="rp-race-card__time">${fmtTime(r.time_seconds)}</div>
        <div class="rp-race-card__pace">${fmtPace(r.time_seconds, r.distance_km)}</div>
      </div>
    </div>`).join('');
}

async function init() {
  const { data: { session } } = await sb.auth.getSession();
  const newBtn = document.getElementById('races-new-btn');
  if (session) newBtn.style.display = 'inline-flex';

  sb.auth.onAuthStateChange((_e, sess) => {
    newBtn.style.display = sess ? 'inline-flex' : 'none';
    document.getElementById('races-add-section').style.display = 'none';
  });

  newBtn.addEventListener('click', () => {
    const el = document.getElementById('races-add-section');
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
    document.getElementById('r-date').valueAsDate = new Date();
  });

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
      msg.textContent = 'Omple dist\xe0ncia, temps i data.';
      return;
    }

    const { data: { user } } = await sb.auth.getUser();
    if (!user) { msg.textContent = "Has d'iniciar sessi\xf3."; return; }

    msg.style.color = 'var(--rp-muted)';
    msg.textContent = 'Desant...';

    const { error } = await sb.from('races').insert({
      user_id: user.id, name, category_id, distance_km, time_seconds, race_date,
      elevation_m: elevation_m ? parseFloat(elevation_m) : null
    });

    if (error) { msg.style.color = '#f87171'; msg.textContent = error.message; return; }

    msg.style.color = '#4ade80';
    msg.textContent = '\u2713 Cursa desada!';
    document.getElementById('races-add-section').style.display = 'none';
    loadRaces();
  });

  loadRaces();
}

init();
