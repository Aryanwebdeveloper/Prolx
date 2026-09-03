const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, serviceKey);

async function checkCerts() {
  console.log("--- ACADEMY CERTIFICATES ---");
  const { data: acadCerts, error: err1 } = await supabase
    .from('academy_certificates')
    .select('id, certificate_id, recipient_name, course_title, status, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  if (err1) console.error("Error fetching academy_certificates:", err1);
  else console.log("academy_certificates count:", acadCerts?.length, JSON.stringify(acadCerts, null, 2));

  console.log("--- LEGACY CERTIFICATES ---");
  const { data: legCerts, error: err2 } = await supabase
    .from('certificates')
    .select('id, recipient_name, title, status, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  if (err2) console.error("Error fetching certificates:", err2);
  else console.log("certificates count:", legCerts?.length, JSON.stringify(legCerts, null, 2));
}

checkCerts();
