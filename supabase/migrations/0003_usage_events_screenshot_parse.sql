-- スクショ読み取り(Vision)の利用も、利用上限の判定と原価記録の対象にする。
-- 0001 で列定義に書いた check 制約(自動命名: usage_events_kind_check)を置き換える。
alter table public.usage_events drop constraint usage_events_kind_check;
alter table public.usage_events add constraint usage_events_kind_check
  check (kind in ('match_review', 'followup', 'screenshot_parse'));
