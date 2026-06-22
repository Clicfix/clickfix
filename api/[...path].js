import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const pathValue = req.query.path || req.query["...path"];
  const route = Array.isArray(pathValue) ? pathValue[0] : pathValue;

  try {
    switch (route) {
      case "ai-chat": return await aiChat(req, res);
      case "analyze-photo": return await analyzePhoto(req, res);
      case "capture-payment": return await capturePayment(req, res);
      case "create-payment": return await createPayment(req, res);
      case "generate-invoice": return await generateInvoice(req, res);
      case "news": return await news(req, res);
      case "register": return await register(req, res);
      case "save-lead": return await saveLead(req, res);
      case "send-email": return await sendEmail(req, res);
      case "stripe-onboard": return await stripeOnboard(req, res);
      case "stripe-webhook": return await stripeWebhook(req, res);
      case "urgence-lead": return await urgenceLead(req, res);
      case "verify-document": return await verifyDocument(req, res);
      case "check-devis": return await checkDevis(req, res);
      default: return res.status(404).json({ error: "Route inconnue: " + route });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

// ===================== AI-CHAT =====================
async function aiChat(req,res){
if(req.method!=="POST")return res.status(405).end();
const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
const messages=body.messages||(body.history?[...body.history,{role:"user",content:body.message}]:null);
if(!messages)return res.status(400).json({error:"messages required"});
const prompt=`Tu es un assistant expert en travaux pour Click&fix. REGLES STRICTES: 1) Pose UNE seule question a la fois. 2) Adapte tes questions au type de travaux. 3) NE demande JAMAIS l adresse ni les creneaux - geres separement. 4) TOUJOURS demander le budget en derniere question avant de generer le LEAD. Questions selon le type: - Serrurerie/securite: type de serrure, marque, probleme exact, puis budget - Chaudiere/chauffage: marque, modele, symptomes, age, puis budget - Fuite/plomberie: localisation exacte, gravite, depuis quand, puis budget - Parquet/carrelage/peinture: surface en m2, etat actuel, materiaux souhaites, puis budget - Electricite: type de panne, nombre de pieces concernees, puis budget - Cuisine/salle de bain: surface, etat actuel, niveau de renovation (partiel/complet), puis budget - Maconnerie/extension: dimensions, type de construction, permis obtenu, puis budget. Des que tu as toutes les infos INCLUANT le budget, reponds UNIQUEMENT avec ce JSON dans une balise <LEAD>{"travaux":"categorie","precision":"details complets","surface":"surface si pertinent sinon null","budget":"budget indique","urgence":false,"description":"resume complet"}</LEAD>. Sois chaleureux et professionnel. Reponds en francais.`;
try{
const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
body:JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:1000,messages:[{role:"system",content:prompt},...messages]})});
const d=await r.json();
const text=d.choices?.[0]?.message?.content||"";
res.status(200).json({text});
}catch(e){res.status(500).json({error:e.message});}
}

// ===================== ANALYZE-PHOTO =====================
async function analyzePhoto(req,res){
if(req.method!=="POST")return res.status(405).end();
const {image,description}=typeof req.body==="string"?JSON.parse(req.body):req.body;
const prompt="Tu es un expert en depannage a domicile en Ile-de-France avec 20 ans d experience terrain, specialise dans l estimation de prix pour intervention urgente. Analyse precisement cette panne a partir de la photo et de la description, et reponds UNIQUEMENT en JSON sans markdown avec une fourchette de prix la PLUS ETROITE et REALISTE possible, basee sur les tarifs reels pratiques en Ile-de-France en 2025-2026 (pas les tarifs nationaux moyens, specifiquement IDF qui sont plus eleves). Sois rigoureux: ne surestime pas par prudence, vise la fourchette qu un artisan honnete facturerait reellement. Format: {\"diagnostic\":\"description precise du probleme observe\",\"materiel\":[\"materiel1\",\"materiel2\"],\"duree\":\"ex: 1h30\",\"prix_min\":\"ex: 150 EUR\",\"prix_max\":\"ex: 220 EUR\",\"main_oeuvre\":\"ex: 80 EUR/h\",\"urgence\":\"critique|urgent|normal\",\"conseils\":\"conseil pratique\"}. Description du probleme: "+description;
try{
const messages=[{role:"user",content:image?[{type:"text",text:prompt},{type:"image_url",image_url:{url:image}}]:[{type:"text",text:prompt}]}];
const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
body:JSON.stringify({model:image?"meta-llama/llama-4-scout-17b-16e-instruct":"llama-3.3-70b-versatile",max_tokens:600,messages})
});
const d=await r.json();
const text=d.choices?.[0]?.message?.content||"{}";
const clean=text.replace(/```json|```/g,"").trim();
res.status(200).json(JSON.parse(clean));
}catch(e){res.status(500).json({error:e.message});}
}

// ===================== CAPTURE-PAYMENT =====================
async function capturePayment(req,res){
if(req.method!=="POST")return res.status(405).end();
const{payment_intent_id,amount_final,assigned_to}=typeof req.body==="string"?JSON.parse(req.body):req.body;
try{
const pi=await stripe.paymentIntents.capture(payment_intent_id,{amount_to_capture:Math.round(amount_final*100)});
let transfer=null;
if(assigned_to){
  try{
    const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
    const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
    const H={"apikey":SK,"Authorization":"Bearer "+SK};
    const pr=await fetch(SB+"/rest/v1/profiles?id=eq."+assigned_to+"&select=stripe_account_id",{headers:H});
    const prs=await pr.json();
    const stripeAccountId=Array.isArray(prs)&&prs[0]?prs[0].stripe_account_id:null;
    if(stripeAccountId){
      const montantArtisan=Math.round(amount_final*100*0.85);
      const tr=await stripe.transfers.create({amount:montantArtisan,currency:"eur",destination:stripeAccountId,transfer_group:payment_intent_id});
      transfer={id:tr.id,amount:tr.amount,destination:stripeAccountId};
    }else{
      transfer={error:"Artisan sans compte Stripe Connect actif - virement manuel necessaire"};
    }
  }catch(e){
    transfer={error:"Echec du transfert automatique: "+e.message+" - virement manuel necessaire"};
  }
}
res.status(200).json({success:true,status:pi.status,amount:pi.amount_received,transfer});
}catch(e){res.status(500).json({error:e.message});}
}

// ===================== CREATE-PAYMENT =====================
async function createPayment(req,res){
if(req.method!=="POST")return res.status(405).end();
const {amount,currency="eur",lead_id,client_email,description,connected_account}=typeof req.body==="string"?JSON.parse(req.body):req.body;
try{
const params={
amount:Math.round(amount*100),
currency,
capture_method:"manual",automatic_payment_methods:{enabled:true,allow_redirects:"never"},
description:description||"Intervention Click&fix",
metadata:{lead_id:lead_id||"",platform:"clickfix"}
};
if(client_email)params.receipt_email=client_email;
if(connected_account){
params.application_fee_amount=Math.round(amount*100*0.15);
params.transfer_data={destination:connected_account};
}
const paymentIntent=await stripe.paymentIntents.create(params);
res.status(200).json({client_secret:paymentIntent.client_secret,payment_intent_id:paymentIntent.id});
}catch(e){res.status(500).json({error:e.message});}
}

// ===================== GENERATE-INVOICE =====================
async function generateInvoice(req,res){
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

// ===================== NEWS =====================
async function news(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
if(req.method!=='GET')return res.status(405).end();
const feeds=[
  'https://www.lemonde.fr/immobilier/rss_full.xml',
  'https://www.batiactu.com/accueil/immo.rss',
  'https://www.batirama.com/rss/2-l-info-actualites.html'
];
const results=[];
for(const url of feeds){
  try{
    const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; Googlebot/2.1)','Accept':'application/rss+xml,application/xml'}});
    const xml=await r.text();
    const items=xml.split('<item>').slice(1);
    const source=url.includes('lemonde')?'Le Monde':url.includes('batiactu')?'Batiactu':'Batirama';
    let addedFromThisSource=0;
    for(const item of items){
      if(addedFromThisSource>=1)break;
      const title=(item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)||item.match(/<title>(.*?)<\/title>/))?.[1]||'';
      const desc=(item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)||item.match(/<description>(.*?)<\/description>/))?.[1]?.replace(/<[^>]*>/g,'').slice(0,150)||'';
      const link=(item.match(/<link>(.*?)<\/link>/)||item.match(/<link href="(.*?)"/))?.[1]||'';
      const img=(item.match(/<media:content[^>]*url="([^"]*)"/)|| item.match(/<enclosure[^>]*url="([^"]*)"/)|| item.match(/<media:thumbnail[^>]*url="([^"]*)"/)||[null,''])?.[1]||'';
      if(title&&link&&!results.find(x=>x.title===title)){
        results.push({title,description:desc,urlToImage:img||'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&q=80',url:link,source:{name:source}});
        addedFromThisSource++;
      }
    }
  }catch(e){}
}
if(results.length>0)return res.status(200).json({articles:results});
res.status(200).json({articles:[
  {title:"MaPrimeRenov 2025 : tout ce qui change",description:"Le gouvernement a revu les conditions d acces aux aides a la renovation energetique.",urlToImage:"https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",url:"https://www.service-public.fr/particuliers/vosdroits/F35083",source:{name:"Service-Public.fr"}},
  {title:"Renovation : les prix moyens en 2025",description:"Salle de bain : 8 000 a 15 000 euros. Cuisine : 5 000 a 20 000 euros.",urlToImage:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",url:"https://www.travaux.com/renovation/guide-des-prix",source:{name:"Travaux.com"}},
  {title:"Comment bien choisir son artisan ?",description:"SIRET, assurance decennale, devis detaille : les points essentiels a verifier.",urlToImage:"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",url:"https://www.economie.gouv.fr/particuliers/choisir-artisan",source:{name:"Economie.gouv.fr"}}
]});
}

// ===================== REGISTER =====================
async function register(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { email, pass, prenom, nom, role, tel, entreprise, siret, specialites, ville_intervention, rayon } = body;
  const SB = "https://bipqtqezntzcmxwiaqdz.supabase.co";
  const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
  const H = { "Content-Type": "application/json", "apikey": SK, "Authorization": "Bearer " + SK };
  try {
    const chk = await fetch(SB + "/rest/v1/profiles?select=email&email=eq." + encodeURIComponent(email), { headers: H });
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
    let lat = null, lon = null;
    if (ville_intervention) {
      try {
        const geoRes = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(ville_intervention + ", France"), { headers: { "User-Agent": "clickfix/1.0 contact@click-fix.fr" } });
        const geoData = await geoRes.json();
        if (geoData && geoData[0]) { lat = parseFloat(geoData[0].lat); lon = parseFloat(geoData[0].lon); }
      } catch(e) {}
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
      body: JSON.stringify({ id: uid, email, prenom, nom, role, tel: tel||"", entreprise: entreprise||"", siret: siret||"", specialites: specialites||[], ville_intervention: ville_intervention||"", rayon: rayon||"", lat, lon, rdv_restants: 0, rdv_total: 0, statut_paiement: "actif" })
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

// ===================== SAVE-LEAD =====================
async function saveLead(req,res){
if(req.method!=="POST")return res.status(405).end();
const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const H={"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};

function haversine(la1,lo1,la2,lo2){
  const R=6371;
  const dLat=(la2-la1)*Math.PI/180;
  const dLon=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function normalize(s){
  return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function matchKeywords(leadDesc,proSpecialites){
  if(!proSpecialites||proSpecialites.length===0)return false;
  const desc=normalize(leadDesc);
  const specs=proSpecialites.map(s=>normalize(s));
  const words=desc.split(/[\s,&/\-]+/).filter(w=>w.length>2);
  for(const spec of specs){
    const specWords=spec.split(/[\s,&/\-]+/).filter(w=>w.length>2);
    for(const sw of specWords){
      for(const w of words){
        if(sw===w||sw.includes(w)||w.includes(sw))return true;
      }
    }
  }
  return false;
}

try{
let lat=body.lat||null,lon=body.lon||null;
if(!lat&&(body.adresse||body.ville)){
  try{
    const q=encodeURIComponent((body.adresse||"")+" "+(body.ville||"")+" France");
    const g=await fetch("https://api-adresse.data.gouv.fr/search/?q="+q+"&limit=1",{headers:{"User-Agent":"clickfix/1.0"}});
    const d=await g.json();
    if(d?.features?.[0]){lat=d.features[0].geometry.coordinates[1];lon=d.features[0].geometry.coordinates[0];}
  }catch(e){}
}

const creneaux=typeof body.creneaux==='string'?JSON.parse(body.creneaux||'[]'):(body.creneaux||[]);
const nbArtisans=parseInt(body.nb_artisans)||3;
const leadDesc=(body.precision||body.travaux||"")+" "+(body.details||"");

const prosRes=await fetch(SB+"/rest/v1/profiles?role=eq.pro&statut_paiement=eq.actif&select=*",{headers:H});
const prosRaw=await prosRes.json();
const pros=Array.isArray(prosRaw)?prosRaw:[];

const PACK_ORDER={"Elite":0,"Pro":1,"Decouverte":2};
const sorted=pros
  .filter(p=>p&&(p.rdv_restants||0)>0&&p.specialites?.length>0)
  .filter(p=>matchKeywords(leadDesc,p.specialites))
  .filter(p=>{
    if(p.lat&&p.lon&&lat&&lon){
      const dist=haversine(parseFloat(p.lat),parseFloat(p.lon),parseFloat(lat),parseFloat(lon));
      const rayon=parseInt((p.rayon||"50").replace(/[^0-9]/g,""))||50;
      return dist<=rayon;
    }
    return true;
  })
  .sort((a,b)=>(PACK_ORDER[a.pack]||2)-(PACK_ORDER[b.pack]||2))
  .slice(0,nbArtisans);

const dispatched=[];
for(let i=0;i<sorted.length;i++){
  const pro=sorted[i];
  const creneau=creneaux[i]||creneaux[0]||null;
  const r=await fetch(SB+"/rest/v1/leads",{method:"POST",headers:{...H,"Prefer":"return=representation"},body:JSON.stringify({...body,lat,lon,statut:"dispatche",assigned_to:pro.id,creneaux:creneau?JSON.stringify([creneau]):"[]",heure:creneau?.label||"Sur RDV",user_id:body.user_id||null})});
  const leads=await r.json();
  const lead=leads?.[0];
  if(lead){
    dispatched.push(lead);
    fetch(SB+"/rest/v1/profiles?id=eq."+pro.id,{method:"PATCH",headers:H,body:JSON.stringify({rdv_restants:Math.max(0,(pro.rdv_restants||1)-1)})}).catch(()=>{});
    fetch("https://www.click-fix.fr/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"new_lead_pro",to:pro.email,data:{prenom:pro.prenom,client_nom:body.client_nom,travaux:body.travaux||body.precision,adresse:body.adresse,ville:body.ville,surface:body.surface,budget:body.budget,details:body.details||"",heure:creneau?.label||"Sur RDV"}})}).catch(()=>{});
  }
}

if(dispatched.length===0){
  await fetch(SB+"/rest/v1/leads",{method:"POST",headers:{...H,"Prefer":"return=minimal"},body:JSON.stringify({...body,lat,lon,statut:"en_attente",assigned_to:null,creneaux:JSON.stringify(creneaux),heure:creneaux[0]?.label||"Sur RDV",user_id:body.user_id||null})}).catch(()=>{});
}

res.status(200).json({ok:true,dispatched:dispatched.length});
}catch(e){res.status(500).json({error:e.message});}
}

// ===================== SEND-EMAIL =====================
async function sendEmail(req,res){
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
subject="Votre RDV est confirmé — Coordonnées de votre artisan";
html=wrap(`<div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;padding:12px 16px;margin-bottom:16px"><p style="margin:0;color:#22c55e;font-weight:700">Votre RDV est confirmé !</p></div><h2 style="color:#fff;margin:0 0 12px;font-size:20px">Bonjour ${data.client_prenom},</h2><p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 12px">Voici les coordonnées de votre artisan :</p>${box(row("Artisan",data.artisan_prenom+" "+data.artisan_nom)+row("Entreprise",data.artisan_entreprise||"-")+row("Téléphone",data.artisan_tel||"-")+row("Email",data.artisan_email||"-")+row("Créneau",data.creneau||"-"))}${btn("Voir mon espace","https://click-fix.fr")}`);
}
else if(type==="rappel_rdv_pro"){
subject="Rappel - Vous avez un RDV demain";
html=wrap(`<h2 style="color:#FBC005;margin:0 0 12px;font-size:22px">Rappel RDV demain !</h2><p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 12px">Bonjour ${data.prenom}, vous avez un RDV demain :</p>${box(row("Client",data.client_nom)+row("Adresse",data.adresse||"-")+row("Travaux",data.travaux)+row("Heure",data.creneau||"-"))}${btn("Voir les details","https://click-fix.fr","#FBC005")}`);
}
else if(type==="pack_active"){
subject="Votre pack Click&fix est activé — Récapitulatif";
html=wrap(`<h2 style="color:#FF6F00;margin:0 0 12px;font-size:22px">Pack ${data.pack_name} activé !</h2><p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px">Bonjour ${data.prenom}, votre pack a bien été activé. Voici le récapitulatif de votre offre :</p>${box(row("Pack",data.pack_name)+row("Nombre de RDV",data.pack_rdv+" RDV")+row("Prix",data.pack_prix+" EUR"+(data.abonnement?" / mois":""))+row("Tarif par RDV",data.pack_par)+row("Type",data.abonnement?"Abonnement mensuel":"Paiement unique")+row("Statut","Actif"))}<p style="color:#555;font-size:13px;margin:16px 0 8px">Vous allez bientôt recevoir vos premiers RDV qualifiés. Chaque lead sera attribué selon votre expertise.</p>${btn("Accéder à mon espace","https://click-fix.fr")}`);
}
else if(type==="recharge_needed"){
subject="Une demande de depannage vous attend - Rechargez votre pack";
html=wrap(`<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:12px 16px;margin-bottom:16px"><p style="margin:0;color:#ef4444;font-weight:700">Une demande de depannage urgent vous attend !</p></div><h2 style="color:#fff;margin:0 0 12px;font-size:20px">Bonjour ${data.prenom},</h2><p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 16px">Un client a selectionne votre profil pour un depannage urgent, mais votre quota de RDV est epuise. Rechargez votre pack pour acceder immediatement a cette demande.</p>${btn("Recharger mon pack","https://click-fix.fr","#ef4444")}`);
}
if(!subject)return res.status(400).json({error:"Type inconnu"});
try{
const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+KEY},body:JSON.stringify({from:"Click&fix <contact@click-fix.fr>",to:[to],subject,html})});
const result=await r.json();
res.status(200).json({ok:true,result});
}catch(e){res.status(500).json({error:e.message});}
}

// ===================== STRIPE-ONBOARD =====================
async function stripeOnboard(req,res){
if(req.method!=="POST")return res.status(405).end();
const {email,artisan_id}=typeof req.body==="string"?JSON.parse(req.body):req.body;
try{
const account=await stripe.accounts.create({type:"express",country:"FR",email,capabilities:{card_payments:{requested:true},transfers:{requested:true}}});
const accountLink=await stripe.accountLinks.create({account:account.id,refresh_url:"https://www.click-fix.fr?stripe=refresh",return_url:"https://www.click-fix.fr?stripe=success&id="+artisan_id,type:"account_onboarding"});
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
await fetch(SB+"/rest/v1/profiles?id=eq."+artisan_id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK},body:JSON.stringify({stripe_account_id:account.id})});
res.status(200).json({url:accountLink.url,account_id:account.id});
}catch(e){res.status(500).json({error:e.message});}
}

// ===================== STRIPE-WEBHOOK =====================
async function stripeWebhook(req,res){
if(req.method!=="POST")return res.status(405).end();
try{
const event=req.body;
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const H={"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};
const AMOUNTS={24900:{name:"Decouverte",rdv:5,total:5,prix:249,par:"49 EUR/RDV",abonnement:false},59900:{name:"Pro",rdv:15,total:15,prix:599,par:"39 EUR/RDV",abonnement:true},99900:{name:"Elite",rdv:30,total:30,prix:999,par:"33 EUR/RDV",abonnement:true}};
const t=event.type;
const obj=event.data?.object;
if(t==="checkout.session.completed"){
const email=obj?.customer_email||obj?.customer_details?.email;
const pack=AMOUNTS[obj?.amount_total];
if(email&&pack){
const profRes=await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(email)+"&select=id,pack,rdv_restants,rdv_total,prenom,packs_history,specialites",{headers:H});
const profs=await profRes.json();
const current=profs?.[0];
const now=new Date().toISOString();
const renewDate=new Date(Date.now()+30*24*60*60*1000).toISOString();
const newEntry={name:pack.name,rdv:pack.rdv,prix:pack.prix,date_achat:now,date_renouvellement:pack.abonnement?renewDate:null,abonnement:pack.abonnement,specialites:current?.specialites||[]};
let history=current?.packs_history||[];
if(pack.abonnement){history=history.filter(h=>!h.abonnement);}
history.push(newEntry);
let update={statut_paiement:"actif",packs_history:history};
if(pack.name==="Decouverte"&&current?.pack&&(current.pack==="Pro"||current.pack==="Elite")){
update.rdv_restants=(current.rdv_restants||0)+pack.rdv;
update.rdv_total=(current.rdv_total||0)+pack.rdv;
}else{
const rdvRestantsAncien=pack.abonnement&&current?.pack?(current.rdv_restants||0):0;
update.pack=pack.name;
update.rdv_restants=pack.rdv+rdvRestantsAncien;
update.rdv_total=pack.total+rdvRestantsAncien;
}
await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(email),{method:"PATCH",headers:H,body:JSON.stringify(update)});
await fetch("https://www.click-fix.fr/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"pack_active",to:email,data:{prenom:current?.prenom||"",pack_name:pack.name,pack_rdv:pack.rdv,pack_prix:pack.prix,pack_par:pack.par,abonnement:pack.abonnement}})});
if(current?.id&&update.rdv_restants>0){
let remaining=update.rdv_restants;
const pendingRes=await fetch(SB+"/rest/v1/leads?assigned_to=eq."+current.id+"&statut=eq.en_attente_recharge&order=created_at.asc&select=*",{headers:H});
const pendingRaw=await pendingRes.json();
const pendingList=Array.isArray(pendingRaw)?pendingRaw:[];
for(const pl of pendingList){
if(remaining<=0)break;
await fetch(SB+"/rest/v1/leads?id=eq."+pl.id,{method:"PATCH",headers:H,body:JSON.stringify({statut:"dispatche"})});
remaining--;
fetch("https://www.click-fix.fr/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"new_lead_pro",to:email,data:{prenom:current?.prenom||"",travaux:pl.travaux||pl.precision,adresse:pl.adresse,ville:pl.ville,surface:pl.surface,budget:pl.budget,details:pl.details||"",heure:"Immediatement"}})}).catch(()=>{});
}
if(remaining!==update.rdv_restants){
await fetch(SB+"/rest/v1/profiles?id=eq."+current.id,{method:"PATCH",headers:H,body:JSON.stringify({rdv_restants:remaining})});
}
}
return res.status(200).json({ok:true,email,pack:pack.name});
}}
if(t==="customer.subscription.deleted"){
const em=obj?.customer_email;
if(em)await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(em),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"expire",pack:null,rdv_restants:0})});
}
if(t==="invoice.payment_failed"){
const em=obj?.customer_email;
if(em)await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(em),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"impaye"})});
}
res.status(200).json({received:true,type:t});
}catch(e){res.status(500).json({error:e.message});}
}

// ===================== URGENCE-LEAD =====================
async function urgenceLead(req,res){
if(req.method!=="POST")return res.status(405).end();
const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const H={"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};
try{
const proId=body.assigned_to;
let pro=null;
if(proId){
const pr=await fetch(SB+"/rest/v1/profiles?id=eq."+proId+"&select=id,prenom,email,pack,rdv_restants,disponible",{headers:H});
const prs=await pr.json();
pro=Array.isArray(prs)&&prs[0]?prs[0]:null;
}
const modeUrgenceActif=pro&&pro.disponible===true;
const hasQuota=modeUrgenceActif&&(pro.pack==="Elite"||pro.pack==="Pro")&&(pro.rdv_restants||0)>0;
const statutLead=(pro&&modeUrgenceActif&&!hasQuota)?"en_attente_recharge":"dispatche";
const r=await fetch(SB+"/rest/v1/leads",{method:"POST",headers:{...H,"Prefer":"return=representation"},body:JSON.stringify({...body,statut:statutLead,heure:"Immédiatement",creneaux:"[]"})});
const leads=await r.json();
const lead=leads?.[0];
if(!lead)return res.status(500).json({error:"Lead non cree"});
if(pro&&hasQuota){
fetch(SB+"/rest/v1/profiles?id=eq."+pro.id,{method:"PATCH",headers:H,body:JSON.stringify({rdv_restants:Math.max(0,(pro.rdv_restants||1)-1)})}).catch(()=>{});
}
if(pro&&modeUrgenceActif&&!hasQuota){
fetch("https://www.click-fix.fr/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"recharge_needed",to:pro.email,data:{prenom:pro.prenom}})}).catch(()=>{});
}
res.status(200).json({ok:true,lead});
}catch(e){res.status(500).json({error:e.message});}
}

// ===================== CHECK-DEVIS =====================
async function checkDevis(req,res){
if(req.method!=="POST")return res.status(405).end();
const {image}=typeof req.body==="string"?JSON.parse(req.body):req.body;
if(!image||!image.startsWith("data:image"))return res.status(200).json({verdict:"non_analyse",raison:"Format non analysable - assurez-vous d avoir bien telecharge une image ou un PDF du devis"});
const prompt="Tu es un expert independant en batiment et travaux en France, specialiste de l analyse de devis pour proteger les particuliers contre les prix abusifs. Analyse l image de ce devis de travaux. Identifie le ou les postes de travaux et le montant total TTC indique. Compare ce montant aux tarifs reels du marche francais 2025-2026 pour ce type de travaux (en Ile-de-France si mentionne, sinon moyenne nationale). Reponds UNIQUEMENT en JSON sans markdown au format exact: {\"travaux_detecte\":\"description courte des travaux identifies sur le devis\",\"prix_detecte\":0,\"verdict\":\"coherent\",\"ecart_pct\":0,\"fourchette_min\":0,\"fourchette_max\":0,\"explication\":\"2 phrases courtes expliquant le verdict\"} ou verdict est coherent, eleve ou bas, et ecart_pct est positif si plus cher que la moyenne marche, negatif si moins cher. Si le prix n est pas clairement lisible sur le devis, mets prix_detecte a 0 et explique pourquoi dans explication.";
try{
const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
body:JSON.stringify({model:"meta-llama/llama-4-scout-17b-16e-instruct",max_tokens:400,messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:image}}]}]})
});
const d=await r.json();
const text=d.choices?.[0]?.message?.content||"{}";
const clean=text.replace(/```json|```/g,"").trim();
res.status(200).json(JSON.parse(clean));
}catch(e){res.status(500).json({verdict:"a_verifier",raison:"Analyse impossible pour le moment, reessayez"});}
}

// ===================== VERIFY-DOCUMENT =====================
async function verifyDocument(req,res){
if(req.method!=="POST")return res.status(405).end();
const {docType,docLabel,image}=typeof req.body==="string"?JSON.parse(req.body):req.body;
if(!image||!image.startsWith("data:image"))return res.status(200).json({verdict:"non_analyse",raison:"Format non analysable automatiquement (PDF ou autre) - verification manuelle requise"});
const prompt="Tu es un expert en verification de documents administratifs francais pour artisans du BTP. Analyse cette image et determine si c'est bien un document de type \""+(docLabel||docType)+"\" (Kbis = extrait du registre du commerce, Decennale = attestation assurance decennale, RC Pro = attestation assurance responsabilite civile professionnelle, RIB = releve d'identite bancaire, RGE = certificat de qualification RGE). Reponds UNIQUEMENT en JSON sans markdown au format exact: {\"type_detecte\":\"description courte de ce que tu vois\",\"correspond\":true,\"date_expiration\":\"YYYY-MM-DD ou null\",\"expire\":false,\"verdict\":\"valide\",\"raison\":\"phrase courte\"} ou verdict est valide, a_verifier ou invalide.";
try{
const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
body:JSON.stringify({model:"meta-llama/llama-4-scout-17b-16e-instruct",max_tokens:300,messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:image}}]}]})
});
const d=await r.json();
const text=d.choices?.[0]?.message?.content||"{}";
const clean=text.replace(/```json|```/g,"").trim();
res.status(200).json(JSON.parse(clean));
}catch(e){res.status(200).json({verdict:"a_verifier",raison:"Analyse impossible, verification manuelle recommandee"});}
}
