export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
try{
const event=req.body;
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const H={"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};
const AMOUNTS={24900:{name:"Decouverte",rdv:5,total:5,prix:249,par:"49 EUR/RDV",abonnement:false},59900:{name:"Pro",rdv:15,total:15,prix:599,par:"39 EUR/RDV",abonnement:true},99900:{name:"Elite",rdv:30,total:30,prix:999,par:"33 EUR/RDV",abonnement:true}};
const t=event.type;
const obj=event.data?.object;
if(t==="checkout.session.completed"){
const email=obj?.customer_email||obj?.customer_details?.email;
const pack=AMOUNTS[obj?.amount_total];
if(email&&pack){
await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(email),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"actif",pack:pack.name,rdv_restants:pack.rdv,rdv_total:pack.total})});
const profRes=await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(email)+"&select=prenom",{headers:H});
const prof=await profRes.json();
const prenom=prof?.[0]?.prenom||"";
await fetch("https://www.click-fix.fr/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"pack_active",to:email,data:{prenom,pack_name:pack.name,pack_rdv:pack.rdv,pack_prix:pack.prix,pack_par:pack.par,abonnement:pack.abonnement}})});
return res.status(200).json({ok:true,email,pack:pack.name});
}
}
if(t==="customer.subscription.deleted"){
const em=obj?.customer_email;
if(em)await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(em),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"expire",pack:null,rdv_restants:0})});
}
if(t==="invoice.payment_failed"){
const em=obj?.customer_email;
if(em)await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(em),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"impaye"})});
}
res.status(200).json({received:true,type:t});
}catch(e){res.status(500).json({error:e.message});}
}
