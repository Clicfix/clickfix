export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
try{
const event=req.body;
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const H={"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};
const AMOUNTS={24900:{name:"Decouverte",rdv:5,total:5},59900:{name:"Pro",rdv:15,total:15},99900:{name:"Elite",rdv:30,total:30}};
const t=event.type;
const obj=event.data?.object;
let email=null,pack=null;
if(t==="checkout.session.completed"){
email=obj?.customer_email||obj?.customer_details?.email;
const amount=obj?.amount_total;
pack=AMOUNTS[amount];
console.log("checkout email:",email,"amount:",amount,"pack:",pack?.name);
}
if(t==="charge.succeeded"){
email=obj?.billing_details?.email||obj?.receipt_email;
const amount=obj?.amount;
pack=AMOUNTS[amount];
console.log("charge email:",email,"amount:",amount,"pack:",pack?.name);
}
if(email&&pack){
console.log("Updating profile:",email,pack.name,pack.rdv);
const r=await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(email),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"actif",pack:pack.name,rdv_restants:pack.rdv,rdv_total:pack.total})});
const d=await r.json();
console.log("Supabase result:",JSON.stringify(d));
}
if(t==="customer.subscription.deleted"){
const em=obj?.customer_email;
if(em)await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(em),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"expire",pack:null,rdv_restants:0})});
}
if(t==="invoice.payment_failed"){
const em=obj?.customer_email;
if(em)await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(em),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"impaye"})});
}
res.status(200).json({received:true,type:t,email,pack:pack?.name});
}catch(e){
console.error(e);
res.status(500).json({error:e.message});
}
}
