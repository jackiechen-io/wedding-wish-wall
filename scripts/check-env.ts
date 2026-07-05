const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'ADMIN_TOKEN'
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error('Missing env vars:', missing.join(', '));
  process.exit(1);
}
console.log('All required env vars exist.');
