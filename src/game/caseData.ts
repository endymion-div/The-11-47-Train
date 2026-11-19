import type {
  CaseQuestion,
  EvidenceItem,
  HypothesisTemplate,
  LocationId,
  SuspectId,
  SuspectProfile,
  TimelineEventCard,
  TimelineSlot,
  TrainLocation,
} from './types';

export const ANONYMOUS_NOTE_TEXT = 'At 11:47 PM, someone on this train will die.';

export const VICTIM_INFO = {
  name: 'Thomas Avery',
  title: 'Senior Syndicate Railway Auditor',
  age: 54,
  compartment: 'Carriage 7, Compartment 4',
  causeOfDeath: 'Blunt cranial trauma following mild chloral hydrate sedation',
  summary:
    'Found slumped beside the locked compartment desk at 11:48:33 PM. The interior brass slide-bolt was thrown, both windows were factory-sealed against the storm, and the train never slowed.',
};

export const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'ev_anonymous_note',
    name: 'Anonymous 11:20 PM Warning Note',
    category: 'Documentary',
    location: 'carriage_7',
    locationLabel: 'Elias Vane Coat Pocket',
    timeDiscovered: '11:20 PM',
    description:
      'A folded slip of Silver Meridian stationery typed on a misaligned pica carriage: "At 11:47 PM, someone on this train will die."',
    observationNote: 'Notice the lowered capital "T" and faint violet ribbon ink—identical to the conductor manifest typewriter.',
    reliability: 'Verified',
    possibleConnections: ['Conductor Typewriter', 'Premeditated Timing'],
    isKeyClue: true,
  },
  {
    id: 'ev_stopped_watch',
    name: "Avery's Shattered Pocket Watch",
    category: 'Timeline',
    location: 'victims_compartment',
    locationLabel: 'Carriage 7, Compartment 4',
    timeDiscovered: '11:49 PM',
    description:
      'A heavy silver pocket watch crushed on the underside by a blunt impact. Its hands froze cleanly at 11:47:30.',
    observationNote: 'The crystal cracked inward at the exact moment of the metallic thud heard across Carriage 7.',
    reliability: 'Verified',
    possibleConnections: ['11:47:30 Sound', 'Coupling Wrench'],
    isKeyClue: true,
  },
  {
    id: 'ev_brandy_residue',
    name: 'Brandy Glass with Bitter Residue',
    category: 'Physical',
    location: 'victims_compartment',
    locationLabel: 'Carriage 7, Compartment 4',
    timeDiscovered: '11:50 PM',
    description:
      'A crystal snifter beside Avery’s elbow containing dregs of cognac and pale crystalline sediment smelling faintly of sweet pear—chloral hydrate.',
    observationNote: 'Avery was sedated before 11:47 so he would be sluggish when answering the door.',
    reliability: 'Verified',
    possibleConnections: ['Dr. Mercer Medical Satchel', 'Pre-Blackout Sedation'],
    isKeyClue: true,
    requiresObservation: true,
  },
  {
    id: 'ev_door_scratch',
    name: 'Fresh Brass Scratch on Bolt & Transom',
    category: 'Physical',
    location: 'victims_compartment',
    locationLabel: 'Carriage 7, Compartment 4 Door',
    timeDiscovered: '11:51 PM',
    description:
      'A bright, curved scoring mark along the painted brass slide-bolt plate and a frayed silk fiber snagged near the upper ventilation transom louver.',
    observationNote: 'Someone pulled the interior bolt shut from the outside corridor using stiff wire fed through the transom slats.',
    reliability: 'Verified',
    possibleConnections: ['Coiled Piano Wire', 'Locked-Room Method'],
    isKeyClue: true,
    requiresObservation: true,
  },
  {
    id: 'ev_sealed_windows',
    name: 'Intact Storm-Sealed Window Clasps',
    category: 'Environmental',
    location: 'victims_compartment',
    locationLabel: 'Carriage 7, Compartment 4',
    timeDiscovered: '11:49 PM',
    description:
      'Both double-pane windows are bolted shut with unbroken winter-storm lead seals and untouched dust along the exterior sills.',
    observationNote: 'Rules out any entry or exit from the roof or exterior running board.',
    reliability: 'Verified',
    possibleConnections: ['Corridor Access Only'],
    isKeyClue: false,
  },
  {
    id: 'ev_wet_footprint',
    name: 'Damp Size-9 Felt Sole Smudge',
    category: 'Physical',
    location: 'carriage_7',
    locationLabel: 'Carriage 7 Rear Vestibule',
    timeDiscovered: '11:52 PM',
    description:
      'A faint, clean-edged damp imprint on the mahogany runner leading from the Observation Carriage vestibule toward Compartment 4—not a leather heel, but soft felt.',
    observationNote: 'Matches soft overshoes worn to muffle footsteps during the blackout.',
    reliability: 'High',
    possibleConnections: ['Arthur Bell Suitcase', 'Observation Vestibule'],
    isKeyClue: true,
    requiresObservation: true,
  },
  {
    id: 'ev_hale_cigarette_case',
    name: "Victor Hale's Brass Cigarette Case",
    category: 'Physical',
    location: 'carriage_7',
    locationLabel: 'Carriage 7 Corridor',
    timeDiscovered: '11:53 PM',
    description:
      'Engraved "V.H." and lying beside the wainscoting outside Compartment 4. Two Turkish cigarettes remain inside; the hinge is warm from earlier handling.',
    observationNote: 'Placed or dropped earlier—check when Victor Hale actually left Carriage 7.',
    reliability: 'High',
    possibleConnections: ['Victor Hale Argument', 'Red Herring'],
    isKeyClue: false,
  },
  {
    id: 'ev_thermal_shunt',
    name: '90-Second Bi-Metal Timing Shunt',
    category: 'Digital',
    location: 'carriage_7',
    locationLabel: 'Carriage 7 Junction Panel',
    timeDiscovered: '11:54 PM',
    description:
      'A modified pocket-watch balance spring and copper strip wedged across the Carriage 7 main lighting relay—engineered to trip at 11:47 and thermally release after 90 seconds.',
    observationNote: 'Proves the blackout was mechanically timed to the exact second, not a storm fault.',
    reliability: 'Verified',
    possibleConnections: ['11:47:00 Blackout', 'Engine Access Tools'],
    isKeyClue: true,
  },
  {
    id: 'ev_missing_wrench',
    name: 'Missing Brass Coupling Wrench Slot',
    category: 'Physical',
    location: 'engine_access',
    locationLabel: 'Engine Access Tool Rack',
    timeDiscovered: '11:56 PM',
    description:
      'The heavy 14-inch brass coupling wrench is missing from its oilcloth slot. Fresh copper filings sit on the workbench vise beside a jeweler’s file.',
    observationNote: 'The killer forged the timing shunt right here and took the heavy wrench as a weapon.',
    reliability: 'Verified',
    possibleConnections: ['90-Second Timing Shunt', 'Avery Head Wound'],
    isKeyClue: true,
  },
  {
    id: 'ev_grease_smudge',
    name: 'Graphite Valve Grease on Door Jamb',
    category: 'Environmental',
    location: 'engine_access',
    locationLabel: 'Engine Access Vestibule',
    timeDiscovered: '11:57 PM',
    description:
      'A smudge of locomotive graphite grease on the latch—distinct from passenger carriage brass polish.',
    observationNote: 'Whoever entered Engine Access wore gloves to avoid staining bare hands.',
    reliability: 'High',
    possibleConnections: ['Arthur Bell Gloves', 'Samuel Reed'],
    isKeyClue: false,
    requiresObservation: true,
  },
  {
    id: 'ev_manifest_typewriter',
    name: 'Misaligned Typewriter & Ribbon',
    category: 'Documentary',
    location: 'conductors_compartment',
    locationLabel: "Conductor's Compartment",
    timeDiscovered: '11:59 PM',
    description:
      'The desk Underwood typewriter has a dropped capital "T" key and violet ink ribbon—the exact mechanical fingerprint of the 11:20 PM anonymous note.',
    observationNote: 'Conductor Reed left his compartment unlocked while checking Dining Car tickets at 11:10 PM.',
    reliability: 'Verified',
    possibleConnections: ['Anonymous 11:20 PM Note'],
    isKeyClue: true,
  },
  {
    id: 'ev_ticket_scanner_log',
    name: 'Electronic Berth Punch Log (Carriage 5)',
    category: 'Digital',
    location: 'conductors_compartment',
    locationLabel: "Conductor's Compartment",
    timeDiscovered: '12:00 AM',
    description:
      'The automated vestibule berth-key punch register shows Clara Whitmore’s passkey #304 clicked through Carriage 5 at 11:46:10 PM.',
    observationNote: 'Directly contradicts Clara’s claim that she stayed in the Dining Car and Berth 3.',
    reliability: 'Verified',
    possibleConnections: ['Clara Whitmore Alibi', 'Promissory Note'],
    isKeyClue: true,
  },
  {
    id: 'ev_train_schedule',
    name: 'Silver Meridian Timetable & Signal Log',
    category: 'Timeline',
    location: 'conductors_compartment',
    locationLabel: "Conductor's Compartment",
    timeDiscovered: '12:01 AM',
    description:
      'Confirms the train maintained 62 mph between Briarwood Crossing (11:40) and Ashworth Tunnel (11:55) without deceleration or stops.',
    observationNote: 'No one boarded or disembarked between 11:40 and midnight.',
    reliability: 'Verified',
    possibleConnections: ['Suspect Pool Locked'],
    isKeyClue: false,
  },
  {
    id: 'ev_promissory_note',
    name: 'Charred Debt Promissory Note',
    category: 'Documentary',
    location: 'lounge',
    locationLabel: 'Lounge Hearth Ashtray',
    timeDiscovered: '12:03 AM',
    description:
      'Half-burned heavy vellum bearing Clara Whitmore’s forged signature and Thomas Avery’s red notary stamp—worth £42,000.',
    observationNote: 'Explains why Clara slipped out at 11:46: to steal back and burn her debt paper, not to commit murder.',
    reliability: 'Verified',
    possibleConnections: ['Clara Whitmore Confession', 'Berth Punch Log'],
    isKeyClue: true,
  },
  {
    id: 'ev_bartender_ledger',
    name: 'Lounge Cognac Chit (11:47 PM)',
    category: 'Documentary',
    location: 'dining_car',
    locationLabel: 'Dining Car Service Counter',
    timeDiscovered: '12:05 AM',
    description:
      'Steward’s penciled spill log: "11:47 PM — Lights died just as Mr. Hale knocked his double neat over the mahogany bar in Lounge."',
    observationNote: 'Corroborates Victor Hale’s presence in the Lounge when the blackout began.',
    reliability: 'Corroborated',
    possibleConnections: ['Victor Hale Alibi'],
    isKeyClue: true,
  },
  {
    id: 'ev_dining_argument',
    name: 'Torn Steel Audit Memorandum',
    category: 'Documentary',
    location: 'dining_car',
    locationLabel: 'Dining Car Corner Booth',
    timeDiscovered: '12:06 AM',
    description:
      'Crumpled notes left at Avery’s dinner table detailing defective rail steel supplied by Hale Foundries.',
    observationNote: 'Establishes Victor Hale’s fierce 11:10 PM public quarrel with Avery.',
    reliability: 'High',
    possibleConnections: ['Victor Hale Motive'],
    isKeyClue: false,
  },
  {
    id: 'ev_mercer_satchel',
    name: "Dr. Mercer's Unlocked Medical Satchel",
    category: 'Physical',
    location: 'carriage_3',
    locationLabel: 'Carriage 3, Berth 1',
    timeDiscovered: '12:08 AM',
    description:
      'A leather doctor’s case whose brass clasp has been picked open. Inside the velvet sedative tray, one 10ml vial of Chloral Hydrate is missing.',
    observationNote: 'Someone stole the sedative before 11:30 PM. Mercer hid the theft out of panic.',
    reliability: 'Verified',
    possibleConnections: ['Brandy Glass Residue', 'Dr. Mercer Secret'],
    isKeyClue: true,
  },
  {
    id: 'ev_moved_suitcase',
    name: "Arthur Bell's Moved Suitcase Contents",
    category: 'Physical',
    location: 'carriage_5',
    locationLabel: 'Carriage 5, Berth 2',
    timeDiscovered: '12:11 AM',
    description:
      'A leather valise pushed crookedly under Berth 2 (dust line shows it was opened after 11:40). Inside lie damp size-9 felt overshoes, coiled silk-wrapped piano wire, and a 1920 bridge inquiry clipping.',
    observationNote:
      'The clipping names Martin Bell—Arthur’s late brother—ruined by Thomas Avery’s false audit. The piano wire matches the bolt scratch.',
    reliability: 'Verified',
    possibleConnections: ['Wet Footprint', 'Brass Door Scratch', 'Arthur Bell Motive'],
    isKeyClue: true,
    requiresObservation: true,
  },
  {
    id: 'ev_rear_deck_latch',
    name: 'Wet Rain Catch on Observation Rear Door',
    category: 'Environmental',
    location: 'observation_carriage',
    locationLabel: 'Observation Carriage Rear Deck',
    timeDiscovered: '12:14 AM',
    description:
      'A puddle of rainwater inside the rear deck threshold and Eleanor Graves’s damp tweed trench hem draped over the radiator.',
    observationNote:
      'Proves Eleanor stepped outside into the storm around 11:46:30, leaving Arthur Bell completely unobserved.',
    reliability: 'Verified',
    possibleConnections: ['Eleanor Graves Alibi', 'Arthur Bell Window'],
    isKeyClue: true,
    requiresObservation: true,
  },
  {
    id: 'ev_observation_clock_receipt',
    name: 'Observation Tea Receipt (11:44 PM)',
    category: 'Timeline',
    location: 'observation_carriage',
    locationLabel: 'Observation Carriage Side Table',
    timeDiscovered: '12:15 AM',
    description:
      'Arthur Bell’s neatly folded tea receipt stamped 11:44 PM, placed conspicuously beside an open book turned upside down to suggest uninterrupted reading.',
    observationNote: 'The bookmark rests at page 12—exactly where it was when the steward delivered the pot.',
    reliability: 'Circumstantial',
    possibleConnections: ['Arthur Bell Staged Alibi'],
    isKeyClue: false,
  },
];

export const SUSPECT_PROFILES: Record<SuspectId, SuspectProfile> = {
  clara: {
    id: 'clara',
    name: 'Clara Whitmore',
    role: 'Wealthy Socialite',
    age: 32,
    portraitUrl: '/src/assets/images/portrait_clara_whitmore_1795070417047.jpg',
    carriageHome: 'dining_car',
    possibleMotive: 'Financial ruin — Avery held £42,000 in forged promissory notes against her estate.',
    behaviorSummary: 'Poised, aristocratic, speaks in measured deflections while guarding her evening clutch.',
    physicalTell: 'Touches her pearl choker twice whenever her whereabouts between 11:45 and 11:48 are mentioned.',
    alibis: [
      { time: '11:45 PM', claim: 'Leaving the Dining Car after late champagne.' },
      { time: '11:47 PM', claim: 'Asleep behind locked curtains in Carriage 3.' },
      { time: '11:48 PM', claim: 'Returned to the Dining Car after the lights flickered back.' },
    ],
    contradictionEvidenceIds: ['ev_ticket_scanner_log', 'ev_promissory_note'],
    contradictionExplanation:
      'Passkey log #304 shows Clara entered Carriage 5 at 11:46:10 PM, and her forged promissory note was found half-burned in the Lounge.',
    truthSummary:
      'She crept into the Lounge & Carriage 5 at 11:46 to steal and burn her £42,000 debt note from Avery’s coat, hearing voices outside Compartment 4 just before the blackout.',
    topics: {
      alibi: {
        label: 'Whereabouts at 11:47 PM',
        initialAnswer:
          'I left the Dining Car at eleven forty-five, retired to my berth in Carriage 3, and scarcely stirred until the conductor shouted.',
        pressAnswer:
          'Why must detectives assume every woman in silk has something to hide? My berth curtains were drawn. Nobody saw me leave.',
        challengedAnswer:
          'You have no proof I ever stepped past Carriage 3. Keep your insinuations to yourself, Mr. Vane.',
        statementId: 'st_clara_alibi',
        statementQuote: 'Clara claims she was asleep in Carriage 3 from 11:45 through the 11:47 blackout.',
        isLie: true,
        requiredEvidenceToBreak: 'ev_ticket_scanner_log',
        brokenAnswer:
          'Very well—I wasn’t asleep! I slipped through Carriage 5 at eleven forty-six to recover my promissory note from Avery’s coat before he ruined my family. As I passed Carriage 7, I heard Avery speaking politely to someone with a quiet voice just before the lights snapped out.',
        brokenStatementQuote:
          'Clara admits passing Carriage 5/7 at 11:46:10 PM and hearing Avery speak calmly to someone at his door just before 11:47.',
      },
      victim: {
        label: 'Connection to Thomas Avery',
        initialAnswer:
          'Thomas Avery was an acquaintance of my late father. We exchanged polite nods at dinner, nothing more.',
        pressAnswer:
          'He collected signatures and debts the way other men collect stamps. Still, wishing a man bankrupt is hardly wishing him dead.',
        challengedAnswer:
          'If you intend to accuse me of murder over ledger ink, you are grasping at smoke.',
        statementId: 'st_clara_victim',
        statementQuote: 'Clara insists her relationship with Thomas Avery was purely polite.',
        isLie: true,
        requiredEvidenceToBreak: 'ev_promissory_note',
        brokenAnswer:
          'He forged my father’s collateral schedule! Forty-two thousand pounds. I burned the paper in the Lounge hearth, yes—but Avery was alive and talking in his compartment when I walked past!',
        brokenStatementQuote:
          'Clara confesses she burned Avery’s £42,000 promissory note to save her estate, not to kill him.',
      },
      blackout: {
        label: 'Sounds During Blackout',
        initialAnswer:
          'Only the storm rattling the brass window frames and the wheels hammering the rails.',
        pressAnswer:
          'Wait—there was a muffled thump forward of Carriage 7, and someone hurrying in soft soles. I froze in the corridor shadow.',
        challengedAnswer:
          'In pitch blackness, every passenger sounds like a phantom.',
        statementId: 'st_clara_blackout',
        statementQuote: 'Clara heard soft, muffled footsteps moving fast in the dark.',
        isLie: false,
      },
      secret: {
        label: 'Forged Debt & Carriage 5',
        initialAnswer:
          'A lady’s private finances are scarcely railway property, Detective.',
        pressAnswer:
          'If that note had reached London tomorrow morning, Whitmore Hall would be auctioned by Friday.',
        challengedAnswer:
          'Desperation makes people burn paper—not fracture skulls with heavy iron.',
        statementId: 'st_clara_secret',
        statementQuote: 'Clara admits extreme financial pressure from Avery’s impending London audit.',
        isLie: false,
      },
    },
    evidenceReactions: {
      ev_ticket_scanner_log: {
        dialogue:
          'That blasted brass punch register! Fine—I unlocked Carriage 5 at 11:46:10. I needed the corridor shortcut to reach the Lounge hearth with Avery’s coat pocket ledger. I never went inside Compartment 4!',
        suspicionDelta: -10,
        breaksAlibi: true,
      },
      ev_promissory_note: {
        dialogue:
          'You fished that out of the ash? Then you already know why I was awake. Burned debt isn’t murder, Detective—look at who actually had the stomach for blood.',
        suspicionDelta: -5,
        breaksAlibi: true,
      },
      ev_anonymous_note: {
        dialogue:
          'Typed on a railway machine? I haven’t touched a typewriter since finishing school.',
        suspicionDelta: 0,
      },
    },
    defaultEvidenceReaction:
      'I fail to see how that trinket concerns me, Mr. Vane. Perhaps ask the gentlemen with louder tempers.',
  },

  victor: {
    id: 'victor',
    name: 'Victor Hale',
    role: 'Steel Industrialist',
    age: 51,
    portraitUrl: '/src/assets/images/portrait_victor_hale_1795070417891.jpg',
    carriageHome: 'lounge',
    possibleMotive: 'Career exposure — Avery held proof Hale supplied brittle steel to northern viaducts.',
    behaviorSummary: 'Blunt, impatient, leans forward aggressively when pressed on his business dealings.',
    physicalTell: 'Grips the unlit cigar harder and taps his signet ring when defensive about his 11:10 PM quarrel.',
    alibis: [
      { time: '11:45 PM', claim: 'Drinking double cognac alone at the Lounge bar.' },
      { time: '11:47 PM', claim: 'Still at the Lounge bar when the lights snapped off.' },
      { time: '11:48 PM', claim: 'Cursing in the dark over his spilled glass.' },
    ],
    contradictionEvidenceIds: [],
    contradictionExplanation:
      'While Hale lied about visiting Carriage 7 earlier (11:43 PM), the Dining Car steward chit confirms he was indeed in the Lounge at 11:47 PM.',
    truthSummary:
      'Victor Hale argued violently with Avery at 11:10 and knocked on his door again at 11:43 (dropping his cigarette case), but returned to the Lounge before 11:46 and knocked over his cognac at 11:47:00.',
    topics: {
      alibi: {
        label: 'Whereabouts at 11:47 PM',
        initialAnswer:
          'I was in the Lounge from eleven forty-five onward, nursing a cognac! Ask the steward—I knocked the glass straight across the bar the instant the lights died.',
        pressAnswer:
          'Think I sprinted three carriages in pitch darkness just to play lock-picker? Check the steward’s spill ledger!',
        challengedAnswer:
          'Watch your tone, Vane. My alibi at 11:47 is solid mahogany.',
        statementId: 'st_victor_alibi',
        statementQuote: 'Victor Hale insists he was at the Lounge bar knocking over cognac at 11:47 PM.',
        isLie: false,
      },
      victim: {
        label: 'Argument with Avery',
        initialAnswer:
          'Avery was a bloodless bean-counter who didn’t know Bessemer steel from tin foil. Yes, we had words at dinner—so what?',
        pressAnswer:
          'I went down toward Carriage 7 around eleven forty-three to tell him to name his price. He slammed the door in my face, so I marched back to the Lounge.',
        challengedAnswer:
          'Dropping a cigarette case in a hallway doesn’t make me a killer!',
        statementId: 'st_victor_victim',
        statementQuote: 'Hale admits confronting Avery at 11:43 PM outside Compartment 4 before returning to the Lounge.',
        isLie: false,
      },
      blackout: {
        label: 'During the 90 Seconds',
        initialAnswer:
          'Pitch black for ninety seconds. I stayed put by the bar rail because I wasn’t about to break an ankle in a swaying train.',
        pressAnswer:
          'Only saw someone in pale silk slip past the Lounge archway just before the lights cut—looked like Whitmore.',
        challengedAnswer:
          'I know the exact second the lights died because cognac soaked straight through my cuff!',
        statementId: 'st_victor_blackout',
        statementQuote: 'Hale saw Clara Whitmore pass the Lounge archway moments before 11:47 PM.',
        isLie: false,
      },
      secret: {
        label: 'Defective Rail Audit',
        initialAnswer:
          'Whatever Avery scribbled in his audit book was half-baked guesswork.',
        pressAnswer:
          'Alright—if that memorandum hits the Board, Hale Foundries loses the Northern contract. That’s business war, not bludgeoning a man in the dark.',
        challengedAnswer:
          'If I wanted Avery silenced, I’d buy his silence—not steal a greasy railway wrench!',
        statementId: 'st_victor_secret',
        statementQuote: 'Hale admits Avery’s audit threatened Hale Foundries’ biggest contract.',
        isLie: false,
      },
    },
    evidenceReactions: {
      ev_hale_cigarette_case: {
        dialogue:
          'Ah, there it is! Dropped it when Avery shut Compartment 4 in my face at 11:43. Check the time of my cognac spill—I couldn’t be in two carriages at once.',
        suspicionDelta: 5,
      },
      ev_bartender_ledger: {
        dialogue:
          'See? Eleven forty-seven sharp! That steward’s pencil clears me clean. Maybe look at the quiet little clerk in the back carriage instead of barking at me.',
        suspicionDelta: -15,
      },
      ev_dining_argument: {
        dialogue:
          'Torn up and left on the tablecloth. If I’d murdered him for that paper, wouldn’t I have pocketed it instead of leaving it at dinner?',
        suspicionDelta: 0,
      },
    },
    defaultEvidenceReaction:
      'Stop waving clues at me like a magistrate and check the steward’s log in the Dining Car.',
  },

  mercer: {
    id: 'mercer',
    name: 'Dr. Julian Mercer',
    role: 'Physician',
    age: 48,
    portraitUrl: '/src/assets/images/portrait_julian_mercer_1795070417541.jpg',
    carriageHome: 'carriage_3',
    possibleMotive: 'Avery threatened to publish sealed 1919 Vienna hospital malpractice records.',
    behaviorSummary: 'Unnervingly composed, speaks in precise clinical cadence, avoids blinking during pauses.',
    physicalTell: 'Rests one thumb lightly over the brass clasp of his leather medical satchel.',
    alibis: [
      { time: '11:45 PM', claim: 'Reading surgical monographs in Carriage 3, Berth 1.' },
      { time: '11:47 PM', claim: 'Seated calmly in Carriage 3 during the entire blackout.' },
      { time: '11:48 PM', claim: 'Stepped into the corridor only when Conductor Reed called for a doctor.' },
    ],
    contradictionEvidenceIds: ['ev_brandy_residue', 'ev_mercer_satchel'],
    contradictionExplanation:
      'Dr. Mercer concealed that a 10ml vial of Chloral Hydrate was stolen from his unlocked medical satchel—the exact sedative found in Avery’s brandy glass.',
    truthSummary:
      'Mercer boarded with sedatives planning to confront Avery about Vienna, but discovered a vial missing from his satchel around 11:35 PM. Terrified of being framed, he hid the theft until confronted with the brandy residue.',
    topics: {
      alibi: {
        label: 'Whereabouts at 11:47 PM',
        initialAnswer:
          'I remained in Carriage 3 throughout the power failure. As a physician, panic serves no purpose in the dark.',
        pressAnswer:
          'My berth light failed at 11:47 exactly. I waited ninety seconds by my pocket pulse count until the sconces returned.',
        challengedAnswer:
          'You will find no trace of me in Carriage 7 prior to Conductor Reed summoning medical aid.',
        statementId: 'st_mercer_alibi',
        statementQuote: 'Dr. Mercer states he remained in Carriage 3 for the entire 90-second blackout.',
        isLie: false,
      },
      victim: {
        label: 'Vienna Records & Avery',
        initialAnswer:
          'I treated Thomas Avery’s mild angina twice in London. Our professional acquaintance was strictly clinical.',
        pressAnswer:
          'He made veiled remarks at dinner about old hospital archives in Vienna. Unpleasant, certainly, but hardly fatal.',
        challengedAnswer:
          'A surgeon does not ruin his hands striking skulls in the dark, Mr. Vane.',
        statementId: 'st_mercer_victim',
        statementQuote: 'Dr. Mercer minimizes his dispute with Avery over 1919 Vienna archives.',
        isLie: true,
        requiredEvidenceToBreak: 'ev_mercer_satchel',
        brokenAnswer:
          'I brought chloral hydrate because I feared Avery’s angina—and yes, his threats over Vienna kept me awake. When I opened my bag at eleven thirty-five, the clasp was sprung and one vial was gone! I stayed silent because I knew how it would look.',
        brokenStatementQuote:
          'Dr. Mercer confesses a 10ml chloral hydrate vial was stolen from his unlocked satchel before 11:35 PM.',
      },
      blackout: {
        label: 'Medical Assessment of Death',
        initialAnswer:
          'When I examined Avery at 11:49, rigor had not begun, and the blow was delivered with heavy flat-edged brass—not a fist.',
        pressAnswer:
          'Interestingly, his pupils were slightly sluggish despite the trauma—consistent with an ingested hypnotic taken fifteen minutes earlier.',
        challengedAnswer:
          'Notice the precision of the time: his watch cracked at 11:47:30, yet the door was bolted from inside.',
        statementId: 'st_mercer_blackout',
        statementQuote: 'Dr. Mercer confirms Avery suffered blunt brass trauma at 11:47:30 after mild sedation.',
        isLie: false,
      },
      secret: {
        label: 'Missing Sedative Vial',
        initialAnswer:
          'My medical instruments are all accounted for under lock and key.',
        pressAnswer:
          'Anyone passing Carriage 3 while I stepped into the Dining Car at eleven-fifteen could have slipped that brass catch.',
        challengedAnswer:
          'If my sedative ended up in Avery’s glass, the thief used my own medicine to slow him down!',
        statementId: 'st_mercer_secret',
        statementQuote: 'Mercer left his satchel unattended in Carriage 3 while dining around 11:15 PM.',
        isLie: true,
        requiredEvidenceToBreak: 'ev_brandy_residue',
        brokenAnswer:
          'Chloral hydrate in his brandy... God help me. It came from my satchel—the vial vanished while I took tea at 11:15! The killer drugged Avery’s nightcap early so he wouldn’t fight back during a 90-second window.',
        brokenStatementQuote:
          'Mercer links the stolen chloral hydrate to Avery’s brandy glass, proving premeditated sedation before 11:47.',
      },
    },
    evidenceReactions: {
      ev_brandy_residue: {
        dialogue:
          'Sweet pear odor... chloral hydrate. Wait—I noticed one 10ml vial missing from my satchel at eleven thirty-five and kept quiet out of sheer terror of being blamed. Someone picked my bag at 11:15!',
        suspicionDelta: -10,
        breaksAlibi: true,
      },
      ev_mercer_satchel: {
        dialogue:
          'You inspected the velvet tray. Yes, the clasp was forced while I was in the Dining Car at 11:15. Whoever planned this planned hours ahead.',
        suspicionDelta: -5,
        breaksAlibi: true,
      },
      ev_stopped_watch: {
        dialogue:
          '11:47:30. That aligns with the metallic clatter heard down the train—thirty seconds into the blackness.',
        suspicionDelta: 0,
      },
    },
    defaultEvidenceReaction:
      'Interesting from a forensic standpoint, Detective, though it does not implicate Carriage 3.',
  },

  eleanor: {
    id: 'eleanor',
    name: 'Eleanor Graves',
    role: 'Investigative Journalist',
    age: 29,
    portraitUrl: '/src/assets/images/portrait_eleanor_graves_1795070417239.jpg',
    carriageHome: 'observation_carriage',
    possibleMotive: 'Avery threatened to expose her confidential Whitehall railway whistle-blower.',
    behaviorSummary: 'Sharp-eyed, rapid-fire observer who takes shorthand notes even while being questioned.',
    physicalTell: 'Taps her fountain pen against the margin of her notebook whenever editing her story.',
    alibis: [
      { time: '11:45 PM', claim: 'Writing at a window booth in the Observation Carriage.' },
      { time: '11:47 PM', claim: 'Remained inside the Observation Carriage with Arthur Bell.' },
      { time: '11:48 PM', claim: 'Still in the Observation Carriage when lights returned.' },
    ],
    contradictionEvidenceIds: ['ev_rear_deck_latch'],
    contradictionExplanation:
      'Her rain-soaked trench coat and the wet rear-deck threshold prove Eleanor stepped outside onto the observation balcony from 11:46:30 to 11:47:50—leaving Arthur Bell alone!',
    truthSummary:
      'Eleanor stepped onto the freezing rear observation deck at 11:46:30 to smoke and clear her head, returning just before 11:48. She omitted this at first out of embarrassment over leaving Arthur Bell unattended—not realizing she destroyed his "unbreakable" alibi.',
    topics: {
      alibi: {
        label: 'Observation Carriage & Arthur Bell',
        initialAnswer:
          'I was in the Observation Carriage from eleven forty-four straight through eleven fifty. Quiet Mr. Bell was right across the aisle reading the whole time—neither of us budged.',
        pressAnswer:
          'Well, the carriage was stifling with coal smoke, and I may have glanced toward the rear glass... Why are you staring at my coat?',
        challengedAnswer:
          'Don’t tell a reporter what she did or didn’t observe, Vane.',
        statementId: 'st_eleanor_alibi',
        statementQuote: 'Eleanor claims neither she nor Arthur Bell left the Observation Carriage between 11:44 and 11:50.',
        isLie: true,
        requiredEvidenceToBreak: 'ev_rear_deck_latch',
        brokenAnswer:
          'Alright, you caught the wet hem! I slipped out onto the rear iron deck at eleven forty-six thirty for a cigarette in the wind. I came back in around eleven forty-seven fifty—and now I realize my back was turned for nearly eighty seconds! Arthur Bell could have walked straight into Carriage 7!',
        brokenStatementQuote:
          'Eleanor admits stepping onto the rear deck (11:46:30–11:47:50), proving Arthur Bell was completely unobserved during the blackout.',
      },
      victim: {
        label: 'Avery & Her Source',
        initialAnswer:
          'Thomas Avery had a talent for blackmail. He cornered me near the Lounge and threatened to burn my Whitehall contact.',
        pressAnswer:
          'A journalist doesn’t kill a story by killing the subject—dead men can’t testify before Parliament.',
        challengedAnswer:
          'Check my shorthand notes. I was building an expose, not an ambush.',
        statementId: 'st_eleanor_victim',
        statementQuote: 'Eleanor states Avery threatened her source, though killing him would ruin her article.',
        isLie: false,
      },
      blackout: {
        label: 'Rear Deck During Blackout',
        initialAnswer:
          'When the lights went out, the whole train looked like a dark snake rushing through rain.',
        pressAnswer:
          'Come to think of it, when I pushed back inside the Observation door near 11:47:50, I smelled cold rain on the inner vestibule rug—as if someone else had just come through the forward door.',
        challengedAnswer:
          'Wait... Arthur Bell was holding his book upside down when the lights came back on. I thought nothing of it until now!',
        statementId: 'st_eleanor_blackout',
        statementQuote: 'Eleanor noticed fresh rain on the forward vestibule rug and Arthur’s book upside down at 11:48:30.',
        isLie: false,
      },
      secret: {
        label: 'Why Hide Stepping Outside?',
        initialAnswer:
          'I didn’t want Reed thinking I tampered with the emergency brake out on the tail platform.',
        pressAnswer:
          'And honestly, Mr. Bell seemed so harmless—a mild little man drinking chamomile tea.',
        challengedAnswer:
          'The quietest passenger in the car just used me as his living alibi, didn’t he?',
        statementId: 'st_eleanor_secret',
        statementQuote: 'Eleanor realizes Arthur Bell exploited her absence on the rear deck as cover.',
        isLie: false,
      },
    },
    evidenceReactions: {
      ev_rear_deck_latch: {
        dialogue:
          'Dammit, you noticed the rainwater! Yes, I stepped onto the rear observation deck at 11:46:30 to smoke in the storm and stayed until 11:47:50. Which means nobody was watching Arthur Bell for the entire murder window!',
        suspicionDelta: -10,
        breaksAlibi: true,
      },
      ev_observation_clock_receipt: {
        dialogue:
          'Yes! Look at the time—11:44. He ordered tea right before I stepped outside, practically staging a still-life painting of himself.',
        suspicionDelta: 5,
      },
      ev_moved_suitcase: {
        dialogue:
          'Felt overshoes, piano wire, and a 1920 bridge clipping? Martin Bell... Wait—I remember that railway inquiry! Avery buried Martin Bell’s testimony six years ago!',
        suspicionDelta: 0,
      },
    },
    defaultEvidenceReaction:
      'Put that in my notebook too, Vane—if it breaks the locked-room trick, I want the exclusive.',
  },

  reed: {
    id: 'reed',
    name: 'Samuel Reed',
    role: 'Senior Conductor',
    age: 58,
    portraitUrl: '/src/assets/images/portrait_samuel_reed_1795070417812.jpg',
    carriageHome: 'conductors_compartment',
    possibleMotive: 'Unknown — deeply protective of his railway record and knowledge of train circuits.',
    behaviorSummary: 'Stiffly professional, answers briskly, checks his pocket watch to the exact second.',
    physicalTell: 'Adjusts his brass lantern bail whenever electrical panels or keys are brought up.',
    alibis: [
      { time: '11:45 PM', claim: 'Checking ticket receipts in the Conductor’s Compartment.' },
      { time: '11:47 PM', claim: 'Entering Carriage 7 corridor with his oil lantern when lights failed.' },
      { time: '11:48 PM', claim: 'Forced Compartment 4 with Elias Vane after the lights returned.' },
    ],
    contradictionEvidenceIds: ['ev_thermal_shunt', 'ev_missing_wrench'],
    contradictionExplanation:
      'Reed initially claimed the blackout was a storm fuse blowout, hiding the sabotaged 90-second thermal shunt and missing coupling wrench because he left Engine Access unlocked.',
    truthSummary:
      'Reed is innocent of murder, but concealed that Engine Access was left unlocked and that someone jammed a 90-second timing shunt into Carriage 7’s breaker because he feared losing his pension.',
    topics: {
      alibi: {
        label: 'Whereabouts at 11:47 PM',
        initialAnswer:
          'I stepped from Carriage 5 into Carriage 7 at eleven forty-seven sharp because the voltage needle dipped—and then the whole train went black.',
        pressAnswer:
          'At 11:47:15 someone in soft shoes brushed past me in the dark near Compartment 4! Not boots—quiet as felt. Then at 11:47:30 came a sickening metallic thud inside Compartment 4.',
        challengedAnswer:
          'At 11:48:30 the lights snapped back on by themselves. Compartment 4’s interior slide-bolt was thrown—we had to break the brass catch!',
        statementId: 'st_reed_alibi',
        statementQuote: 'Reed felt someone in soft shoes brush past him at 11:47:15 and heard a metallic thud at 11:47:30.',
        isLie: false,
      },
      victim: {
        label: 'Compartment 4 Lock Mechanism',
        initialAnswer:
          'Standard Silver Meridian brass night-bolt. Once thrown from inside, nobody can turn it from the corridor.',
        pressAnswer:
          'Wait—every door has an overhead brass ventilation transom so coal air circulates. Only three-quarter-inch slats, mind you—no hand fits through.',
        challengedAnswer:
          'A thin steel wire with a hook? Good Lord... yes, if you slid it through the transom slat, you could catch the bolt knob.',
        statementId: 'st_reed_victim',
        statementQuote: 'Reed confirms Compartment 4 has an overhead transom slat above the interior slide-bolt.',
        isLie: false,
      },
      blackout: {
        label: 'Cause of the 90-Second Blackout',
        initialAnswer:
          'Lightning surge on the dynamo line. Happens twice a winter on the ridge; breakers reset in ninety seconds.',
        pressAnswer:
          'Don’t look at the Carriage 7 junction box—it’s high-voltage copper in there, sir.',
        challengedAnswer:
          'If I admit a passenger tampered with my breakers, the Board strips thirty years of pension!',
        statementId: 'st_reed_blackout',
        statementQuote: 'Reed blames the 90-second blackout on a routine storm lightning surge.',
        isLie: true,
        requiredEvidenceToBreak: 'ev_thermal_shunt',
        brokenAnswer:
          'God forgive me... I found that brass balance-spring shunt welded across the Carriage 7 relay at 11:49 and snapped the panel shut! Someone engineered an exact ninety-second blackout using watch parts and Engine Access tools.',
        brokenStatementQuote:
          'Reed confesses he hid the sabotaged 90-second timing shunt to protect his railway pension.',
      },
      secret: {
        label: 'Engine Access & Typewriter',
        initialAnswer:
          'My compartment and the Engine Access door are always locked per company regulation.',
        pressAnswer:
          'Well... I stepped away to the Dining Car at eleven-ten to help with spilled wine. Left my keys on the desk for ten minutes.',
        challengedAnswer:
          'Anyone could have typed your warning note on my Underwood—and walked right into Engine Access!',
        statementId: 'st_reed_secret',
        statementQuote: 'Reed admits leaving his compartment and Engine Access keys unattended at 11:10 PM.',
        isLie: true,
        requiredEvidenceToBreak: 'ev_missing_wrench',
        brokenAnswer:
          'The 14-inch brass coupling wrench is gone! Heavy enough to crush bone in a single swing—and those copper filings mean the killer built the blackout timer right on my workbench.',
        brokenStatementQuote:
          'Reed confirms the 14-inch brass coupling wrench was stolen from Engine Access.',
      },
    },
    evidenceReactions: {
      ev_thermal_shunt: {
        dialogue:
          'You opened the Carriage 7 panel... Yes, I saw that watch-spring shunt and panicked! Thirty years on the Silver Meridian, and I left Engine Access unlocked at 11:10. Someone engineered those ninety seconds to the tick.',
        suspicionDelta: -10,
        breaksAlibi: true,
      },
      ev_missing_wrench: {
        dialogue:
          'My brass coupling wrench—missing! That’s what cracked Avery’s watch and skull at 11:47:30. Check the rear carriages—it hasn’t left the train.',
        suspicionDelta: -5,
        breaksAlibi: true,
      },
      ev_door_scratch: {
        dialogue:
          'That’s fresh brass gouging right beneath the transom louver! A hooked piano wire could snag the bolt knob from the hallway and drop it shut after stepping out!',
        suspicionDelta: 0,
      },
      ev_manifest_typewriter: {
        dialogue:
          'Look at that dropped capital T... Whoever typed your 11:20 warning slipped into my compartment while I was in the Dining Car at 11:10.',
        suspicionDelta: 0,
      },
    },
    defaultEvidenceReaction:
      'I’ve served thirty years on this line, Mr. Vane. Ask me about locks or timetables, not parlor gossip.',
  },

  arthur: {
    id: 'arthur',
    name: 'Arthur Bell',
    role: 'Quiet Passenger',
    age: 44,
    portraitUrl: '/src/assets/images/portrait_arthur_bell_1795070417473.jpg',
    carriageHome: 'observation_carriage',
    possibleMotive: 'Apparently none — modest traveling clerk with an unusually airtight alibi.',
    behaviorSummary: 'Mild-mannered, softly spoken, keeps gloved hands folded neatly in his lap.',
    physicalTell: 'Never removes his thin leather gloves even indoors—and keeps his book turned upside down.',
    alibis: [
      { time: '11:45 PM', claim: 'Sitting quietly in Observation Carriage with Eleanor Graves.' },
      { time: '11:47 PM', claim: 'Reading silently in the same armchair throughout the blackout.' },
      { time: '11:48 PM', claim: 'Seen in his seat by Eleanor Graves when lights returned.' },
    ],
    contradictionEvidenceIds: ['ev_rear_deck_latch', 'ev_moved_suitcase', 'ev_wet_footprint', 'ev_door_scratch'],
    contradictionExplanation:
      'Eleanor stepped onto the rear deck from 11:46:30 to 11:47:50, leaving Arthur unobserved. His moved suitcase in Carriage 5 hides damp felt overshoes, coiled piano wire, and the 1920 inquiry file of his framed brother, Martin Bell.',
    truthSummary:
      'Arthur Vance-Bell orchestrated the 90-second blackout, sedated Avery earlier with Mercer’s stolen chloral hydrate, slipped from Observation through the wet vestibule in felt overshoes, struck Avery at 11:47:30 with the stolen brass wrench, and wired the interior bolt shut from the corridor.',
    topics: {
      alibi: {
        label: 'Whereabouts at 11:47 PM',
        initialAnswer:
          'Oh, I scarcely moved an inch, Detective. I ordered chamomile tea at eleven forty-four and read quietly right here across from Miss Graves until the lights returned.',
        pressAnswer:
          'Ask Miss Graves yourself—she sat three paces away from me in the Observation Carriage. Why would a clerk from Leeds wander into Carriage 7?',
        challengedAnswer:
          'You’re a clever detective, Mr. Vane, yet even clever men trip over a shadow when the real facts are plain.',
        statementId: 'st_arthur_alibi',
        statementQuote: 'Arthur Bell asserts Eleanor Graves witnessed him sitting quietly in Observation for the entire blackout.',
        isLie: true,
        requiredEvidenceToBreak: 'ev_rear_deck_latch',
        brokenAnswer:
          'So Miss Graves admitted stepping onto the rear deck... Well. Even so, an empty chair proves nothing. Perhaps I closed my eyes for ninety seconds.',
        brokenStatementQuote:
          'When confronted with Eleanor’s absence, Arthur Bell changes his story to "perhaps I closed my eyes alone."',
      },
      victim: {
        label: 'Knowledge of Thomas Avery',
        initialAnswer:
          'I only read Mr. Avery’s name in the financial columns. A formidable railway auditor, I gather.',
        pressAnswer:
          'I have never spoken a word to the gentleman in my life. My work is strictly municipal stationery.',
        challengedAnswer:
          'Names are common enough in Yorkshire, Detective. Bell is hardly rare.',
        statementId: 'st_arthur_victim',
        statementQuote: 'Arthur Bell claims he had zero prior connection to Thomas Avery.',
        isLie: true,
        requiredEvidenceToBreak: 'ev_moved_suitcase',
        brokenAnswer:
          'Martin Bell was the finest bridge engineer in England! Thomas Avery forged that 1920 inspection ledger to pocket forty thousand pounds and let my brother die behind iron bars. Avery deserved ninety seconds of darkness.',
        brokenStatementQuote:
          'Arthur Bell confesses Thomas Avery destroyed his brother Martin Bell via a forged 1920 bridge audit.',
      },
      blackout: {
        label: 'The 90-Second Window',
        initialAnswer:
          'Ninety seconds is terribly short, isn’t it? Hardly enough time for an ordinary traveler to lose his bearings.',
        pressAnswer:
          'Though I suppose if a man knew the exact distance—twelve paces from Observation into Carriage 7—and knew the lights would return in ninety seconds... it would feel quite orderly.',
        challengedAnswer:
          'Hypothetically speaking, of course, Mr. Vane.',
        statementId: 'st_arthur_blackout',
        statementQuote: 'Arthur Bell oddly knows the exact distance—twelve paces—between Observation and Carriage 7.',
        isLie: false,
      },
      secret: {
        label: 'Gloves & Berth 2 Suitcase',
        initialAnswer:
          'Poor circulation, Detective. Old railway cars get dreadfully drafty in November rain.',
        pressAnswer:
          'My suitcase in Carriage 5 holds nothing but wool socks and spare spectacles.',
        challengedAnswer:
          'Be careful opening another passenger’s luggage without a magistrate’s seal.',
        statementId: 'st_arthur_secret',
        statementQuote: 'Arthur Bell claims his gloves are for drafts and his Carriage 5 suitcase holds only clothes.',
        isLie: true,
        requiredEvidenceToBreak: 'ev_door_scratch',
        brokenAnswer:
          'Wire through a brass transom... How neat a mechanic would have to be to pull a bolt shut in total darkness without leaving a fingerprint!',
        brokenStatementQuote:
          'Arthur Bell reacts tensely to the transom-wire locked-room mechanism.',
      },
    },
    evidenceReactions: {
      ev_rear_deck_latch: {
        dialogue:
          'Ah. Miss Graves stepped onto the rear balcony, did she? Curious—I scarcely noticed. Still, being alone in an armchair is hardly a crime.',
        suspicionDelta: 20,
        breaksAlibi: true,
      },
      ev_wet_footprint: {
        dialogue:
          'Felt overshoes in Carriage 7? A practical choice in wet weather, though half the train wears rubbers in November.',
        suspicionDelta: 15,
      },
      ev_moved_suitcase: {
        dialogue:
          'You opened Berth 2... Then you know who Martin Bell was. Six years I waited for Thomas Avery to step onto a night train without his London bodyguards.',
        suspicionDelta: 45,
        breaksAlibi: true,
      },
      ev_door_scratch: {
        dialogue:
          'A clever trick, isn’t it? Silk-wrapped wire leaves no glove fibers behind—just one bright crescent on brass.',
        suspicionDelta: 25,
      },
      ev_anonymous_note: {
        dialogue:
          'Why send you a warning at eleven-twenty? Because if an ordinary policeman investigated, he’d blame poor Mr. Hale. I wanted Elias Vane himself to certify the room was locked from the inside.',
        suspicionDelta: 25,
      },
    },
    defaultEvidenceReaction:
      'I am merely an ordinary passenger hoping to reach London on schedule, Detective.',
  },
};

export const TRAIN_LOCATIONS: Record<LocationId, TrainLocation> = {
  engine_access: {
    id: 'engine_access',
    name: 'Engine Access Area',
    shortName: 'Engine',
    carNumber: 'Car 1',
    description:
      'Rivet-lined steel bulkhead smelling of coal smoke, valve oil, and hot brass. A heavy tool rack stands beside the locomotive tender door.',
    ambientTheme: 'steel',
    rightExit: 'conductors_compartment',
    floorY: 0.78,
    suspectsPresent: [],
    hotspots: [
      {
        id: 'hs_tool_rack',
        label: 'Brass Coupling Tool Rack',
        x: 0.34,
        y: 0.48,
        width: 0.14,
        height: 0.24,
        kind: 'evidence',
        evidenceId: 'ev_missing_wrench',
        inspectText: 'An oiled canvas rack. The 14-inch brass coupling wrench slot is empty, with fresh copper filings on the vise.',
      },
      {
        id: 'hs_grease_jamb',
        label: 'Valve Grease Smudge',
        x: 0.68,
        y: 0.56,
        width: 0.1,
        height: 0.14,
        kind: 'evidence',
        evidenceId: 'ev_grease_smudge',
        requiresObservation: true,
        inspectText: 'Graphite grease smudged across the steel latch—transferred from a gloved palm.',
        observationDetail: 'Gloved hand—no skin ridges in the graphite smear.',
      },
    ],
  },

  conductors_compartment: {
    id: 'conductors_compartment',
    name: "Conductor's Compartment",
    shortName: 'Conductor',
    carNumber: 'Car 2',
    description:
      'Compact mahogany office lined with pigeonhole timetables, ticket registers, and a brass-rimmed Underwood typewriter.',
    ambientTheme: 'mahogany',
    leftExit: 'engine_access',
    rightExit: 'dining_car',
    floorY: 0.78,
    suspectsPresent: ['reed'],
    hotspots: [
      {
        id: 'hs_typewriter',
        label: 'Underwood Manifest Typewriter',
        x: 0.27,
        y: 0.52,
        width: 0.12,
        height: 0.14,
        kind: 'evidence',
        evidenceId: 'ev_manifest_typewriter',
        inspectText: 'A violet-ribbon typewriter with a noticeably dropped capital "T" slug.',
      },
      {
        id: 'hs_punch_log',
        label: 'Berth Key Punch Register',
        x: 0.49,
        y: 0.44,
        width: 0.12,
        height: 0.18,
        kind: 'evidence',
        evidenceId: 'ev_ticket_scanner_log',
        inspectText: 'Chronological punch tape logging vestibule keycard scans by carriage.',
      },
      {
        id: 'hs_timetable',
        label: 'Silver Meridian Timetable',
        x: 0.64,
        y: 0.36,
        width: 0.1,
        height: 0.16,
        kind: 'evidence',
        evidenceId: 'ev_train_schedule',
        inspectText: 'Official dispatch sheet confirming uninterrupted 62 mph travel through the storm.',
      },
      {
        id: 'hs_suspect_reed',
        label: 'Samuel Reed (Conductor)',
        x: 0.77,
        y: 0.52,
        width: 0.12,
        height: 0.32,
        kind: 'suspect',
        suspectId: 'reed',
        inspectText: 'Senior Conductor Samuel Reed grips his brass lantern, watching the corridor door.',
      },
    ],
  },

  dining_car: {
    id: 'dining_car',
    name: 'Dining Car',
    shortName: 'Dining',
    carNumber: 'Car 3A',
    description:
      'White-linened tables lit by amber Art Deco table lamps, crystal stemware chiming softly to the rhythm of the rails.',
    ambientTheme: 'mahogany',
    leftExit: 'conductors_compartment',
    rightExit: 'lounge',
    floorY: 0.78,
    suspectsPresent: ['clara'],
    hotspots: [
      {
        id: 'hs_bartender_chit',
        label: 'Steward Service Counter',
        x: 0.24,
        y: 0.5,
        width: 0.13,
        height: 0.2,
        kind: 'evidence',
        evidenceId: 'ev_bartender_ledger',
        inspectText: 'The steward’s penciled service ledger recording exact spill and drink times.',
      },
      {
        id: 'hs_steel_memo',
        label: "Avery's Dinner Booth",
        x: 0.52,
        y: 0.56,
        width: 0.14,
        height: 0.16,
        kind: 'evidence',
        evidenceId: 'ev_dining_argument',
        inspectText: 'Crumpled audit notes from Avery’s dinner argument earlier tonight.',
      },
      {
        id: 'hs_suspect_clara',
        label: 'Clara Whitmore',
        x: 0.74,
        y: 0.54,
        width: 0.12,
        height: 0.3,
        kind: 'suspect',
        suspectId: 'clara',
        inspectText: 'Clara Whitmore sits poised in emerald silk, watching the rain slide down the dining glass.',
      },
    ],
  },

  lounge: {
    id: 'lounge',
    name: 'Lounge',
    shortName: 'Lounge',
    carNumber: 'Car 4',
    description:
      'Deep tufted velvet armchairs, brass cigar stands, and a smoldering marble hearth beside the mahogany bar.',
    ambientTheme: 'velvet',
    leftExit: 'dining_car',
    rightExit: 'carriage_3',
    floorY: 0.78,
    suspectsPresent: ['victor'],
    hotspots: [
      {
        id: 'hs_hearth_ash',
        label: 'Marble Hearth Ashtray',
        x: 0.3,
        y: 0.58,
        width: 0.12,
        height: 0.16,
        kind: 'evidence',
        evidenceId: 'ev_promissory_note',
        inspectText: 'Half-burned cream vellum curls inside the brass hearth grate.',
      },
      {
        id: 'hs_cognac_stain',
        label: 'Spilled Cognac on Bar Rail',
        x: 0.5,
        y: 0.54,
        width: 0.11,
        height: 0.14,
        kind: 'detail',
        inspectText: 'Fresh cognac soaked into a bar towel—matching the steward’s 11:47 PM entry.',
      },
      {
        id: 'hs_suspect_victor',
        label: 'Victor Hale',
        x: 0.72,
        y: 0.52,
        width: 0.12,
        height: 0.32,
        kind: 'suspect',
        suspectId: 'victor',
        inspectText: 'Victor Hale broods in a deep leather armchair, rolling an unlit cigar between blunt fingers.',
      },
    ],
  },

  carriage_3: {
    id: 'carriage_3',
    name: 'Carriage 3 (Berths)',
    shortName: 'Car 3',
    carNumber: 'Car 3',
    description:
      'Narrow velvet-carpeted sleeping corridor lined with numbered brass berth doors and soft amber sconces.',
    ambientTheme: 'corridor',
    leftExit: 'lounge',
    rightExit: 'carriage_5',
    floorY: 0.78,
    suspectsPresent: ['mercer'],
    hotspots: [
      {
        id: 'hs_mercer_satchel',
        label: 'Leather Medical Satchel',
        x: 0.35,
        y: 0.6,
        width: 0.12,
        height: 0.16,
        kind: 'evidence',
        evidenceId: 'ev_mercer_satchel',
        inspectText: 'Dr. Mercer’s leather bag rests beside Berth 1—its brass clasp faintly scored.',
      },
      {
        id: 'hs_suspect_mercer',
        label: 'Dr. Julian Mercer',
        x: 0.64,
        y: 0.52,
        width: 0.12,
        height: 0.32,
        kind: 'suspect',
        suspectId: 'mercer',
        inspectText: 'Dr. Julian Mercer stands serenely outside Berth 1, spectacles gleaming in the sconce light.',
      },
    ],
  },

  carriage_5: {
    id: 'carriage_5',
    name: 'Carriage 5 (Berths)',
    shortName: 'Car 5',
    carNumber: 'Car 5',
    description:
      'Quiet sleeper carriage with brass passkey scanner at the vestibule. Beneath Berth 2 sits a weathered leather valise.',
    ambientTheme: 'corridor',
    leftExit: 'carriage_3',
    rightExit: 'carriage_7',
    floorY: 0.78,
    suspectsPresent: [],
    hotspots: [
      {
        id: 'hs_berth_scanner',
        label: 'Vestibule Keycard Punch',
        x: 0.22,
        y: 0.44,
        width: 0.09,
        height: 0.18,
        kind: 'detail',
        inspectText: 'Brass passkey punch that records every berth key entering Carriage 5.',
      },
      {
        id: 'hs_moved_suitcase',
        label: 'Moved Suitcase Under Berth 2',
        x: 0.56,
        y: 0.64,
        width: 0.14,
        height: 0.14,
        kind: 'evidence',
        evidenceId: 'ev_moved_suitcase',
        requiresObservation: true,
        inspectText: 'A leather valise shoved crookedly beneath Arthur Bell’s berth—dust streaks show recent dragging.',
        observationDetail: 'Fresh drag marks in the carpet nap; damp overshoes and coiled wire inside.',
      },
    ],
  },

  carriage_7: {
    id: 'carriage_7',
    name: 'Carriage 7 (Corridor)',
    shortName: 'Car 7',
    carNumber: 'Car 7',
    description:
      'The corridor outside Compartment 4. Rain lashes the corridor windows while brass warning tape marks the crime scene threshold.',
    ambientTheme: 'corridor',
    leftExit: 'carriage_5',
    rightExit: 'observation_carriage',
    interiorDoor: 'victims_compartment',
    floorY: 0.78,
    suspectsPresent: [],
    hotspots: [
      {
        id: 'hs_junction_box',
        label: 'Carriage 7 Electrical Panel',
        x: 0.21,
        y: 0.42,
        width: 0.1,
        height: 0.2,
        kind: 'evidence',
        evidenceId: 'ev_thermal_shunt',
        inspectText: 'A brass-latched breaker box smelling faintly of scorched copper.',
      },
      {
        id: 'hs_hale_case',
        label: 'Glinting Brass Cigarette Case',
        x: 0.38,
        y: 0.68,
        width: 0.09,
        height: 0.1,
        kind: 'evidence',
        evidenceId: 'ev_hale_cigarette_case',
        inspectText: 'An engraved "V.H." cigarette case lying near the wainscoting.',
      },
      {
        id: 'hs_compartment_4_door',
        label: 'Enter Compartment 4 (Crime Scene)',
        x: 0.54,
        y: 0.51,
        width: 0.14,
        height: 0.54,
        kind: 'door',
        targetLocation: 'victims_compartment',
        inspectText: 'Door to Thomas Avery’s locked compartment. The brass latch has been forced open.',
      },
      {
        id: 'hs_wet_footprint',
        label: 'Damp Sole Smudge (Rear Vestibule)',
        x: 0.77,
        y: 0.72,
        width: 0.11,
        height: 0.09,
        kind: 'evidence',
        evidenceId: 'ev_wet_footprint',
        requiresObservation: true,
        inspectText: 'A faint wet smudge on the runner leading from the Observation Carriage vestibule.',
        observationDetail: 'Soft felt-soled overshoe print, size 9—leaves no heel strike.',
      },
    ],
  },

  victims_compartment: {
    id: 'victims_compartment',
    name: "Victim's Compartment (Car 7, #4)",
    shortName: 'Comp 4',
    carNumber: 'Comp 4',
    description:
      'Private mahogany compartment. Thomas Avery lies beside his mahogany writing desk; overhead sits a narrow brass ventilation transom.',
    ambientTheme: 'crime',
    leftExit: 'carriage_7',
    floorY: 0.78,
    suspectsPresent: [],
    hotspots: [
      {
        id: 'hs_door_scratch',
        label: 'Door Slide-Bolt & Overhead Transom',
        x: 0.18,
        y: 0.32,
        width: 0.13,
        height: 0.32,
        kind: 'evidence',
        evidenceId: 'ev_door_scratch',
        requiresObservation: true,
        inspectText: 'The interior brass slide-bolt plate shows a fresh curved metal scratch beneath the transom slats.',
        observationDetail: 'Fresh brass scoring + a micro-fiber of silk-wrapped piano wire!',
      },
      {
        id: 'hs_stopped_watch',
        label: "Avery's Shattered Pocket Watch",
        x: 0.43,
        y: 0.64,
        width: 0.1,
        height: 0.12,
        kind: 'evidence',
        evidenceId: 'ev_stopped_watch',
        inspectText: 'Silver pocket watch beside Avery’s hand—frozen at 11:47:30.',
      },
      {
        id: 'hs_brandy_glass',
        label: 'Crystal Brandy Snifter',
        x: 0.6,
        y: 0.54,
        width: 0.09,
        height: 0.12,
        kind: 'evidence',
        evidenceId: 'ev_brandy_residue',
        requiresObservation: true,
        inspectText: 'Half-empty brandy snifter with pale crystalline sediment clinging to the glass.',
        observationDetail: 'Faint sweet-pear chemical odor: chloral hydrate sedative.',
      },
      {
        id: 'hs_sealed_window',
        label: 'Storm-Sealed Carriage Window',
        x: 0.78,
        y: 0.3,
        width: 0.14,
        height: 0.28,
        kind: 'evidence',
        evidenceId: 'ev_sealed_windows',
        inspectText: 'Heavy double-pane window with unbroken winter lead seals.',
      },
    ],
  },

  observation_carriage: {
    id: 'observation_carriage',
    name: 'Observation Carriage',
    shortName: 'Observ',
    carNumber: 'Car 8',
    description:
      'Glass-walled tail carriage looking out into the storm-lit valley. Brass reading lamps illuminate two armchairs and a rain-lashed rear balcony door.',
    ambientTheme: 'glass',
    leftExit: 'carriage_7',
    floorY: 0.78,
    suspectsPresent: ['eleanor', 'arthur'],
    hotspots: [
      {
        id: 'hs_suspect_eleanor',
        label: 'Eleanor Graves',
        x: 0.28,
        y: 0.54,
        width: 0.12,
        height: 0.3,
        kind: 'suspect',
        suspectId: 'eleanor',
        inspectText: 'Eleanor Graves scribbles furiously in her shorthand pad near the forward vestibule.',
      },
      {
        id: 'hs_tea_receipt',
        label: '11:44 PM Tea Receipt & Upside-Down Book',
        x: 0.46,
        y: 0.6,
        width: 0.1,
        height: 0.12,
        kind: 'evidence',
        evidenceId: 'ev_observation_clock_receipt',
        inspectText: 'A folded 11:44 PM tea receipt tucked beside an unread novel resting upside down.',
      },
      {
        id: 'hs_suspect_arthur',
        label: 'Arthur Bell',
        x: 0.62,
        y: 0.54,
        width: 0.12,
        height: 0.3,
        kind: 'suspect',
        suspectId: 'arthur',
        inspectText: 'Arthur Bell sits composedly in leather gloves, watching every move with quiet politeness.',
      },
      {
        id: 'hs_rear_deck',
        label: 'Rear Balcony Door & Wet Trench Coat',
        x: 0.83,
        y: 0.44,
        width: 0.12,
        height: 0.34,
        kind: 'evidence',
        evidenceId: 'ev_rear_deck_latch',
        requiresObservation: true,
        inspectText: 'Rainwater pools beneath the rear observation door beside Eleanor’s damp coat hem.',
        observationDetail: 'Fresh storm puddles inside the threshold—opened within the last hour.',
      },
    ],
  },
};

export const TIMELINE_SLOTS: TimelineSlot[] = [
  { id: 'slot_1', time: '11:46:30', label: 'Just Before Blackout', expectedEventId: 'tl_eleanor_deck' },
  { id: 'slot_2', time: '11:47:00', label: 'Blackout Begins', expectedEventId: 'tl_shunt_trips' },
  { id: 'slot_3', time: '11:47:15', label: 'Unknown Movement', expectedEventId: 'tl_felt_steps' },
  { id: 'slot_4', time: '11:47:30', label: 'Sound in Carriage 7', expectedEventId: 'tl_wrench_strike' },
  { id: 'slot_5', time: '11:47:52', label: 'Locked-Room Trick', expectedEventId: 'tl_wire_bolt' },
  { id: 'slot_6', time: '11:48:30', label: 'Lights Return (90s)', expectedEventId: 'tl_relay_resets' },
];

export const TIMELINE_EVENT_CARDS: TimelineEventCard[] = [
  {
    id: 'tl_eleanor_deck',
    title: 'Eleanor steps onto rear observation deck',
    detail: 'Leaves Arthur Bell unobserved in the Observation Carriage; Arthur slips forward in felt overshoes.',
    sourceHint: 'Observation Rear Door / Eleanor Interrogation',
  },
  {
    id: 'tl_shunt_trips',
    title: 'Carriage 7 timing shunt trips main lights',
    detail: 'Bi-metal pocket-watch shunt cuts power across the train for an exact 90-second cycle; Hale spills cognac in Lounge.',
    sourceHint: 'Carriage 7 Junction Panel / Steward Log',
  },
  {
    id: 'tl_felt_steps',
    title: 'Muffled felt footsteps brush past Conductor Reed',
    detail: 'Someone in damp size-9 felt overshoes moves rapidly toward Compartment 4.',
    sourceHint: 'Wet Vestibule Footprint / Reed Testimony',
  },
  {
    id: 'tl_wrench_strike',
    title: 'Blunt strike shatters Avery’s watch in Comp 4',
    detail: 'Sedated Avery opens his door and is struck with the stolen brass coupling wrench, stopping his watch at 11:47:30.',
    sourceHint: 'Shattered Watch / Engine Access Wrench',
  },
  {
    id: 'tl_wire_bolt',
    title: 'Interior brass bolt pulled shut via transom wire',
    detail: 'Killer steps into corridor, hooks slide-bolt with silk-wrapped piano wire through the transom, and returns to Observation.',
    sourceHint: 'Brass Door Scratch / Moved Suitcase',
  },
  {
    id: 'tl_relay_resets',
    title: 'Thermal relay resets; lights return at 90s',
    detail: 'Eleanor re-enters from deck; Arthur sits by his upside-down book; Reed & Vane break into Compartment 4.',
    sourceHint: 'Thermal Shunt / Body Discovery',
  },
  // Plausible Red Herring cards
  {
    id: 'tl_rh_clara_murder',
    title: 'Clara Whitmore enters Compartment 4',
    detail: 'Clara passes Carriage 5 at 11:46:10—actually heading to the Lounge hearth to burn her forged promissory note.',
    sourceHint: 'Berth Punch Log (Red Herring)',
  },
  {
    id: 'tl_rh_hale_attack',
    title: 'Victor Hale storms Carriage 7 in the dark',
    detail: 'Hale confronted Avery earlier at 11:43 PM, but was spilling cognac in the Lounge when 11:47 struck.',
    sourceHint: 'Cigarette Case (Red Herring)',
  },
];

export const HYPOTHESIS_TEMPLATES: HypothesisTemplate[] = [
  {
    id: 'hyp_victor',
    title: 'Victor Hale attacked Avery over the steel audit',
    suspectId: 'victor',
    claim: 'Victor Hale entered Compartment 4 during the blackout and struck Avery in anger.',
    supportingEvidenceIds: ['ev_hale_cigarette_case', 'ev_dining_argument'],
    contradictingEvidenceIds: ['ev_bartender_ledger'],
    conclusionText:
      'Contradicted: The steward’s 11:47 PM cognac spill log proves Hale was in the Lounge when the lights failed.',
  },
  {
    id: 'hyp_clara',
    title: 'Clara Whitmore killed Avery to erase her £42,000 debt',
    suspectId: 'clara',
    claim: 'Clara lied about Carriage 3 so she could murder Avery in Compartment 4.',
    supportingEvidenceIds: ['ev_ticket_scanner_log', 'ev_promissory_note'],
    contradictingEvidenceIds: ['ev_missing_wrench', 'ev_moved_suitcase'],
    conclusionText:
      'Incomplete / Misaligned: Clara broke into Carriage 5 to burn her forged note in the Lounge hearth—she lacked the wrench, wire, or blackout timer.',
  },
  {
    id: 'hyp_arthur',
    title: 'Arthur Bell staged the 90-second blackout & transom lock',
    suspectId: 'arthur',
    claim:
      'Arthur Bell used Mercer’s sedative, the Engine wrench, a 90s thermal shunt, felt overshoes, and transom piano wire while Eleanor stepped onto the rear deck.',
    supportingEvidenceIds: [
      'ev_rear_deck_latch',
      'ev_thermal_shunt',
      'ev_missing_wrench',
      'ev_door_scratch',
      'ev_moved_suitcase',
      'ev_brandy_residue',
    ],
    contradictingEvidenceIds: [],
    conclusionText:
      'Proven: Every physical, documentary, and timeline detail converges on Arthur Vance-Bell.',
  },
];

export const CASE_QUESTIONS: CaseQuestion[] = [
  {
    id: 'q_blackout',
    question: 'Why did the lights fail for exactly 90 seconds at 11:47:00 PM?',
    resolvedByEvidenceId: 'ev_thermal_shunt',
    answer: 'A modified pocket-watch bi-metal shunt in Carriage 7 tripped the relay and thermally reset after 90 seconds.',
  },
  {
    id: 'q_locked_door',
    question: 'How was Compartment 4 bolted from the inside with nobody left inside?',
    resolvedByEvidenceId: 'ev_door_scratch',
    answer: 'Stiff silk-wrapped piano wire fed through the overhead ventilation transom hooked and slid the brass bolt shut.',
  },
  {
    id: 'q_alibi',
    question: 'How could anyone in the Observation Carriage leave unnoticed during the blackout?',
    resolvedByEvidenceId: 'ev_rear_deck_latch',
    answer: 'Eleanor Graves stepped onto the stormy rear deck from 11:46:30 to 11:47:50, leaving Arthur Bell completely alone.',
  },
  {
    id: 'q_sedation',
    question: 'Why did Avery fail to overpower his attacker inside the doorway?',
    resolvedByEvidenceId: 'ev_brandy_residue',
    answer: 'Avery’s brandy was spiked with chloral hydrate stolen earlier from Dr. Mercer’s unlocked satchel.',
  },
  {
    id: 'q_motive',
    question: 'Why did Arthur Bell target Thomas Avery with such cold precision?',
    resolvedByEvidenceId: 'ev_moved_suitcase',
    answer: 'Avery’s falsified 1920 bridge audit framed Arthur’s brother, Chief Engineer Martin Bell, who died in prison.',
  },
];

export const LOCATION_ORDER: LocationId[] = [
  'engine_access',
  'conductors_compartment',
  'dining_car',
  'lounge',
  'carriage_3',
  'carriage_5',
  'carriage_7',
  'observation_carriage',
];
