export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
if(req.method!=='GET')return res.status(405).end();
const queries=['renovation maison','MaPrimeRenov','plomberie electricite'];
const results=[];
for(const q of queries){
  try{
    const r=await fetch('https://gnews.io/api/v4/search?q='+encodeURIComponent(q)+'&lang=fr&max=2&apikey=721a3b648841d84f034ba9a8a2af72f9');
    const d=await r.json();
    const art=(d.articles||[]).find(a=>a.image&&a.title&&!results.find(x=>x.title===a.title));
    if(art)results.push({title:art.title,description:art.description,urlToImage:art.image,url:art.url,source:{name:art.source?.name||'Actualite'}});
  }catch(e){}
}
res.status(200).json({articles:results.slice(0,3)});
}
