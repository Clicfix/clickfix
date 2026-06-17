export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const body=typeof req.body==="string"?JSON.parse(req.body):req.body;
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const H={"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};

function haversine(la1,lo1,la2,lo2){
  const R=6371;
  const dLat=(la2-la1)*Math.PI/180;
  const dLon=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function normalize(s){
  return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function matchKeywords(leadDesc,proSpecialites){
  if(!proSpecialites||proSpecialites.length===0)return false;
  const desc=normalize(leadDesc);
  const specs=proSpecialites.map(s=>normalize(s));
  const words=desc.split(/[\s,&/\-]+/).filter(w=>w.length>2);
  for(const spec of specs){
    const specWords=spec.split(/[\s,&/\-]+/).filter(w=>w.length>2);
    for(const sw of specWords){
      for(const w of words){
        if(sw===w||sw.includes(w)||w.includes(sw))return true;
      }
    }
  }
  return false;
}

try{
let lat=body.lat||null,lon=body.lon||null;
if(!lat&&(body.adresse||body.ville)){
  try{
    const q=encodeURIComponent((body.adresse||"")+" "+(body.ville||"")+" France");
    const g=await fetch("https://api-adresse.data.gouv.fr/search/?q="+q+"&limit=1",{headers:{"User-Agent":"clickfix/1.0"}});
    const d=await g.json();
    if(d?.features?.[0]){lat=d.features[0].geometry.coordinates[1];lon=d.features[0].geometry.coordinates[0];}
  }catch(e){}
}

const creneaux=typeof body.creneaux==='string'?JSON.parse(body.creneaux||'[]'):(body.creneaux||[]);
const nbArtisans=parseInt(body.nb_artisans)||3;
const leadDesc=(body.precision||body.travaux||"")+" "+(body.details||"");

const prosRes=await fetch(SB+"/rest/v1/profiles?role=eq.pro&statut_paiement=eq.actif&select=*",{headers:H});
const prosRaw=await prosRes.json();
const pros=Array.isArray(prosRaw)?prosRaw:[];

const PACK_ORDER={"Elite":0,"Pro":1,"Decouverte":2};
const sorted=pros
  .filter(p=>p&&(p.rdv_restants||0)>0&&p.specialites?.length>0)
  .filter(p=>matchKeywords(leadDesc,p.specialites))
  .filter(p=>{
    if(p.lat&&p.lon&&lat&&lon){
      const dist=haversine(parseFloat(p.lat),parseFloat(p.lon),parseFloat(lat),parseFloat(lon));
      const rayon=parseInt((p.rayon||"50").replace(/[^0-9]/g,""))||50;
      return dist<=rayon;
    }
    return true;
  })
  .sort((a,b)=>(PACK_ORDER[a.pack]||2)-(PACK_ORDER[b.pack]||2))
  .slice(0,nbArtisans);

const dispatched=[];
for(let i=0;i<sorted.length;i++){
  const pro=sorted[i];
  const creneau=creneaux[i]||creneaux[0]||null;
  const r=await fetch(SB+"/rest/v1/leads",{method:"POST",headers:{...H,"Prefer":"return=representation"},body:JSON.stringify({...body,lat,lon,statut:"dispatche",assigned_to:pro.id,creneaux:creneau?JSON.stringify([creneau]):"[]",heure:creneau?.label||"Sur RDV",user_id:body.user_id||null})});
  const leads=await r.json();
  const lead=leads?.[0];
  if(lead){
    dispatched.push(lead);
    fetch(SB+"/rest/v1/profiles?id=eq."+pro.id,{method:"PATCH",headers:H,body:JSON.stringify({rdv_restants:Math.max(0,(pro.rdv_restants||1)-1)})}).catch(()=>{});
    fetch("https://www.click-fix.fr/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"new_lead_pro",to:pro.email,data:{prenom:pro.prenom,client_nom:body.client_nom,travaux:body.travaux||body.precision,adresse:body.adresse,ville:body.ville,surface:body.surface,budget:body.budget,details:body.details||"",heure:creneau?.label||"Sur RDV"}})}).catch(()=>{});
  }
}

if(dispatched.length===0){
  await fetch(SB+"/rest/v1/leads",{method:"POST",headers:{...H,"Prefer":"return=minimal"},body:JSON.stringify({...body,lat,lon,statut:"en_attente",assigned_to:null,creneaux:JSON.stringify(creneaux),heure:creneaux[0]?.label||"Sur RDV",user_id:body.user_id||null})}).catch(()=>{});
}

res.status(200).json({ok:true,dispatched:dispatched.length});
}catch(e){res.status(500).json({error:e.message});}
}
