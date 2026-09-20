import type { Host } from '../types'

export const hosts: Host[] = [
  {
    id: 'host-amirul',
    name: 'Amirul',
    homeTown: 'Kampung Melayu Majidee, Johor Bahru',
    yearsHosting: 3,
    languages: ['English', 'Malay', 'Mandarin'],
    bio: 'Amirul grew up five minutes from the first kopitiam on this route and still buys his vegetables at the market you will walk through. He spent six years managing a seafood restaurant before hosting full time, which is why the dinner reservations are always good ones.',
    drives: 'Toyota Innova, 2023 — four seats, cold air-con, boot space for market bags',
    verifiedItems: ['Identity verified', 'Malaysian driving licence on file', 'Vehicle insurance checked', 'Background screening completed'],
    tripsHosted: 61,
    rating: 4.9,
    avatarSeed: 'A',
  },
  {
    id: 'host-weijian',
    name: 'Wei Jian',
    homeTown: 'Taman Molek, Johor Bahru',
    yearsHosting: 2,
    languages: ['English', 'Mandarin', 'Malay'],
    bio: 'Wei Jian raced karts competitively in his twenties and still holds a club lap record he will mention exactly once. He knows which circuit runs the faster engines on any given week and books your sessions accordingly.',
    drives: 'Honda Odyssey, 2022 — four seats, plenty of room after karting',
    verifiedItems: ['Identity verified', 'Malaysian driving licence on file', 'Vehicle insurance checked', 'Background screening completed'],
    tripsHosted: 38,
    rating: 4.9,
    avatarSeed: 'W',
  },
  {
    id: 'host-nurul',
    name: 'Nurul',
    homeTown: 'Pontian, Johor',
    yearsHosting: 4,
    languages: ['English', 'Malay'],
    bio: 'Nurul is from Pontian and has been taking visitors down the west coast since long before it was a weekend trend. She knows the tide table at Kukup by heart and will tell you when to put the phone down and just look.',
    drives: 'Toyota Innova, 2024 — four seats, built for the coast road',
    verifiedItems: ['Identity verified', 'Malaysian driving licence on file', 'Vehicle insurance checked', 'Background screening completed'],
    tripsHosted: 84,
    rating: 5.0,
    avatarSeed: 'N',
  },
]

export const hostById = (id: string) => hosts.find((h) => h.id === id) ?? hosts[0]
