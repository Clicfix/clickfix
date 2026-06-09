export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const {image,description}=typeof req.body==="string"?JSON.parse(req.body):req.body;
try{
const messages=[{
role:"user",
content:image?[
{type:"text",text:"Tu es un expert en rénovation et dépannage en France. Analyse ce problème et réponds UNIQUEMENT en JSON avec ce format exact sans markdown: {\"diagnostic\":\"...\",\"materiel\":[\"...\"],\"duree\":\"...\",\"prix_min\":\"...\",\"prix_max\":\"...\",\"urgence\":\"critique|urgent|normal\",\"conseils\":\"...\"}. Description: "+description},
{type:"image_url",image_url:{url:image}}
]:[{type:"text",text:"Tu es un expert en rénovation et dépannage en France. Analyse ce problème et réponds UNIQUEMENT en JSON sans markdown: {\"diagnostic\":\"...\",\"materiel\":[\"...\"],\"duree\":\"...\",\"prix_min\":\"...\",\"prix_max\":\"...\",\"urgence\":\"critique|urgent|normal\",\"conseils\":\"...\"}. Description: "+description}]
}];
const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
body:JSON.stringify({
model:image?"meta-llama/llama-4-scout-17b-16e-instruct":"llama-3.3-70b-versatile",
max_tokens:600,
messages
})
});
const d=await r.json();
const text=d.choices?.[0]?.message?.content||"{}";
const clean=text.replace(/```json|```/g,"").trim();
res.status(200).json(JSON.parse(clean));
}catch(e){res.status(500).json({error:e.message});}
}
