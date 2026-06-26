drop policy if exists "Allow all for authenticated" on employees;

create policy "Allow all access on employees"
  on employees for all
  using (true)
  with check (true);
