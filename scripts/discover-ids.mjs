// Takım ve lig ID'lerini kaynaklardan doğrula. Sonucu elle config/club.ts içine yaz.
// ESPN anahtar istemez. API-Football için API_FOOTBALL_KEY ortam değişkeni (isteğe bağlı).
const SITE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

const get = async (url, headers = {}) => {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};

console.log('== ESPN: Süper Lig (tur.1) takımları');
const teams = await get(`${SITE}/tur.1/teams`);
for (const { team } of teams.sports[0].leagues[0].teams) {
  if (/be[sş]ikta[sş]/i.test(team.displayName))
    console.log(`  teamId=${team.id} ${team.displayName}`);
}

const key = process.env.API_FOOTBALL_KEY;
if (key) {
  const h = { 'x-apisports-key': key };
  const base = 'https://v3.football.api-sports.io';
  console.log('\n== API-Football: /teams?search=besiktas');
  for (const r of (await get(`${base}/teams?search=besiktas`, h)).response) {
    console.log(`  ${r.team.id} ${r.team.name} (${r.team.country})`);
  }
  console.log('\n== API-Football: /leagues?country=Turkey');
  for (const r of (await get(`${base}/leagues?country=Turkey`, h)).response) {
    console.log(`  ${r.league.id} ${r.league.name} [${r.league.type}]`);
  }
} else {
  console.log('\nAPI_FOOTBALL_KEY yok: API-Football adımı atlandı.');
}
