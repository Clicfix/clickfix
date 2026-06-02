export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { email, pass, prenom, nom, role, tel, entreprise, siret, specialites } = body;
  const SB_URL = "https://bipqtqezntzcmxwiaqdz.supabase.co";
  const SB_SERVICE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
  try {
    const signupRes = await fetch(SB_URL + "/auth/v1/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SB_SERVICE, "Authorization": "Bearer " + SB_SERVICE },
      body: JSON.stringify({ email, password: pass, email_confirm: true, user_metadata: { prenom, nom, role } })
    });
    const user = await signupRes.json();
    if (user.error) return res.status(400).json({ error: user.error.message });
    const uid = user.id;
    await fetch(SB_URL + "/rest/v1/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SB_SERVICE, "Authorization": "Bearer " + SB_SERVICE, "Prefer": "resolution=merge-duplicates" },
      body: JSON.stringify({ id: uid, email, prenom, nom, role, tel: tel||"", entreprise: entreprise||"", siret: siret||"", specialites: specialites||[], rdv_restants: 0, rdv_total: 0, statut_paiement: "actif" })
    });
    const tokenRes = await fetch(SB_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SB_SERVICE },
      body: JSON.stringify({ email, password: pass })
    });
    const tokenData = await tokenRes.json();
    res.status(200).json({ uid, token: tokenData.access_token, prenom, nom, role });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
