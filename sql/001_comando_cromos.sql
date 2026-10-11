-- ══════════════════════════════════════════════════════════════════════════
-- Els cromos del Comando · el directori de molekulon.org
-- ══════════════════════════════════════════════════════════════════════════
--
-- Viu al mateix Supabase que el directori del SOS (`online_fitxes`, projecte
-- Teamtowershuma) i amb la mateixa clau publicable: una sola infraestructura,
-- dues taules amb feines diferents (knowledge/alta-i-directori.md §3).
--
-- La diferència amb `online_fitxes` és qui dona fe. Allà, la firma de la
-- persona. Aquí, **l'autor de l'obra**: un cromo no surt al directori fins que
-- algú l'aprova. Per això aquesta taula no és oberta a ningú, ni a llegir ni a
-- escriure. Tot passa per tres funcions:
--
--   envia_cromo(nick, fitxa, clau, retira)  · afegeix una versió, PENDENT
--   directori_cromos()                       · llegeix només els APROVATS
--   el_meu_cromo(nick, clau)                 · torna la teva última versió
--
-- ── La clau d'edició, i per què no hi ha comptes ───────────────────────────
-- Qui envia el primer cromo d'un nick s'inventa (el navegador ho fa per ell)
-- una clau llarga. Aquí només se'n guarda el resum SHA-256. Qui torni amb la
-- mateixa clau pot enviar-ne una versió nova o retirar-lo; qui no la tingui no
-- pot fer servir aquell nick. És el mateix pacte que el SOS —qui té la clau
-- mana sobre la fitxa— sense haver d'explicar criptografia a ningú.
--
-- ── Només afegir ───────────────────────────────────────────────────────────
-- Actualitzar-se és enviar una versió nova, que torna a passar per aprovació.
-- Mentrestant, el directori segueix ensenyant l'última aprovada. Retirar-se és
-- enviar una versió amb `retira`, i aquesta no espera ningú: surt del directori
-- a l'instant. Es pot marxar sense demanar permís.
--
-- ── Moderar ────────────────────────────────────────────────────────────────
-- Des del panell de Supabase (Table Editor › comando_cromos), canviant `estat`
-- de `pendent` a `aprovat` o `rebutjat`. Ho fa el rol de servei, que no passa
-- per RLS. El disparador posa `revisat` sol.
--
-- ── Dades personals ────────────────────────────────────────────────────────
-- Cap. Ni correu, ni nom, ni IP. El que hi ha és el que el kit diu que es
-- publica: el personatge (alta-i-directori.md §2bis).

-- pgcrypto ja hi és, a l'esquema `extensions` (el de Supabase per defecte).
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.comando_cromos (
  id         bigint generated always as identity primary key,
  nick       text        not null,
  fitxa      jsonb       not null,
  clau_hash  text        not null,
  estat      text        not null default 'pendent',
  creat      timestamptz not null default now(),
  revisat    timestamptz,
  nota       text,

  constraint cromo_nick_forma check (nick ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(nick) between 2 and 20),
  constraint cromo_estat check (estat in ('pendent', 'aprovat', 'rebutjat', 'retirat')),
  constraint cromo_objecte check (jsonb_typeof(fitxa) = 'object'),
  constraint cromo_mida check (pg_column_size(fitxa) < 16384),
  constraint cromo_hash_forma check (clau_hash ~ '^[0-9a-f]{64}$')
);

create index if not exists comando_cromos_nick_id on public.comando_cromos (nick, id desc);
create index if not exists comando_cromos_estat on public.comando_cromos (estat, creat desc);

-- Tancada. Sense cap política, RLS ho prohibeix tot a `anon` i `authenticated`.
alter table public.comando_cromos enable row level security;
revoke all on public.comando_cromos from anon, authenticated;

-- Els noms que no es poden donar: els catorze canònics i els nicks reservats
-- als fundadors al SOS (teamtowershuma SOS/tools/build-convits.js, RESERVES).
create table if not exists public.comando_noms_reservats (nick text primary key, de text not null);
alter table public.comando_noms_reservats enable row level security;
revoke all on public.comando_noms_reservats from anon, authenticated;
insert into public.comando_noms_reservats (nick, de) values
  ('mazinguer','Mazinguer'), ('horacio-motomachi','Horacio Motomachi'), ('horacio','Horacio Motomachi'),
  ('guiri-guay','Guiri-Guay'), ('guiriguay','Guiri-Guay'), ('purpleman','Purpleman'), ('afrodita','Afrodita'),
  ('el-aviador','El Aviador'), ('aviador','El Aviador'), ('pigmenton','Pigmentón'),
  ('la-medusa-andaluza','La Medusa Andaluza'), ('medusa','La Medusa Andaluza'),
  ('electroplasman','Electroplasman'), ('el-anguila','El Anguila'), ('anguila','El Anguila'),
  ('barbamuda','Barbamuda'), ('reciclator','Reciclator'), ('supergerminador','Supergerminador'),
  ('fraktalman','Fraktalman')
on conflict (nick) do nothing;

-- `revisat` el posa el disparador: qui modera només toca `estat`.
create or replace function public.comando_cromos_revisat() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.estat is distinct from old.estat then new.revisat := now(); end if;
  return new;
end $$;
create trigger comando_cromos_revisat before update on public.comando_cromos
  for each row execute function public.comando_cromos_revisat();

-- ── Enviar ─────────────────────────────────────────────────────────────────
create or replace function public.envia_cromo(p_nick text, p_fitxa jsonb, p_clau text, p_retira boolean default false)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  h text;
  propi text;
  nom text := btrim(coalesce(p_fitxa->>'nom', ''));
begin
  if p_clau is null or length(p_clau) not between 20 and 200 then
    raise exception 'clau_curta';
  end if;
  if p_nick is null or p_nick !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_nick) not between 2 and 20 then
    raise exception 'nick_forma';
  end if;
  if exists (select 1 from public.comando_noms_reservats r where r.nick = p_nick) then
    raise exception 'nick_reservat';
  end if;
  if p_fitxa is null or jsonb_typeof(p_fitxa) <> 'object' or length(nom) not between 2 and 40
     or jsonb_typeof(coalesce(p_fitxa->'poders', 'null')) <> 'array'
     or jsonb_array_length(p_fitxa->'poders') not between 1 and 5 then
    raise exception 'fitxa_incompleta';
  end if;

  h := encode(extensions.digest(p_clau, 'sha256'), 'hex');
  select c.clau_hash into propi from public.comando_cromos c where c.nick = p_nick order by c.id limit 1;
  if propi is not null and propi <> h then
    raise exception 'nick_ocupat';
  end if;
  if p_retira and propi is null then
    raise exception 'res_a_retirar';
  end if;

  -- El sostre contra l'accident i el bot ximple, no contra algú decidit.
  if (select count(*) from public.comando_cromos c where c.nick = p_nick and c.creat > now() - interval '10 minutes') >= 5
     or (select count(*) from public.comando_cromos c where c.creat > now() - interval '1 hour') >= 300 then
    raise exception 'massa_seguit';
  end if;

  insert into public.comando_cromos (nick, fitxa, clau_hash, estat)
  values (p_nick, p_fitxa, h, case when p_retira then 'retirat' else 'pendent' end);

  return jsonb_build_object('ok', true, 'nick', p_nick, 'estat', case when p_retira then 'retirat' else 'pendent' end);
end $$;

-- ── Llegir el directori ────────────────────────────────────────────────────
-- Per cada nick, l'última versió moderada (aprovada o retirada); surt si és
-- aprovada. Una versió nova pendent no amaga la que ja hi era.
create or replace function public.directori_cromos()
returns table (nick text, fitxa jsonb, aprovat timestamptz)
language sql stable security definer set search_path = '' as $$
  select d.nick, d.fitxa, d.t from (
    select distinct on (c.nick) c.nick, c.fitxa, c.estat, coalesce(c.revisat, c.creat) as t
    from public.comando_cromos c
    where c.estat in ('aprovat', 'retirat')
    order by c.nick, c.id desc
  ) d
  where d.estat = 'aprovat'
  order by d.t desc
  limit 1000
$$;

-- ── Recuperar el teu ───────────────────────────────────────────────────────
-- Per continuar editant des d'un altre aparell: amb el nick i la clau, la teva
-- última versió i en quin estat és. Sense la clau, res.
create or replace function public.el_meu_cromo(p_nick text, p_clau text)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare r record;
begin
  if p_clau is null or length(p_clau) not between 20 and 200 then return null; end if;
  select c.fitxa, c.estat, c.creat, c.nota into r from public.comando_cromos c
  where c.nick = p_nick and c.clau_hash = encode(extensions.digest(p_clau, 'sha256'), 'hex')
  order by c.id desc limit 1;
  if not found then return null; end if;
  return jsonb_build_object('fitxa', r.fitxa, 'estat', r.estat, 'creat', r.creat, 'nota', r.nota);
end $$;

grant execute on function public.envia_cromo(text, jsonb, text, boolean) to anon, authenticated;
grant execute on function public.directori_cromos() to anon, authenticated;
grant execute on function public.el_meu_cromo(text, text) to anon, authenticated;

-- ── Aplicat ────────────────────────────────────────────────────────────────
-- 2026-10-11, al projecte Teamtowershuma (grkgrceioxktmbwdhvmm), com a tres
-- migracions: `comando_cromos`, `comando_cromos_revisat` i
-- `comando_cromos_funcions`. Provat com a `anon`: la taula no es pot llegir,
-- un nick d'un altre torna `nick_ocupat`, un canònic torna `nick_reservat`, un
-- pendent no surt al directori i un retirat en surt a l'instant.
