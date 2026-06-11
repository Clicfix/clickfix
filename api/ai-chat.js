export default async function handler(req,res){
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
