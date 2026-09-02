-- Classifica unidades que ainda sao grupos sem criar uma congregacao publica extra (etapa 2).

begin;

alter table public.congregacoes
  add column if not exists tipo_unidade text not null default 'congregacao',
  add column if not exists congregacao_responsavel_nome text,
  add column if not exists congregacao_responsavel_numero text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'congregacoes_tipo_unidade_check'
      and conrelid = 'public.congregacoes'::regclass
  ) then
    alter table public.congregacoes
      add constraint congregacoes_tipo_unidade_check
      check (tipo_unidade in ('congregacao', 'grupo'));
  end if;
end
$$;

update public.congregacoes
set
  nome = 'Grupo Espanhol Içara',
  tipo_unidade = 'grupo',
  numero_oficial = null,
  congregacao_responsavel_nome = 'Congregação Vila Nova - Içara SC',
  congregacao_responsavel_numero = '58289',
  updated_at = now()
where id = 2
  and nome in ('Congregação Espanhol Içara', 'Grupo Espanhol Içara');

do $$
begin
  if not exists (
    select 1
    from public.congregacoes
    where id = 2
      and tipo_unidade = 'grupo'
      and congregacao_responsavel_numero = '58289'
      and numero_oficial is null
  ) then
    raise exception 'Nao foi possivel classificar o Grupo Espanhol Icara com seguranca.';
  end if;
end
$$;

commit;
