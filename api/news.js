export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
if(req.method!=='GET')return res.status(405).end();
try{
const r=await fetch('https://gnews.io/api/v4/search?q=renovation+OR+artisan+OR+travaux+OR+MaPrimeRenov+OR+plomberie+OR+electricite&lang=fr&max=10&apikey=721a3b648841d84f034ba9a8a2af72f9');
const d=await r.json();
const seen=new Set();
const arts=(d.articles||[]).filter(a=>{
  if(!a.image||!a.title||seen.has(a.title))return false;
  seen.add(a.title);
  return true;
}).map(a=>({title:a.title,description:a.description,urlToImage:a.image,url:a.url,source:{name:a.source?.name||'Actualite'}}));
res.status(200).json({articles:arts});
}catch(e){res.status(500).json({error:e.message});}
}
