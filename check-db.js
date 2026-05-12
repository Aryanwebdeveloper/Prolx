const fs = require('fs');
const https = require('https');

// Extract Supabase URL and Key from .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const supabaseUrlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
const supabaseKeyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);

if (!supabaseUrlMatch || !supabaseKeyMatch) {
  console.log("Could not find Supabase credentials");
  process.exit(1);
}

const url = supabaseUrlMatch[1];
const key = supabaseKeyMatch[1];

const reqUrl = new URL(`${url}/rest/v1/team_members?select=id,full_name,user_id`);

const options = {
  hostname: reqUrl.hostname,
  path: reqUrl.pathname + reqUrl.search,
  method: 'GET',
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Team Members:", JSON.parse(data));
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
