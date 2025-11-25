// Team Logos Database - Using official API-Football CDN
// This avoids hitting API rate limits by using direct CDN URLs

interface TeamLogo {
  name: string;
  logo: string;
  variations?: string[]; // Alternative team names
}

const teamLogos: TeamLogo[] = [
  // PREMIER LEAGUE
  { name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png", variations: ["Man City", "City"] },
  { name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" },
  { name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" },
  { name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
  { name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png", variations: ["Man United", "United"] },
  { name: "Tottenham", logo: "https://media.api-sports.io/football/teams/47.png", variations: ["Spurs"] },
  { name: "Newcastle", logo: "https://media.api-sports.io/football/teams/34.png", variations: ["Newcastle United"] },
  { name: "Aston Villa", logo: "https://media.api-sports.io/football/teams/66.png", variations: ["Villa"] },
  { name: "Brighton", logo: "https://media.api-sports.io/football/teams/51.png", variations: ["Brighton & Hove Albion"] },
  { name: "West Ham", logo: "https://media.api-sports.io/football/teams/48.png", variations: ["West Ham United"] },
  
  // LA LIGA
  { name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png", variations: ["Barça", "FC Barcelona"] },
  { name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png", variations: ["Madrid"] },
  { name: "Atletico Madrid", logo: "https://media.api-sports.io/football/teams/530.png", variations: ["Atlético", "Atleti"] },
  { name: "Sevilla", logo: "https://media.api-sports.io/football/teams/536.png", variations: ["Sevilla FC"] },
  { name: "Real Sociedad", logo: "https://media.api-sports.io/football/teams/548.png", variations: ["Sociedad"] },
  { name: "Villarreal", logo: "https://media.api-sports.io/football/teams/533.png" },
  { name: "Athletic Bilbao", logo: "https://media.api-sports.io/football/teams/531.png", variations: ["Athletic Club"] },
  { name: "Real Betis", logo: "https://media.api-sports.io/football/teams/543.png", variations: ["Betis"] },
  
  // SERIE A
  { name: "Juventus", logo: "https://media.api-sports.io/football/teams/496.png", variations: ["Juve"] },
  { name: "Inter", logo: "https://media.api-sports.io/football/teams/505.png", variations: ["Inter Milan", "Internazionale"] },
  { name: "Milan", logo: "https://media.api-sports.io/football/teams/489.png", variations: ["AC Milan"] },
  { name: "Napoli", logo: "https://media.api-sports.io/football/teams/492.png", variations: ["SSC Napoli"] },
  { name: "Roma", logo: "https://media.api-sports.io/football/teams/497.png", variations: ["AS Roma"] },
  { name: "Lazio", logo: "https://media.api-sports.io/football/teams/487.png", variations: ["SS Lazio"] },
  { name: "Atalanta", logo: "https://media.api-sports.io/football/teams/499.png" },
  { name: "Fiorentina", logo: "https://media.api-sports.io/football/teams/502.png", variations: ["ACF Fiorentina"] },
  
  // BUNDESLIGA
  { name: "Bayern Munich", logo: "https://media.api-sports.io/football/teams/157.png", variations: ["Bayern", "FC Bayern"] },
  { name: "Borussia Dortmund", logo: "https://media.api-sports.io/football/teams/165.png", variations: ["Dortmund", "BVB"] },
  { name: "RB Leipzig", logo: "https://media.api-sports.io/football/teams/173.png", variations: ["Leipzig"] },
  { name: "Bayer Leverkusen", logo: "https://media.api-sports.io/football/teams/168.png", variations: ["Leverkusen"] },
  { name: "Union Berlin", logo: "https://media.api-sports.io/football/teams/28.png" },
  
  // LIGUE 1
  { name: "PSG", logo: "https://media.api-sports.io/football/teams/85.png", variations: ["Paris Saint-Germain", "Paris"] },
  { name: "Marseille", logo: "https://media.api-sports.io/football/teams/81.png", variations: ["OM"] },
  { name: "Monaco", logo: "https://media.api-sports.io/football/teams/91.png", variations: ["AS Monaco"] },
  { name: "Lyon", logo: "https://media.api-sports.io/football/teams/80.png", variations: ["Olympique Lyon", "OL"] },
  { name: "Lille", logo: "https://media.api-sports.io/football/teams/79.png", variations: ["LOSC"] },
  
  // BRASILEIRÃO
  { name: "Flamengo", logo: "https://media.api-sports.io/football/teams/127.png" },
  { name: "Palmeiras", logo: "https://media.api-sports.io/football/teams/126.png" },
  { name: "Corinthians", logo: "https://media.api-sports.io/football/teams/131.png" },
  { name: "São Paulo", logo: "https://media.api-sports.io/football/teams/130.png", variations: ["Sao Paulo"] },
  { name: "Fluminense", logo: "https://media.api-sports.io/football/teams/124.png" },
  { name: "Atlético Mineiro", logo: "https://media.api-sports.io/football/teams/120.png", variations: ["Atletico Mineiro", "Galo"] },
  { name: "Internacional", logo: "https://media.api-sports.io/football/teams/129.png", variations: ["Inter Porto Alegre"] },
  { name: "Grêmio", logo: "https://media.api-sports.io/football/teams/128.png", variations: ["Gremio"] },
  { name: "Santos", logo: "https://media.api-sports.io/football/teams/123.png" },
  { name: "Vasco", logo: "https://media.api-sports.io/football/teams/1062.png", variations: ["Vasco da Gama"] },
  { name: "Botafogo", logo: "https://media.api-sports.io/football/teams/118.png" },
  { name: "Cruzeiro", logo: "https://media.api-sports.io/football/teams/133.png" },
];

// Create a map for faster lookups
const logoMap = new Map<string, string>();
teamLogos.forEach(team => {
  // Add primary name
  logoMap.set(team.name.toLowerCase(), team.logo);
  // Add variations
  team.variations?.forEach(variation => {
    logoMap.set(variation.toLowerCase(), team.logo);
  });
});

/**
 * Get team logo URL by team name
 * Returns logo URL or undefined if not found
 */
export function getTeamLogo(teamName: string): string | undefined {
  if (!teamName) return undefined;
  
  const cleanName = teamName.trim().toLowerCase();
  return logoMap.get(cleanName);
}

/**
 * Check if a team logo exists in our database
 */
export function hasTeamLogo(teamName: string): boolean {
  if (!teamName) return false;
  const cleanName = teamName.trim().toLowerCase();
  return logoMap.has(cleanName);
}
