alter table memberships
  add column if not exists role text not null default 'user';

create index if not exists memberships_role_idx on memberships (role);
