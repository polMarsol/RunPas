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

async function loadLeaderboard(slug) {
  const el = document.getElementById('lb-content');
  el.innerHTML = '<div class="rp-spinner"></div>';

  const { data, error } = await sb
    .from('leaderboard')
    .select('*')
    .eq('category_slug', slug)
    .order('rank');

  if (error || !data?.length) {
    el.innerHTML = `
      <div class="rp-empty">
        <div class="rp-empty__icon">&#127942;</div>
        <div class="rp-empty__title">Cap resultat per ${slug.toUpperCase()}</div>
        <p>Sigues el primer en registrar una cursa en aquesta categoria!</p>
      </div>`;
    return;
  }

  el.innerHTML = data.map(r => `
    <div class="rp-race-card">
      <div class="rp-race-card__rank ${r.rank == 1 ? 'top1' : r.rank == 2 ? 'top2' : r.rank == 3 ? 'top3' : ''}">#${r.rank}</div>
      <div class="rp-race-card__info">
        <div class="rp-race-card__name">${r.username ?? 'An\xf2nim'}</div>
        <div class="rp-race-card__meta">${r.distance_km} km \xb7 ${r.race_date}</div>
      </div>
      <div>
        <div class="rp-race-card__time">${fmtTime(r.time_seconds)}</div>
        <div class="rp-race-card__pace">${fmtPace(r.time_seconds, r.distance_km)}</div>
      </div>
    </div>`).join('');
}

let currentSlug = '5k';

document.querySelectorAll('.rp-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rp-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSlug = btn.dataset.slug;
    loadLeaderboard(currentSlug);
  });
});

loadLeaderboard(currentSlug);
