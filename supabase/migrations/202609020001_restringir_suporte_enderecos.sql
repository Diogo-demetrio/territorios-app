-- Suporte pode alterar somente status e a data associada à visita.
-- Administradores e superadministradores mantêm as permissões existentes.
create or replace function public.restringir_suporte_enderecos()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  perfil public.usuarios_app%rowtype;
  congregacao_endereco bigint;
begin
  select usuario.*
    into perfil
  from public.usuarios_app usuario
  where usuario.auth_user_id = auth.uid()
    and usuario.ativo = true
  limit 1;

  -- Operações internas sem usuário autenticado e demais papéis seguem as regras
  -- e políticas já existentes no banco.
  if not found or perfil.papel <> 'suporte' then
    if tg_op = 'DELETE' then
      return old;
    end if;

    return new;
  end if;

  if tg_op = 'INSERT' then
    raise exception 'O perfil suporte não pode cadastrar endereços.'
      using errcode = '42501';
  end if;

  if tg_op = 'DELETE' then
    raise exception 'O perfil suporte não pode excluir endereços.'
      using errcode = '42501';
  end if;

  select territorio.congregacao_id
    into congregacao_endereco
  from public.territorios territorio
  where territorio.id = old.territorio_id;

  if perfil.congregacao_id is distinct from congregacao_endereco then
    raise exception 'O perfil suporte não pode alterar endereços de outra congregação.'
      using errcode = '42501';
  end if;

  if (to_jsonb(new) - array['status', 'ultima_visita'])
       is distinct from
     (to_jsonb(old) - array['status', 'ultima_visita']) then
    raise exception 'O perfil suporte pode alterar somente o status do endereço.'
      using errcode = '42501';
  end if;

  if new.status is null or new.status not in (
    'visitado',
    'nao_atendeu',
    'nao_visitado',
    'novo'
  ) then
    raise exception 'Status de endereço inválido.'
      using errcode = '22023';
  end if;

  return new;
end;
$$;

drop trigger if exists restringir_suporte_enderecos
  on public.enderecos;

create trigger restringir_suporte_enderecos
before insert or update or delete on public.enderecos
for each row
execute function public.restringir_suporte_enderecos();

revoke all on function public.restringir_suporte_enderecos() from public;
