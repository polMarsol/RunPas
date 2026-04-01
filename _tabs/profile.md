---
layout: page
title: Perfil
permalink: /profile/
icon: fas fa-user
order: 3
---

<div id="profile-noauth" style="display:none">
  <div class="rp-empty">
    <div class="rp-empty__icon">&#128100;</div>
    <div class="rp-empty__title">Has d'iniciar sessi&oacute;</div>
    <p>Accedeix al teu perfil des del bot&oacute; d'inici de sessi&oacute;.</p>
  </div>
</div>

<div id="profile-app" style="display:none">
  <div style="display:flex;align-items:center;gap:24px;margin-bottom:32px;flex-wrap:wrap;">
    <div style="position:relative;cursor:pointer;" id="avatar-wrapper" title="Canviar avatar">
      <img id="profile-avatar" src="" alt="Avatar"
        style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid var(--rp-orange);background:var(--rp-surface2);"
        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 88 88%22%3E%3Crect width=%2288%22 height=%2288%22 fill=%22%231a1a2e%22/%3E%3Ctext x=%2244%22 y=%2256%22 text-anchor=%22middle%22 font-size=%2236%22 fill=%22%23FF6B35%22%3E&#127939;%3C/text%3E%3C/svg%3E'">
      <div style="position:absolute;bottom:0;right:0;background:var(--rp-orange);border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;">&#9998;</div>
      <input type="file" id="avatar-input" accept="image/*" style="display:none">
    </div>
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <h2 id="profile-username" style="margin:0;font-family:var(--rp-font-display);font-size:1.8rem;font-weight:800;text-transform:uppercase;"></h2>
        <button id="edit-username-btn" class="rp-btn rp-btn--ghost" style="padding:4px 12px;font-size:.75rem;">Editar</button>
      </div>
      <div id="profile-email" style="color:var(--rp-muted);font-size:.85rem;margin-top:4px;"></div>
      <div style="margin-top:10px;">
        <button class="rp-btn rp-btn--strava" style="opacity:.5;cursor:not-allowed;font-size:.8rem;" disabled>
          &#128279; Connecta Strava (pr&ograve;ximament)
        </button>
      </div>
    </div>
  </div>

  <div id="edit-username-form" style="display:none;margin-bottom:24px;">
    <div class="rp-form" style="padding:16px;">
      <div style="display:flex;gap:10px;align-items:center;">
        <input id="new-username" type="text" placeholder="Nou nom d'usuari"
          style="flex:1;background:var(--rp-bg);border:1px solid var(--rp-border);border-radius:8px;padding:8px 12px;color:var(--rp-text);font-size:.9rem;">
        <button class="rp-btn rp-btn--primary" id="save-username-btn" style="padding:8px 16px;">Desar</button>
        <button class="rp-btn rp-btn--ghost" id="cancel-username-btn" style="padding:8px 16px;">Cancel&middot;lar</button>
      </div>
      <div id="username-msg" style="font-size:.8rem;margin-top:8px;"></div>
    </div>
  </div>

  <div class="rp-stats" style="margin-bottom:32px;">
    <div class="rp-stat"><div class="rp-stat__value" id="stat-total-races">—</div><div class="rp-stat__label">Curses</div></div>
    <div class="rp-stat"><div class="rp-stat__value" id="stat-total-km">—</div><div class="rp-stat__label">Km totals</div></div>
    <div class="rp-stat"><div class="rp-stat__value" id="stat-best-5k">—</div><div class="rp-stat__label">Millor 5K</div></div>
    <div class="rp-stat"><div class="rp-stat__value" id="stat-best-10k">—</div><div class="rp-stat__label">Millor 10K</div></div>
    <div class="rp-stat"><div class="rp-stat__value" id="stat-best-mitja">—</div><div class="rp-stat__label">Millor Mitja</div></div>
    <div class="rp-stat"><div class="rp-stat__value" id="stat-best-maro">—</div><div class="rp-stat__label">Millor Marat&oacute;</div></div>
  </div>

  <h2 class="rp-section-title">Les meves <span>curses</span></h2>
  <div id="my-races"><div class="rp-spinner"></div></div>
</div>

<script type="module" src="/RunPas/assets/js/page-profile.js"></script>
