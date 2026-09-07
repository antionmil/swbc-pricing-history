-- Database: Neon project `pricing-history` (crimson-bread-33318433), eu-central-1.
-- Nothing else lives in this database. One project per site: day 1 of this run
-- executed another product's schema into a live database by accident.
--
-- Three tables, and none of them can say WHO. The visitor is a salted one-way
-- hash of their IP, the hash rows are swept, and only a bare integer survives.

create table if not exists presence (
  id      text primary key,
  seen_at timestamptz not null default now()
);
create index if not exists presence_seen_idx on presence (seen_at);

-- one row per visitor per day, swept after 8 days
create table if not exists visit_days (
  day date not null,
  id  text not null,
  primary key (day, id)
);
create index if not exists visit_days_day_idx on visit_days (day);

-- the daily total, with nobody in it, so it can be kept for good
create table if not exists visit_totals (
  day date primary key,
  n   integer not null default 0
);
