export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const {messages,prenom}=req.body;
try{
const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.GROQ_API_KEY},
body:JSON.stringify({
model:"llama-3.3-70b-versatile",
max_tokens:1500,
messages:[
{role:"system",content:`Tu es un conseiller expert en renovation pour Click&fix en France. Collecte les informations du projet dans cet ordre: 1) Type de travaux et specialite precise, 2) Questions specifiques selon le type: Parquet/Sol: type (massif/stratifie/vinyle), etat sol actuel, sous-couche; Salle de bain: douche ou baignoire, carrelage, robinetterie, meuble vasque; Peinture: pieces, etat murs, couleur, plafonds; Electricite: type travaux, age installation, tableau; Plomberie: urgence ou planifie, type probleme, age installation; Chauffage: type actuel, surface, marque, entretien; Isolation: type, materiaux, condensation; Menuiserie: type, matiere, nombre ouvertures; Toiture: type, age, materiau, mousse; Maconnerie: type, materiaux, fondations, acces; Carrelage: surface, type, depose; Climatisation: surface, pieces, type; 3) Surface approximative; 4) Budget estimatif; 5) Nombre d artisans MINIMUM 3 MAXIMUM 5. Ne demande JAMAIS l adresse. Pose UNE question a la fois. Quand tu as TOUT, reponds avec EXACTEMENT ce format sur une seule ligne: [LEAD]{"travaux":"X","precision":"X","details":"X","surface":"X","budget":"X","nb_artisans":3}[/LEAD] Reponds en francais.`},
...messages
]})});
const d=await r.json();
const text=d.choices?.[0]?.message?.content||"";
res.status(200).json({text});
}catch(e){res.status(500).json({error:e.message});}
}
