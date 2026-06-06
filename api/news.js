export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
if(req.method!=='GET')return res.status(405).end();
const queries=['renovation maison France','MaPrimeRenov travaux 2025','plomberie electricite chauffage artisan'];
const q=queries[new Date().getHours()%3];
try{
const r=await fetch('https://newsapi.org/v2/everything?q='+encodeURIComponent(q)+'&language=fr&pageSize=6&sortBy=publishedAt&apiKey=21bcbe2b29014aae899dc18103c1c35d');
const d=await r.json();
const arts=(d.articles||[]).filter(a=>a.urlToImage&&a.title&&!a.title.includes('[Removed]')).slice(0,3);
res.status(200).json({articles:arts});
}catch(e){res.status(500).json({error:e.message});}
}
