import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const {amount,currency="eur",lead_id,client_email,description,connected_account}=typeof req.body==="string"?JSON.parse(req.body):req.body;
try{
const paymentIntent=await stripe.paymentIntents.create({
amount:Math.round(amount*100),
currency,
capture_method:"manual",
description:description||"Intervention Click&fix",
receipt_email:client_email||undefined,
metadata:{lead_id:lead_id||"",platform:"clickfix"},
application_fee_amount:Math.round(amount*100*0.15),
transfer_data:connected_account?{destination:connected_account}:undefined
});
res.status(200).json({client_secret:paymentIntent.client_secret,payment_intent_id:paymentIntent.id});
}catch(e){res.status(500).json({error:e.message});}
}
