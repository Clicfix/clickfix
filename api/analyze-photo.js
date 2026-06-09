export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const {image,description}=typeof req.body==="string"?JSON.parse(req.body):req.body;
const prompt="Tu es un expert en rénovation et dépannage en France avec 20 ans d experience. Analyse ce problème et réponds UNIQUEMENT en JSON sans markdown avec des prix PRÉCIS en euros basés sur les tarifs réels du marché français 2025. Format: {\"diagnostic\":\"description précise du problème\",\"materiel\":[\"matériel1\",\"matériel2\"],\"duree\":\"ex: 1h30\",\"prix_min\":\"ex: 150€\",\"prix_max\":\"ex: 280€\",\"main_oeuvre\":\"ex: 80€/h\",\"urgence\":\"critique|urgent|normal\",\"conseils\":\"conseil pratique\"}. Description du problème: "+description;
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
