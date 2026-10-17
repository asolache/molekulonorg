-- ══════════════════════════════════════════════════════════════════════════
-- L'auditoria amb el cervell (2026-10-17) · dues portes que no tancaven
-- ══════════════════════════════════════════════════════════════════════════
--
-- ── 1 · La marca «comprovat al SOS» ja no la dona Postgres ─────────────────
-- `directori_cromos()` posava `sos: true` si l'última fila de `online_fitxes`
-- d'aquell `did` portava el mateix @nick. Però aquella taula accepta files de
-- qualsevol i Postgres no pot comprovar-ne la firma (vegeu teamtowershuma
-- SOS/sql/001_online_fitxes.sql): n'hi havia prou de posar el `did` d'una
-- altra persona i el nick propi per sortir «comprovat» com si fos ella. És
-- dir «verificat» del que no s'ha verificat (veda 61 heretada).
--
-- Ara la marca la decideix el navegador a /personatges: llegeix les fitxes del
-- `did`, pren la més nova amb firma vàlida, com fa /SOS/online, i ho prova
-- `tools/prova-firma.js` al CI. Aquí només es treu el camp, i també el que
-- algú hagués pogut escriure dins la seva pròpia fitxa amb aquest nom.
--
-- ── 2 · La clau de moderador, amb fre ──────────────────────────────────────
-- `modera_llista` i `modera_cromo` comparaven el resum de la clau sense cap
-- límit d'intents. Ara cada intent amb una clau dolenta queda anotat, i amb 10
-- en 15 minuts la moderació es tanca per a tothom fins que passin. Que es tanqui
-- també per a l'autor és a posta: si la porta distingís la clau bona durant el
-- bloqueig, seguiria servint per endevinar-la. Mentrestant es pot moderar des de
-- Supabase › Table Editor, com sempre.
--
-- Per anotar el fracàs la funció no pot petar: un `raise` desfaria també
-- l'anotació. Per això una clau dolenta ara torna `{"error": "no_moderador"}`
-- i el bloqueig `{"error": "massa_intents"}`, i /modera ho llegeix.

create or replace function public.directori_cromos()
returns table (nick text, fitxa jsonb, aprovat timestamptz)
language sql stable security definer set search_path = '' as $$
  select d.nick, d.fitxa - 'sos', d.t
  from (
    select distinct on (c.nick) c.nick, c.fitxa, c.estat, coalesce(c.revisat, c.creat) as t
    from public.comando_cromos c
    where c.estat in ('aprovat', 'retirat')
    order by c.nick, c.id desc
  ) d
  where d.estat = 'aprovat'
  order by d.t desc
  limit 1000
$$;

create table if not exists public.comando_moderacio_intents (
  id    bigint generated always as identity primary key,
  creat timestamptz not null default now()
);
create index if not exists comando_moderacio_intents_creat on public.comando_moderacio_intents (creat desc);
alter table public.comando_moderacio_intents enable row level security;
revoke all on public.comando_moderacio_intents from anon, authenticated;

-- null si la clau és bona; si no, el motiu. Només la criden les dues de sota.
create or replace function public.comando_porta_moderador(p_clau text)
returns text
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.comando_moderacio_intents i where i.creat > now() - interval '15 minutes') >= 10 then
    return 'massa_intents';
  end if;
  if p_clau is not null and exists (select 1 from public.comando_moderadors m
      where m.clau_hash = encode(extensions.digest(p_clau, 'sha256'), 'hex')) then
    return null;
  end if;
  insert into public.comando_moderacio_intents default values;
  delete from public.comando_moderacio_intents where creat < now() - interval '1 day';
  return 'no_moderador';
end $$;
revoke all on function public.comando_porta_moderador(text) from public, anon, authenticated;

create or replace function public.modera_llista(p_clau text)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare motiu text := public.comando_porta_moderador(p_clau);
begin
  if motiu is not null then return jsonb_build_object('error', motiu); end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'nick', c.nick, 'fitxa', c.fitxa, 'estat', c.estat,
      'creat', c.creat, 'revisat', c.revisat, 'nota', c.nota) order by (c.estat = 'pendent') desc, c.id desc)
    from (select * from public.comando_cromos order by id desc limit 300) c), '[]'::jsonb);
end $$;

create or replace function public.modera_cromo(p_clau text, p_id bigint, p_estat text, p_nota text default null)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare motiu text := public.comando_porta_moderador(p_clau);
begin
  if motiu is not null then return jsonb_build_object('error', motiu); end if;
  if p_estat not in ('pendent', 'aprovat', 'rebutjat', 'retirat') then
    raise exception 'estat_forma';
  end if;
  update public.comando_cromos set estat = p_estat, nota = nullif(left(btrim(coalesce(p_nota, '')), 300), '')
  where id = p_id;
  if not found then raise exception 'no_existeix'; end if;
  return jsonb_build_object('ok', true, 'id', p_id, 'estat', p_estat);
end $$;

grant execute on function public.modera_llista(text) to anon, authenticated;
grant execute on function public.modera_cromo(text, bigint, text, text) to anon, authenticated;

-- ── Aplicat ────────────────────────────────────────────────────────────────
-- 2026-10-17, al projecte Teamtowershuma (grkgrceioxktmbwdhvmm), com a
-- migració `comando_cromos_auditoria_cervell`.
