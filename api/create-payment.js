import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export default async function handler(req,res){
if(req.method!=="POST")return res.status(405).end();
const {amount,currency="eur",lead_id,client_email,description,connected_account}=typeof req.body==="string"?JSON.parse(req.body):req.body;
try{
const params={
amount:Math.round(amount*100),
currency,
capture_method:"manual",
description:description||"Intervention Click&fix",
metadata:{lead_id:lead_id||"",platform:"clickfix"}
};
if(client_email)params.receipt_email=client_email;
if(connected_account){
params.application_fee_amount=Math.round(amount*100*0.15);
params.transfer_data={destination:connected_account};
}
const paymentIntent=await stripe.paymentIntents.create(params);
res.status(200).json({client_secret:paymentIntent.client_secret,payment_intent_id:paymentIntent.id});
}catch(e){res.status(500).json({error:e.message});}
}
