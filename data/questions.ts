export type CategoryId = 'nigeria' | 'africa' | 'food' | 'landmarks';

export type Question = {
  id: string;
  category: CategoryId;
  question: string;
  options: string[];
  answer: string;
  fact: string;
};

export const categories = [
  { id: 'nigeria' as const, title: 'Nigeria', icon: '🇳🇬', color: '#E7F5EC' },
  { id: 'africa' as const, title: 'Africa', icon: '🌍', color: '#FFF3D6' },
  { id: 'food' as const, title: 'Food & Culture', icon: '🍲', color: '#FDE4E1' },
  { id: 'landmarks' as const, title: 'Landmarks', icon: '🏛️', color: '#E8E5FA' },
];

export const questions: Question[] = [
  { id: 'ng-1', category: 'nigeria', question: 'What is the capital city of Nigeria?', options: ['Lagos', 'Abuja', 'Kano', 'Ibadan'], answer: 'Abuja', fact: 'Abuja became Nigeria’s capital in 1991.' },
  { id: 'ng-2', category: 'nigeria', question: 'Which language is Nigeria’s official language?', options: ['English', 'Yoruba', 'Hausa', 'Igbo'], answer: 'English', fact: 'Nigeria is also home to hundreds of local languages.' },
  { id: 'ng-3', category: 'nigeria', question: 'Which Nigerian city is famous for Nollywood and a large film industry?', options: ['Lagos', 'Jos', 'Enugu', 'Ilorin'], answer: 'Lagos', fact: 'Lagos is a major center for Nigerian film, music, and business.' },
  { id: 'ng-4', category: 'nigeria', question: 'Which three groups are among Nigeria’s largest ethnic groups?', options: ['Yoruba, Hausa, Igbo', 'Zulu, Xhosa, Sotho', 'Akan, Ewe, Ga', 'Tuareg, Berber, Oromo'], answer: 'Yoruba, Hausa, Igbo', fact: 'Nigeria has more than 250 ethnic groups.' },
  { id: 'af-1', category: 'africa', question: 'Which is the largest desert in Africa?', options: ['Kalahari', 'Sahara', 'Namib', 'Danakil'], answer: 'Sahara', fact: 'The Sahara stretches across much of North Africa.' },
  { id: 'af-2', category: 'africa', question: 'Which country is home to Mount Kilimanjaro?', options: ['Tanzania', 'Ghana', 'Morocco', 'Senegal'], answer: 'Tanzania', fact: 'Mount Kilimanjaro is Africa’s highest mountain.' },
  { id: 'af-3', category: 'africa', question: 'What is Afrobeats?', options: ['A music movement', 'A type of mountain', 'A traditional soup', 'A language'], answer: 'A music movement', fact: 'Modern Afrobeats has roots in West African sounds and global influences.' },
  { id: 'fd-1', category: 'food', question: 'Jollof rice is especially associated with which region?', options: ['West Africa', 'East Asia', 'South America', 'Northern Europe'], answer: 'West Africa', fact: 'Many West African countries have their own beloved style of jollof rice.' },
  { id: 'fd-2', category: 'food', question: 'What does the word “ubuntu” commonly express?', options: ['Humanity and community', 'A cooking method', 'A type of clothing', 'A mountain range'], answer: 'Humanity and community', fact: 'Ubuntu is often summarized as “I am because we are.”' },
  { id: 'lm-1', category: 'landmarks', question: 'The Pyramids of Giza are in which country?', options: ['Egypt', 'Kenya', 'Mali', 'Ethiopia'], answer: 'Egypt', fact: 'The Great Pyramid is one of the ancient wonders of the world.' },
  { id: 'lm-2', category: 'landmarks', question: 'Timbuktu is a historic city in which country?', options: ['Mali', 'Rwanda', 'Nigeria', 'Tunisia'], answer: 'Mali', fact: 'Timbuktu was a major center of learning and trade.' },
];
