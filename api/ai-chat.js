export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
const messages=body.messages||(body.history?[...body.history,{role:"user",content:body.message}]:null);
if(!messages)return res.status(400).json({error:"messages required"});
const prenom=body.prenom||"";
try{
const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
body:JSON.stringify({
model:"llama-3.3-70b-versatile",
max_tokens:1000,
messages:[
{role:"system",content:`Tu es un assistant pour la plateforme Click&fix qui met en relation particuliers et artisans en France. Ton role est de collecter les informations du projet de travaux du client de facon naturelle et conversationnelle. Tu dois collecter: 1) Type de travaux et specialite exacte (ex: Renovation/Parquet), 2) Adresse complete du chantier, 3) Surface approximative, 4) Budget estimatif, 5) Au moins 3 creneaux de disponibilite (date et heure). Pose une question a la fois. Quand tu as TOUTES les infos, reponds UNIQUEMENT avec un JSON dans une balise <LEAD>{"travaux":"categorie","precision":"specialite exacte","adresse":"adresse complete","ville":"ville","code_postal":"CP","surface":"surface","budget":"budget","slots":[{"key":"01/07/2026_14:00","date":"01/07/2026","hour":"14:00","label":"01/07/2026 a 14:00"}]}</LEAD>. Sois chaleureux et professionnel. Reponds en francais.`},
...messages
]})});
const d=await r.json();
const text=d.choices?.[0]?.message?.content||"";
res.status(200).json({text});
}catch(e){res.status(500).json({error:e.message});}
}
