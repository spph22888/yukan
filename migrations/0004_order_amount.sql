alter table membership_orders
  alter column amount_yuan type numeric(10, 2)
  using amount_yuan::numeric(10, 2);
