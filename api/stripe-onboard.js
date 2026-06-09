import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const {email,artisan_id}=typeof req.body==="string"?JSON.parse(req.body):req.body;
try{
const account=await stripe.accounts.create({type:"express",country:"FR",email,capabilities:{card_payments:{requested:true},transfers:{requested:true}}});
const accountLink=await stripe.accountLinks.create({account:account.id,refresh_url:"https://www.click-fix.fr?stripe=refresh",return_url:"https://www.click-fix.fr?stripe=success&id="+artisan_id,type:"account_onboarding"});
const SB="https://bipqtqezntzcmxwiaqdz.supabase.co";
const SK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcHF0cWV6bnR6Y214d2lhcWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA3OTkxMCwiZXhwIjoyMDk1NjU1OTEwfQ.NJxvcp7MJEGbpNmvjkwDGc4CJCswcoLZdGUSw0EDisU";
await fetch(SB+"/rest/v1/profiles?id=eq."+artisan_id,{method:"PATCH",headers:{"Content-Type":"application/json","apikey":SK,"Authorization":"Bearer "+SK},body:JSON.stringify({stripe_account_id:account.id})});
res.status(200).json({url:accountLink.url,account_id:account.id});
}catch(e){res.status(500).json({error:e.message});}
}
