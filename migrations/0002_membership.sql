create table if not exists memberships (
  user_id    text primary key,
  plan       text not null,
  status     text not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists membership_orders (
  id         serial primary key,
  user_id    text not null,
  plan       text not null,
  amount_yuan integer not null,
  status     text not null default 'paid',
  created_at timestamptz not null default now(),
  paid_at    timestamptz
);
create index if not exists membership_orders_user_id_idx on membership_orders (user_id);

create table if not exists analysis_runs (
  id         serial primary key,
  user_id    text not null,
  lat        double precision not null,
  lng        double precision not null,
  title      text,
  created_at timestamptz not null default now()
);
create index if not exists analysis_runs_user_id_idx on analysis_runs (user_id);
