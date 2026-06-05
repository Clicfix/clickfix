export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const H={"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};
function haversine(la1,lo1,la2,lo2){const R=6371;const dLat=(la2-la1)*Math.PI/180;const dLon=(lo2-lo1)*Math.PI/180;const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
try{
let lat=body.lat||null,lon=body.lon||null;
if(!lat&&(body.adresse||body.ville)){
try{const q=encodeURIComponent((body.adresse||"")+" "+(body.ville||"")+" France");const g=await fetch("https://api-adresse.data.gouv.fr/search/?q="+q+"&limit=1",{headers:{"User-Agent":"clickfix/1.0"}});const d=await g.json();if(d?.features?.[0]){lat=d.features[0].geometry.coordinates[1];lon=d.features[0].geometry.coordinates[0];}}catch(e){}}
const r=await fetch(SB+"/rest/v1/leads",{method:"POST",headers:{...H,"Prefer":"return=representation"},body:JSON.stringify({...body,lat,lon,statut:"en attente"})});
const leads=await r.json();
const lead=leads?.[0];
if(!lead)return res.status(500).json({error:"Lead non cree"});
const travaux=(body.precision||body.travaux||"").toLowerCase();
const nbArtisans=parseInt(body.nb_artisans)||3;
const prosRes=await fetch(SB+"/rest/v1/profiles?role=eq.pro&statut_paiement=eq.actif&select=*",{headers:H});
const pros=await prosRes.json();
const PACK_ORDER={"Elite":0,"Pro":1,"Decouverte":2};
const matching=pros.filter(p=>{
if((p.rdv_restants||0)<=0)return false;
if(!p.specialites||p.specialites.length===0)return false;
const specOk=p.specialites.some(s=>travaux.includes(s.toLowerCase())||s.toLowerCase().includes(travaux.split(" ")[0]));
if(!specOk)return false;
if(p.lat&&lat){const dist=haversine(p.lat,p.lon,lat,lon);const rayon=parseInt((p.rayon||"50").replace(/[^0-9]/g,""));if(dist>rayon)return false;}
return true;
}).sort((a,b)=>(PACK_ORDER[a.pack]||2)-(PACK_ORDER[b.pack]||2));
const toSend=matching.slice(0,nbArtisans);
for(const pro of toSend){
await fetch(SB+"/rest/v1/profiles?id=eq."+pro.id,{method:"PATCH",headers:H,body:JSON.stringify({rdv_restants:Math.max(0,(pro.rdv_restants||1)-1)})});
await fetch(SB+"/rest/v1/leads?id=eq."+lead.id,{method:"PATCH",headers:H,body:JSON.stringify({assigned_to:pro.id,statut:"dispatche"})});
await fetch("https://www.click-fix.fr/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"new_lead_pro",to:pro.email,data:{prenom:pro.prenom,client_nom:body.client_nom,travaux:body.travaux||body.precision,adresse:body.adresse,ville:body.ville,surface:body.surface,budget:body.budget,heure:body.creneaux?.[0]?.label||""}})});
}
res.status(200).json({ok:true,lead,dispatched:toSend.length});
}catch(e){res.status(500).json({error:e.message});}
}
