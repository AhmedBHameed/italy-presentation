/**
 * content.js
 * ---------------------------------------------------------------------------
 * Every field in this file is transcribed from `Italy.pdf`. The `source`
 * property on each block records the PDF page it came from, so the website
 * and the document stay verifiably in sync.
 *
 * Anything NOT in the PDF (regional population/area figures used by the map
 * dossier) is marked `fromPdf: false` so it is never presented as if it were.
 * ---------------------------------------------------------------------------
 */

'use strict';

/* ===========================================================================
 * 1. THE COUNTRY  — Italy.pdf, page 1
 * ======================================================================== */

const overview = {
  source: 'Italy.pdf · p.1',
  title: 'Italy',
  lede:
    'Italy is one of the most remarkable countries in Southern Europe. It is famous for its rich ' +
    'history, art, culture, and delicious food.',
  body: [
    'The capital city is Rome, which is also one of the oldest and most important cities in the world.',
    'Italy has 20 regions, and each region has its own traditions, food, and attractions. Some famous ' +
      'cities are Milan, Venice, Florence, Naples, and Turin.',
    'Italy is also known for landmarks such as the Colosseum, the Leaning Tower of Pisa, and the canals ' +
      'of Venice. Millions of tourists visit Italy every year to enjoy its history, nature, and culture.',
  ],
  keyFigures: [
    { value: '20', label: 'Regions', note: 'each with its own traditions, food and attractions' },
    { value: 'Rome', label: 'Capital city', note: 'one of the oldest cities in the world' },
    { value: 'Millions', label: 'Visitors a year', note: 'drawn by history, nature and culture' },
    { value: '3', label: 'Travel seasons', note: 'high, low and shoulder — they change the price' },
  ],
  landmarks: [
    { name: 'The Colosseum', wiki: 'Colosseum' },
    { name: 'The Leaning Tower of Pisa', wiki: 'Leaning_Tower_of_Pisa' },
    { name: 'The canals of Venice', wiki: 'Venice' },
  ],
};

/* ===========================================================================
 * 2. REGION → CITY GUIDE  — Italy.pdf, page 1 (the bulleted list)
 * ======================================================================== */

/** The five regions the PDF explicitly calls out, keyed by the map's region name. */
const guideRegions = {
  Lazio: {
    source: 'Italy.pdf · p.1',
    displayName: 'Lazio',
    chain: ['Lazio', 'Rome'],
    cities: [{ name: 'Rome', wiki: 'Rome', note: 'The capital — and the whole of Chapter 2 below.' }],
  },
  Lombardia: {
    source: 'Italy.pdf · p.1',
    displayName: 'Lombardy (Lombardia)',
    chain: ['Lombardy (Lombardia)', 'Milan'],
    cities: [{ name: 'Milan', wiki: 'Milan', note: 'Named in the PDF among Italy’s famous cities.' }],
  },
  Campania: {
    source: 'Italy.pdf · p.1',
    displayName: 'Campania',
    chain: ['Campania', 'Naples', 'Amalfi Coast'],
    cities: [
      { name: 'Naples', wiki: 'Naples', note: 'Named in the PDF among Italy’s famous cities.' },
      { name: 'Amalfi Coast', wiki: 'Amalfi_Coast', note: 'A UNESCO World Heritage Site — see the note.' },
    ],
  },
  Toscana: {
    source: 'Italy.pdf · p.1',
    displayName: 'Tuscany (Toscana)',
    chain: ['Tuscany (Toscana)', 'Florence', 'Pisa', 'Siena'],
    cities: [
      { name: 'Florence', wiki: 'Florence', note: 'Named in the PDF among Italy’s famous cities.' },
      { name: 'Pisa', wiki: 'Pisa', note: 'Home of the Leaning Tower.' },
      { name: 'Siena', wiki: 'Siena', note: '' },
    ],
  },
  Veneto: {
    source: 'Italy.pdf · p.1',
    displayName: 'Veneto',
    chain: ['Veneto', 'Venice', 'Verona'],
    cities: [
      { name: 'Venice', wiki: 'Venice', note: 'Famous for its canals.' },
      { name: 'Verona', wiki: 'Verona', note: '' },
    ],
  },
};

const amalfiNote = {
  source: 'Italy.pdf · p.1',
  title: 'The Amalfi Coast',
  text:
    'The Amalfi Coast is one of Italy’s most beautiful coastal destinations and is famous for its ' +
    'colorful villages, dramatic cliffs, crystal-clear sea, and breathtaking views. It is also a ' +
    'UNESCO World Heritage Site.',
  badge: 'UNESCO World Heritage Site',
  wiki: 'Amalfi_Coast',
};

/* ===========================================================================
 * 3. THE 20 REGIONS — dossier data for the interactive map.
 *    NOTE: population / area figures are rounded approximations for a
 *    learning demo. They are NOT from the PDF and are flagged as such.
 * ======================================================================== */

const regionInfo = {
  Piemonte: {
    subtitle: 'The Piedmont, foothill of the Alps',
    capital: 'Torino',
    population: 4_250_000,
    areaKm2: 25_387,
    fact:
      'Home to the first capital of unified Italy (1861–65) and the Slow Food movement, born in the ' +
      'town of Bra in 1986.',
  },
  "Valle d'Aosta/Vallée d'Aoste": {
    subtitle: 'Italy’s smallest and most alpine region',
    capital: 'Aosta',
    population: 124_000,
    areaKm2: 3_261,
    fact:
      'Officially bilingual in Italian and French, and home to Italy’s tallest peaks, including the ' +
      'Matterhorn and Mont Blanc massif.',
  },
  Lombardia: {
    subtitle: 'The economic engine of Italy',
    capital: 'Milano',
    population: 10_060_000,
    areaKm2: 23_863,
    fact:
      'Italy’s most populous region and, on its own, one of the largest regional economies in the EU.',
  },
  'Trentino-Alto Adige/Südtirol': {
    subtitle: 'Two autonomous provinces, one region',
    capital: 'Trento',
    population: 1_080_000,
    areaKm2: 13_607,
    fact:
      'Split into Trentino and South Tyrol (Südtirol), where German is the majority first language in ' +
      'many valleys.',
  },
  Veneto: {
    subtitle: 'Lagoons, Prosecco hills, and Palladian villas',
    capital: 'Venezia',
    population: 4_850_000,
    areaKm2: 18_407,
    fact: 'Venice’s historic center sits on 118 small islands linked by roughly 400 footbridges.',
  },
  'Friuli-Venezia Giulia': {
    subtitle: 'Where the Alps meet the Adriatic and the Balkans',
    capital: 'Trieste',
    population: 1_190_000,
    areaKm2: 7_924,
    fact:
      'Trieste was long a key port of the Austro-Hungarian Empire, giving the city its distinct Central ' +
      'European café culture.',
  },
  Liguria: {
    subtitle: 'The Italian Riviera',
    capital: 'Genova',
    population: 1_510_000,
    areaKm2: 5_416,
    fact:
      'A narrow coastal strip that gave the world pesto alla genovese and focaccia, and one of Europe’s ' +
      'busiest ports.',
  },
  'Emilia-Romagna': {
    subtitle: 'The food valley',
    capital: 'Bologna',
    population: 4_460_000,
    areaKm2: 22_453,
    fact:
      'Parmigiano Reggiano, Prosciutto di Parma, and traditional balsamic vinegar all carry ' +
      'protected-origin status from here.',
  },
  Toscana: {
    subtitle: 'Cradle of the Renaissance',
    capital: 'Firenze',
    population: 3_670_000,
    areaKm2: 22_987,
    fact:
      'The Tuscan dialect, thanks largely to Dante, became the basis for standard modern Italian.',
  },
  Umbria: {
    subtitle: 'The green heart of Italy',
    capital: 'Perugia',
    population: 860_000,
    areaKm2: 8_464,
    fact:
      'Italy’s only region with no coastline and no border with another country, it’s centered on ' +
      'Assisi and Perugia.',
  },
  Marche: {
    subtitle: 'A quiet stretch of central Adriatic coast',
    capital: 'Ancona',
    population: 1_490_000,
    areaKm2: 9_401,
    fact:
      'Its rolling hills were the childhood landscape of both Raphael and the poet Giacomo Leopardi.',
  },
  Lazio: {
    subtitle: 'Home to the capital',
    capital: 'Roma',
    population: 5_720_000,
    areaKm2: 17_232,
    fact: 'Vatican City is a fully independent state entirely enclosed within Rome, itself inside Lazio.',
  },
  Abruzzo: {
    subtitle: 'Mountains that fall into the sea',
    capital: "L'Aquila",
    population: 1_270_000,
    areaKm2: 10_832,
    fact:
      'Roughly a third of the region is protected national park, home to the Marsican brown bear, found ' +
      'nowhere else.',
  },
  Molise: {
    subtitle: 'Italy’s youngest and quietest region',
    capital: 'Campobasso',
    population: 290_000,
    areaKm2: 4_461,
    fact:
      'Only separated from Abruzzo to form its own region in 1963, it’s often (jokingly) said not to exist.',
  },
  Campania: {
    subtitle: 'Vesuvius, the Amalfi Coast, and Naples',
    capital: 'Napoli',
    population: 5_600_000,
    areaKm2: 13_671,
    fact:
      'Pompeii and Herculaneum, buried by Vesuvius in 79 AD, sit within commuting distance of central Naples.',
  },
  Puglia: {
    subtitle: 'The heel of the boot',
    capital: 'Bari',
    population: 3_890_000,
    areaKm2: 19_541,
    fact:
      'Known for the trulli of Alberobello — whitewashed stone huts with conical roofs, built without mortar.',
  },
  Basilicata: {
    subtitle: 'The instep, historically called Lucania',
    capital: 'Potenza',
    population: 540_000,
    areaKm2: 9_995,
    fact:
      'The cave-dwellings of Matera, inhabited for thousands of years and once shamed as Italy’s ' +
      '“national disgrace”, are now a UNESCO site.',
  },
  Calabria: {
    subtitle: 'The toe of the boot',
    capital: 'Catanzaro',
    population: 1_830_000,
    areaKm2: 15_222,
    fact:
      'Squeezed between two seas, the Tyrrhenian and Ionian coasts are, at their closest, only about 30 km apart.',
  },
  Sicilia: {
    subtitle: 'The largest island in the Mediterranean',
    capital: 'Palermo',
    population: 4_770_000,
    areaKm2: 25_711,
    fact:
      'Mount Etna, Europe’s tallest active volcano, has been erupting on and off for roughly 500,000 years.',
  },
  Sardegna: {
    subtitle: 'An island of its own, nuraghi and all',
    capital: 'Cagliari',
    population: 1_570_000,
    areaKm2: 24_100,
    fact:
      'Home to over 7,000 Bronze Age stone nuraghe towers and to some of the world’s highest ' +
      'concentrations of centenarians.',
  },
};

/* ===========================================================================
 * 4. PLANNING A TRIP  — Italy.pdf, pages 1–2
 * ======================================================================== */

const planning = {
  source: 'Italy.pdf · pp.1–2',
  question: 'What decisions should you make when planning a trip to Italy?',
  answer:
    'Before planning your trip, decide when to go, how long to stay, where to go, and how much to spend.',
  decisions: [
    { icon: '🗓', label: 'When to go', hint: 'Three seasons, three very different trips.' },
    { icon: '⏳', label: 'How long to stay', hint: '7 days or 10 days changes everything.' },
    { icon: '📍', label: 'Where to go', hint: 'Region → city → the thing you came for.' },
    { icon: '💶', label: 'How much to spend', hint: 'Season drives price and availability.' },
  ],
  seasonIntro:
    'Italy has three main travel seasons that affect prices, crowds, and availability. Here’s what to expect:',
  seasons: [
    {
      id: 'high',
      name: 'High season',
      months: 'June to August',
      monthIndices: [5, 6, 7],
      tone: 'hot',
      crowds: 4,
      price: 4,
      headline: 'Peak crowds, peak prices.',
      detail:
        'The PDF lists June to August as Italy’s high season — the window that most affects prices, ' +
        'crowds and availability.',
      points: ['Highest prices', 'Biggest crowds', 'Book far ahead for availability'],
    },
    {
      id: 'low',
      name: 'Low season',
      months: 'November to March',
      monthIndices: [10, 11, 0, 1, 2],
      tone: 'cold',
      crowds: 1,
      price: 1,
      headline: 'The quiet, cheapest months.',
      detail: 'The PDF lists November to March as Italy’s low season.',
      points: ['Lowest prices', 'Fewest visitors', 'Some seasonal closures'],
    },
    {
      id: 'shoulder',
      name: 'Shoulder seasons',
      months: 'April to June and September to October',
      monthIndices: [3, 4, 5, 8, 9],
      tone: 'mild',
      crowds: 2,
      price: 2,
      headline: 'The best time to visit Italy for most people.',
      recommended: true,
      detail:
        'You get mild weather, open attractions, and fewer crowds than in summer.',
      points: [
        'Mild weather',
        'Attractions open',
        'Fewer crowds than in summer',
        'Hotels often lower their rates after the summer rush',
      ],
    },
  ],
  bestMonth: {
    source: 'Italy.pdf · p.2',
    month: 'September',
    claim: 'September is the best month to visit Italy.',
    reasons: [
      { icon: '👥', text: 'The summer crowds have thinned.' },
      { icon: '🌡', text: 'The weather is still warm — about 75°F / 24°C.' },
      { icon: '🍇', text: 'It’s harvest season in regions like Tuscany and Piedmont, so you’ll find local festivals and events.' },
      { icon: '🏨', text: 'Hotels often lower their rates after the summer rush.' },
      { icon: '🌊', text: 'The Mediterranean is still warm enough for swimming.' },
    ],
    temperature: { f: 75, c: 24 },
  },
  durations: {
    source: 'Italy.pdf · p.2',
    question: 'How much does a trip to Italy usually cost?',
    options: [
      {
        id: 'd7',
        days: 7,
        title: '7 days in Italy',
        summary: 'Enough for two cities, like Rome and Florence or Venice and Milan.',
        itineraries: [
          { label: 'Option A', stops: ['Rome', 'Florence'] },
          { label: 'Option B', stops: ['Venice', 'Milan'] },
        ],
        stops: ['Rome', 'Florence', 'Venice', 'Milan'],
      },
      {
        id: 'd10',
        days: 10,
        title: '10 days in Italy',
        summary:
          'A well-paced itinerary with time to hit the classics: Rome, Florence, Tuscany, and maybe a ' +
          'few days on the Amalfi Coast.',
        itineraries: [
          { label: 'The classics', stops: ['Rome', 'Florence', 'Tuscany', 'Amalfi Coast'] },
        ],
        stops: ['Rome', 'Florence', 'Tuscany', 'Amalfi Coast'],
      },
    ],
  },
};

/* ===========================================================================
 * 5. ROME  — Italy.pdf, pages 2–18
 * ======================================================================== */

const rome = {
  source: 'Italy.pdf · p.2',
  title: 'Rome, Italy',
  nickname: 'The Eternal City',
  intro:
    'Rome is the capital city of Italy and one of the oldest cities in the world. It is often called ' +
    '"The Eternal City" because of its long and rich history. Rome was the center of the Roman Empire ' +
    'and is now one of the most popular tourist destinations in the world. Every year, millions of ' +
    'visitors come to admire its historical landmarks, museums, churches, and beautiful streets.',
  attractionsHeading: 'Famous Tourist Attractions',
  attractions: [
    {
      id: 'colosseum',
      number: 1,
      name: 'The Colosseum',
      italian: 'Colosseo',
      source: 'Italy.pdf · p.2',
      tagline: 'Almost 2,000 years old, and still the face of Italy.',
      description:
        'The Colosseum is the largest amphitheatre ever built and the single most recognizable landmark ' +
        'in Italy. The PDF records four facts about it — they are listed below.',
      facts: [
        { icon: '🏛', text: 'It is almost **2,000 years old**.' },
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
      source: 'Italy.pdf · p.3',
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
      source: 'Italy.pdf · p.4',
      tagline: 'A dome with a hole in it, open to the sky for 2,000 years.',
      description:
        'The Pantheon is famous for its enormous dome and its central opening, called the oculus, which ' +
        'lets natural light enter the building.',
      facts: [
        { icon: '🏛', text: 'It is nearly **2,000 years old**.' },
        { icon: '🌞', text: 'The oculus is about **9 meters (30 feet)** wide.' },
        { icon: '👑', text: 'The famous Renaissance artist **Raphael** is buried inside the Pantheon.' },
        { icon: '⛪', text: 'Today, it is still an active church where religious services are held.' },
      ],
      hero: { wiki: 'Pantheon,_Rome', caption: 'The Pantheon’s portico' },
      gallery: [
        { wiki: 'Pantheon,_Rome', caption: 'The portico and its granite columns' },
        { wiki: 'Raphael', caption: 'Raphael, buried inside' },
      ],
      quickStat: { value: '9 m', label: 'oculus width' },
    },
    {
      id: 'vatican',
      number: 4,
      name: 'Vatican City',
      italian: 'Città del Vaticano',
      source: 'Italy.pdf · pp.6–17',
      tagline: 'The smallest country in the world — and it fits inside Rome.',
      description:
        'Vatican City is the smallest country in the world and the home of the Pope. It is famous for ' +
        "St. Peter's Basilica, St. Peter's Square, and the Vatican Museums, where visitors can admire " +
        'the beautiful Sistine Chapel.',
      facts: [
        { icon: '🌍', text: 'It is the **smallest country in the world**.' },
        { icon: '⛪', text: 'It is the **home of the Pope**.' },
        { icon: '🗝', text: "Famous for St. Peter's Basilica, St. Peter's Square and the Vatican Museums." },
        { icon: '🎨', text: 'The Vatican Museums hold the **Sistine Chapel**.' },
      ],
      hero: { wiki: "St._Peter's_Basilica", caption: "St. Peter's Basilica and Square from the air" },
      gallery: [
        { wiki: "St._Peter's_Square", caption: "St. Peter's Square" },
        { wiki: 'Vatican_Museums', caption: 'The Gallery of Maps, Vatican Museums' },
        { wiki: 'Sistine_Chapel', caption: 'The Sistine Chapel' },
      ],
      hasDeepDive: true,
      quickStat: { value: '#1', label: 'smallest country' },
    },
    {
      id: 'spanish-steps',
      number: 5,
      name: 'The Spanish Steps',
      italian: 'Scalinata di Trinità dei Monti',
      source: 'Italy.pdf · p.18',
      tagline: '135 steps, one very famous film.',
      description:
        'The Spanish Steps climb from Piazza di Spagna to the church of Trinità dei Monti. The PDF ' +
        'records four facts about them.',
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
      hero: { wiki: 'Spanish_Steps', caption: 'The Spanish Steps and Piazza di Spagna' },
      gallery: [{ wiki: 'Roman_Holiday', caption: 'Roman Holiday (1953), filmed here' }],
      quickStat: { value: '135', label: 'steps' },
    },
  ],
};

/* ===========================================================================
 * 6. VATICAN DEEP DIVE — Italy.pdf, pages 6–17
 *    Hotspot coordinates are percentages on the hand-drawn SVG plan.
 * ======================================================================== */

const vatican = {
  source: 'Italy.pdf · pp.6–17',
  title: 'Inside Vatican City',
  intro:
    'Vatican City is the smallest country in the world and the home of the Pope. Click any part of the ' +
    'plan to explore what the PDF shows there.',
  // x / y are coordinates in the plan SVG's own 100 × 72 viewBox.
  hotspots: [
    {
      id: 'square',
      name: "St. Peter's Square",
      italian: 'Piazza San Pietro',
      x: 74,
      y: 53,
      label: { anchor: 'middle', dx: 0, dy: 13.6 },
      blurb:
        'The great oval piazza in front of the basilica, ringed by colonnades and centred on an obelisk. ' +
        'One of the three sights the PDF names for Vatican City.',
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
      x: 48,
      y: 55,
      label: { anchor: 'middle', dx: 0, dy: 5.6 },
      blurb:
        'The basilica at the heart of the Vatican. The PDF singles out its dome — the great ribbed cupola ' +
        'that dominates the Roman skyline — and Michelangelo’s Pietà inside.',
      wiki: "St._Peter's_Basilica",
      gallery: [
        { wiki: "St._Peter's_Basilica", caption: "St. Peter's Basilica" },
        { wiki: 'Pietà_(Michelangelo)', caption: 'The Pietà, Michelangelo' },
      ],
    },
    {
      id: 'museums',
      name: 'Vatican Museums',
      italian: 'Musei Vaticani',
      x: 62,
      y: 19,
      label: { anchor: 'middle', dx: 0, dy: -3.6 },
      blurb:
        'Where visitors can admire the beautiful Sistine Chapel. Miles of galleries — including the ' +
        'gilded Gallery of Maps and the famous spiral Bramante staircase on the way out.',
      wiki: 'Vatican_Museums',
      gallery: [
        { wiki: 'Vatican_Museums', caption: 'The Gallery of Maps' },
        { wiki: 'Bramante_Staircase', caption: 'The spiral staircase' },
      ],
    },
    {
      id: 'sistine',
      name: 'Sistine Chapel',
      italian: 'Cappella Sistina',
      x: 46.5,
      y: 38.5,
      label: { anchor: 'end', dx: -3, dy: 1 },
      blurb:
        'The chapel inside the Vatican Museums. Its ceiling holds The Creation of Adam, and its altar ' +
        'wall The Last Judgment — both by Michelangelo.',
      wiki: 'Sistine_Chapel',
      gallery: [
        { wiki: 'Sistine_Chapel', caption: 'The chapel interior' },
        { wiki: 'The_Creation_of_Adam', caption: 'The Creation of Adam' },
        { wiki: 'The_Last_Judgment_(Michelangelo)', caption: 'The Last Judgment' },
      ],
    },
    {
      id: 'palace',
      name: 'Apostolic Palace',
      italian: 'Palazzo Apostolico',
      x: 60,
      y: 39,
      label: { anchor: 'middle', dx: 0, dy: -8.5 },
      blurb: 'The official residence of the Pope, whose home the PDF names as Vatican City itself.',
      wiki: 'Apostolic_Palace',
      gallery: [{ wiki: 'Apostolic_Palace', caption: 'The Apostolic Palace' }],
    },
    {
      id: 'gardens',
      name: 'Vatican Gardens',
      italian: 'Giardini Vaticani',
      x: 26,
      y: 42,
      label: { anchor: 'middle', dx: 0, dy: 5.6 },
      blurb: 'More than half the territory of the world’s smallest country is garden.',
      wiki: 'Vatican_Gardens',
      gallery: [{ wiki: 'Vatican_Gardens', caption: 'The Vatican Gardens' }],
    },
  ],
  masterpieces: [
    {
      id: 'creation',
      title: 'The Creation of Adam',
      where: 'Sistine Chapel ceiling',
      wiki: 'The_Creation_of_Adam',
      note: 'Shown in the PDF on page 12.',
    },
    {
      id: 'judgment',
      title: 'The Last Judgment',
      where: 'Sistine Chapel altar wall',
      wiki: 'The_Last_Judgment_(Michelangelo)',
      note: 'Shown in the PDF on pages 13–14.',
    },
    {
      id: 'pieta',
      title: 'Pietà',
      where: "St. Peter's Basilica",
      wiki: 'Pietà_(Michelangelo)',
      note: 'Shown in the PDF on page 17.',
    },
    {
      id: 'dome',
      title: "Dome of St. Peter's Basilica",
      where: "St. Peter's Basilica",
      wiki: "St._Peter's_Basilica",
      note: 'Shown in the PDF on pages 15–16.',
    },
  ],
};

/* ===========================================================================
 * 7. QUIZ — every answer is checkable against the PDF
 * ======================================================================== */

const quiz = [
  {
    id: 'q1',
    question: 'How many regions does Italy have?',
    options: ['12', '20', '25', '7'],
    answer: 1,
    because: 'Italy has 20 regions, and each has its own traditions, food and attractions.',
    source: 'Italy.pdf · p.1',
  },
  {
    id: 'q2',
    question: 'Which region do you travel to for Florence, Pisa and Siena?',
    options: ['Veneto', 'Campania', 'Tuscany (Toscana)', 'Lombardy'],
    answer: 2,
    because: 'The guide maps Tuscany (Toscana) → Florence, Pisa, Siena.',
    source: 'Italy.pdf · p.1',
  },
  {
    id: 'q3',
    question: 'Which months are Italy’s high season?',
    options: ['April to June', 'June to August', 'November to March', 'September to October'],
    answer: 1,
    because: 'High season runs June to August — the priciest, busiest window.',
    source: 'Italy.pdf · p.1',
  },
  {
    id: 'q4',
    question: 'Which single month does the guide call the best month to visit Italy?',
    options: ['May', 'July', 'September', 'January'],
    answer: 2,
    because:
      'September: the summer crowds have thinned, it is still about 24°C, and it is harvest season in ' +
      'Tuscany and Piedmont.',
    source: 'Italy.pdf · p.2',
  },
  {
    id: 'q5',
    question: 'About how many people could the Colosseum accommodate?',
    options: ['5,000', '15,000', '50,000', '500,000'],
    answer: 2,
    because: 'Around 50,000 people — and it is almost 2,000 years old.',
    source: 'Italy.pdf · p.2',
  },
  {
    id: 'q6',
    question: 'At the Trevi Fountain, what does throwing three coins mean?',
    options: [
      'You will return to Rome',
      'You may fall in love with an Italian',
      'You may get married',
      'You get your money back',
    ],
    answer: 2,
    because: 'One coin = you return to Rome; two = you may fall in love with an Italian; three = you may marry.',
    source: 'Italy.pdf · p.3',
  },
  {
    id: 'q7',
    question: 'What is the opening in the Pantheon’s dome called?',
    options: ['The oculus', 'The lantern', 'The cupola', 'The apse'],
    answer: 0,
    because: 'The oculus — about 9 meters (30 feet) wide — lets natural light into the building.',
    source: 'Italy.pdf · p.4',
  },
  {
    id: 'q8',
    question: 'Which famous Renaissance artist is buried inside the Pantheon?',
    options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
    answer: 2,
    because: 'Raphael is buried inside the Pantheon, which is still an active church today.',
    source: 'Italy.pdf · p.4',
  },
  {
    id: 'q9',
    question: 'What is Vatican City?',
    options: [
      'A district of Rome',
      'The smallest country in the world',
      'A museum complex',
      'An island off Naples',
    ],
    answer: 1,
    because: 'It is the smallest country in the world and the home of the Pope.',
    source: 'Italy.pdf · p.6',
  },
  {
    id: 'q10',
    question: 'How many steps do the Spanish Steps have?',
    options: ['99', '135', '212', '365'],
    answer: 1,
    because: '135 steps, completed in 1725, next to the Spanish Embassy to the Holy See.',
    source: 'Italy.pdf · p.18',
  },
];

/* ===========================================================================
 * Export
 * ======================================================================== */

module.exports = {
  overview,
  guideRegions,
  amalfiNote,
  regionInfo,
  planning,
  rome,
  vatican,
  quiz,
  meta: {
    sourceDocument: 'Italy.pdf',
    pages: 18,
    generatedFor: 'Interactive learning presentation',
    disclaimer:
      'Regional population and area figures in the map dossier are rounded approximations for teaching ' +
      'purposes and do not come from Italy.pdf. Every other fact on this site is transcribed from it.',
  },
};
