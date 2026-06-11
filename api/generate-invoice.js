export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const{lead_id,client_nom,artisan_nom,travaux,details,prix_final,date}=typeof req.body==="string"?JSON.parse(req.body):req.body;
const num="CF-"+new Date().getFullYear()+"-"+String(lead_id).padStart(4,"0");
const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#1d1d1f;}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;padding-bottom:20px;border-bottom:2px solid #FF6F00;}
.logo{font-size:24px;font-weight:900;color:#FF6F00;}
.title{font-size:28px;font-weight:700;margin-bottom:4px;}
.num{color:#8e8e93;font-size:14px;}
.section{margin:24px 0;padding:20px;background:#f5f5f7;border-radius:12px;}
.label{font-size:11px;color:#8e8e93;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}
.value{font-size:15px;font-weight:600;}
.total{margin-top:32px;padding:20px;background:#FF6F00;border-radius:12px;color:#fff;display:flex;justify-content:space-between;align-items:center;}
.total-label{font-size:16px;font-weight:700;}
.total-amount{font-size:32px;font-weight:900;}
.footer{margin-top:40px;text-align:center;color:#8e8e93;font-size:12px;}
</style></head><body>
<div class="header"><div class="logo">Click&fix</div><div><div class="title">Facture</div><div class="num">${num}</div></div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
<div class="section"><div class="label">Client</div><div class="value">${client_nom||"Client"}</div></div>
<div class="section"><div class="label">Artisan</div><div class="value">${artisan_nom||"Artisan"}</div></div>
</div>
<div class="section"><div class="label">Prestation</div><div class="value">${travaux||"Intervention"}</div>${details?`<div style="margin-top:8px;font-size:13px;color:#6e6e73">${details}</div>`:""}</div>
<div class="section"><div class="label">Date</div><div class="value">${date||new Date().toLocaleDateString("fr-FR")}</div></div>
<div class="total"><div class="total-label">Total TTC</div><div class="total-amount">${prix_final}€</div></div>
<div class="footer"><p>Click&fix — Plateforme de mise en relation artisans</p><p>contact@click-fix.fr — www.click-fix.fr</p></div>
</body></html>`;
res.setHeader("Content-Type","text/html; charset=utf-8");
res.status(200).send(html);
}
