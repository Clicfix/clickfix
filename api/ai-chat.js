export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
const messages=body.messages||(body.history?[...body.history,{role:"user",content:body.message}]:null);
if(!messages)return res.status(400).json({error:"messages required"});
const prompt=`Tu es un assistant expert en travaux pour Click&fix. REGLES: 1) Pose UNE seule question a la fois. 2) Adapte tes questions au type de travaux - pour une serrure cassee ou panne chaudiere NE demande pas la superficie. 3) NE demande JAMAIS l adresse ni les creneaux. 4) Pour depannage urgent (serrure, fuite, panne electrique, chaudiere): demande le probleme exact, marque/modele si utile. 5) Pour renovation (parquet, peinture, carrelage, cuisine): demande surface et materiaux souhaites. 6) Pour gros oeuvre: demande dimensions et type. 7) Demande le budget seulement si pertinent. Des que tu as assez d infos, reponds UNIQUEMENT avec ce JSON dans une balise <LEAD>{"travaux":"categorie","precision":"details complets","surface":"si pertinent sinon null","budget":"si pertinent sinon null","urgence":false,"description":"resume du probleme"}</LEAD>. Sois chaleureux, empathique si urgence, professionnel. Reponds en francais.`;
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
