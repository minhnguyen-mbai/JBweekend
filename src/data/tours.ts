import type { Tour } from '../types'

export const tours: Tour[] = [
  {
    id: 'tour-kampung-table',
    slug: 'kampung-table',
    title: 'Kampung Table',
    category: 'food',
    shortDescription:
      'A local food journey through traditional kopitiams, an afternoon market, a fishing-village seafood dinner, and a neighbourhood dessert shop that most Singapore day-trippers never find.',
    hook: 'Four stops. No tourist queues. Hosted by someone who grew up here.',
    duration: 'About 8 hours',
    sharedSeatPrice: 119,
    privateCarPrice: 350,
    heroImage: 'kampung-table',
    tags: ['Local food', 'Hidden gems', 'Small group'],
    bestFor: ['Foodies', 'Couples', 'Repeat JB visitors'],
    defaultStartTime: '1:30 PM',
    defaultEndTime: '9:30 PM',
    meetingPoint: 'JB CIQ arrival hall, Level 1 pick-up bay',
    itinerary: [
      {
        time: '1:30 PM',
        title: 'Meet your host at JB CIQ',
        detail:
          'Your host meets you inside the arrival hall holding a JB Weekend card, then walks the group to the car. Five minutes, no hunting for a carpark.',
      },
      {
        time: '2:15 PM',
        title: 'Kopitiam in a 1970s shophouse row',
        detail:
          'Charcoal-toasted bread, kaya made in-house, and a kopi order your host will teach you to say properly. This is the warm-up, not the meal.',
      },
      {
        time: '3:45 PM',
        title: 'Afternoon wet market walk',
        detail:
          'Tropical fruit you will not see in an NTUC, belacan being pounded, and a stall that has sold the same curry puff since 1988. Your host points you at what is worth buying.',
      },
      {
        time: '5:15 PM',
        title: 'Kampung detour and tea stop',
        detail:
          'A short drive through a residential kampung where your host grew up, with a stop for teh tarik and a proper sit-down before dinner. Drinks are paid at the stall.',
      },
      {
        time: '6:45 PM',
        title: 'Fishing-village seafood dinner',
        detail:
          'A jetty-side kitchen where the order depends on what came in that afternoon. Your host has the table booked and orders for the group; you settle the bill between you.',
      },
      {
        time: '8:15 PM',
        title: 'Neighbourhood dessert shop',
        detail:
          'Cendol or tau foo fah under fluorescent lights, the way locals finish a long meal. Last stop before the drive back.',
      },
      {
        time: '9:30 PM',
        title: 'Drop-off at JB CIQ',
        detail:
          'Back at the same meeting point in time for the last comfortable crossing home.',
      },
    ],
    included: [
      'Car and all transport within Johor',
      'Your local host, who drives and guides the whole route',
      'Pick-up and drop-off at JB CIQ',
      'The curated itinerary and table reservations',
      'Trip coordination and support on the day',
    ],
    excluded: [
      'Food and drinks at every stop, paid as you go',
      'Shopping at the market',
      'Any optional activities you add on the day',
      'Your Singapore–Johor border crossing',
      'Travel insurance',
    ],
    weatherPlan:
      'Food stops are indoors or covered, so rain rarely changes the plan. If the market closes for a public holiday, your host swaps in a covered hawker centre of similar standing and tells the group in the chat beforehand.',
    faqs: [
      {
        question: 'How much food is this, honestly?',
        answer:
          'Four stops across eight hours, paced so you are hungry again by dinner. Most travellers skip lunch before the trip and eat lightly the next morning.',
      },
      {
        question: 'Can you handle halal, vegetarian or allergy requirements?',
        answer:
          'Yes for halal and vegetarian if you tell us at booking — your host reworks the stops rather than leaving you watching. Severe shellfish allergies are harder on this particular trip, so we will contact you and may suggest End of Asia instead.',
      },
      {
        question: 'Is this walkable for someone who is not very mobile?',
        answer:
          'The market stretch involves about twenty minutes of slow walking on uneven ground. Everything else is a short walk from the car. Tell us at booking and your host will adjust the pace.',
      },
    ],
  },
  {
    id: 'tour-petrolhead-night',
    slug: 'petrolhead-night',
    title: 'Petrolhead Night',
    category: 'adventure',
    shortDescription:
      'Three timed go-kart sessions across two circuits, followed by local bak kut teh and a 90-minute sports massage.',
    hook: 'Three racers. Two circuits. One leaderboard.',
    duration: 'About 8 hours',
    sharedSeatPrice: 159,
    privateCarPrice: 450,
    heroImage: 'petrolhead-night',
    tags: ['Go-kart', 'Competition', 'Massage'],
    bestFor: ['Groups of friends', 'Birthdays', 'Colleagues'],
    defaultStartTime: '2:00 PM',
    defaultEndTime: '9:45 PM',
    meetingPoint: 'JB CIQ arrival hall, Level 1 pick-up bay',
    itinerary: [
      {
        time: '2:00 PM',
        title: 'Meet your host at JB CIQ',
        detail:
          'Quick briefing in the car: circuit rules, timing format, and how the leaderboard works across the afternoon.',
      },
      {
        time: '2:45 PM',
        title: 'Circuit one — practice and first timed run',
        detail:
          'An outdoor track with long straights. Your host has the slots booked; you pay the circuit directly for each session.',
      },
      {
        time: '4:30 PM',
        title: 'Circuit two — technical laps',
        detail:
          'Tighter indoor layout, faster karts, more braking. Two sessions here, and this is usually where the standings change.',
      },
      {
        time: '6:15 PM',
        title: 'Bak kut teh and the final standings',
        detail:
          'Peppery Johor-style broth, you tiao, and your host reading out the combined times. Winner gets bragging rights and nothing else.',
      },
      {
        time: '7:45 PM',
        title: '90-minute sports massage',
        detail:
          'A proper local massage house, not a hotel spa. Booked as a group and paid at the counter, timed for the moment your shoulders realise what you did.',
      },
      {
        time: '9:45 PM',
        title: 'Drop-off at JB CIQ',
        detail: 'Back at the same meeting point, considerably more relaxed than you arrived.',
      },
    ],
    included: [
      'Car and all transport within Johor',
      'Your local host, who drives and guides the whole route',
      'Pick-up and drop-off at JB CIQ',
      'The curated itinerary, circuit slots and massage booked ahead',
      'Trip coordination and support on the day',
    ],
    excluded: [
      'Go-kart session fees and equipment hire, paid at each circuit',
      'The sports massage, paid at the massage house',
      'Food and drinks',
      'Any optional activities you add on the day',
      'Your Singapore–Johor border crossing and travel insurance',
    ],
    weatherPlan:
      'Circuit one is outdoors. If it rains hard, that session moves indoors to circuit two and you still get three timed runs — the karting operators run wet sessions where it is safe, and your host makes the call on the day.',
    faqs: [
      {
        question: 'Do I need karting experience?',
        answer:
          'No. Every session starts with a briefing, and the first run is a practice run that does not count. Most travellers on this trip have never raced competitively.',
      },
      {
        question: 'Are there height, weight or age limits?',
        answer:
          'Circuits require drivers to be at least 1.45 m tall and hold a valid ID. Weight limits are around 100 kg for the karts used here. Tell us at booking if you are near either limit and we will confirm with the operator first.',
      },
      {
        question: 'Can I skip the massage?',
        answer:
          'Yes. The massage is booked for the group but paid at the counter, so skipping it simply means you do not pay for it. Tell your host during the day and the booking is adjusted.',
      },
    ],
  },
  {
    id: 'tour-end-of-asia',
    slug: 'end-of-asia',
    title: 'End of Asia',
    category: 'nature',
    shortDescription:
      'Visit Tanjung Piai, explore the stilt village at Kukup, enjoy a Pontian café stop, and finish with a local seafood dinner at sunset.',
    hook: 'Stand at the southernmost point of mainland Asia and return home the same night.',
    duration: 'About 9 hours',
    sharedSeatPrice: 119,
    privateCarPrice: 340,
    heroImage: 'end-of-asia',
    tags: ['Nature', 'Sunset', 'Seafood'],
    bestFor: ['Couples', 'Photographers', 'First-time explorers'],
    defaultStartTime: '1:00 PM',
    defaultEndTime: '9:45 PM',
    meetingPoint: 'JB CIQ arrival hall, Level 1 pick-up bay',
    itinerary: [
      {
        time: '1:00 PM',
        title: 'Meet your host at JB CIQ',
        detail:
          'The longest drive of the three trips, so the group gets comfortable early. About ninety minutes west along the coast.',
      },
      {
        time: '2:30 PM',
        title: 'Tanjung Piai National Park',
        detail:
          'Mangrove boardwalks out over the water to the marker at the southernmost tip of mainland Asia. Park entry is paid at the gate; macaques, mudskippers and the shipping lane are free.',
      },
      {
        time: '4:15 PM',
        title: 'Kukup stilt village',
        detail:
          'A working fishing village built entirely on stilts over the water. Your host walks you through the back lanes rather than the souvenir strip.',
      },
      {
        time: '5:45 PM',
        title: 'Pontian café stop',
        detail:
          'Coffee, a slice of something, and a sit-down while the light gets good. This is the breather before dinner.',
      },
      {
        time: '7:00 PM',
        title: 'Seafood dinner as the sun goes down',
        detail:
          'A coastal restaurant facing west, booked ahead by your host. Grilled fish, butter prawns and kangkung, ordered for the table and settled between you.',
      },
      {
        time: '9:45 PM',
        title: 'Drop-off at JB CIQ',
        detail: 'Back at the same meeting point after the drive east along the coast road.',
      },
    ],
    included: [
      'Car and all transport within Johor',
      'Your local host, who drives and guides the whole route',
      'Pick-up and drop-off at JB CIQ',
      'The curated itinerary and a guided walk through Kukup',
      'Trip coordination and support on the day',
    ],
    excluded: [
      'Tanjung Piai National Park entry, paid at the gate',
      'Food and drinks, including the seafood dinner',
      'Optional boat ride at Kukup',
      'Any optional activities you add on the day',
      'Your Singapore–Johor border crossing and travel insurance',
    ],
    weatherPlan:
      'The boardwalk at Tanjung Piai closes during lightning. If that happens your host reorders the day, takes Kukup first, and comes back. Park entry is paid at the gate, so a closed park simply means you do not pay it, and your host swaps in the Pontian coast road instead.',
    faqs: [
      {
        question: 'How much walking is involved?',
        answer:
          'Roughly 3 km in total across flat boardwalk and village lanes, spread over two stops. Comfortable shoes are enough; no hiking gear needed.',
      },
      {
        question: 'Will I actually get a sunset?',
        answer:
          'Dinner is timed and positioned for it, and the restaurant faces west over the water. Johor weather does what it likes, so we promise the seat, not the sky.',
      },
      {
        question: 'Is this suitable for children?',
        answer:
          'Yes for ages 7 and up, with an accompanying adult booking the seat. The boardwalk has railings throughout. Under-7s are better suited to a private booking.',
      },
    ],
  },
]

export const tourById = (id: string) => tours.find((t) => t.id === id)
export const tourBySlug = (slug: string) => tours.find((t) => t.slug === slug)
