import { supabase } from './supabase-client.js';

async function loadRaces() {
  const loading = document.getElementById('races-loading');
  const list = document.getElementById('races-list');

  const { data: races, error } = await supabase
    .from('races')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false });

  if (error) {
    loading.textContent = 'Error carregant les curses.';
    console.error(error);
    return;
  }

  loading.style.display = 'none';
  // TODO: render races table
  list.innerHTML = `<p>${races.length} curses carregades.</p>`;
}

loadRaces();
