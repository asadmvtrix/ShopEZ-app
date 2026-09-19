const { createClient } = require("@supabase/supabase-js");

function getAdminClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw Object.assign(new Error("Server is missing Supabase admin credentials."), {
      status: 503,
    });
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getAnonClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw Object.assign(new Error("Server is missing Supabase credentials."), { status: 503 });
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    throw Object.assign(new Error("Sign in required."), { status: 401 });
  }

  const supabase = getAnonClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw Object.assign(new Error("Session expired. Sign in again."), { status: 401 });
  }
  return { user: data.user, accessToken: token };
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function siteOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return process.env.SITE_URL || `${proto}://${host}`;
}

module.exports = {
  getAdminClient,
  getAnonClient,
  requireUser,
  sendJson,
  readJson,
  siteOrigin,
};
