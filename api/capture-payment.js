import Stripe from 'stripe';
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const{payment_intent_id,amount_final}=typeof req.body==="string"?JSON.parse(req.body):req.body;
try{
const pi=await stripe.paymentIntents.capture(payment_intent_id,{amount_to_capture:Math.round(amount_final*100)});
res.status(200).json({success:true,status:pi.status,amount:pi.amount_received});
}catch(e){res.status(500).json({error:e.message});}
}
