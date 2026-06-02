export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { email, pass, prenom, nom, role, tel, entreprise, siret, specialites } = body;
  const SB = "https://bipqtqezntzcmxwiaqdz.supabase.co";
  const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
  const H = { "Content-Type": "application/json", "apikey": SK, "Authorization": "Bearer " + SK };
  try {
    const chk = await fetch(SB + "/rest/v1/profiles?select=email,tel,siret&email=eq." + encodeURIComponent(email), { headers: H });
    const ex = await chk.json();
    if (ex && ex.length > 0) return res.status(400).json({ error: "Cet email est deja utilise" });
    if (tel) {
      const chkTel = await fetch(SB + "/rest/v1/profiles?select=tel&tel=eq." + encodeURIComponent(tel), { headers: H });
      const exTel = await chkTel.json();
      if (exTel && exTel.length > 0) return res.status(400).json({ error: "Ce telephone est deja utilise" });
    }
    if (siret) {
      const chkSiret = await fetch(SB + "/rest/v1/profiles?select=siret&siret=eq." + encodeURIComponent(siret), { headers: H });
      const exSiret = await chkSiret.json();
      if (exSiret && exSiret.length > 0) return res.status(400).json({ error: "Ce SIRET est deja utilise" });
    }
    const signupRes = await fetch(SB + "/auth/v1/admin/users", {
      method: "POST",
      headers: H,
      body: JSON.stringify({ email, password: pass, email_confirm: true, user_metadata: { prenom, nom, role } })
    });
    const user = await signupRes.json();
    if (user.error) return res.status(400).json({ error: user.error.message });
    const uid = user.id;
    const profileRes = await fetch(SB + "/rest/v1/profiles", {
      method: "POST",
      headers: { ...H, "Prefer": "return=representation" },
      body: JSON.stringify({ id: uid, email, prenom, nom, role, tel: tel||"", entreprise: entreprise||"", siret: siret||"", specialites: specialites||[], rdv_restants: 0, rdv_total: 0, statut_paiement: "actif" })
    });
    const profileData = await profileRes.json();
    const tokenRes = await fetch(SB + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: H,
      body: JSON.stringify({ email, password: pass })
    });
    const tokenData = await tokenRes.json();
    res.status(200).json({ uid, token: tokenData.access_token, prenom, nom, role, profileData });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
