import type { Host } from '../types'

/**
 * Descriptive information only. We do not publish ratings, trip counts or
 * screening claims because there is no verified data behind them yet.
 */
export const hosts: Host[] = [
  {
    id: 'host-amirul',
    name: 'Amirul',
    homeTown: 'Kampung Melayu Majidee, Johor Bahru',
    languages: ['English', 'Malay', 'Mandarin'],
    bio: 'Amirul grew up five minutes from the first kopitiam on this route and still buys his vegetables at the market you will walk through. He managed a seafood restaurant for six years before hosting, which is why the dinner reservations are good ones.',
    vehicle: 'Toyota Innova — three traveller seats, cold air-con, boot space for market bags',
    avatarSeed: 'A',
  },
  {
    id: 'host-weijian',
    name: 'Wei Jian',
    homeTown: 'Taman Molek, Johor Bahru',
    languages: ['English', 'Mandarin', 'Malay'],
    bio: 'Wei Jian raced karts competitively in his twenties and still holds a club lap record he will mention exactly once. He knows which circuit runs the faster engines on any given week and books your sessions accordingly.',
    vehicle: 'Honda Odyssey — three traveller seats, plenty of room after karting',
    avatarSeed: 'W',
  },
  {
    id: 'host-nurul',
    name: 'Nurul',
    homeTown: 'Pontian, Johor',
    languages: ['English', 'Malay'],
    bio: 'Nurul is from Pontian and has been taking visitors down the west coast since long before it was a weekend trend. She knows the tide table at Kukup by heart and will tell you when to put the phone down and just look.',
    vehicle: 'Toyota Innova — three traveller seats, built for the coast road',
    avatarSeed: 'N',
  },
]

export const hostById = (id: string) => hosts.find((h) => h.id === id) ?? hosts[0]
