export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
if(req.method!=='GET')return res.status(405).end();
const feeds=[
  'https://www.batiactu.com/rss.php',
  'https://www.lemoniteur.fr/rss/actualites.xml',
  'https://api.rss2json.com/v1/api.json?rss_url=https://www.batiactu.com/rss.php&api_key=free&count=5',
];
try{
  const results=[];
  const rssUrls=[
    'https://www.batiactu.com/rss.php',
    'https://www.lemoniteur.fr/rss/actualites.xml',
    'https://www.laconstruction.fr/feed'
  ];
  for(const url of rssUrls){
    if(results.length>=3)break;
    try{
      const apiUrl='https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(url)+'&count=3';
      const r=await fetch(apiUrl);
      const d=await r.json();
      if(d.status==='ok'&&d.items?.length>0){
        const item=d.items.find(i=>i.thumbnail&&i.title&&!results.find(x=>x.title===i.title));
        if(item){
          results.push({
            title:item.title,
            description:item.description?.replace(/<[^>]*>/g,'').slice(0,150)||'',
            urlToImage:item.thumbnail,
            url:item.link,
            source:{name:d.feed?.title||'Actualite'}
          });
        }
      }
    }catch(e){}
  }
  if(results.length>0)return res.status(200).json({articles:results});
  throw new Error('No articles');
}catch(e){
  const fallback=[
    {title:"MaPrimeRenov 2025 : tout ce qui change",description:"Le gouvernement a revu les conditions d acces aux aides a la renovation energetique.",urlToImage:"https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",url:"https://www.service-public.fr/particuliers/vosdroits/F35083",source:{name:"Service-Public.fr"}},
    {title:"Renovation : les prix moyens en 2025",description:"Salle de bain : 8 000 a 15 000 euros. Cuisine : 5 000 a 20 000 euros.",urlToImage:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",url:"https://www.travaux.com/renovation/guide-des-prix",source:{name:"Travaux.com"}},
    {title:"Comment bien choisir son artisan ?",description:"SIRET, assurance decennale, devis detaille : les points essentiels a verifier.",urlToImage:"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",url:"https://www.economie.gouv.fr/particuliers/choisir-artisan",source:{name:"Economie.gouv.fr"}}
  ];
  res.status(200).json({articles:fallback});
}
}
