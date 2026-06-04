export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
try{
const event=req.body;
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
const H={"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK};
const AMOUNTS={24900:{name:"Decouverte",rdv:5,total:5},59900:{name:"Pro",rdv:15,total:15},99900:{name:"Elite",rdv:30,total:30}};
const PRICES={"price_1TclbHRyxerWKxWhTNUQcpsz":{name:"Decouverte",rdv:5,total:5},"price_1TclozRyxerWKxWhMKwd8Ar2":{name:"Pro",rdv:15,total:15},"price_1TclhzRyxerWKxWhph7X0DO1":{name:"Elite",rdv:30,total:30}};
const t=event.type;
const obj=event.data?.object;
let email=null,pack=null;
if(t==="charge.succeeded"||t==="charge.updated"||t==="payment_intent.succeeded"){
email=obj?.receipt_email||obj?.billing_details?.email||obj?.charges?.data?.[0]?.billing_details?.email;
const amount=obj?.amount||obj?.amount_received;
pack=AMOUNTS[amount];
}
if(t==="checkout.session.completed"){
email=obj?.customer_email||obj?.customer_details?.email;
const priceId=obj?.line_items?.data?.[0]?.price?.id;
pack=PRICES[priceId]||AMOUNTS[obj?.amount_total];
}
if(t==="invoice.paid"){
email=obj?.customer_email;
const priceId=obj?.lines?.data?.[0]?.price?.id;
pack=PRICES[priceId];
}
if(email&&pack){
const paid=obj?.status==="succeeded"||obj?.paid||t==="checkout.session.completed"||t==="invoice.paid";
if(paid){
await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(email),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"actif",pack:pack.name,rdv_restants:pack.rdv,rdv_total:pack.total})});
}}
if(t==="customer.subscription.deleted"){
const em=obj?.customer_email;
if(em)await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(em),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"expire",pack:null,rdv_restants:0})});
}
if(t==="invoice.payment_failed"){
const em=obj?.customer_email;
if(em)await fetch(SB+"/rest/v1/profiles?email=eq."+encodeURIComponent(em),{method:"PATCH",headers:H,body:JSON.stringify({statut_paiement:"impaye"})});
}
res.status(200).json({received:true});
}catch(e){res.status(500).json({error:e.message});}
}
