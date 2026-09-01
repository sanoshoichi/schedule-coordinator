create extension if not exists pgcrypto;
-- テーブルは直接公開せず、検証済みのRPCだけをブラウザから実行できるようにする。
create table if not exists public.schedules(id uuid primary key default gen_random_uuid(),slug text unique not null check(slug~'^[a-z0-9-]{1,50}$'),title text not null check(char_length(title) between 1 and 100),candidate_dates date[] not null default '{}',start_hour int not null default 9 check(start_hour between 0 and 23),end_hour int not null default 20 check(end_hour between 0 and 23 and end_hour>=start_hour),admin_password_hash text not null,updated_at timestamptz not null default now());
create table if not exists public.schedule_responses(id bigint generated always as identity primary key,schedule_id uuid not null references public.schedules on delete cascade,name text not null check(char_length(name) between 1 and 40),availability jsonb not null default '{}',updated_at timestamptz not null default now(),unique(schedule_id,name));
alter table public.schedules enable row level security;alter table public.schedule_responses enable row level security;
revoke all on public.schedules,public.schedule_responses from anon,authenticated;
create or replace function public.get_public_schedule(p_slug text) returns jsonb language sql security definer set search_path=public as $$select jsonb_build_object('slug',s.slug,'title',s.title,'candidate_dates',s.candidate_dates,'start_hour',s.start_hour,'end_hour',s.end_hour,'responses',coalesce((select jsonb_agg(jsonb_build_object('name',r.name,'availability',r.availability) order by r.updated_at) from schedule_responses r where r.schedule_id=s.id),'[]'::jsonb)) from schedules s where s.slug=p_slug$$;
-- 切り替え欄には管理情報や回答内容を含めず、識別に必要な項目だけを返す。
create or replace function public.list_public_schedules() returns jsonb language sql security definer set search_path=public as $$select coalesce(jsonb_agg(jsonb_build_object('slug',slug,'title',title,'updated_at',updated_at) order by updated_at desc),'[]'::jsonb) from schedules$$;
create or replace function public.save_schedule_response(p_slug text,p_name text,p_availability jsonb) returns void language plpgsql security definer set search_path=public as $$declare v_id uuid;v_key text;v_mark text;begin select id into v_id from schedules where slug=p_slug;if v_id is null then raise exception 'schedule not found';end if;p_name=left(regexp_replace(trim(p_name),'\s+',' ','g'),40);if p_name='' then raise exception 'name is required';end if;if jsonb_typeof(p_availability)<>'object' or jsonb_object_length(p_availability)>500 then raise exception 'invalid availability';end if;for v_key,v_mark in select * from jsonb_each_text(p_availability) loop if v_mark not in('circle','triangle','cross') or not exists(select 1 from schedules s,unnest(s.candidate_dates)d where s.id=v_id and v_key~('^'||d::text||'T([01][0-9]|2[0-3]):00$') and split_part(v_key,'T',2)::time between make_time(s.start_hour,0,0) and make_time(s.end_hour,0,0)) then raise exception 'invalid slot';end if;end loop;insert into schedule_responses(schedule_id,name,availability)values(v_id,p_name,p_availability)on conflict(schedule_id,name)do update set availability=excluded.availability,updated_at=now();end$$;
create or replace function public.admin_update_schedule(p_slug text,p_password text,p_title text,p_candidate_dates date[],p_start_hour int,p_end_hour int) returns void language plpgsql security definer set search_path=public as $$begin update schedules set title=left(trim(p_title),100),candidate_dates=p_candidate_dates,start_hour=p_start_hour,end_hour=p_end_hour,updated_at=now() where slug=p_slug and admin_password_hash=crypt(p_password,admin_password_hash);if not found then raise exception 'invalid schedule or password';end if;end$$;
grant execute on function public.list_public_schedules(),public.get_public_schedule(text),public.save_schedule_response(text,text,jsonb),public.admin_update_schedule(text,text,text,date[],int,int) to anon,authenticated;
-- 初回のみ実行。CHANGE_MEを十分長い管理パスワードへ置換すること。
insert into public.schedules(slug,title,candidate_dates,start_hour,end_hour,admin_password_hash)values('default','日程調整',array[current_date+1,current_date+3,current_date+6],9,20,crypt('CHANGE_ME',gen_salt('bf')))on conflict(slug)do nothing;

-- 旧版が一つのJSONに保持していた予定を、予定ごとの行へ安全に引き継ぐ。
do $$
declare legacy jsonb; item jsonb; payload jsonb; migrated_slug text; schedule_id uuid; person jsonb; availability jsonb;
begin
  if to_regclass('public.schedule_state') is null then return; end if;
  execute 'select payload from public.schedule_state where id = 1' into legacy;
  if jsonb_typeof(legacy->'schedules') <> 'array' then return; end if;
  for item in select * from jsonb_array_elements(legacy->'schedules') loop
    payload := coalesce(item->'payload','{}'::jsonb);
    migrated_slug := left(regexp_replace(lower(coalesce(item->>'id','legacy')),'[^a-z0-9-]+','-','g'),50);
    if migrated_slug = '' then migrated_slug := 'legacy'; end if;
    insert into schedules(slug,title,candidate_dates,start_hour,end_hour,admin_password_hash)
    values(migrated_slug,left(coalesce(nullif(item->>'title',''),migrated_slug),100),coalesce(array(select value::date from jsonb_array_elements_text(coalesce(payload->'candidateDates','[]'::jsonb))),'{}'),9,20,crypt('CHANGE_ME',gen_salt('bf')))
    on conflict(slug) do update set title=excluded.title,candidate_dates=excluded.candidate_dates
    returning id into schedule_id;
    for person in select * from jsonb_array_elements(coalesce(payload->'participantEntries','[]'::jsonb)) loop
      select coalesce(jsonb_object_agg(slot->>'id',coalesce(slot->>'mark','circle')),'{}'::jsonb) into availability from jsonb_array_elements(coalesce(person->'slots','[]'::jsonb)) slot where slot ? 'id';
      if nullif(trim(person->>'name'),'') is not null then insert into schedule_responses(schedule_id,name,availability) values(schedule_id,left(trim(person->>'name'),40),availability) on conflict(schedule_id,name) do update set availability=excluded.availability; end if;
    end loop;
  end loop;
end $$;
