export type MissionThoughtCategory =
  | 'EARTH & HOME'
  | 'COURAGE'
  | 'PURPOSE'
  | 'DISCOVERY'
  | 'RESILIENCE'
  | 'SOLITUDE'
  | 'HUMANITY'
  | 'THE UNKNOWN'
  | 'TIME'
  | 'LIFE'
  | 'HOPE'
  | 'FAILURE & RECOVERY'
  | 'TEAM & CREW'
  | 'MARS / DEEP SPACE'
  | 'FUTURE GENERATIONS';

export type PresentationMode =
  | 'MINIMAL'
  | 'ORBITAL'
  | 'STARFIELD'
  | 'TELEMETRY'
  | 'TRANSMISSION'
  | 'CONSTELLATION';

export interface ConstellationPoint {
  x: number;
  y: number;
  r: number;
  label?: string;
}

export interface MissionThought {
  id: string;
  quote: string;
  supportingLine?: string;
  category: MissionThoughtCategory;
  transmissionCode: string;
  preferredMode?: PresentationMode;
  constellation?: {
    points: ConstellationPoint[];
    lines: Array<[number, number]>;
  };
}

// Preset abstract constellation vectors (normalized coordinates 0-100)
const CONSTELLATIONS = {
  ORIONIS: {
    points: [{ x: 15, y: 25, r: 2 }, { x: 85, y: 20, r: 2.5 }, { x: 42, y: 50, r: 1.8 }, { x: 50, y: 52, r: 2 }, { x: 58, y: 54, r: 1.8 }, { x: 20, y: 80, r: 2.2 }, { x: 80, y: 78, r: 2.4 }],
    lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 1], [5, 6]] as Array<[number, number]>
  },
  VEGA_CYGNUS: {
    points: [{ x: 50, y: 15, r: 2.8 }, { x: 50, y: 48, r: 2.2 }, { x: 50, y: 82, r: 2 }, { x: 20, y: 48, r: 2.2 }, { x: 80, y: 48, r: 2.2 }],
    lines: [[0, 1], [1, 2], [3, 1], [1, 4]] as Array<[number, number]>
  },
  CASSIOPEIA: {
    points: [{ x: 12, y: 35, r: 2.2 }, { x: 32, y: 68, r: 2.4 }, { x: 52, y: 42, r: 2 }, { x: 72, y: 62, r: 2.3 }, { x: 88, y: 30, r: 2.5 }],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]] as Array<[number, number]>
  },
  URSA_NAVIGATOR: {
    points: [{ x: 15, y: 60, r: 2.2 }, { x: 30, y: 62, r: 2 }, { x: 44, y: 50, r: 2.1 }, { x: 58, y: 52, r: 2.3 }, { x: 62, y: 28, r: 2.5 }, { x: 85, y: 22, r: 2.8 }, { x: 82, y: 46, r: 2 }],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] as Array<[number, number]>
  },
  CENTAURUS: {
    points: [{ x: 22, y: 75, r: 2.6 }, { x: 38, y: 52, r: 2 }, { x: 50, y: 26, r: 2.4 }, { x: 68, y: 40, r: 2.2 }, { x: 84, y: 65, r: 2.5 }],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 3]] as Array<[number, number]>
  },
  SOLARIS: {
    points: [{ x: 50, y: 50, r: 3 }, { x: 25, y: 30, r: 1.8 }, { x: 75, y: 30, r: 1.8 }, { x: 25, y: 70, r: 1.8 }, { x: 75, y: 70, r: 1.8 }],
    lines: [[1, 0], [2, 0], [3, 0], [4, 0], [1, 2], [3, 4]] as Array<[number, number]>
  }
};

export const MISSION_THOUGHTS: MissionThought[] = [
  // =========================================================================
  // A. EARTH & HOME (8 Thoughts)
  // =========================================================================
  {
    id: "thought-01",
    category: "EARTH & HOME",
    transmissionCode: "TR-001",
    quote: "From here, Earth is small. Its meaning is not.",
    supportingLine: "Every ocean, every memory, every dawn remains woven into who we are.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-02",
    category: "EARTH & HOME",
    transmissionCode: "TR-002",
    quote: "We did not leave home to escape our world, but to learn how fragile and precious it truly is.",
    supportingLine: "Distance does not erase devotion; it distills it.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },
  {
    id: "thought-03",
    category: "EARTH & HOME",
    transmissionCode: "TR-003",
    quote: "A single sunrise seen from orbit can reorder a lifetime of priorities.",
    supportingLine: "The atmosphere is only a paper-thin veil protecting everything we cherish.",
    preferredMode: "STARFIELD",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-04",
    category: "EARTH & HOME",
    transmissionCode: "TR-004",
    quote: "Earth is a pale beacon in our rearview, but its heartbeat remains inside us.",
    supportingLine: "We carry eight billion hopes into the dark.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-05",
    category: "EARTH & HOME",
    transmissionCode: "TR-005",
    quote: "When looking back at the blue crescent, national borders vanish entirely.",
    supportingLine: "Only one crew. Only one home planet.",
    preferredMode: "CONSTELLATION",
    constellation: CONSTELLATIONS.SOLARIS
  },

  // =========================================================================
  // B. COURAGE (6 Thoughts)
  // =========================================================================
  {
    id: "thought-06",
    category: "COURAGE",
    transmissionCode: "TR-006",
    quote: "Courage in deep space is quiet. It is found in steady hands on the console.",
    supportingLine: "Calmness is our strongest shield against the unknown.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-07",
    category: "COURAGE",
    transmissionCode: "TR-007",
    quote: "Bravery is not the lack of trepidation, but crossing the airlock anyway.",
    supportingLine: "Stand firm at the threshold of the deep vacuum.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-08",
    category: "COURAGE",
    transmissionCode: "TR-008",
    quote: "We were never promised certainty. Only another horizon.",
    supportingLine: "Confidence grows with every checklist executed with precision.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },
  {
    id: "thought-09",
    category: "COURAGE",
    transmissionCode: "TR-009",
    quote: "Do not fear the silence between stellar signals.",
    supportingLine: "It is simply the space where clarity takes root.",
    preferredMode: "STARFIELD",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },
  {
    id: "thought-10",
    category: "COURAGE",
    transmissionCode: "TR-010",
    quote: "Keep going.",
    supportingLine: "One telemetry cycle at a time.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.SOLARIS
  },

  // =========================================================================
  // C. PURPOSE (6 Thoughts)
  // =========================================================================
  {
    id: "thought-11",
    category: "PURPOSE",
    transmissionCode: "TR-011",
    quote: "Far from Earth. Close to purpose.",
    supportingLine: "Every heartbeat moves humanity forward.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-12",
    category: "PURPOSE",
    transmissionCode: "TR-012",
    quote: "The distance is measured in millions of kilometers. The purpose is measured in every step.",
    supportingLine: "Maintain focus on the instruments, and trust the crew beside you.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-13",
    category: "PURPOSE",
    transmissionCode: "TR-013",
    quote: "The farther we travel, the more we understand what we carry with us.",
    supportingLine: "A sacred trust handed from past explorers to future generations.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },
  {
    id: "thought-14",
    category: "PURPOSE",
    transmissionCode: "TR-014",
    quote: "You may be millions of kilometers from Earth, but you are never without purpose.",
    supportingLine: "Every calculation and every observation expands our shared horizon.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },
  {
    id: "thought-15",
    category: "PURPOSE",
    transmissionCode: "TR-015",
    quote: "Even when Earth is silent, your purpose remains.",
    supportingLine: "The mission is defined not by incoming transmissions, but by steady resolve.",
    preferredMode: "CONSTELLATION",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },

  // =========================================================================
  // D. DISCOVERY (6 Thoughts)
  // =========================================================================
  {
    id: "thought-16",
    category: "DISCOVERY",
    transmissionCode: "TR-016",
    quote: "The unknown is not empty. It is waiting to be understood.",
    supportingLine: "Each new spectrogram tells a story billions of years in the making.",
    preferredMode: "STARFIELD",
    constellation: CONSTELLATIONS.SOLARIS
  },
  {
    id: "thought-17",
    category: "DISCOVERY",
    transmissionCode: "TR-017",
    quote: "Discovery is not just reaching a new planet, but acquiring new eyes to perceive it.",
    supportingLine: "Old assumptions stay in low Earth orbit. Open inquiry travels beyond.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-18",
    category: "DISCOVERY",
    transmissionCode: "TR-018",
    quote: "Somewhere in this vast dark, an answer is waiting for the right question.",
    supportingLine: "Keep observing. The instruments will reveal what words cannot.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-19",
    category: "DISCOVERY",
    transmissionCode: "TR-019",
    quote: "Every crater tells of ancient collisions; every sample reveals our cosmic ancestry.",
    supportingLine: "We are stardust returning to examine the stars.",
    preferredMode: "CONSTELLATION",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-20",
    category: "DISCOVERY",
    transmissionCode: "TR-020",
    quote: "To explore is to honor the curiosity that brought our ancestors across oceans.",
    supportingLine: "The ocean is simply wider now, and paved with starlight.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },

  // =========================================================================
  // E. RESILIENCE (6 Thoughts)
  // =========================================================================
  {
    id: "thought-21",
    category: "RESILIENCE",
    transmissionCode: "TR-021",
    quote: "Resilience is not the absence of fatigue; it is deciding to check one more system before rest.",
    supportingLine: "Small routines sustain great voyages.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },
  {
    id: "thought-22",
    category: "RESILIENCE",
    transmissionCode: "TR-022",
    quote: "Not every day has to be extraordinary. Some days, continuing is enough.",
    supportingLine: "Keep your pace steady. The mission is built on cumulative consistency.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-23",
    category: "RESILIENCE",
    transmissionCode: "TR-023",
    quote: "When systems stress and alarms sound, discipline restores gravity.",
    supportingLine: "Acknowledge the variance. Execute the emergency checklist. Reclaim balance.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.SOLARIS
  },
  {
    id: "thought-24",
    category: "RESILIENCE",
    transmissionCode: "TR-024",
    quote: "Breathe. Calibrate. Continue.",
    supportingLine: "A calm mind is the most reliable navigation computer on board.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-25",
    category: "RESILIENCE",
    transmissionCode: "TR-025",
    quote: "The hull protects against the cold of space; our mental composure protects everything inside.",
    supportingLine: "Tend to your thoughts with the same care as life support.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },

  // =========================================================================
  // F. SOLITUDE (6 Thoughts)
  // =========================================================================
  {
    id: "thought-26",
    category: "SOLITUDE",
    transmissionCode: "TR-026",
    quote: "Out here, silence is not emptiness—it is the space where focus is forged.",
    supportingLine: "The mission endures through steady inner discipline.",
    preferredMode: "STARFIELD",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-27",
    category: "SOLITUDE",
    transmissionCode: "TR-027",
    quote: "Solitude in orbit is an austere teacher.",
    supportingLine: "It strips away trivial noise and reveals the essential core of living.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-28",
    category: "SOLITUDE",
    transmissionCode: "TR-028",
    quote: "You are alone with the instruments, but united with history.",
    supportingLine: "Generations of thinkers and craftspeople stand invisible at your side.",
    preferredMode: "CONSTELLATION",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },
  {
    id: "thought-29",
    category: "SOLITUDE",
    transmissionCode: "TR-029",
    quote: "In the profound quiet of the night watch, find companionship in your purpose.",
    supportingLine: "The spacecraft moves in harmony with cosmic law.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-30",
    category: "SOLITUDE",
    transmissionCode: "TR-030",
    quote: "Distance isolates the body, but shared mission binds the soul.",
    supportingLine: "Hold tight to the quiet bonds that anchor your spirit.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.SOLARIS
  },

  // =========================================================================
  // G. HUMANITY (6 Thoughts)
  // =========================================================================
  {
    id: "thought-31",
    category: "HUMANITY",
    transmissionCode: "TR-031",
    quote: "You are not traveling alone. Humanity is traveling with you.",
    supportingLine: "Every bolt turned and line of code written carries human goodwill.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-32",
    category: "HUMANITY",
    transmissionCode: "TR-032",
    quote: "Every heartbeat carries a piece of Earth forward.",
    supportingLine: "We are life reaching out from cradle waters toward the suns.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },
  {
    id: "thought-33",
    category: "HUMANITY",
    transmissionCode: "TR-033",
    quote: "Our technology is remarkable, but human compassion is what makes the journey meaningful.",
    supportingLine: "Never forget why we build vessels for the void.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-34",
    category: "HUMANITY",
    transmissionCode: "TR-034",
    quote: "In this metallic corridor, human warmth is our most valuable renewable resource.",
    supportingLine: "A shared laugh or a word of encouragement alters the entire cabin atmosphere.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-35",
    category: "HUMANITY",
    transmissionCode: "TR-035",
    quote: "We carry the laughter of children and the wisdom of elders across the vacuum.",
    supportingLine: "We are human emissaries in an ancient cosmos.",
    preferredMode: "STARFIELD",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },

  // =========================================================================
  // H. THE UNKNOWN (6 Thoughts)
  // =========================================================================
  {
    id: "thought-36",
    category: "THE UNKNOWN",
    transmissionCode: "TR-036",
    quote: "The horizon did not disappear when we left orbit; it simply expanded into the infinite.",
    supportingLine: "Keep your gaze steady on the destination ahead.",
    preferredMode: "CONSTELLATION",
    constellation: CONSTELLATIONS.SOLARIS
  },
  {
    id: "thought-37",
    category: "THE UNKNOWN",
    transmissionCode: "TR-037",
    quote: "Do not demand immediate answers from an ancient universe.",
    supportingLine: "Learn to listen before drawing conclusions.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-38",
    category: "THE UNKNOWN",
    transmissionCode: "TR-038",
    quote: "Beyond the navigation map lies the realm of possibility.",
    supportingLine: "Pioneers exist to make maps out of mysteries.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },
  {
    id: "thought-39",
    category: "THE UNKNOWN",
    transmissionCode: "TR-039",
    quote: "Space is dark only until our curiosity lights the way.",
    supportingLine: "Let reason and wonder illuminate every quadrant.",
    preferredMode: "STARFIELD",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-40",
    category: "THE UNKNOWN",
    transmissionCode: "TR-040",
    quote: "Every boundary humanity once considered impassable now sits behind us.",
    supportingLine: "The current boundary will join them soon.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },

  // =========================================================================
  // I. TIME (5 Thoughts)
  // =========================================================================
  {
    id: "thought-41",
    category: "TIME",
    transmissionCode: "TR-041",
    quote: "Between the stars, time slows down to the cadence of your breath.",
    supportingLine: "Stay grounded in your craft, no matter how vast the void.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-42",
    category: "TIME",
    transmissionCode: "TR-042",
    quote: "Light from these distant nebulae began its journey before humanity learned to write.",
    supportingLine: "We are witnesses to the deep architecture of time.",
    preferredMode: "STARFIELD",
    constellation: CONSTELLATIONS.SOLARIS
  },
  {
    id: "thought-43",
    category: "TIME",
    transmissionCode: "TR-043",
    quote: "Minutes feel long during critical burns; years feel brief when reflecting back.",
    supportingLine: "Anchor yourself in the present moment.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-44",
    category: "TIME",
    transmissionCode: "TR-044",
    quote: "Patience is as essential to orbital mechanics as delta-v.",
    supportingLine: "The planets will align when the trajectory is true.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-45",
    category: "TIME",
    transmissionCode: "TR-045",
    quote: "Every Sol spent in space is an investment in human longevity.",
    supportingLine: "Count the discoveries, not just the elapsed days.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },

  // =========================================================================
  // J. LIFE (5 Thoughts)
  // =========================================================================
  {
    id: "thought-46",
    category: "LIFE",
    transmissionCode: "TR-046",
    quote: "Every breath is proof that the journey continues.",
    supportingLine: "Life is tenacious, carrying water and warmth where none existed.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },
  {
    id: "thought-47",
    category: "LIFE",
    transmissionCode: "TR-047",
    quote: "In the sterile vacuum, a single green seedling in hydroponics is a cathedral.",
    supportingLine: "Cherish the vital processes that keep our biology humming.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-48",
    category: "LIFE",
    transmissionCode: "TR-048",
    quote: "Life did not arise to remain stationary on one rock.",
    supportingLine: "Dispersal across the stars is biology fulfilling its deepest instinct.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.SOLARIS
  },
  {
    id: "thought-49",
    category: "LIFE",
    transmissionCode: "TR-049",
    quote: "To nourish your body and mind is an operational duty, not a secondary luxury.",
    supportingLine: "The spacecraft cannot succeed if the astronaut is depleted.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-50",
    category: "LIFE",
    transmissionCode: "TR-050",
    quote: "We are fragile carbon beings daring to navigate oceans of radiation.",
    supportingLine: "That audacity is our greatest beauty.",
    preferredMode: "CONSTELLATION",
    constellation: CONSTELLATIONS.ORIONIS
  },

  // =========================================================================
  // K. HOPE (5 Thoughts)
  // =========================================================================
  {
    id: "thought-51",
    category: "HOPE",
    transmissionCode: "TR-051",
    quote: "Hope is not passive optimism; it is the discipline to keep calculating trajectories.",
    supportingLine: "Work the problem until the solution appears.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },
  {
    id: "thought-52",
    category: "HOPE",
    transmissionCode: "TR-052",
    quote: "Even in the coldest shadow of eclipse, the sun will crest the planet's limb.",
    supportingLine: "The darkest orbital phase is always temporary.",
    preferredMode: "STARFIELD",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-53",
    category: "HOPE",
    transmissionCode: "TR-053",
    quote: "Let your belief in tomorrow guide your telemetry today.",
    supportingLine: "We do not fly on fuel alone, but on collective aspiration.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },
  {
    id: "thought-54",
    category: "HOPE",
    transmissionCode: "TR-054",
    quote: "A beacon shines brightest when surrounding space is darkest.",
    supportingLine: "Be that beacon for yourself and your crewmates.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.SOLARIS
  },
  {
    id: "thought-55",
    category: "HOPE",
    transmissionCode: "TR-055",
    quote: "The future is not fixed by fate; it is shaped by astronauts who refuse to turn back.",
    supportingLine: "Hold course. The dawn is waiting.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.CENTAURUS
  },

  // =========================================================================
  // L. FAILURE & RECOVERY (5 Thoughts)
  // =========================================================================
  {
    id: "thought-56",
    category: "FAILURE & RECOVERY",
    transmissionCode: "TR-056",
    quote: "An anomaly is not a defeat; it is data instructing us how to succeed.",
    supportingLine: "Isolate the root cause. Adjust the parameters. Re-engage.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-57",
    category: "FAILURE & RECOVERY",
    transmissionCode: "TR-057",
    quote: "When a burn falls short, do not waste energy on regret—recompute the rendezvous.",
    supportingLine: "There is always another viable trajectory.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },
  {
    id: "thought-58",
    category: "FAILURE & RECOVERY",
    transmissionCode: "TR-058",
    quote: "Forgive yourself for moments of exhaustion.",
    supportingLine: "Rest is not surrender; it is system maintenance.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-59",
    category: "FAILURE & RECOVERY",
    transmissionCode: "TR-059",
    quote: "Every space program was forged through setbacks overcome with quiet resolve.",
    supportingLine: "We inherit their resilience with every mission command.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },
  {
    id: "thought-60",
    category: "FAILURE & RECOVERY",
    transmissionCode: "TR-060",
    quote: "The only fatal error is refusing to learn from the last telemetry readout.",
    supportingLine: "Iterate with clarity. Advance with humility.",
    preferredMode: "CONSTELLATION",
    constellation: CONSTELLATIONS.SOLARIS
  },

  // =========================================================================
  // M. TEAM & CREW (5 Thoughts)
  // =========================================================================
  {
    id: "thought-61",
    category: "TEAM & CREW",
    transmissionCode: "TR-061",
    quote: "A crew is not merely a team—it is a closed ecosystem of mutual trust.",
    supportingLine: "When one falters, others steady the helm without judgment.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-62",
    category: "TEAM & CREW",
    transmissionCode: "TR-062",
    quote: "In deep space, psychological safety is as critical as hull integrity.",
    supportingLine: "Listen openly. Speak transparently. Protect each other's peace.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-63",
    category: "TEAM & CREW",
    transmissionCode: "TR-063",
    quote: "The greatest instrument aboard this craft is the empathy between crewmates.",
    supportingLine: "No algorithm can substitute for genuine human solidarity.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },
  {
    id: "thought-64",
    category: "TEAM & CREW",
    transmissionCode: "TR-064",
    quote: "Thousands of engineers on the ground poured their lives into these seals and valves.",
    supportingLine: "Every successful burn honors their devotion.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },
  {
    id: "thought-65",
    category: "TEAM & CREW",
    transmissionCode: "TR-065",
    quote: "Divided by individual stress, we are vulnerable. United in mission, we are unstoppable.",
    supportingLine: "Synchronize your efforts with the crew.",
    preferredMode: "CONSTELLATION",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },

  // =========================================================================
  // N. MARS / DEEP SPACE (5 Thoughts)
  // =========================================================================
  {
    id: "thought-66",
    category: "MARS / DEEP SPACE",
    transmissionCode: "TR-066",
    quote: "The red dust of Mars holds the questions of our origin.",
    supportingLine: "We walk there not as conquerors, but as humble students of the solar system.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.SOLARIS
  },
  {
    id: "thought-67",
    category: "MARS / DEEP SPACE",
    transmissionCode: "TR-067",
    quote: "Crossing interplanetary space changes how you perceive distance forever.",
    supportingLine: "Days become astronomical units; thoughts become cosmic anchors.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-68",
    category: "MARS / DEEP SPACE",
    transmissionCode: "TR-068",
    quote: "Mars is an austere frontier, but it will soon know the sound of human voices.",
    supportingLine: "The first steps on another world echo through all of future history.",
    preferredMode: "STARFIELD",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-69",
    category: "MARS / DEEP SPACE",
    transmissionCode: "TR-069",
    quote: "Out in the deep interplanetary void, Earth is no longer an expanse—it is a jewel.",
    supportingLine: "And we are its emissaries, carrying fire into the cold.",
    preferredMode: "ORBITAL",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  },
  {
    id: "thought-70",
    category: "MARS / DEEP SPACE",
    transmissionCode: "TR-070",
    quote: "Every kilometer gained toward the red planet brings humanity closer to becoming multiplanetary.",
    supportingLine: "This is the threshold between who we were and who we will become.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.CASSIOPEIA
  },

  // =========================================================================
  // O. FUTURE GENERATIONS (5 Thoughts)
  // =========================================================================
  {
    id: "thought-71",
    category: "FUTURE GENERATIONS",
    transmissionCode: "TR-071",
    quote: "The children of tomorrow will read of these missions the way we read of ancient seafaring.",
    supportingLine: "Build their history with integrity and courage.",
    preferredMode: "CONSTELLATION",
    constellation: CONSTELLATIONS.URSA_NAVIGATOR
  },
  {
    id: "thought-72",
    category: "FUTURE GENERATIONS",
    transmissionCode: "TR-072",
    quote: "We plant trees under whose shade we may never sit, and build ships whose destinations our grandchildren will inhabit.",
    supportingLine: "This is the highest expression of human stewardship.",
    preferredMode: "STARFIELD",
    constellation: CONSTELLATIONS.SOLARIS
  },
  {
    id: "thought-73",
    category: "FUTURE GENERATIONS",
    transmissionCode: "TR-073",
    quote: "They will look up from classrooms on Earth and Mars, knowing the path was opened here.",
    supportingLine: "Hold steady. The future is taking notes.",
    preferredMode: "MINIMAL",
    constellation: CONSTELLATIONS.ORIONIS
  },
  {
    id: "thought-74",
    category: "FUTURE GENERATIONS",
    transmissionCode: "TR-074",
    quote: "Every sacrifice in deep space purchases a wider sky for those who follow.",
    supportingLine: "No effort is wasted when dedicated to the continuum of exploration.",
    preferredMode: "TELEMETRY",
    constellation: CONSTELLATIONS.CENTAURUS
  },
  {
    id: "thought-75",
    category: "FUTURE GENERATIONS",
    transmissionCode: "TR-075",
    quote: "Sometimes the greatest distance is not between planets, but between where we are and where we are meant to be.",
    supportingLine: "We bridge that distance with every completed Sol.",
    preferredMode: "TRANSMISSION",
    constellation: CONSTELLATIONS.VEGA_CYGNUS
  }
];
