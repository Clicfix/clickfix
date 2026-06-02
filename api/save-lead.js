export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const H={"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};
try{
let lat=null,lon=null;
const address=body.ville||body.adresse||"";
if(address){try{const g=await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q="+encodeURIComponent(address+", France"),{headers:{"User-Agent":"clickfix/1.0 contact@click-fix.fr"}});const d=await g.json();if(d&&d[0]){lat=parseFloat(d[0].lat);lon=parseFloat(d[0].lon);}}catch(e){}}
const r=await fetch(SB+"/rest/v1/leads",{method:"POST",headers:{...H,"Prefer":"return=representation"},body:JSON.stringify({...body,lat,lon})});
const result=await r.json();
res.status(200).json({ok:true,result});
}catch(e){res.status(500).json({error:e.message});}
}
