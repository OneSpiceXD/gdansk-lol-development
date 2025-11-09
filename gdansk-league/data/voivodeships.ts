// Shared voivodeship data for Poland map
export const voivodeshipsData = {
  'pomorskie': { name: 'Pomorskie (Gdańsk)', players: 2847, growth: '+12%' },
  'mazowieckie': { name: 'Mazowieckie (Warsaw)', players: 4521, growth: '+8%' },
  'wielkopolskie': { name: 'Wielkopolskie (Poznań)', players: 1923, growth: '+15%' },
  'malopolskie': { name: 'Małopolskie (Kraków)', players: 2156, growth: '+10%' },
  'dolnoslaskie': { name: 'Dolnośląskie (Wrocław)', players: 1834, growth: '+7%' },
  'lodzkie': { name: 'Łódzkie (Łódź)', players: 1245, growth: '+5%' },
  'zachodniopomorskie': { name: 'Zachodniopomorskie', players: 892, growth: '+9%' },
  'lubelskie': { name: 'Lubelskie', players: 743, growth: '+6%' },
  'slaskie': { name: 'Śląskie (Katowice)', players: 2987, growth: '+11%' },
  'kujawsko-pomorskie': { name: 'Kujawsko-Pomorskie', players: 654, growth: '+4%' },
  'podkarpackie': { name: 'Podkarpackie', players: 567, growth: '+8%' },
  'warminsko-mazurskie': { name: 'Warmińsko-Mazurskie', players: 432, growth: '+3%' },
  'swietokrzyskie': { name: 'Świętokrzyskie', players: 389, growth: '+2%' },
  'podlaskie': { name: 'Podlaskie', players: 501, growth: '+5%' },
  'opolskie': { name: 'Opolskie', players: 298, growth: '+1%' },
  'lubuskie': { name: 'Lubuskie', players: 312, growth: '+6%' },
} as const;

export type VoivodeshipKey = keyof typeof voivodeshipsData;

// SVG Path data for each region
export const voivodeshipPaths: Record<VoivodeshipKey, { d: string; dot: { cx: number; cy: number; r: number } }> = {
  'zachodniopomorskie': {
    d: 'M 50 80 L 120 60 L 170 80 L 175 120 L 140 135 L 90 130 L 55 110 Z',
    dot: { cx: 110, cy: 95, r: 5 }
  },
  'pomorskie': {
    d: 'M 175 80 L 240 70 L 280 85 L 285 115 L 260 130 L 220 135 L 175 120 Z',
    dot: { cx: 230, cy: 100, r: 6 }
  },
  'warminsko-mazurskie': {
    d: 'M 285 85 L 350 75 L 365 110 L 355 145 L 305 150 L 285 115 Z',
    dot: { cx: 320, cy: 115, r: 5 }
  },
  'podlaskie': {
    d: 'M 305 150 L 355 145 L 370 180 L 365 215 L 330 225 L 305 195 Z',
    dot: { cx: 335, cy: 185, r: 5 }
  },
  'lubuskie': {
    d: 'M 55 135 L 110 135 L 135 165 L 130 205 L 90 215 L 55 195 Z',
    dot: { cx: 90, cy: 175, r: 5 }
  },
  'kujawsko-pomorskie': {
    d: 'M 140 135 L 220 135 L 240 165 L 230 200 L 180 205 L 145 185 Z',
    dot: { cx: 190, cy: 170, r: 5 }
  },
  'wielkopolskie': {
    d: 'M 90 215 L 145 210 L 180 240 L 175 285 L 135 295 L 95 275 Z',
    dot: { cx: 130, cy: 250, r: 6 }
  },
  'mazowieckie': {
    d: 'M 230 200 L 305 195 L 330 225 L 325 280 L 280 295 L 235 285 L 225 240 Z',
    dot: { cx: 280, cy: 240, r: 7 }
  },
  'lodzkie': {
    d: 'M 175 240 L 235 240 L 240 280 L 215 305 L 170 300 L 165 270 Z',
    dot: { cx: 205, cy: 270, r: 5 }
  },
  'lubelskie': {
    d: 'M 280 295 L 325 285 L 345 320 L 340 365 L 300 375 L 270 350 Z',
    dot: { cx: 310, cy: 330, r: 5 }
  },
  'dolnoslaskie': {
    d: 'M 75 295 L 135 295 L 155 330 L 145 365 L 95 375 L 70 345 Z',
    dot: { cx: 110, cy: 335, r: 6 }
  },
  'opolskie': {
    d: 'M 145 325 L 180 320 L 190 350 L 180 370 L 155 365 Z',
    dot: { cx: 170, cy: 345, r: 4 }
  },
  'slaskie': {
    d: 'M 155 365 L 190 365 L 210 395 L 205 420 L 165 425 L 145 400 Z',
    dot: { cx: 180, cy: 395, r: 6 }
  },
  'swietokrzyskie': {
    d: 'M 215 305 L 270 305 L 280 340 L 265 370 L 220 370 L 210 340 Z',
    dot: { cx: 245, cy: 340, r: 4 }
  },
  'malopolskie': {
    d: 'M 205 380 L 265 375 L 285 405 L 280 440 L 235 450 L 200 430 Z',
    dot: { cx: 240, cy: 415, r: 6 }
  },
  'podkarpackie': {
    d: 'M 285 375 L 340 365 L 355 405 L 345 445 L 285 445 L 280 410 Z',
    dot: { cx: 315, cy: 410, r: 5 }
  },
};
