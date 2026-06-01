UPDATE public.site_settings
SET value = jsonb_set(
  jsonb_set(value, '{cta_href}', '"https://www.instagram.com/1017___.records?igsh=ZWwwZGZ0NjlzcjJ5"'),
  '{cta_label}', '"Promote Your Music (Message us)"'
)
WHERE key = 'hero';