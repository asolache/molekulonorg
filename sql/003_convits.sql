-- ══════════════════════════════════════════════════════════════════════════
-- Els convits · la xarxa de moleculons (2026-10-29)
-- ══════════════════════════════════════════════════════════════════════════
--
-- Qui ja és a la col·lecció pot convidar algú altre a Moleculandia: li comença
-- el cromo a /convida i li envia un enllaç. La fitxa començada viatja dins
-- l'enllaç (darrere del #, que no arriba a cap servidor) i **aquí no es guarda**.
-- L'únic que es guarda és un codi sense dades i de qui és: el que demostra qui
-- ha convidat qui. Sense codi, l'enllaç funciona igual i la xarxa no el compta.
--
--   crea_convit(nick, clau)          · un codi nou de qui convida
--   lliga_convit(codi, nick, clau)   · el cromo nou diu que ve d'aquell codi
--   la_meva_xarxa(nick, clau)        · qui m'ha convidat i a qui he convidat
--   xarxa_cromos()                   · les arestes públiques entre cromos aprovats
--
-- ── Qui pot convidar ───────────────────────────────────────────────────────
-- Qui té un cromo **aprovat** (l'última decisió sobre el seu nick és
-- «aprovat») i en té la clau d'edició; o l'autor, amb la clau de moderador i
-- el nick buit, i llavors el convit és «del Comando». La clau de moderador
-- passa per la mateixa porta amb fre que /modera (002_auditoria_cervell.sql).
--
-- ── El que NO canvia ───────────────────────────────────────────────────────
-- Convidar no és aprovar: el primer cromo de la persona convidada passa per
-- l'autor com tots (aprovació mixta, 2026-10-11). `envia_cromo` no es toca.
--
-- ── Dades personals ────────────────────────────────────────────────────────
-- Cap. Un codi a l'atzar, dos nicks i dues dates.

create table if not exists public.comando_convits (
  codi     text primary key check (codi ~ '^[A-Za-z0-9_-]{12,32}$'),
  de       text not null,
  creat    timestamptz not null default now(),
  usat_per text unique,
  usat     timestamptz
);
create index if not exists comando_convits_de on public.comando_convits (de, creat desc);
alter table public.comando_convits enable row level security;
revoke all on public.comando_convits from anon, authenticated;

-- La clau d'edició és d'aquest nick? (El primer enviament d'un nick en fixa la clau.)
create or replace function public.comando_es_seu(p_nick text, p_clau text)
returns boolean
language sql stable security definer set search_path = '' as $$
  select p_clau is not null and length(p_clau) between 20 and 200 and coalesce((
    select c.clau_hash = encode(extensions.digest(p_clau, 'sha256'), 'hex')
    from public.comando_cromos c where c.nick = p_nick order by c.id limit 1), false)
$$;

-- L'última decisió sobre aquest nick és «aprovat»?
create or replace function public.comando_aprovat(p_nick text)
returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select c.estat = 'aprovat' from public.comando_cromos c
    where c.nick = p_nick and c.estat in ('aprovat', 'rebutjat', 'retirat') order by c.id desc limit 1), false)
$$;

create or replace function public.crea_convit(p_nick text, p_clau text)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  qui text;
  motiu text;
  nou text;
begin
  if coalesce(p_nick, '') = '' then
    motiu := public.comando_porta_moderador(p_clau);
    if motiu is not null then return jsonb_build_object('error', motiu); end if;
    qui := 'comando';
  else
    if not public.comando_es_seu(p_nick, p_clau) then return jsonb_build_object('error', 'no_es_teu'); end if;
    if not public.comando_aprovat(p_nick) then return jsonb_build_object('error', 'no_aprovat'); end if;
    qui := p_nick;
  end if;
  -- El sostre contra l'accident, no contra algú decidit.
  if (select count(*) from public.comando_convits v where v.de = qui and v.creat > now() - interval '1 day') >= 30 then
    return jsonb_build_object('error', 'massa_seguit');
  end if;
  nou := rtrim(translate(encode(extensions.gen_random_bytes(12), 'base64'), '+/', '-_'), '=');
  insert into public.comando_convits (codi, de) values (nou, qui);
  return jsonb_build_object('ok', true, 'codi', nou, 'de', qui);
end $$;

create or replace function public.lliga_convit(p_codi text, p_nick text, p_clau text)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare v record;
begin
  if not public.comando_es_seu(p_nick, p_clau) then return jsonb_build_object('error', 'no_es_teu'); end if;
  select * into v from public.comando_convits where codi = p_codi for update;
  if not found then return jsonb_build_object('error', 'no_existeix'); end if;
  if v.usat_per is not null then
    return case when v.usat_per = p_nick then jsonb_build_object('ok', true, 'de', v.de)
                else jsonb_build_object('error', 'ja_usat') end;
  end if;
  if v.de = p_nick then return jsonb_build_object('error', 'a_tu_mateix'); end if;
  if exists (select 1 from public.comando_convits where usat_per = p_nick) then
    return jsonb_build_object('error', 'ja_convidat');
  end if;
  update public.comando_convits set usat_per = p_nick, usat = now() where codi = p_codi;
  return jsonb_build_object('ok', true, 'de', v.de);
end $$;

create or replace function public.la_meva_xarxa(p_nick text, p_clau text)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.comando_es_seu(p_nick, p_clau) then return jsonb_build_object('error', 'no_es_teu'); end if;
  return jsonb_build_object(
    'de', (select v.de from public.comando_convits v where v.usat_per = p_nick),
    'convits', coalesce((select jsonb_agg(jsonb_build_object('creat', v.creat, 'usat_per', v.usat_per,
        'aprovat', v.usat_per is not null and public.comando_aprovat(v.usat_per)) order by v.creat desc)
      from (select * from public.comando_convits where de = p_nick order by creat desc limit 100) v), '[]'::jsonb));
end $$;

-- Les arestes que es poden ensenyar: les dues puntes aprovades (o el Comando).
-- Un convit no usat, o d'algú que no és a la col·lecció, no surt.
create or replace function public.xarxa_cromos()
returns table (de text, nick text)
language sql stable security definer set search_path = '' as $$
  select v.de, v.usat_per from public.comando_convits v
  where v.usat_per is not null and public.comando_aprovat(v.usat_per)
    and (v.de = 'comando' or public.comando_aprovat(v.de))
  order by v.usat
  limit 5000
$$;

grant execute on function public.crea_convit(text, text) to anon, authenticated;
grant execute on function public.lliga_convit(text, text, text) to anon, authenticated;
grant execute on function public.la_meva_xarxa(text, text) to anon, authenticated;
grant execute on function public.xarxa_cromos() to anon, authenticated;

-- Les dues d'ajuda no les crida ningú de fora. S'apliquen en una migració a part: el `revoke ...
-- on function` fa encallar la migració al connector de Supabase.
revoke all on function public.comando_es_seu(text, text) from public, anon, authenticated;
revoke all on function public.comando_aprovat(text) from public, anon, authenticated;

-- ── Aplicat ────────────────────────────────────────────────────────────────
-- Encara no. S'aplica quan l'autor ho digui (per-a-la-ia.md §2).
