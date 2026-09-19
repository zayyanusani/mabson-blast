export type Country = {
  name: string;
  flag: string;
  region: string;
  capital: string;
  languages: string;
  highlights: string[];
  description: string;
};

export const countries: Country[] = [
  { name: 'Nigeria', flag: '🇳🇬', region: 'West Africa', capital: 'Abuja', languages: 'English, Hausa, Yoruba, Igbo', highlights: ['Afrobeats', 'Nollywood', 'Jollof rice'], description: 'A diverse country known for energetic music, film, literature, food, and hundreds of living cultures.' },
  { name: 'Ghana', flag: '🇬🇭', region: 'West Africa', capital: 'Accra', languages: 'English and Ghanaian languages', highlights: ['Kente', 'Cape Coast', 'Highlife music'], description: 'A coastal nation with rich Akan heritage, historic trading centers, and vibrant contemporary culture.' },
  { name: 'Kenya', flag: '🇰🇪', region: 'East Africa', capital: 'Nairobi', languages: 'Swahili and English', highlights: ['Maasai culture', 'Safari', 'Mount Kenya'], description: 'A country of remarkable landscapes, wildlife, urban creativity, and many communities and languages.' },
  { name: 'Egypt', flag: '🇪🇬', region: 'North Africa', capital: 'Cairo', languages: 'Arabic', highlights: ['Pyramids of Giza', 'Nile River', 'Ancient history'], description: 'Home to an extraordinary ancient civilization and a modern culture shaped by the Nile and Mediterranean.' },
  { name: 'South Africa', flag: '🇿🇦', region: 'Southern Africa', capital: 'Pretoria, Cape Town, Bloemfontein', languages: '11 official languages', highlights: ['Table Mountain', 'Ubuntu', 'Robben Island'], description: 'A multilingual and multicultural country with diverse landscapes, histories, and artistic traditions.' },
  { name: 'Mali', flag: '🇲🇱', region: 'West Africa', capital: 'Bamako', languages: 'French and national languages', highlights: ['Timbuktu', 'Mande heritage', 'Traditional music'], description: 'A historic center of West African scholarship, trade, music, and storytelling.' },
];
