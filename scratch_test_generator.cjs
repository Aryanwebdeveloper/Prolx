const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

async function testFix() {
  const cleanId = "PRLX-CERT-0000034";
  console.log(`Is '${cleanId}' a UUID?`, isUuid(cleanId));

  let query = supabaseAdmin
    .from('academy_certificates')
    .select('*');

  if (isUuid(cleanId)) {
    query = query.or(`certificate_id.eq.${cleanId},id.eq.${cleanId}`);
  } else {
    query = query.eq('certificate_id', cleanId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Query Success! Found Certificate:", data);
  }
}

testFix();
