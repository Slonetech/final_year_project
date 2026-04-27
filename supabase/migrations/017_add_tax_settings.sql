create table if not exists tax_settings (
  id text primary key default 'singleton',
  vat_rate numeric not null default 16,
  withholding_professional_fees numeric not null default 5,
  withholding_supplies numeric not null default 3,
  withholding_rent numeric not null default 10,
  withholding_commissions numeric not null default 2,
  updated_at timestamptz not null default now()
);

insert into tax_settings (id)
values ('singleton')
on conflict (id) do nothing;
