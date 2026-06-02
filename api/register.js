export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { email, pass, prenom, nom, role, tel, entreprise, siret, specialites } = body;
  const SB_URL = "https://bipqtqezntzcmxwiaqdz.supabase.co";
  const SB_SERVICE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
  try {
    // Verifier doublons
    const chk = await fetch(SB_URL+"/rest/v1/profiles?select=email,tel,siret&or=(email.eq."+encodeURIComponent(email)+",tel.eq."+encodeURIComponent(tel||"")+",siret.eq."+encodeURIComponent(siret||"")+")",&{headers:{"apikey":SB_SERVICE,"Authorization":"Bearer "+SB_SERVICE}});
    const ex = await chk.json();
    if(ex&&ex.length>0){const d=ex[0];if(d.email===email)return res.status(400).json({error:"Email deja utilise"});if(tel&&d.tel===tel)return res.status(400).json({error:"Telephone deja utilise"});if(siret&&d.siret===siret)return res.status(400).json({error:"SIRET deja utilise"});}
    const signupRes = await fetch(SB_URL + "/auth/v1/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SB_SERVICE, "Authorization": "Bearer " + SB_SERVICE },
      body: JSON.stringify({ email, password: pass, email_confirm: true, user_metadata: { prenom, nom, role } })
    });
    const user = await signupRes.json();
    if (user.error) return res.status(400).json({ error: user.error.message });
    const uid = user.id;
    const profileRes = await fetch(SB_URL + "/rest/v1/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SB_SERVICE, "Authorization": "Bearer " + SB_SERVICE, "Prefer": "return=representation" },
      body: JSON.stringify({ id: uid, email, prenom, nom, role, tel: tel||"", entreprise: entreprise||"", siret: siret||"", specialites: specialites||[], rdv_restants: 0, rdv_total: 0, statut_paiement: "actif" })
    });
    const profileData = await profileRes.json();
    console.log("Profile insert result:", JSON.stringify(profileData));
    const tokenRes = await fetch(SB_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SB_SERVICE },
      body: JSON.stringify({ email, password: pass })
    });
    const tokenData = await tokenRes.json();
    res.status(200).json({ uid, token: tokenData.access_token, prenom, nom, role, profileData });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
