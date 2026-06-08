export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const {image,description}=typeof req.body==="string"?JSON.parse(req.body):req.body;
try{
const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
body:JSON.stringify({
model:"meta-llama/llama-4-scout-17b-16e-instruct",
max_tokens:500,
messages:[{
role:"user",
content:[
{type:"text",text:"Tu es un expert en rénovation et dépannage. Analyse ce problème et réponds UNIQUEMENT en JSON avec ce format exact: {\"diagnostic\":\"...\",\"materiel\":[\"...\"],\"duree\":\"...\",\"urgence\":\"critique|urgent|normal\",\"conseils\":\"...\"}. Description du client: "+description},
{type:"image_url",image_url:{url:image}}
]
}]
})
});
const d=await r.json();
const text=d.choices?.[0]?.message?.content||"{}";
const clean=text.replace(/```json|```/g,"").trim();
res.status(200).json(JSON.parse(clean));
}catch(e){res.status(500).json({error:e.message});}
}
