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

async function loadStats() {
  const [{ count: runners }, { count: races }, { data: kmData }] = await Promise.all([
    sb.from('profiles').select('*', { count: 'exact', head: true }),
    sb.from('races').select('*', { count: 'exact', head: true }),
    sb.from('races').select('distance_km'),
  ]);
  const km = kmData?.reduce((s, r) => s + parseFloat(r.distance_km || 0), 0) || 0;
  document.getElementById('stat-runners').textContent = runners ?? 0;
  document.getElementById('stat-races').textContent = races ?? 0;
  document.getElementById('stat-km').textContent = km >= 1000
    ? `${(km / 1000).toFixed(1)}K` : Math.round(km);
}

async function loadRecent() {
  const container = document.getElementById('home-recent-races');
  const { data: races, error } = await sb
    .from('races')
    .select('*, profiles(username), race_categories(name, slug)')
    .order('race_date', { ascending: false })
    .limit(5);

  if (error || !races?.length) {
    container.innerHTML = `
      <div class="rp-empty">
        <div class="rp-empty__icon">&#127939;</div>
        <div class="rp-empty__title">Encara no hi ha curses</div>
        <p>Sigues el primer en registrar una cursa!</p>
      </div>`;
    return;
  }

  container.innerHTML = races.map((r, i) => `
    <div class="rp-race-card">
      <div class="rp-race-card__rank ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}">#${i + 1}</div>
      <div class="rp-race-card__info">
        <div class="rp-race-card__name">${r.profiles?.username ?? 'An\xf2nim'}</div>
        <div class="rp-race-card__meta">${r.race_categories?.name ?? '\u2014'} \xb7 ${r.distance_km} km \xb7 ${r.race_date}</div>
      </div>
      <div>
        <div class="rp-race-card__time">${fmtTime(r.time_seconds)}</div>
        <div class="rp-race-card__pace">${fmtPace(r.time_seconds, r.distance_km)}</div>
      </div>
    </div>`).join('');
}

loadStats();
loadRecent();
