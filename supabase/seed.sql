-- ============================================================
-- RunPas — Seed data de demo
-- Executa al Supabase Dashboard → SQL Editor
-- NOTA: Crea usuaris demo sense auth real (per visualitzar la UI)
-- ============================================================

-- Insereix perfils demo directament (sense auth.users — per demo visual)
-- En producció els perfils es creen automàticament via trigger

INSERT INTO public.profiles (id, username, total_km, total_races) VALUES
  ('00000000-0000-0000-0000-000000000001', 'marc_runner', 247.3, 12),
  ('00000000-0000-0000-0000-000000000002', 'anna_corre', 189.5, 8),
  ('00000000-0000-0000-0000-000000000003', 'pau_trail', 412.0, 23),
  ('00000000-0000-0000-0000-000000000004', 'julia_fast', 156.8, 7),
  ('00000000-0000-0000-0000-000000000005', 'bernat_km', 328.2, 18)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  total_km = EXCLUDED.total_km,
  total_races = EXCLUDED.total_races;

-- Curses demo (categories: 1=5K, 2=10K, 3=Mitja, 4=Marató, 5=Trail, 6=Ultra)
INSERT INTO public.races (id, user_id, category_id, name, distance_km, time_seconds, elevation_m, race_date) VALUES
  -- 5K
  ('r0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1, 'Cursa Popular Gràcia', 5.0, 1245, null, '2026-03-15'),
  ('r0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 1, 'Cursa Popular Gràcia', 5.0, 1312, null, '2026-03-15'),
  ('r0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 1, '5K Parc de la Ciutadella', 5.0, 1198, null, '2026-02-20'),
  ('r0000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 1, '5K Parc de la Ciutadella', 5.0, 1402, null, '2026-02-20'),

  -- 10K
  ('r0000002-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 2, 'Jean Bouin 10K', 10.0, 2618, null, '2026-03-01'),
  ('r0000002-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 2, 'Jean Bouin 10K', 10.0, 2541, null, '2026-03-01'),
  ('r0000002-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 2, 'Cursa dels Nassos 10K', 10.0, 2890, null, '2025-12-31'),
  ('r0000002-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 2, 'Cursa dels Nassos 10K', 10.0, 2734, null, '2025-12-31'),

  -- Mitja Marató
  ('r0000003-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 3, 'Mitja Marató de Barcelona', 21.1, 5760, null, '2026-02-08'),
  ('r0000003-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 3, 'Mitja Marató de Barcelona', 21.1, 5412, null, '2026-02-08'),
  ('r0000003-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 3, 'Mitja Marató Granollers', 21.1, 6180, null, '2026-01-18'),

  -- Marató
  ('r0000004-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 4, 'Marató de Barcelona', 42.2, 13320, null, '2026-03-08'),
  ('r0000004-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 4, 'Marató de Barcelona', 42.2, 14580, null, '2026-03-08'),

  -- Trail
  ('r0000005-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 5, 'Trail Montserrat', 28.0, 10800, 1800, '2026-01-25'),
  ('r0000005-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 5, 'Trail Montserrat', 28.0, 11520, 1800, '2026-01-25'),
  ('r0000005-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 5, 'Trail Collserola', 18.0, 7200, 650, '2026-02-14'),

  -- Ultra
  ('r0000006-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 6, 'Ultra Pirineus 50K', 50.0, 25200, 3200, '2025-09-06'),
  ('r0000006-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 6, 'Ultra Pirineus 50K', 50.0, 27900, 3200, '2025-09-06')

ON CONFLICT (id) DO NOTHING;

-- Actualitza totals (el trigger no s'ha disparat per INSERT directe)
UPDATE public.profiles p SET
  total_km    = (SELECT COALESCE(SUM(distance_km), 0) FROM public.races WHERE user_id = p.id),
  total_races = (SELECT COUNT(*) FROM public.races WHERE user_id = p.id);
