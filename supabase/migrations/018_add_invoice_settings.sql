create table if not exists invoice_settings (
  id text primary key default 'singleton',
  invoice_prefix text not null default 'INV',
  next_invoice_number integer not null default 1,
  payment_terms text not null default 'Net 30',
  terms_and_conditions text not null default '',
  footer_text text,
  updated_at timestamptz not null default now()
);

insert into invoice_settings (id)
values ('singleton')
on conflict (id) do nothing;
