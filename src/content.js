/**
 * content.js
 * ---------------------------------------------------------------------------
 * The travel guide, as structured data. The whole front end renders from this
 * file — nothing on the page is hard-coded in HTML.
 * ---------------------------------------------------------------------------
 */

'use strict';

/* ===========================================================================
 * 0. THE CHAPTERS
 *    The site is read top to bottom, in the order the source document runs:
 *    the country, the plan, Rome, the Vatican, then the four stops after it.
 *    Every section id below is also the id of a <section> on the page.
 * ======================================================================== */

const chapters = [
  {
    id: 'atlas',
    n: '01',
    title: 'Twenty regions, five on the route',
    kicker: 'the country',
    blurb: 'Where Italy is, how it is divided, and the five regions this guide travels through.',
  },
  {
    id: 'planning',
    n: '02',
    title: 'Planning the trip',
    kicker: 'four decisions',
    blurb: 'When to go, how long to stay, what it costs, and what to book first.',
  },
  {
    id: 'rome',
    n: '03',
    title: 'Rome, the Eternal City',
    kicker: 'Lazio · 3–4 days',
    blurb: 'The five landmarks every first visit is built around.',
  },
  {
    id: 'vatican',
    n: '04',
    title: 'Inside Vatican City',
    kicker: 'a country inside a city',
    blurb: 'The smallest country in the world, and the four masterpieces inside it.',
  },
  {
    id: 'rome-on-foot',
    n: '05',
    title: 'Rome on foot',
    kicker: '6.55 km, end to end',
    blurb: 'The walking route, where to sleep, how to move, and what to eat.',
  },
  {
    id: 'tuscany',
    n: '06',
    title: 'Florence & Pisa',
    kicker: 'Tuscany · 2–3 days',
    blurb: 'The birthplace of the Renaissance, and the tower that will not fall.',
  },
  {
    id: 'venice',
    n: '07',
    title: 'Venice',
    kicker: 'Veneto · 2 days',
    blurb: 'A hundred islands, four hundred bridges, and no cars at all.',
  },
  {
    id: 'milan',
    n: '08',
    title: 'Milan',
    kicker: 'Lombardy · 2 days',
    blurb: 'Fashion, football, and Leonardo’s Last Supper.',
  },
  {
    id: 'naples',
    n: '09',
    title: 'Naples & the Amalfi Coast',
    kicker: 'Campania · 3 days',
    blurb: 'Where the route ends: pizza, cliffs and the bluest water in Italy.',
  },
];

/* ===========================================================================
 * 1. THE COUNTRY
 * ======================================================================== */

const overview = {
  title: 'Italy',
  lede:
    'Italy is one of the most remarkable countries in Southern Europe. It is famous for its rich ' +
    'history, art, culture, and delicious food.',
  body: [
    'The capital city is Rome, which is also one of the oldest and most important cities in the world.',
    'Italy has 20 regions, and each region has its own traditions, food, and attractions. Some famous ' +
      'cities are Milan, Venice, Florence, and Naples.',
    'Italy is also known for landmarks such as the Colosseum, the Leaning Tower of Pisa, and the canals ' +
      'of Venice. Millions of tourists visit Italy every year to enjoy its history, nature, and culture.',
  ],
  keyFigures: [
    { value: '20', label: 'Regions', note: 'each with its own traditions, food and attractions' },
    { value: '2–3', label: 'Regions per trip', note: 'the sweet spot — more means constant transit' },
    { value: '10–14', label: 'Days, first trip', note: 'the best balance of depth and coverage' },
    { value: '$2–3k', label: 'Typical budget', note: 'for a first-time trip to Italy' },
  ],
  landmarks: [
    { name: 'The Colosseum', wiki: 'Colosseum' },
    { name: 'The Leaning Tower of Pisa', wiki: 'Leaning_Tower_of_Pisa' },
    { name: 'The canals of Venice', wiki: 'Venice' },
  ],
};

/* ===========================================================================
 * 2. REGION → CITY GUIDE
 * ======================================================================== */

/** The five regions this guide routes you through, keyed by the map's name. */
const guideRegions = {
  Lazio: {
    displayName: 'Lazio',
    chain: ['Lazio', 'Rome'],
    days: '3–4 days',
    order: 1,
    summary: 'The capital, and the natural first stop of any first-time trip.',
    chapter: 'rome',
    chapterN: '03',
    cities: [
      { name: 'Rome', wiki: 'Rome', note: 'The Eternal City — capital of Italy and of the Roman Empire.' },
    ],
    highlights: ['The Colosseum', 'Trevi Fountain', 'The Pantheon', 'Vatican City', 'The Spanish Steps'],
  },
  Toscana: {
    displayName: 'Tuscany (Toscana)',
    chain: ['Tuscany (Toscana)', 'Florence', 'Pisa', 'Siena'],
    days: '2–3 days',
    order: 2,
    summary: 'Florence, the birthplace of the Renaissance, with Pisa an easy half-day away.',
    chapter: 'tuscany',
    chapterN: '06',
    cities: [
      { name: 'Florence', wiki: 'Florence', note: 'Capital of Tuscany and birthplace of the Renaissance.' },
      { name: 'Pisa', wiki: 'Pisa', note: 'A half-day or full-day trip from Florence.' },
      { name: 'Siena', wiki: 'Siena', note: 'The third Tuscan city named in the guide.' },
    ],
    highlights: ['Florence Cathedral', 'Uffizi Gallery', 'Piazza dei Miracoli'],
  },
  Veneto: {
    displayName: 'Veneto',
    chain: ['Veneto', 'Venice', 'Verona'],
    days: '2 days',
    order: 3,
    summary: 'A city built on more than 100 islands, where boats replace cars.',
    chapter: 'venice',
    chapterN: '07',
    cities: [
      { name: 'Venice', wiki: 'Venice', note: 'Built on 100+ islands, linked by over 400 bridges.' },
      { name: 'Verona', wiki: 'Verona', note: 'The second Veneto city named in the guide.' },
    ],
    highlights: ["St. Mark's Square", "St. Mark's Basilica", 'Grand Canal', 'Rialto Bridge'],
  },
  Lombardia: {
    displayName: 'Lombardy (Lombardia)',
    chain: ['Lombardy (Lombardia)', 'Milan'],
    days: '2 days',
    order: 4,
    summary: "Italy's financial, fashion and design capital — and a football pilgrimage.",
    chapter: 'milan',
    chapterN: '08',
    cities: [
      { name: 'Milan', wiki: 'Milan', note: "Italy's second-largest city, capital of Lombardy." },
    ],
    highlights: ['Duomo di Milano', 'Galleria Vittorio Emanuele II', 'The Last Supper', 'San Siro'],
  },
  Campania: {
    displayName: 'Campania',
    chain: ['Campania', 'Naples', 'Amalfi Coast'],
    days: '3 days',
    order: 5,
    summary: 'One of the oldest cities in Europe, and the gateway to the Amalfi Coast.',
    chapter: 'naples',
    chapterN: '09',
    cities: [
      { name: 'Naples', wiki: 'Naples', note: 'Capital of Campania and gateway to the Amalfi Coast.' },
      { name: 'Amalfi Coast', wiki: 'Amalfi_Coast', note: 'A UNESCO World Heritage Site.' },
    ],
    highlights: ['Naples', 'Positano', 'Amalfi'],
  },
};

const amalfiNote = {
  title: 'The Amalfi Coast',
  text:
    "The Amalfi Coast is one of Italy's most beautiful coastal destinations and is famous for its " +
    'colorful villages, dramatic cliffs, crystal-clear sea, and breathtaking views. It is also a ' +
    'UNESCO World Heritage Site.',
  badge: 'UNESCO World Heritage Site',
  wiki: 'Amalfi_Coast',
};

/* ===========================================================================
 * 3. THE 20 REGIONS — short notes so every region on the map is worth a click.
 *    The guide itself routes through five of them; the rest are context.
 * ======================================================================== */

const regionInfo = {
  Piemonte: {
    subtitle: 'Piedmont, at the foot of the Alps',
    fact: 'Named in the guide as harvest country: in September, Tuscany and Piedmont fill with local festivals.',
  },
  "Valle d'Aosta/Vallée d'Aoste": {
    subtitle: "Italy's smallest and most alpine region",
    fact: 'Bilingual in Italian and French, and home to the highest peaks in the Alps.',
  },
  Lombardia: {
    subtitle: 'The financial, fashion and design capital',
    fact: "Milan is Italy's second-largest city, and home to AC Milan, Inter Milan and San Siro.",
  },
  'Trentino-Alto Adige/Südtirol': {
    subtitle: 'Two autonomous provinces, one region',
    fact: 'Split between Trentino and German-speaking South Tyrol, high in the Dolomites.',
  },
  Veneto: {
    subtitle: 'Canals instead of roads',
    fact: 'Venice is built on more than 100 small islands connected by over 400 bridges.',
  },
  'Friuli-Venezia Giulia': {
    subtitle: 'Where the Alps meet the Adriatic',
    fact: 'The north-eastern corner of Italy, on the border with Slovenia and Austria.',
  },
  Liguria: {
    subtitle: 'The Italian Riviera',
    fact: 'A narrow arc of coastline between the mountains and the Ligurian Sea.',
  },
  'Emilia-Romagna': {
    subtitle: 'The food valley',
    fact: 'Bologna, Parma and Modena — the heartland of Italian cooking.',
  },
  Toscana: {
    subtitle: 'The birthplace of the Renaissance',
    fact: 'Florence, Pisa and Siena. Michelangelo, Leonardo da Vinci and Botticelli all worked here.',
  },
  Umbria: {
    subtitle: 'The green heart of Italy',
    fact: "Italy's only region with neither a coastline nor a foreign border.",
  },
  Marche: {
    subtitle: 'A quiet stretch of the central Adriatic',
    fact: 'Rolling hills running down to a long, calm coast.',
  },
  Lazio: {
    subtitle: 'Home to the capital',
    fact: 'Rome sits here — and Vatican City, the smallest country in the world, sits inside Rome.',
  },
  Abruzzo: {
    subtitle: 'Mountains that fall into the sea',
    fact: 'National parks and the highest peaks of the Apennines, an hour east of Rome.',
  },
  Molise: {
    subtitle: "Italy's youngest and quietest region",
    fact: 'Separated from Abruzzo in 1963, and still the least visited region in the country.',
  },
  Campania: {
    subtitle: 'Naples, Vesuvius and the Amalfi Coast',
    fact: 'Naples is one of the oldest cities in Europe and the gateway to the Amalfi Coast.',
  },
  Puglia: {
    subtitle: 'The heel of the boot',
    fact: 'Whitewashed towns, olive groves, and two coastlines.',
  },
  Basilicata: {
    subtitle: 'The instep, historically called Lucania',
    fact: 'Home to the ancient cave dwellings of Matera.',
  },
  Calabria: {
    subtitle: 'The toe of the boot',
    fact: 'Squeezed between the Tyrrhenian and Ionian seas, facing Sicily across the strait.',
  },
  Sicilia: {
    subtitle: 'The largest island in the Mediterranean',
    fact: 'Greek temples, Norman cathedrals, and Mount Etna, the tallest active volcano in Europe.',
  },
  Sardegna: {
    subtitle: 'An island with a language of its own',
    fact: 'Bronze Age stone towers and some of the clearest water in the Mediterranean.',
  },
};

/** Coordinates [lon, lat] for the city pins drawn on the map. */
const cityPins = {
  Lazio: [{ name: 'Rome', coords: [12.4964, 41.9028] }],
  Toscana: [
    { name: 'Florence', coords: [11.2558, 43.7696] },
    { name: 'Pisa', coords: [10.4017, 43.7228] },
    { name: 'Siena', coords: [11.3308, 43.3188] },
  ],
  Veneto: [
    { name: 'Venice', coords: [12.3155, 45.4408] },
    { name: 'Verona', coords: [10.9916, 45.4384] },
  ],
  Lombardia: [{ name: 'Milan', coords: [9.19, 45.4642] }],
  Campania: [
    { name: 'Naples', coords: [14.2681, 40.8518] },
    { name: 'Positano', coords: [14.4849, 40.6281] },
    { name: 'Amalfi', coords: [14.6026, 40.634] },
  ],
};

/* ===========================================================================
 * 4. PLANNING A TRIP
 * ======================================================================== */

const planning = {
  headline: 'How to plan a first-time trip to Italy',
  lede:
    'Italy is best planned by choosing 2 to 3 regions and matching them to your available time and ' +
    'travel pace.',
  body:
    'Everything else depends on three core decisions: how much time you have, which regions you ' +
    'choose, and how fast you want to travel. Once these are set, you can choose cities, book ' +
    'transport and accommodation, and plan activities much more easily.',
  corePoints: [
    {
      icon: '⏳',
      label: 'Time',
      text: 'Most first-time Italy trips work best with 7 to 14 days.',
    },
    {
      icon: '📍',
      label: 'Regions',
      text: 'Limit yourself to 2 to 3 regions to avoid constant transit.',
    },
    {
      icon: '🚶',
      label: 'Pace',
      text: 'Decide whether you want a slower trip with longer stays or a faster overview with more stops.',
    },
  ],

  question: 'What decisions should you make when planning a trip to Italy?',
  answer:
    'Before planning your trip, decide when to go, how long to stay, where to go, and how much to spend.',
  decisions: [
    { icon: '🗓', label: 'When to go', hint: 'Three seasons, three very different trips.' },
    { icon: '⏳', label: 'How long to stay', hint: '7–10 days or 10–14 days changes the whole route.' },
    { icon: '📍', label: 'Where to go', hint: 'Two or three regions, no more.' },
    { icon: '💶', label: 'How much to spend', hint: 'Budget around $2,000–3,000.' },
  ],

  /* ---- Decision 01 ---- */
  seasonQuestion: "When's the best time to visit Italy?",
  seasonIntro:
    'Italy has three main travel seasons that affect prices, crowds, and availability. ' +
    "Here's what to expect:",
  seasons: [
    {
      id: 'high',
      name: 'High season',
      months: 'June to August',
      monthIndices: [5, 6, 7],
      tone: 'hot',
      crowds: 4,
      price: 4,
      headline: 'Hot weather, big crowds, and high prices.',
      detail: 'Major sights are packed, and beach towns are full to the brim.',
      points: ['Hot weather', 'Big crowds', 'High prices', 'Beach towns full to the brim'],
    },
    {
      id: 'low',
      name: 'Low season',
      months: 'November to March',
      monthIndices: [10, 11, 0, 1, 2],
      tone: 'cold',
      crowds: 1,
      price: 1,
      headline: 'Fewer tourists and lower costs.',
      detail:
        'But in many small towns, museums, restaurants, and hotels may be closed or have limited hours.',
      points: [
        'Fewer tourists',
        'Lower costs',
        'Some museums and restaurants closed',
        'Limited hours in small towns',
      ],
    },
    {
      id: 'shoulder',
      name: 'Shoulder seasons',
      months: 'April to June and September to October',
      monthIndices: [3, 4, 5, 8, 9],
      tone: 'mild',
      crowds: 2,
      price: 2,
      recommended: true,
      headline: 'The best time to visit Italy for most people.',
      detail: 'You get mild weather, open attractions, and fewer crowds than in summer.',
      points: [
        'Mild weather',
        'Attractions open',
        'Fewer crowds than in summer',
        'Hotels often lower their rates after the summer rush',
      ],
      bestMonth: {
        month: 'September',
        claim: 'September is the best month to visit Italy.',
        reasons: [
          'The summer crowds have thinned.',
          "It's harvest season in regions like Tuscany and Piedmont, so you'll find local festivals and events.",
          'Hotels often lower their rates after the summer rush.',
          'The Mediterranean is still warm enough for swimming.',
        ],
      },
    },
  ],

  /* ---- Decision 02 ---- */
  costQuestion: 'How much does a trip to Italy usually cost?',
  cost: {
    low: 2000,
    high: 3000,
    currency: '$',
    display: '$2,000 – $3,000',
    note: 'A working budget for a first-time trip.',
  },

  durationQuestion: 'How many days are enough for Italy?',
  durationAnswer:
    'How many days you need depends on how many regions you want to include and how fast you want to ' +
    'travel. For a first-time trip, 10 to 14 days usually gives you the best balance.',
  durations: [
    {
      id: 'd7',
      days: '7 – 10',
      title: '7 – 10 days in Italy',
      summary: 'Keep it tight and skip the day trips.',
      itineraries: [
        { label: 'Option A', stops: ['Rome', 'Florence', 'Pisa'] },
        { label: 'Option A (alt)', stops: ['Milan', 'Venice'] },
        { label: 'Option B', stops: ['Rome', 'Venice', 'Amalfi Coast'] },
      ],
    },
    {
      id: 'd10',
      days: '10 – 14',
      recommended: true,
      title: '10 – 14 days in Italy',
      summary:
        'A well-paced itinerary with time to hit the classics — and the best balance for a first trip.',
      itineraries: [
        { label: 'The classics', stops: ['Rome', 'Florence', 'Pisa', 'Milan', 'Naples', 'Amalfi Coast'] },
      ],
    },
  ],

  bookingQuestion: 'What should you book first when planning a trip to Italy?',
  bookingAnswer: 'Book flights first, then accommodation, then transport between cities to lock in your route.',
  bookingSteps: [
    { n: 1, icon: '✈️', label: 'Flights', text: 'Lock the dates before anything else.' },
    { n: 2, icon: '🏨', label: 'Accommodation', text: 'Then pick where you sleep in each city.' },
    { n: 3, icon: '🚄', label: 'Transport between cities', text: 'Finally, tie the route together.' },
  ],
};

/* ===========================================================================
 * 5. ROME
 * ======================================================================== */

const rome = {
  title: 'Rome, Italy',
  region: 'Lazio → Rome',
  days: '3–4 days',
  nickname: 'The Eternal City',
  intro:
    'Rome is the capital city of Italy and one of the oldest cities in the world. It is often called ' +
    '"The Eternal City" because of its long and rich history. Rome was the center of the Roman Empire ' +
    'and is now one of the most popular tourist destinations in the world. Every year, millions of ' +
    'visitors come to admire its historical landmarks, museums, churches, and beautiful streets.',

  attractions: [
    {
      id: 'colosseum',
      number: 1,
      name: 'The Colosseum',
      italian: 'Colosseo',
      tagline: 'Where gladiators fought, nearly 2,000 years ago.',
      description:
        'The Colosseum is the most famous landmark in Rome. It is an ancient amphitheater built nearly ' +
        '2,000 years ago, where gladiators fought and public events were held.',
      facts: [
        { icon: '🏛️', text: 'It is almost **2,000 years old**.' },
        { icon: '👥', text: 'It could accommodate around **50,000 people**.' },
        { icon: '🌍', text: 'Millions of tourists visit it every year.' },
        { icon: '🇮🇹', text: 'It is one of the most recognizable landmarks in Italy.' },
      ],
      hero: { wiki: 'Colosseum', caption: 'The Colosseum, Rome' },
      gallery: [
        { wiki: 'Colosseum', caption: 'The amphitheatre from the Via dei Fori Imperiali' },
        { wiki: 'Roman_Forum', caption: 'The Roman Forum, next door' },
      ],
      quickStat: { value: '50,000', label: 'spectators' },
    },
    {
      id: 'trevi',
      number: 2,
      name: 'Trevi Fountain',
      italian: 'Fontana di Trevi',
      tagline: 'Throw a coin, and you will come back to Rome.',
      description:
        'Trevi Fountain is one of the most beautiful fountains in the world. According to tradition, ' +
        'throwing a coin into the fountain means you will return to Rome one day.',
      legendTitle: 'According to a popular legend:',
      legend: [
        {
          coins: 1,
          icon: '🪙',
          text: 'Throw **one coin** over your left shoulder with your right hand, and you will return to Rome.',
        },
        { coins: 2, icon: '🪙🪙', text: 'Throw **two coins**, and you may fall in love with an Italian.' },
        { coins: 3, icon: '🪙🪙🪙', text: 'Throw **three coins**, and you may get married.' },
      ],
      facts: [
        {
          icon: '💭',
          text:
            'Although these beliefs are just traditions and not historical facts, millions of visitors ' +
            'enjoy taking part in them every year.',
        },
        {
          icon: '❤️',
          text:
            'The coins collected from the fountain are gathered regularly and **donated to charity** to ' +
            'help people in need.',
        },
      ],
      hero: { wiki: 'Trevi_Fountain', caption: 'Trevi Fountain' },
      gallery: [{ wiki: 'Trevi_Fountain', caption: 'The Baroque façade of Palazzo Poli behind the fountain' }],
      quickStat: { value: '3 coins', label: 'and you may marry' },
    },
    {
      id: 'pantheon',
      number: 3,
      name: 'The Pantheon',
      italian: 'Pantheon',
      tagline: 'A dome open to the sky for nearly 2,000 years.',
      description:
        'The Pantheon is famous for its enormous dome and its central opening, called the oculus, which ' +
        'lets natural light enter the building.',
      facts: [
        { icon: '🏛️', text: 'It is nearly **2,000 years old**.' },
        { icon: '🌞', text: 'The oculus is about **9 meters (30 feet)** wide.' },
        { icon: '👑', text: 'The famous Renaissance artist **Raphael** is buried inside the Pantheon.' },
        { icon: '⛪', text: 'Today, it is still an active church where religious services are held.' },
      ],
      hero: { wiki: 'Pantheon,_Rome', caption: 'The Pantheon' },
      gallery: [
        { wiki: 'Pantheon,_Rome', caption: 'The portico and its granite columns' },
        { wiki: 'Piazza_Navona', caption: 'Piazza Navona, five minutes away' },
      ],
      quickStat: { value: '9 m', label: 'oculus width' },
    },
    {
      id: 'vatican',
      number: 4,
      name: 'Vatican City',
      italian: 'Città del Vaticano',
      tagline: 'The smallest country in the world — and it fits inside Rome.',
      description:
        'Vatican City is the smallest country in the world and the home of the Pope. It is famous for ' +
        "St. Peter's Basilica, St. Peter's Square, and the Vatican Museums, where visitors can admire " +
        'the beautiful Sistine Chapel.',
      facts: [
        { icon: '🌍', text: 'It is the **smallest country in the world**.' },
        { icon: '⛪', text: 'It is the **home of the Pope**.' },
        { icon: '🎨', text: 'The Vatican Museums hold the **Sistine Chapel**.' },
        { icon: '⏱', text: 'A full visit, including all the main attractions, usually takes about **4 to 6 hours**.' },
      ],
      hero: { wiki: "St._Peter's_Basilica", caption: "St. Peter's Basilica" },
      gallery: [
        { wiki: "St._Peter's_Square", caption: "St. Peter's Square" },
        { wiki: 'Gallery_of_Maps', caption: 'The Vatican Museums' },
        { wiki: 'Sistine_Chapel', caption: 'The Sistine Chapel' },
      ],
      hasDeepDive: true,
      quickStat: { value: '4–6 h', label: 'full visit' },
    },
    {
      id: 'spanish-steps',
      number: 5,
      name: 'The Spanish Steps',
      italian: 'Scalinata di Trinità dei Monti',
      tagline: '135 steps, one very famous film.',
      description:
        'The Spanish Steps climb from Piazza di Spagna up to the church of Trinità dei Monti, and are ' +
        'one of the most recognisable meeting points in the city.',
      facts: [
        { icon: '📅', text: 'The Spanish Steps were completed in **1725**.' },
        { icon: '🪜', text: 'They consist of **135 steps**.' },
        {
          icon: '🇪🇸',
          text:
            'The steps are called the Spanish Steps because they are located next to the **Spanish Embassy ' +
            'to the Holy See**.',
        },
        {
          icon: '🎬',
          text:
            'They have appeared in many famous films, including **Roman Holiday** starring Audrey Hepburn ' +
            'and Gregory Peck.',
        },
      ],
      hero: { wiki: 'Spanish_Steps', caption: 'The Spanish Steps' },
      gallery: [{ wiki: 'Roman_Holiday', caption: 'Roman Holiday (1953), filmed here' }],
      quickStat: { value: '135', label: 'steps' },
    },
  ],

  /* ---- The walking route, with real distances ---- */
  walkTitle: 'The walking route, in order',
  walkIntro:
    'Many attractions are close enough to walk between. This is the order that works, with the distance ' +
    'and walking time for each leg.',
  walkTotal: { km: 6.55, minutes: '80–90' },
  walkingRoute: [
    { name: 'Vatican Museums', wiki: 'Gallery_of_Maps' },
    { leg: { km: 2, time: '25–30 min' } },
    { name: 'Piazza Navona', wiki: 'Piazza_Navona' },
    { leg: { km: 0.4, time: '5 min' } },
    { name: 'Pantheon', wiki: 'Pantheon,_Rome' },
    { leg: { km: 0.8, time: '10 min' } },
    { name: 'Trevi Fountain', wiki: 'Trevi_Fountain' },
    { leg: { km: 0.85, time: '10 min' } },
    { name: 'Spanish Steps', wiki: 'Spanish_Steps' },
    { leg: { km: 2.5, time: '30–35 min' } },
    { name: 'Colosseum', wiki: 'Colosseum' },
  ],

  stayTitle: 'Best areas to stay',
  stayAreas: [
    {
      name: 'Centro Storico',
      subtitle: 'Historic Center',
      badge: 'Best for first-timers',
      text:
        'This is the best area for first-time visitors. It is close to many famous attractions, including ' +
        'the Trevi Fountain, the Pantheon, and Piazza Navona. Many places can be reached on foot.',
      wiki: 'Piazza_Navona',
    },
    {
      name: 'Termini',
      subtitle: 'Around the main station',
      badge: 'Best for budget',
      text:
        "Termini is the best area for budget travelers. It is located next to Rome's main train station " +
        'and provides easy access to the metro, buses, and trains.',
      wiki: 'Roma_Termini_railway_station',
    },
  ],

  transportTitle: 'Getting around',
  transportIntro: 'Rome has an affordable and convenient public transportation system.',
  transport: [
    { icon: '🚇', name: 'Metro', text: 'The fastest way to travel around the city.' },
    { icon: '🚌', name: 'Buses', text: 'They reach almost every area in Rome.' },
    { icon: '🚋', name: 'Trams', text: 'Comfortable for traveling through several neighborhoods.' },
    {
      icon: '🚄',
      name: 'Trains',
      text: 'Perfect for visiting other Italian cities such as Florence, Venice, Milan, and Naples.',
    },
    {
      icon: '🚶',
      name: 'Walking',
      text: 'Many visitors also enjoy walking, because many famous attractions are close to each other.',
    },
  ],

  foodTitle: 'Famous Italian food',
  foodIntro: 'Italy is famous for its delicious cuisine. Some of the most popular dishes are:',
  food: [
    { name: 'Pizza Margherita', wiki: 'Neapolitan_pizza' },
    { name: 'Carbonara', wiki: 'Carbonara' },
    { name: 'Cacio e Pepe', wiki: 'Cacio_e_pepe' },
    { name: 'Risotto Milano', wiki: 'Risotto_alla_milanese' },
    { name: 'Lasagna', wiki: 'Lasagne' },
    { name: 'Gelato', wiki: 'Gelato' },
    { name: 'Tiramisu', wiki: 'Tiramisu' },
    { name: 'Espresso', wiki: 'Espresso' },
  ],
};

/* ===========================================================================
 * 6. VATICAN CITY — deep dive
 *    x / y are coordinates in the plan SVG's own 100 × 72 viewBox.
 * ======================================================================== */

const vatican = {
  title: 'Inside Vatican City',
  intro:
    'Vatican City is the smallest country in the world and the home of the Pope. A full visit, ' +
    'including all the main attractions, usually takes about 4 to 6 hours. Click any marker on the ' +
    'plan to explore it.',
  visitDuration: '4–6 hours',

  hotspots: [
    {
      id: 'square',
      name: "St. Peter's Square",
      italian: 'Piazza San Pietro',
      x: 74,
      y: 50,
      label: { anchor: 'middle', dx: 3, dy: -9.5 },
      blurb:
        'The great oval piazza in front of the basilica, ringed by colonnades and centred on an obelisk. ' +
        'One of the three sights the guide names for Vatican City.',
      wiki: "St._Peter's_Square",
      gallery: [
        { wiki: "St._Peter's_Square", caption: "St. Peter's Square from above" },
        { wiki: "St._Peter's_Basilica", caption: 'The square and basilica together' },
      ],
    },
    {
      id: 'basilica',
      name: "St. Peter's Basilica",
      italian: 'Basilica di San Pietro',
      x: 48.5,
      y: 51,
      label: { anchor: 'middle', dx: -4, dy: 10.5 },
      blurb:
        'The basilica at the heart of the Vatican, crowned by its famous dome. Inside stands ' +
        "Michelangelo's Pietà, carved from a single block of marble.",
      wiki: "St._Peter's_Basilica",
      gallery: [
        { wiki: "St._Peter's_Basilica", caption: "The dome of St. Peter's Basilica" },
        { wiki: 'Pietà_(Michelangelo)', caption: 'The Pietà, Michelangelo' },
      ],
    },
    {
      id: 'museums',
      name: 'Vatican Museums',
      italian: 'Musei Vaticani',
      x: 56,
      y: 17.5,
      label: { anchor: 'middle', dx: 0, dy: -7.5 },
      blurb:
        'Where visitors can admire the beautiful Sistine Chapel. Miles of galleries lead there — the ' +
        'entrance to the Vatican Museums is where almost every visit begins.',
      wiki: 'Gallery_of_Maps',
      gallery: [
        { wiki: 'Gallery_of_Maps', caption: 'The Gallery of Maps' },
        { wiki: 'Bramante_Staircase', caption: 'The spiral staircase on the way out' },
      ],
    },
    {
      id: 'sistine',
      name: 'Sistine Chapel',
      italian: 'Cappella Sistina',
      x: 43.5,
      y: 36,
      label: { anchor: 'end', dx: -4.5, dy: 1 },
      blurb:
        'The chapel inside the Vatican Museums. Its ceiling carries nine scenes from the Book of Genesis, ' +
        'and its altar wall The Last Judgment — both by Michelangelo.',
      wiki: 'Sistine_Chapel',
      gallery: [
        { wiki: 'Sistine_Chapel', caption: 'The chapel interior' },
        { wiki: 'Sistine_Chapel_ceiling', caption: 'The ceiling' },
        { wiki: 'The_Creation_of_Adam', caption: 'The Creation of Adam' },
      ],
    },
    {
      id: 'palace',
      name: 'Apostolic Palace',
      italian: 'Palazzo Apostolico',
      x: 55,
      y: 37.5,
      label: { anchor: 'middle', dx: 0, dy: -9 },
      blurb: 'The official residence of the Pope, whose home the guide names as Vatican City itself.',
      wiki: 'Apostolic_Palace',
      gallery: [{ wiki: 'Apostolic_Palace', caption: 'The Apostolic Palace' }],
    },
    {
      id: 'gardens',
      name: 'Vatican Gardens',
      italian: 'Giardini Vaticani',
      x: 25,
      y: 39,
      label: { anchor: 'middle', dx: 0, dy: 7 },
      blurb: "More than half the territory of the world's smallest country is garden.",
      wiki: 'Vatican_Gardens',
      gallery: [{ wiki: 'Vatican_Gardens', caption: 'The Vatican Gardens' }],
    },
  ],

  /* ---- The Sistine ceiling ---- */
  ceiling: {
    title: 'The ceiling of the Sistine Chapel',
    intro:
      'Besides The Creation of Adam, the ceiling of the Sistine Chapel includes several famous scenes ' +
      'from the Book of Genesis in the Bible. These nine scenes tell the story of creation and the early ' +
      'history of humanity.',
    wiki: 'Sistine_Chapel_ceiling',
    scenes: [
      'The Separation of Light from Darkness',
      'The Creation of the Sun, Moon, and Plants',
      'The Separation of Land and Water',
      'The Creation of Adam',
      'The Creation of Eve',
      'The Temptation and Expulsion from the Garden of Eden',
      'The Sacrifice of Noah',
      'The Great Flood',
      'The Drunkenness of Noah',
    ],
    famousIndex: 3,
    outro:
      'The most famous of them is The Creation of Adam, where God reaches out to give life to Adam.',
  },

  masterpieces: [
    {
      id: 'creation',
      title: 'The Creation of Adam',
      where: 'Sistine Chapel ceiling',
      artist: 'Michelangelo',
      dates: '1508 – 1512',
      wiki: 'The_Creation_of_Adam',
      note:
        'One of the most famous paintings in the world. It illustrates the biblical story of God giving ' +
        'life to Adam, the first man. Their fingers almost touch, symbolizing the moment life is given ' +
        'to humanity.',
    },
    {
      id: 'judgment',
      title: 'The Last Judgment',
      where: 'Sistine Chapel altar wall',
      artist: 'Michelangelo',
      dates: '1536 – 1541',
      wiki: 'The_Last_Judgment_(Michelangelo)',
      note:
        'One of the world’s most famous frescoes. It depicts the Second Coming of Christ and the ' +
        'Final Judgment, showing the saved ascending to Heaven and the damned descending into Hell.',
    },
    {
      id: 'pieta',
      title: 'Pietà',
      where: "St. Peter's Basilica",
      artist: 'Michelangelo',
      dates: 'carved from a single block of marble',
      wiki: 'Pietà_(Michelangelo)',
      note:
        'The sculpture depicts the Virgin Mary holding the body of Jesus Christ after his crucifixion. ' +
        'It symbolizes love, compassion, sorrow, and hope.',
    },
    {
      id: 'dome',
      title: "Dome of St. Peter's Basilica",
      where: "St. Peter's Basilica",
      artist: '',
      dates: '',
      wiki: "St._Peter's_Basilica",
      note: 'The great ribbed cupola that dominates the Roman skyline.',
    },
  ],
};

/* ===========================================================================
 * 7. THE REST OF THE ROUTE
 * ======================================================================== */

const destinations = [
  {
    id: 'tuscany',
    name: 'Florence & Pisa',
    city: 'Florence (Firenze)',
    region: 'Tuscany (Toscana)',
    regionKey: 'Toscana',
    days: '2–3 days',
    hero: { wiki: 'Florence', caption: 'Florence from Piazzale Michelangelo' },
    intro:
      'After visiting Rome, the next destination is Florence, the capital of the Tuscany Region. ' +
      'Florence is one of the most beautiful cities in Italy and is known as the birthplace of the ' +
      'Renaissance. Many famous artists, including Michelangelo, Leonardo da Vinci, and Sandro ' +
      'Botticelli, lived and worked in Florence.',
    travel: {
      title: 'How to travel from Rome to Florence',
      options: [
        {
          icon: '🚄',
          name: 'High-speed train',
          time: '1 h 30 min',
          text: 'The fastest and most convenient option.',
          best: true,
        },
        { icon: '🚗', name: 'Car', time: '~3 hours', text: 'Depending on traffic.' },
        { icon: '🚌', name: 'Bus', time: 'Longer', text: 'The cheapest option, but it takes longer than the train.' },
      ],
    },
    attractions: [
      {
        name: 'Florence Cathedral',
        italian: 'Duomo di Firenze',
        wiki: 'Florence_Cathedral',
        text:
          "The Florence Cathedral is the city's most famous landmark. It is well known for its " +
          'magnificent dome, designed by Filippo Brunelleschi. Visitors can climb to the top and enjoy ' +
          'breathtaking views of Florence.',
      },
      {
        name: 'Uffizi Gallery',
        italian: 'Galleria degli Uffizi',
        wiki: 'Uffizi_Gallery',
        text:
          'The Uffizi Gallery is one of the most famous art museums in the world. It displays ' +
          'masterpieces by artists such as Leonardo da Vinci, Michelangelo, Raphael, and Botticelli.',
      },
      {
        name: 'Piazza dei Miracoli',
        italian: 'Square of Miracles, Pisa',
        wiki: 'Piazza_dei_Miracoli',
        text:
          'The most famous tourist site in Pisa, and a UNESCO World Heritage Site. All of its monuments ' +
          'stand in the same square, so visitors can easily explore them on foot.',
        subItems: [
          { name: 'Leaning Tower of Pisa', wiki: 'Leaning_Tower_of_Pisa', text: 'The iconic leaning bell tower.' },
          { name: 'Pisa Cathedral', wiki: 'Pisa_Cathedral', text: 'A magnificent Romanesque cathedral.' },
          { name: 'Pisa Baptistery', wiki: 'Pisa_Baptistery', text: 'The largest baptistery in Italy.' },
        ],
      },
    ],
    whyVisit: {
      title: 'Why visit Pisa?',
      text:
        "Pisa is one of Italy's most famous destinations because of its unique Leaning Tower, beautiful " +
        'historic buildings, and rich history. It is a perfect place for a half-day or full-day trip ' +
        'while staying in Florence.',
    },
    myth: {
      title: 'A common misconception',
      text:
        'Although many people think it is one of the Seven Wonders of the World, the Leaning Tower of ' +
        "Pisa is **not** officially one of the New Seven Wonders of the World. However, it is one of the " +
        "world's most famous and recognizable landmarks.",
    },
    stay: [
      {
        name: 'Historic Center',
        badge: 'Best for first-timers',
        text:
          'The best area for first-time visitors. It is close to the Duomo, Ponte Vecchio, museums, ' +
          'restaurants, and shopping streets. Most attractions can be reached on foot.',
        wiki: 'Ponte_Vecchio',
      },
      {
        name: 'Santa Maria Novella',
        badge: 'Best for day trips',
        text:
          "Near Florence's main train station, making it convenient if you plan to visit Pisa, Venice, " +
          'or Rome.',
        wiki: 'Florence',
        hotel: 'Hotel Alba Palace — comfortable, reasonably priced, and close to the train station.',
      },
    ],
    food: {
      intro: 'Florence is famous for its delicious Tuscan cuisine. Some traditional dishes include:',
      items: [
        {
          name: 'Bistecca alla Fiorentina',
          wiki: 'Bistecca_alla_fiorentina',
          text: 'A thick, grilled Florentine steak.',
        },
      ],
    },
  },

  {
    id: 'venice',
    name: 'Venice',
    city: 'Venice (Venezia)',
    region: 'Veneto',
    regionKey: 'Veneto',
    days: '2 days',
    hero: { wiki: 'Venice', caption: 'Venice from the air' },
    intro:
      'Venice is the capital of the Veneto Region in northeastern Italy. It is one of the most unique ' +
      'and beautiful cities in the world. Venice is built on more than 100 small islands connected by ' +
      'over 400 bridges. Instead of roads, the city has canals, and boats are the main means of ' +
      'transportation. Every year, millions of tourists visit Venice to enjoy its history, ' +
      'architecture, and romantic atmosphere.',
    whyVisit: {
      title: 'Why visit Venice?',
      text:
        'Venice is one of the most unique cities in the world. Its canals, historic buildings, ' +
        'magnificent bridges, and romantic atmosphere make it an unforgettable destination. Whether you ' +
        'are interested in history, art, architecture, or simply enjoying beautiful scenery, Venice ' +
        'offers an unforgettable travel experience.',
    },
    orderTitle: 'Best order to visit the attractions',
    orderIntro:
      'If you are visiting Venice for the first time, it is recommended to visit the attractions in ' +
      'the following order:',
    attractions: [
      {
        number: 1,
        name: "St. Mark's Square",
        italian: 'Piazza San Marco',
        wiki: 'Piazza_San_Marco',
        text:
          "St. Mark's Square is the heart of Venice and the city's most famous square. It is surrounded " +
          'by beautiful historic buildings, cafés, restaurants, and shops. It is the perfect place to ' +
          'start your tour of Venice.',
      },
      {
        number: 2,
        name: "St. Mark's Basilica",
        italian: 'Basilica di San Marco',
        wiki: "St_Mark's_Basilica",
        text:
          "Located next to St. Mark's Square, St. Mark's Basilica is one of the most beautiful churches " +
          'in Italy. It is famous for its golden mosaics, magnificent domes, and impressive Byzantine ' +
          'architecture.',
      },
      {
        number: 3,
        name: "Doge's Palace",
        italian: 'Palazzo Ducale',
        wiki: "Doge's_Palace",
        text:
          "Doge's Palace was the official residence of the rulers of Venice. Today, it is a museum where " +
          'visitors can admire beautiful paintings, elegant halls, and historic rooms.',
      },
      {
        number: 4,
        name: 'Bridge of Sighs',
        italian: 'Ponte dei Sospiri',
        wiki: 'Bridge_of_Sighs',
        text:
          'Built in 1600, it connects the Doge’s Palace to the old prison. The bridge is completely ' +
          'enclosed and has small windows with stone bars. Prisoners crossed this bridge on their way ' +
          'from the courtroom to their prison cells.',
        story: {
          question: 'Why is it called the "Bridge of Sighs"?',
          text:
            'According to legend, prisoners would take their last look at Venice through the small ' +
            'windows before being imprisoned. They were said to sigh as they looked at the beautiful ' +
            'city for the final time.',
        },
        legend: {
          title: 'A romantic legend',
          text:
            'If a couple kisses while riding in a gondola under the Bridge of Sighs at sunset, their ' +
            'love will last forever. Although this is a modern legend created for tourists, it has made ' +
            "the bridge one of Venice's most romantic attractions.",
          note: 'Today, the bridge is one of the most photographed landmarks in Venice.',
        },
      },
      {
        number: 5,
        name: 'Grand Canal',
        italian: 'Canal Grande',
        wiki: 'Grand_Canal_(Venice)',
        text:
          'The Grand Canal is the main waterway in Venice. It divides the city into two parts and is ' +
          'lined with beautiful palaces, churches, and historic buildings. Visitors can explore the ' +
          'canal by water bus or gondola.',
      },
      {
        number: 6,
        name: 'Rialto Bridge',
        italian: 'Ponte di Rialto',
        wiki: 'Rialto_Bridge',
        text:
          'The Rialto Bridge is the oldest and most famous bridge over the Grand Canal. It is one of ' +
          "Venice's most photographed landmarks and offers spectacular views of the canal.",
      },
    ],
    route: [
      { name: 'Grand Canal', wiki: 'Grand_Canal_(Venice)' },
      { leg: { time: '' } },
      { name: 'Rialto Bridge', wiki: 'Rialto_Bridge' },
      { leg: { time: '10–15 min walk' } },
      { name: "St. Mark's Square", wiki: 'Piazza_San_Marco' },
      { leg: { time: '' } },
      { name: "St. Mark's Basilica & Doge's Palace", wiki: "St_Mark's_Basilica" },
      { leg: { time: '' } },
      { name: 'Bridge of Sighs', wiki: 'Bridge_of_Sighs' },
    ],
    transportTitle: 'Transportation in Venice',
    transportIntro:
      'Unlike most cities, Venice has no cars in its historic center. The main ways to get around are:',
    transport: [
      { icon: '⛴', name: 'Vaporetto (Water Bus)', text: 'The most popular and affordable public transportation.' },
      { icon: '🛥', name: 'Water Taxi', text: 'A faster but more expensive option.' },
      { icon: '🚶', name: 'Walking', text: "The best way to discover Venice's narrow streets and hidden squares." },
      { icon: '🛶', name: 'Gondola', text: 'A traditional Venetian boat mainly used for sightseeing.' },
    ],
    experience: {
      title: 'Gondola ride',
      wiki: 'Gondola',
      text:
        'A gondola ride is one of the most popular experiences in Venice. It allows visitors to explore ' +
        "the city's quiet canals and enjoy its unique atmosphere.",
    },
  },

  {
    id: 'milan',
    name: 'Milan',
    city: 'Milan (Milano)',
    region: 'Lombardy',
    regionKey: 'Lombardia',
    days: '2 days',
    hero: { wiki: 'Milan_Cathedral', caption: 'The Duomo di Milano' },
    intro:
      'Milan (Milano) is the capital of the Lombardy Region in northern Italy. It is Italy’s ' +
      "second-largest city and is known as the country's financial, fashion, and design capital. Milan " +
      'combines modern life with historic architecture, making it one of Italy’s most exciting ' +
      'destinations.',
    sport: {
      title: 'A football pilgrimage',
      wiki: 'San_Siro',
      text:
        'Milan is famous for sports tourism, especially football. The city is home to AC Milan and Inter ' +
        "Milan, two of the world's most successful football clubs. Both teams play at the iconic San " +
        'Siro Stadium, one of the largest and most famous stadiums in Europe. Visitors can watch ' +
        'football matches, tour the stadium, and visit the San Siro Museum.',
    },
    attractions: [
      {
        number: 1,
        name: 'Duomo di Milano',
        italian: 'Milan Cathedral',
        wiki: 'Milan_Cathedral',
        text:
          'The Milan Cathedral is the most famous landmark in Milan. It is one of the largest Gothic ' +
          'cathedrals in the world. Visitors can climb to the rooftop and enjoy spectacular views of ' +
          'the city.',
      },
      {
        number: 2,
        name: 'Galleria Vittorio Emanuele II',
        italian: 'Built 1865 – 1877',
        wiki: 'Galleria_Vittorio_Emanuele_II',
        text:
          "One of the world's oldest and most beautiful shopping galleries, in the heart of Milan next " +
          'to the Duomo. It is famous for its stunning glass roof, elegant architecture, luxury ' +
          'boutiques, cafés, and restaurants, and is home to brands such as Prada, Gucci, and ' +
          'Louis Vuitton.',
        tradition: {
          icon: '🐂',
          title: 'Spin on the bull',
          text:
            "One of the gallery's most popular traditions is spinning around **3 times** on the bull " +
            'mosaic on the floor for good luck.',
        },
        why: [
          'Historic 19th-century architecture.',
          'Luxury shopping and fine dining.',
          'Beautiful glass dome.',
          'Located next to the Duomo di Milano.',
        ],
      },
      {
        number: 3,
        name: 'The Last Supper',
        italian: 'Il Cenacolo',
        wiki: 'The_Last_Supper_(Leonardo)',
        text:
          "Leonardo da Vinci's famous masterpiece, The Last Supper, is displayed in the Convent of Santa " +
          "Maria delle Grazie. It is one of the world's most celebrated paintings.",
      },
      {
        number: 4,
        name: 'Teatro alla Scala',
        italian: 'La Scala',
        wiki: 'La_Scala',
        text:
          "La Scala is one of the world's most famous opera houses and has hosted many legendary " +
          'performances.',
      },
    ],
    stay: [
      {
        name: 'B&B Hotel Milano Centrale Station',
        badge: '⭐⭐⭐',
        text:
          'About a 5-minute walk from the station. A good option if you are looking for a reasonable price.',
        wiki: 'Milan',
      },
    ],
    transportTitle: 'Transportation',
    transport: [
      { icon: '🚇', name: 'Metro', text: 'The fastest way to get around the city.' },
      { icon: '🚋', name: 'Tram', text: "Milan's famous historic yellow trams." },
      { icon: '🚌', name: 'Bus', text: 'Buses cover all parts of the city.' },
      { icon: '🚄', name: 'Train', text: 'High-speed trains connect Milan with Rome, Florence, Venice, and Naples.' },
    ],
    travel: {
      title: 'How to travel from Milan to Naples',
      intro:
        'There are several ways to travel from Milan to Naples, but the high-speed train is the fastest ' +
        'and most convenient option.',
      options: [
        {
          icon: '🚄',
          name: 'High-speed train',
          time: '4 h 30 – 5 h',
          text:
            'Comfortable, reliable, and connects Milano Centrale Station with Napoli Centrale Station. ' +
            'The most popular choice for tourists.',
          best: true,
        },
        {
          icon: '✈️',
          name: 'Plane',
          time: '~4 – 5 h total',
          text:
            'The flight takes about 1 hour 30 minutes, but with check-in, security and airport transfers ' +
            'the total is usually 4 to 5 hours.',
        },
        {
          icon: '🚗',
          name: 'Car',
          time: '7 – 8 h',
          text: 'Suitable for travelers who want to explore other cities along the way.',
        },
        {
          icon: '🚌',
          name: 'Bus',
          time: '10 – 12 h',
          text: 'The cheapest option, but not recommended if you want to save time.',
        },
      ],
    },
  },

  {
    id: 'naples',
    name: 'Naples & the Amalfi Coast',
    city: 'Naples (Napoli)',
    region: 'Campania',
    regionKey: 'Campania',
    days: '3 days',
    hero: { wiki: 'Amalfi_Coast', caption: 'The Amalfi Coast' },
    intro:
      'Naples is the capital of the Campania Region in southern Italy. It is one of the oldest cities ' +
      'in Europe and is famous for its rich history, delicious food, beautiful coastline, and vibrant ' +
      'atmosphere. Naples is also the gateway to the breathtaking Amalfi Coast.',
    whyVisit: {
      title: 'Why go south?',
      text:
        'Naples and the Amalfi Coast offer a perfect combination of history, culture, delicious food, ' +
        'and breathtaking natural beauty. Visitors can explore historic streets, relax on beautiful ' +
        'beaches, enjoy spectacular coastal views, and experience authentic Italian hospitality.',
    },
    orderTitle: 'Famous places on the Amalfi Coast',
    attractions: [
      {
        number: 1,
        name: 'Naples',
        italian: 'Napoli',
        wiki: 'Naples',
        text:
          'The capital of the Campania Region in southern Italy. It is famous for its rich history, ' +
          'vibrant atmosphere, delicious pizza, and beautiful waterfront. It is also the main gateway ' +
          'to the Amalfi Coast.',
      },
      {
        number: 2,
        name: 'Positano',
        italian: '',
        wiki: 'Positano',
        text:
          'Positano is the most famous town on the Amalfi Coast. It is well known for its colorful ' +
          'houses built on steep cliffs, beautiful beaches, luxury hotels, and breathtaking views of ' +
          'the Mediterranean Sea.',
      },
      {
        number: 3,
        name: 'Amalfi',
        italian: '',
        wiki: 'Amalfi',
        text:
          'A historic seaside town famous for its magnificent cathedral, charming narrow streets, lively ' +
          'harbor, and traditional Italian cafés. It is one of the highlights of the Amalfi Coast.',
      },
    ],
    note: {
      badge: 'UNESCO World Heritage Site',
      text:
        "The Amalfi Coast is one of Italy's most beautiful coastal destinations and is famous for its " +
        'colorful villages, dramatic cliffs, crystal-clear sea, and breathtaking views.',
    },
    transportTitle: 'Transportation',
    transport: [
      { icon: '🚇', name: 'Metro', text: 'Available in Naples.' },
      { icon: '🚌', name: 'Bus', text: 'Connects the city with nearby towns.' },
      { icon: '🚄', name: 'Train', text: 'High-speed trains connect Naples with Rome, Florence, and Milan.' },
      { icon: '⛴', name: 'Ferry', text: 'Ferries travel to Capri, Sorrento, and other coastal destinations.' },
    ],
    food: {
      intro: 'Famous food',
      items: [
        { name: 'Seafood Pasta', wiki: 'Spaghetti_alle_vongole', text: 'Fresh pasta served with local seafood.' },
        { name: 'Pizza Margherita', wiki: 'Neapolitan_pizza', text: 'Naples is the birthplace of pizza.' },
      ],
    },
  },
];

/* ===========================================================================
 * 8. COLOPHON
 * ======================================================================== */

const author = {
  name: 'Ahmed Hameed',
  url: 'https://ahmedhameed.dev',
  role: 'Built by',
  tagline: 'Software engineer · ahmedhameed.dev',
  initials: 'AH',
};

module.exports = {
  chapters,
  overview,
  guideRegions,
  amalfiNote,
  regionInfo,
  cityPins,
  planning,
  rome,
  vatican,
  destinations,
  author,
  meta: {
    title: 'Discover Italy',
    subtitle: 'A first-time travel guide',
    chapters: chapters.length,
  },
};
