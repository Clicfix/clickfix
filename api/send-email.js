export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
const{type,to,data}=body;
const KEY="re_ifi5vKQp_LM6JP8eoGccKGZrKEtTFTEQx";
const hdr='<div style="background:#FF6F00;padding:20px 30px;text-align:center"><h1 style="margin:0;color:#fff;font-family:Arial;font-size:24px;font-weight:900">click<span style="color:#FBC005">&</span>fix</h1></div>';
const ftr='<div style="background:#333;padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.08)"><p style="margin:0;color:rgba(255,255,255,0.4);font-size:11px;font-family:Arial">Click&fix | contact@click-fix.fr | click-fix.fr</p></div>';
const wrap=c=>`<div style="background:#f5f5f5;padding:20px;font-family:Arial"><div style="max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08)">${hdr}<div style="background:#ffffff;padding:24px">${c}</div>${ftr}</div></div>`;
const row=(l,v)=>`<table width="100%" style="border-bottom:1px solid #eee;margin-bottom:6px"><tr><td style="color:#666;font-size:13px;padding:6px 0;font-family:Arial">${l} :</td><td align="right" style="color:#333;font-size:13px;font-weight:700;font-family:Arial;padding:6px 0">${v}</td></tr></table>`;
const box=rows=>`<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:16px;margin:16px 0;border:1px solid rgba(255,255,255,0.08)">${rows}</div>`;
const btn=(t,u,c="#FF6F00")=>`<a href="${u}" style="display:inline-block;padding:13px 26px;background:${c};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;font-family:Arial;margin-top:14px">${t}</a>`;
let subject,html;
if(type==="welcome_pro"){
subject="Bienvenue sur Click&fix ! Votre compte est actif";
html=wrap(`<h2 style="color:#FF6F00;margin:0 0 12px;font-size:22px">Bienvenue ${data.prenom} !</h2><p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px">Votre compte artisan Click&fix est actif. Vous allez bientôt recevoir des RDV qualifiés.</p>${box(row("Prenom",data.prenom)+row("Email",data.email)+row("Entreprise",data.entreprise||"-")+row("Statut","Actif"))}<p style="color:#FF6F00;font-size:13px;margin:0 0 8px;font-weight:700">Prochaines étapes :</p><ul style="color:#555;font-size:13px;line-height:1.8;padding-left:20px;margin:0 0 16px"><li>Téléchargez vos documents (Kbis, Decennale, RC Pro)</li><li>Choisissez votre pack de RDV</li><li>Recevez vos premiers clients</li></ul>${btn("Accéder à mon espace","https://click-fix.fr")}`);
}
else if(type==="new_lead_pro"){
subject="Nouveau RDV qualifié - Confirmez votre presence";
html=wrap(`<div style="background:rgba(255,111,0,0.1);border:1px solid rgba(255,111,0,0.3);border-radius:8px;padding:12px 16px;margin-bottom:16px"><p style="margin:0;color:#FF6F00;font-weight:700">Nouveau RDV qualifié disponible !</p></div><h2 style="color:#fff;margin:0 0 12px;font-size:20px">Bonjour ${data.prenom},</h2><p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 12px">Un client recherche un artisan pour les travaux suivants :</p>${box(row("Travaux",data.travaux)+row("Surface",data.surface||"-")+row("Budget",data.budget||"-")+row("Ville",data.ville||"-")+row("Votre créneau",data.creneau||"Sur RDV"))}${btn("Confirmer ma présence","https://click-fix.fr","#22c55e")}`);
}
else if(type==="confirm_rdv_client"){
subject="Votre RDV est confirme - Coordonnees de votre artisan";
html=wrap(`<div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;padding:12px 16px;margin-bottom:16px"><p style="margin:0;color:#22c55e;font-weight:700">Votre RDV est confirme !</p></div><h2 style="color:#fff;margin:0 0 12px;font-size:20px">Bonjour ${data.client_prenom},</h2><p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 12px">Voici les coordonnées de votre artisan :</p>${box(row("Artisan",data.artisan_prenom+" "+data.artisan_nom)+row("Entreprise",data.artisan_entreprise||"-")+row("Telephone",data.artisan_tel||"-")+row("Email",data.artisan_email||"-")+row("Creneau",data.creneau||"-"))}${btn("Voir mon espace","https://click-fix.fr")}`);
}
else if(type==="rappel_rdv_pro"){
subject="Rappel - Vous avez un RDV demain";
html=wrap(`<h2 style="color:#FBC005;margin:0 0 12px;font-size:22px">Rappel RDV demain !</h2><p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 12px">Bonjour ${data.prenom}, vous avez un RDV demain :</p>${box(row("Client",data.client_nom)+row("Adresse",data.adresse||"-")+row("Travaux",data.travaux)+row("Heure",data.creneau||"-"))}${btn("Voir les details","https://click-fix.fr","#FBC005")}`);
}
else if(type==="pack_active"){
subject="Votre pack Click&fix est activé — Récapitulatif";
html=wrap(`<h2 style="color:#FF6F00;margin:0 0 12px;font-size:22px">Pack ${data.pack_name} activé !</h2><p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px">Bonjour ${data.prenom}, votre pack a bien été activé. Voici le récapitulatif de votre offre :</p>${box(row("Pack",data.pack_name)+row("Nombre de RDV",data.pack_rdv+" RDV")+row("Prix",data.pack_prix+" EUR"+(data.abonnement?" / mois":""))+row("Tarif par RDV",data.pack_par)+row("Type",data.abonnement?"Abonnement mensuel":"Paiement unique")+row("Statut","Actif"))}<p style="color:#555;font-size:13px;margin:16px 0 8px">Vous allez bientôt recevoir vos premiers RDV qualifiés. Chaque lead sera attribué selon votre expertise.</p>${btn("Accéder à mon espace","https://click-fix.fr")}`);
}
if(!subject)return res.status(400).json({error:"Type inconnu"});
try{
const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+KEY},body:JSON.stringify({from:"Click&fix <contact@click-fix.fr>",to:[to],subject,html})});
const result=await r.json();
res.status(200).json({ok:true,result});
}catch(e){res.status(500).json({error:e.message});}
}
