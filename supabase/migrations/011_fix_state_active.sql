-- 011_fix_state_active: allow ACTIVE as valid state and ensure any transition allowed
-- Fixes bug where changing from RESULT_PUBLISHED back to ACTIVE fails due to CHECK constraint

alter table public.competitions drop constraint if exists competitions_state_check;
alter table public.competitions add constraint competitions_state_check
  check (state in ('NOT_STARTED','ACTIVE','REGISTRATION','VERIFICATION','VOTING_OPEN','VOTING_CLOSED','RESULT_VERIFICATION','RESULT_PUBLISHED','COMPLETED'));

-- Also ensure frontend's simplified states map correctly: if old data has ACTIVE, keep it; no trigger blocking transitions
comment on column public.competitions.state is 'Frontend uses NOT_STARTED, ACTIVE (=VOTING_OPEN), VOTING_CLOSED, RESULT_PUBLISHED. ACTIVE is alias for VOTING_OPEN and must be allowed for any transition.';
