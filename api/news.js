export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
if(req.method!=='GET')return res.status(405).end();
const queries=['renovation maison','MaPrimeRenov travaux','plomberie electricite artisan'];
const q=queries[new Date().getHours()%3];
try{
const r=await fetch('https://gnews.io/api/v4/search?q='+encodeURIComponent(q)+'&lang=fr&max=3&apikey=721a3b648841d84f034ba9a8a2af72f9');
const d=await r.json();
const arts=(d.articles||[]).filter(a=>a.image&&a.title).slice(0,3).map(a=>({
title:a.title,
description:a.description,
urlToImage:a.image,
url:a.url,
source:{name:a.source&&a.source.name?a.source.name:'Actualite'}
}));
res.status(200).json({articles:arts});
}catch(e){res.status(500).json({error:e.message});}
}
