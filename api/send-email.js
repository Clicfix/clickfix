export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { type, to, data } = body;
  const RESEND_KEY = "re_ifi5vKQp_LM6JP8eoGccKGZrKEtTFTEQx";

  let subject, html;

  if (type === "welcome_pro") {
    subject = "Bienvenue sur Click&fix !";
    html = `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;background:#07090f;color:#fff">
      <h1 style="color:#FF6F00">Bienvenue ${data.prenom} !</h1>
      <p>Votre compte artisan Click&fix a bien ete cree.</p>
      <p><strong>Email :</strong> ${data.email}</p>
      <p><strong>Entreprise :</strong> ${data.entreprise}</p>
      <p>Vous allez bientot recevoir vos premiers RDV qualifies.</p>
      <a href="https://clickfix-omega.vercel.app" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#FF6F00;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Acceder a mon espace</a>
      <p style="margin-top:30px;color:#666;font-size:12px">L equipe Click&fix</p>
    </div>`;
  }

  else if (type === "new_lead_pro") {
    subject = "Nouveau RDV qualifie disponible !";
    html = `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;background:#07090f;color:#fff">
      <h1 style="color:#FF6F00">Nouveau RDV qualifie !</h1>
      <p>Bonjour ${data.prenom},</p>
      <p>Un nouveau client recherche un artisan pour :</p>
      <div style="background:#1a1a2e;padding:16px;border-radius:8px;margin:16px 0">
        <p><strong>Travaux :</strong> ${data.travaux}</p>
        <p><strong>Surface :</strong> ${data.surface}</p>
        <p><strong>Budget :</strong> ${data.budget}</p>
        <p><strong>Ville :</strong> ${data.ville}</p>
        <p><strong>Votre creneau :</strong> ${data.creneau}</p>
      </div>
      <a href="https://clickfix-omega.vercel.app" style="display:inline-block;margin-top:10px;padding:12px 24px;background:#FF6F00;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Confirmer ma presence</a>
      <p style="margin-top:30px;color:#666;font-size:12px">L equipe Click&fix</p>
    </div>`;
  }

  else if (type === "confirm_rdv_client") {
    subject = "Votre RDV Click&fix est confirme !";
    html = `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;background:#07090f;color:#fff">
      <h1 style="color:#FF6F00">Votre RDV est confirme !</h1>
      <p>Bonjour ${data.client_prenom},</p>
      <p>Un artisan a confirme votre rendez-vous :</p>
      <div style="background:#1a1a2e;padding:16px;border-radius:8px;margin:16px 0">
        <p><strong>Artisan :</strong> ${data.artisan_prenom} ${data.artisan_nom}</p>
        <p><strong>Entreprise :</strong> ${data.artisan_entreprise}</p>
        <p><strong>Telephone :</strong> ${data.artisan_tel}</p>
        <p><strong>Email :</strong> ${data.artisan_email}</p>
        <p><strong>Creneau :</strong> ${data.creneau}</p>
      </div>
      <p>L artisan vous contactera pour confirmer les details.</p>
      <p style="margin-top:30px;color:#666;font-size:12px">L equipe Click&fix</p>
    </div>`;
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + RESEND_KEY },
      body: JSON.stringify({ from: "Click&fix <contact@click-fix.fr>", to: [to], subject, html })
    });
    const result = await r.json();
    res.status(200).json({ ok: true, result });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
