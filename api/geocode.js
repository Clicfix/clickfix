export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { address } = body;
  if (!address) return res.status(400).json({ error: "Adresse manquante" });
  try {
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(address);
    const r = await fetch(url, { headers: { "User-Agent": "clickfix/1.0 contact@click-fix.fr" } });
    const data = await r.json();
    if (!data || data.length === 0) return res.status(404).json({ error: "Adresse introuvable" });
    res.status(200).json({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
