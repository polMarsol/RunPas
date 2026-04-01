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

async function loadProfile(userId) {
  const { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();
  const { data: races } = await sb
    .from('races').select('*, race_categories(name,slug)')
    .eq('user_id', userId).order('race_date', { ascending: false });

  document.getElementById('profile-username').textContent = profile?.username ?? 'Corredor';
  document.getElementById('new-username').value = profile?.username ?? '';
  const { data: { user } } = await sb.auth.getUser();
  document.getElementById('profile-email').textContent = user?.email ?? '';
  if (profile?.avatar_url) document.getElementById('profile-avatar').src = profile.avatar_url;

  const totalKm = races?.reduce((s, r) => s + parseFloat(r.distance_km), 0) ?? 0;
  document.getElementById('stat-total-races').textContent = races?.length ?? 0;
  document.getElementById('stat-total-km').textContent = totalKm.toFixed(1);

  const best = (slug) => {
    const cat = races?.filter(r => r.race_categories?.slug === slug);
    if (!cat?.length) return '\u2014';
    return fmtTime(Math.min(...cat.map(r => r.time_seconds)));
  };
  document.getElementById('stat-best-5k').textContent = best('5k');
  document.getElementById('stat-best-10k').textContent = best('10k');
  document.getElementById('stat-best-mitja').textContent = best('mitja');
  document.getElementById('stat-best-maro').textContent = best('maro');

  const el = document.getElementById('my-races');
  if (!races?.length) {
    el.innerHTML = `
      <div class="rp-empty">
        <div class="rp-empty__icon">&#127939;</div>
        <div class="rp-empty__title">Encara no tens curses</div>
        <p><a href="/RunPas/races/">Afegeix la teva primera cursa</a></p>
      </div>`;
    return;
  }

  el.innerHTML = races.map(r => `
    <div class="rp-race-card">
      <div class="rp-race-card__info">
        <div class="rp-race-card__name">${r.name || r.race_categories?.name || 'Cursa'}</div>
        <div class="rp-race-card__meta">
          ${r.race_categories?.name ?? '\u2014'} \xb7 ${r.distance_km} km \xb7 ${r.race_date}
          ${r.elevation_m ? ' \xb7 \u2191' + r.elevation_m + 'm' : ''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
        <div class="rp-race-card__time">${fmtTime(r.time_seconds)}</div>
        <div class="rp-race-card__pace">${fmtPace(r.time_seconds, r.distance_km)}</div>
        <button onclick="window.deleteRace('${r.id}')"
          style="font-size:.7rem;color:var(--rp-muted);background:none;border:none;cursor:pointer;padding:0;">
          &#128465; Eliminar
        </button>
      </div>
    </div>`).join('');
}

window.deleteRace = async (id) => {
  if (!confirm('Eliminar aquesta cursa?')) return;
  await sb.from('races').delete().eq('id', id);
  const { data: { session } } = await sb.auth.getSession();
  if (session) loadProfile(session.user.id);
};

async function init() {
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
    if (!username) { msg.style.color = '#f87171'; msg.textContent = 'El nom no pot estar buit.'; return; }
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from('profiles').update({ username }).eq('id', user.id);
    if (error) { msg.style.color = '#f87171'; msg.textContent = error.message; return; }
    document.getElementById('profile-username').textContent = username;
    document.getElementById('edit-username-form').style.display = 'none';
  });

  document.getElementById('avatar-wrapper').addEventListener('click', () => {
    document.getElementById('avatar-input').click();
  });
  document.getElementById('avatar-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { data: { user } } = await sb.auth.getUser();
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await sb.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { alert('Error pujant avatar: ' + error.message); return; }
    const { data: { publicUrl } } = sb.storage.from('avatars').getPublicUrl(path);
    await sb.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    document.getElementById('profile-avatar').src = publicUrl + '?t=' + Date.now();
  });

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
}

init();
