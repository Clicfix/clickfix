export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const H={"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};
try{
const r=await fetch(SB+"/rest/v1/leads",{method:"POST",headers:{...H,"Prefer":"return=representation"},body:JSON.stringify({...body,statut:"dispatche",heure:"Immédiatement",creneaux:"[]"})});
const leads=await r.json();
const lead=leads?.[0];
if(!lead)return res.status(500).json({error:"Lead non cree"});
res.status(200).json({ok:true,lead});
}catch(e){res.status(500).json({error:e.message});}
}
