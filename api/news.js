export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
if(req.method!=='GET')return res.status(405).end();
const feeds=[
  'https://www.seloger.com/rss/actualites.xml',
  'https://www.journaldunet.com/patrimoine/rss/',
  'https://www.batirama.com/feed.xml',
  'https://www.lebatimentnumerique.fr/feed',
  'https://www.batinfo.com/feed/'
];
const results=[];
for(const url of feeds){
  if(results.length>=3)break;
  try{
    const apiUrl='https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(url)+'&count=5';
    const r=await fetch(apiUrl,{headers:{'User-Agent':'Mozilla/5.0'}});
    const d=await r.json();
    if(d.status==='ok'&&d.items?.length>0){
      for(const item of d.items){
        if(results.length>=3)break;
        const img=item.thumbnail||item.enclosure?.link||d.feed?.image||null;
        if(item.title&&!results.find(x=>x.title===item.title)){
          results.push({
            title:item.title,
            description:(item.description||'').replace(/<[^>]*>/g,'').slice(0,150),
            urlToImage:img||'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600&q=80',
            url:item.link,
            source:{name:d.feed?.title||'Actualite'}
          });
        }
      }
    }
  }catch(e){}
}
if(results.length>0)return res.status(200).json({articles:results});
res.status(200).json({articles:[
  {title:"MaPrimeRenov 2025 : tout ce qui change",description:"Le gouvernement a revu les conditions d acces aux aides a la renovation energetique.",urlToImage:"https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",url:"https://www.service-public.fr/particuliers/vosdroits/F35083",source:{name:"Service-Public.fr"}},
  {title:"Renovation : les prix moyens en 2025",description:"Salle de bain : 8 000 a 15 000 euros. Cuisine : 5 000 a 20 000 euros.",urlToImage:"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",url:"https://www.travaux.com/renovation/guide-des-prix",source:{name:"Travaux.com"}},
  {title:"Comment bien choisir son artisan ?",description:"SIRET, assurance decennale, devis detaille : les points essentiels a verifier.",urlToImage:"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",url:"https://www.economie.gouv.fr/particuliers/choisir-artisan",source:{name:"Economie.gouv.fr"}}
]});
}
