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
      <div class="rp-field"><label>Nom de la cursa</label><input id="r-name" type="text" placeholder="Cursa de Montjuic 2026"></div>
      <div class="rp-field"><label>Categoria</label>
        <select id="r-category">
          <option value="1">5K</option><option value="2">10K</option>
          <option value="3">Mitja Marat&oacute;</option><option value="4">Marat&oacute;</option>
          <option value="5">Trail</option><option value="6">Ultra</option>
        </select>
      </div>
      <div class="rp-field"><label>Dist&agrave;ncia (km)</label><input id="r-km" type="number" step="0.01" placeholder="10.00"></div>
      <div class="rp-field"><label>Temps (hh:mm:ss)</label><input id="r-time" type="text" placeholder="0:45:30"></div>
      <div class="rp-field"><label>Data</label><input id="r-date" type="date"></div>
      <div class="rp-field"><label>Desnivell (m) opcional</label><input id="r-elevation" type="number" placeholder="250"></div>
    </div>
    <div style="margin-top:16px;display:flex;gap:10px;align-items:center;">
      <button class="rp-btn rp-btn--primary" id="r-submit">Desar cursa</button>
      <span id="r-msg" style="font-size:.85rem;color:var(--rp-muted);"></span>
    </div>
  </div>
</div>

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
  <h2 class="rp-section-title" style="margin-bottom:0">Totes les <span>curses</span></h2>
  <button class="rp-btn rp-btn--primary" id="races-new-btn" style="display:none">+ Nova cursa</button>
</div>

<div id="races-list"><div class="rp-spinner"></div></div>
<script type="module" src="/RunPas/assets/js/page-races.js"></script>
