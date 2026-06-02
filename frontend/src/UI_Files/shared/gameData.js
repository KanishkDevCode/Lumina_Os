// gameData.js
export const THEMES = {
  GOW: {
    id: 'GOW',
    title: 'GOD OF WAR',
    tagline: 'MYTHIC ACTION EXPERIENCE',
    overview: 'Enter the world of Norse mythology as Kratos and Atreus. Journey across the Nine Realms, face legendary enemies, and uncover the truth behind the frost.',
    description: 'Step into the world of Norse mythology and wield the power of the Leviathan Axe. Explore ancient realms, fight legendary creatures, and uncover the truth behind the frost.',
    genre: 'Action / Adventure',
    developer: 'Santa Monica Studio',
    version: 'v0.3.2 (Alpha)',
    world: 'Norse Mythology (Midgard)',
    features: [
      'Action / Adventure',
      'Mythology',
      'Single Player',
      'Story Rich',
      'High Detail Combat'
    ],
    overviewIcons: ['Action / Adventure', 'Mythology', 'Single Player', 'High Detail Combat'],
    platforms: ['PC', 'Console'],
    status: 'Developed',
    releaseDate: '2022',
    gameMode: 'Single Player',
    settings: {
      difficulty: 'Story, Normal, Hard, Give Me God of War',
      graphics: 'Low, Medium, High, Ultra',
      multiplayer: 'No',
      language: 'English, French, German, Spanish, Italian',
      camera: 'Over The Shoulder',
      accessibility: 'Colorblind Mode, Subtitles, Remap Controls'
    },
    lore: [
      { name: 'MIDGARD', desc: 'Midgard is the realm of humankind, a vast and untamed land where towering mountains pierce the skies, ancient forests conceal forgotten secrets, and icy rivers carve their way through a world shaped by gods and legends. Though it appears beautiful and serene, Midgard is a place of constant struggle, where the remnants of ancient civilizations, mysterious ruins, and hidden powers lie scattered across the wilderness. From snow-covered peaks and dense pine forests to rugged coastlines and abandoned temples, every corner of the realm tells a story of survival, destiny, and the enduring spirit of those who call it home. Beneath its breathtaking landscapes lingers an air of mystery, as echoes of old magic and the shadows of forgotten ages continue to shape the fate of the world.' },
      { name: 'ALFHEIM', desc: 'Alfheim is a realm of breathtaking beauty and radiant magic, where shimmering rivers, crystal-clear lakes, and luminous forests stretch beneath skies filled with eternal light. Home to the noble Light Elves, this enchanted world is adorned with elegant spires, ancient temples, and magnificent structures that seem woven from light itself. Every corner of Alfheim glows with mystical energy, from its flowering groves and cascading waterfalls to the celestial creatures that roam its sacred lands. Yet beneath its serene and heavenly appearance lies a realm filled with ancient conflicts, hidden knowledge, and secrets lost to time. Alfheim stands as a symbol of grace, wisdom, and arcane power, where the brilliance of creation and the mysteries of the cosmos exist in perfect harmony.' },
      { name: 'JOTUNHEIM', desc: 'Jötunheim is the ancient homeland of the Giants, a vast and awe-inspiring realm where colossal mountains, frozen valleys, and endless glaciers stretch beyond the horizon. Shrouded in snow and illuminated by the dancing lights of the aurora, this land bears the legacy of an ancient race whose wisdom, strength, and bloodlines shaped the fate of the Nine Realms. Towering statues, rune-covered monoliths, and forgotten sanctuaries stand as silent reminders of a civilization long faded from glory. Despite its harsh and unforgiving landscape, Jötunheim possesses a profound sense of mystery and majesty, where every icy peak hides untold stories and every frozen ruin echoes with the voices of giants who once walked the world. It is a realm of destiny, heritage, and ancient power, preserving secrets that have endured through the ages.' },
      { name: 'MUSPELHEIM', desc: 'Muspelheim is the primordial realm of fire, a land where rivers of molten lava carve through scorched wastelands and towering volcanoes spew endless flames into crimson skies. Consumed by heat and chaos, this unforgiving world is home to powerful fire-born beings, ancient warriors, and destructive forces that embody the raw fury of creation itself. Jagged obsidian cliffs, burning fortresses, and rune-carved monuments rise from seas of magma, their glow illuminating a realm that never knows darkness. The air trembles with the roar of eruptions and the clash of eternal battles, making Muspelheim a place where only the strongest can endure. Yet within its infernal beauty lies a deeper significance, for this realm represents the untamed power of destruction and rebirth, a force destined to shape the fate of gods, giants, and the Nine Realms themselves.' },
      { name: 'NIFLHEIM', desc: 'Niflheim is a realm shrouded in eternal mist, where icy winds whisper through forgotten ruins and darkness lingers over a land cursed by ancient magic. Endless fog blankets jagged mountains, frozen valleys, and crumbling structures, obscuring the path of any traveler brave enough to enter. The air itself feels hostile, carrying a chilling presence that drains warmth, hope, and life from all who wander too far. Ghostly lights flicker through the haze, while long-abandoned monuments and rune-covered towers stand as remnants of a forgotten age. Beneath its frozen silence lies an ever-present sense of dread, as hidden dangers and ancient curses dwell within the shadows. Niflheim is a realm of isolation, mystery, and relentless cold—a place where the boundary between life and death seems to fade into the endless mist.' },
      { name: 'ASGARD', desc: 'Asgard is the magnificent realm of the Aesir gods, a celestial kingdom where divine power, wisdom, and order reign supreme. Suspended high above the mortal world, its golden halls, towering palaces, and majestic citadels shine beneath radiant skies, reflecting the glory of an empire forged by gods. Vast bridges connect grand fortresses and sacred temples, while powerful warriors stand watch over the realm’s borders, guarding it against the chaos beyond. At the heart of Asgard lies the seat of Odin, the All-Father, whose influence shapes the destiny of the Nine Realms. Yet beneath its splendor and strength, Asgard is also a realm of ambition, prophecy, and hidden intrigue, where the decisions of gods can alter the fate of worlds. It stands as the ultimate symbol of divine authority—a fortified paradise built upon honor, power, and the enduring legacy of the Aesir.' },
      { name: 'VANAHEIM', desc: 'Vanaheim is a vibrant and untamed realm where nature reigns supreme, its endless jungles, ancient forests, and crystal-clear rivers pulsing with powerful primal magic. Home to the Vanir gods, this lush world thrives in perfect harmony with the living forces of the land, where colossal trees stretch toward the heavens and forgotten temples lie hidden beneath curtains of vines and cascading waterfalls. Every corner of Vanaheim teems with life, from mystical creatures roaming the wilderness to sacred groves infused with ancient enchantments. Yet beneath its breathtaking beauty lies a realm of fierce resilience and hidden power, where nature itself can become a formidable guardian against those who seek to disturb its balance. Vanaheim embodies growth, wisdom, and the enduring strength of life, standing as a testament to the deep connection between magic and the natural world.' },
      { name: 'SVARTALFHEIM', desc: 'Svartalfheim is the industrious realm of the Dwarves, a vast underground world carved deep beneath mountains and stone. Illuminated by the glow of colossal forges, molten rivers, and intricate machinery, this realm is a masterpiece of engineering and craftsmanship, where every tunnel, bridge, and fortress reflects centuries of unmatched skill. The air echoes with the sound of hammers striking anvils as master smiths shape legendary weapons, enchanted artifacts, and marvels of invention. Towering mines stretch into the depths of the earth, yielding precious metals and rare resources that fuel the realms prosperity. Though harsh and rugged, Svartalfheim thrives through ingenuity, determination, and hard work, standing as a testament to the creativity and resilience of the Dwarven people. It is a realm where industry and artistry become one, and where some of the greatest creations in all the Nine Realms are born.' },
      { name: 'HELHEIM', desc: '**Helheim** is the bleak and frozen realm of the dead, a desolate kingdom where endless winter, haunting silence, and eternal sorrow reign without mercy. Beneath darkened skies and amidst towering glaciers, countless lost souls wander through icy wastelands, forever bound to a fate they cannot escape. Ancient fortresses, spectral ruins, and colossal monuments rise from the frost-covered landscape, illuminated only by the ghostly glow of cursed flames and the pale light of the underworld. Ruled by Hel, the enigmatic goddess of death, this realm serves as the final destination for those who perish without glory or honor in battle. The air itself carries a chilling sense of despair, as memories, regrets, and forgotten spirits linger in the frozen mist. Helheim is a realm of death, judgment, and eternal stillness—a haunting reminder that not all destinies end in glory, and that some souls are fated to wander the darkness forever.' }
    ],
    weapons: [
      { name: 'LEVIATHAN AXE', desc: 'A powerful axe infused with Frost energy, capable of devastating enemies.', icon: '🪓' },
      { name: 'BLADES OF CHAOS', desc: 'Twin blades bound by fire and rage, capable of relentless combos.', icon: '⚔️' },
      { name: 'DRAUPNIR SPEAR', desc: 'A magical spear that multiplies and pierces through any enemy.', icon: '🔱' }
    ],
    primary: '#00d2ff',
    primaryRgb: '0, 210, 255',
    bgCore: '#02050a',
    bgGlow: '#001a2c',
    surface: 'rgba(10, 18, 30, 0.65)',
    particleColor: '#aaddff'
  },
  AC: {
    id: 'AC',
    title: "ASSASSIN'S CREED",
    tagline: 'LIVE BY THE CREED',
    overview: 'Join the Brotherhood and step into the shadows. Experience the eternal struggle between Assassins and Templars across stunning historical worlds.',
    description: 'Step into the eternal struggle between Assassins and Templars. Explore historical worlds, uncover hidden truths, and shape your legacy.',
    genre: 'Action / Adventure',
    developer: 'Lumina Studios',
    version: 'v0.3.2 (Alpha)',
    world: 'Renaissance Italy (Florence)',
    features: [
      'Action / Adventure',
      'Stealth / Parkour',
      'Historical Fiction',
      'Single Player'
    ],
    overviewIcons: ['Action / Adventure', 'Stealth / Parkour', 'Historical Fiction', 'Single Player'],
    platforms: ['Console', 'PC'],
    status: 'Alpha',
    releaseDate: 'To be announced',
    gameMode: 'Single Player',
    settings: {
      difficulty: 'Novice, Assassin, Master Assassin',
      graphics: 'Low, Medium, High, Animus Ultra',
      multiplayer: 'Co-op (Up to 4 Players)',
      language: 'English, Italian, French, Spanish, Arabic',
      camera: 'Dynamic Follow',
      accessibility: 'Eagle Vision Toggle, Subtitles, Auto-Parkour'
    },
    lore: [
      { name: 'THE BROTHERHOOD', desc: 'A secret order fighting for peace, free will, and the protection of humanity from tyranny.' },
      { name: 'THE TEMPLARS', desc: 'An ancient organization seeking peace through order, control, and the subjugation of free will.' },
      { name: 'THE ANIMUS', desc: 'A machine that allows users to access and experience the genetic memories of their ancestors.' },
      { name: 'PIECES OF EDEN', desc: 'Technologically advanced artifacts created by the Isu to control and manipulate humanity.' },
      { name: 'THE ISU', desc: 'An advanced precursor race that created humanity and the Pieces of Eden before a great catastrophe.' }
    ],
    weapons: [
      { name: 'HIDDEN BLADE', desc: 'The signature weapon of the Brotherhood. A retractable blade used for stealth assassinations.', icon: '🗡️' },
      { name: 'SWORD OF ALTAÏR', desc: 'A legendary weapon wielded by the great Mentor. Light, incredibly sharp, and deadly.', icon: '⚔️' },
      { name: 'PHANTOM BLADE', desc: 'A modification of the Hidden Blade that acts as a miniaturized crossbow for silent ranged kills.', icon: '🏹' }
    ],
    publishData: {
      progress: 65,
      phases: [
        { name: 'Parkour Mechanics', done: true },
        { name: 'City Generation', done: true },
        { name: 'Crowd AI', done: true },
        { name: 'Combat & Stealth', done: false },
        { name: 'Story Integration', done: false }
      ],
      updates: [
        { version: 'v0.2.5 (Alpha)', date: '3 days ago', desc: 'Improved crowd blending mechanics and updated leap of faith physics.' },
        { version: 'v0.2.4 (Alpha)', date: '2 weeks ago', desc: 'Added new assassination animations and expanded the Florence map.' },
        { version: 'v0.2.0 (Alpha)', date: '1 month ago', desc: 'Initial Animus boot sequence and basic parkour systems implemented.' }
      ],
      testing: [
        { name: 'Stealth Mechanics', status: 'In Progress', icon: '✓', color: '#00ff88' },
        { name: 'AI Detection', status: 'In Progress', icon: '⚡', color: '#ffcc00' },
        { name: 'Historical Accuracy', status: 'Reviewing', icon: '⟳', color: '#00ff88' },
        { name: 'Mission Scripting', status: 'Pending', icon: '⏱', color: '#888' }
      ],
      issues: [
        'NPCs occasionally getting stuck on merchant stalls',
        'Eagle Vision highlight persisting after combat',
        'Desynchronization loading screen takes too long'
      ],
      roadmap: [
        { milestone: 'Closed Alpha', date: 'Q1 2025' },
        { milestone: 'Beta Release', date: 'Q2 2025' },
        { milestone: 'Multiplayer Test', date: 'Q3 2025' },
        { milestone: 'Global Launch', date: 'Q4 2025' }
      ]
    },
    primary: '#ffffff',
    primaryRgb: '255, 255, 255',
    bgCore: '#050505',
    bgGlow: '#222222',
    surface: 'rgba(20, 20, 20, 0.65)',
    particleColor: '#ffffff'
  },
  HL: {
    id: 'HL',
    title: 'HOGWARTS LEGACY',
    tagline: 'LIVE THE UNWRITTEN',
    overview: 'Experience Hogwarts in the 1800s. Your character is a student who holds the key to an ancient secret that threatens to tear the wizarding world apart.',
    description: 'Forge alliances, battle Dark wizards, and decide the fate of the wizarding world. Your legacy is what you make of it.',
    genre: 'Action RPG',
    developer: 'Lumina Studios',
    version: 'v1.1.0',
    world: 'The Wizarding World',
    features: ['Open World', 'Magic & Spells', 'Character Customization', 'Rich Story'],
    overviewIcons: ['Open World', 'Magic & Spells', 'Character Customization', 'Rich Story'],
    platforms: ['PC', 'Console'],
    status: 'Released',
    releaseDate: 'Feb 10, 2023',
    gameMode: 'Single Player',
    settings: {
      difficulty: 'Story, Easy, Normal, Hard',
      graphics: 'Low, Medium, High, Ultra (Ray Tracing)',
      multiplayer: 'None',
      language: 'English, French, German, Spanish',
      camera: 'Third Person',
      accessibility: 'Colorblind Mode, Audio Visualizer, Aim Assist'
    },
    lore: [
      { name: 'HOGWARTS CASTLE', desc: 'The School of Witchcraft and Wizardry, full of ancient magic, hidden passages, and secrets.' },
      { name: 'HOGSMEADE', desc: 'The only all-wizarding village in Britain, famous for its shops and Butterbeer.' },
      { name: 'THE FORBIDDEN FOREST', desc: 'A dark and dangerous forest bordering the castle grounds, home to centaurs and spiders.' },
      { name: 'ANCIENT MAGIC', desc: 'A rare and powerful form of magic that only a select few individuals can perceive and wield.' }
    ],
    weapons: [
      { name: 'WAND', desc: 'The primary tool of any witch or wizard, channeling magical energy into spells.', icon: '🪄' },
      { name: 'POTIONS', desc: 'Brewed concoctions that provide healing, defense, or offensive capabilities in combat.', icon: '🧪' },
      { name: 'MANDRAKE', desc: 'A magical plant whose cry can stun or incapacitate enemies when uprooted.', icon: '🌱' }
    ],
    publishData: {
      progress: 100,
      phases: [
        { name: 'Castle Architecture', done: true },
        { name: 'Spell Combat', done: true },
        { name: 'Creature Handling', done: true },
        { name: 'Main Quests', done: true },
        { name: 'Optimization', done: true }
      ],
      updates: [
        { version: 'v1.1.0', date: '1 month ago', desc: 'Added Arachnophobia mode and performance optimizations.' },
        { version: 'v1.0.5', date: '3 months ago', desc: 'Fixed broom flight controls and various quest bugs.' }
      ],
      testing: [
        { name: 'PC Performance', status: 'Completed', icon: '✓', color: '#00ff88' },
        { name: 'Console Fidelity', status: 'Completed', icon: '✓', color: '#00ff88' }
      ],
      issues: [
        'Minor frame drops in Hogsmeade during rain',
        'Robes clipping through mounts'
      ],
      roadmap: [
        { milestone: 'Launch', date: 'Feb 2023' },
        { milestone: 'Summer Update', date: 'Jun 2023' },
        { milestone: 'Photo Mode Expansion', date: 'Sep 2023' }
      ]
    },
    primary: '#2a9d8f',
    primaryRgb: '42, 157, 143',
    bgCore: '#111815',
    bgGlow: '#0e382b',
    surface: 'rgba(20, 30, 25, 0.65)',
    particleColor: '#48c9b0'
  },
  RDR: {
    id: 'RDR',
    title: 'RED DEAD REDEMPTION',
    tagline: 'OUTLAWS FOR LIFE',
    overview: 'America, 1899. The end of the wild west era has begun as lawmen hunt down the last remaining outlaw gangs.',
    description: 'Arthur Morgan and the Van der Linde gang must rob, steal and fight their way across the rugged heartland of America in order to survive.',
    genre: 'Action / Adventure',
    developer: 'Lumina Studios',
    version: 'v1.31',
    world: 'Wild West America',
    features: ['Open World', 'Story Rich', 'Horseback Riding', 'Gunfights'],
    overviewIcons: ['Open World', 'Story Rich', 'Horseback Riding', 'Gunfights'],
    platforms: ['Console', 'PC'],
    status: 'Released',
    releaseDate: 'Oct 26, 2018',
    gameMode: 'Single Player / Online',
    settings: {
      difficulty: 'Standard',
      graphics: 'Low, Medium, High, Ultra',
      multiplayer: 'Red Dead Online',
      language: 'English, Spanish, French',
      camera: 'First Person, Third Person',
      accessibility: 'Subtitles, Aim Assist, Colorblind Mode'
    },
    lore: [
      { name: 'VAN DER LINDE GANG', desc: 'A notorious gang of outlaws, renegades, and misfits led by the charismatic Dutch van der Linde.' },
      { name: 'THE PINKERTONS', desc: 'A national detective agency hired by wealthy tycoons to hunt down the Van der Linde gang.' },
      { name: 'NEW HANOVER', desc: 'A sprawling state featuring sweeping plains, rugged hills, and the bustling town of Valentine.' },
      { name: 'LEMOYNE', desc: 'A southeastern state known for its humid swamps, cotton plantations, and the city of Saint Denis.' }
    ],
    weapons: [
      { name: 'CATTLEMAN REVOLVER', desc: 'A standard, reliable six-shooter popular among cowboys and outlaws.', icon: '🔫' },
      { name: 'REPEATING SHOTGUN', desc: 'A devastating close-range weapon that holds multiple shells for rapid fire.', icon: '💥' },
      { name: 'BOW', desc: 'A silent weapon ideal for hunting animals without ruining the pelt, or for stealthy kills.', icon: '🏹' }
    ],
    publishData: {
      progress: 100,
      phases: [
        { name: 'Open World Ecology', done: true },
        { name: 'Horse Physics', done: true },
        { name: 'Camp Interactions', done: true },
        { name: 'Bounty System', done: true },
        { name: 'Cinematic Story', done: true }
      ],
      updates: [
        { version: 'v1.31', date: '5 months ago', desc: 'Added new bounty hunter missions to Red Dead Online.' },
        { version: 'v1.30', date: '1 year ago', desc: 'DLSS support added and various graphical optimizations.' }
      ],
      testing: [
        { name: 'PC Port Performance', status: 'Completed', icon: '✓', color: '#00ff88' },
        { name: 'Online Connectivity', status: 'Monitoring', icon: '⟳', color: '#ffcc00' }
      ],
      issues: [
        'Occasional infinite loading screen in Online mode',
        'Camp members sometimes comment on the cold inappropriately'
      ],
      roadmap: [
        { milestone: 'Console Launch', date: 'Oct 2018' },
        { milestone: 'PC Launch', date: 'Nov 2019' },
        { milestone: 'Online Blood Money', date: 'Jul 2021' }
      ]
    },
    primary: '#d62828',
    primaryRgb: '214, 40, 40',
    bgCore: '#1a100c',
    bgGlow: '#3b0909',
    surface: 'rgba(30, 15, 10, 0.65)',
    particleColor: '#ff7b00'
  },
  HITMAN: {
    id: 'HITMAN',
    title: 'HITMAN',
    tagline: 'ENTER A WORLD OF ASSASSINATION',
    overview: 'Travel the globe and track your targets across exotic sandbox locations in Hitman. From sun-drenched streets to dark and dangerous rainforests.',
    description: 'You are Agent 47, the worlds ultimate assassin. Use stealth, disguises, and environmental hazards to eliminate your targets creatively.',
    genre: 'Stealth / Action',
    developer: 'Lumina Studios',
    version: 'v3.150.1',
    world: 'Global (Various Sandbox Locations)',
    features: ['Stealth', 'Sandbox', 'Assassination', 'Disguises'],
    overviewIcons: ['Stealth', 'Sandbox', 'Assassination', 'Disguises'],
    platforms: ['PC', 'Console'],
    status: 'Released',
    releaseDate: 'Jan 20, 2021',
    gameMode: 'Single Player',
    settings: {
      difficulty: 'Casual, Professional, Master',
      graphics: 'Low, Medium, High, Ultra',
      multiplayer: 'Sniper Assassin Co-op',
      language: 'English, French, German',
      camera: 'Third Person',
      accessibility: 'Instinct Toggle, Subtitles, HUD Options'
    },
    lore: [
      { name: 'AGENT 47', desc: 'A genetically engineered clone created to be the perfect assassin. Ruthless, efficient, and virtually emotionless.' },
      { name: 'DIANA BURNWOOD', desc: 'Agent 47s handler at the ICA. She provides intel, secures contracts, and acts as his only connection to humanity.' },
      { name: 'THE ICA', desc: 'The International Contract Agency, a global shadow organization that provides assassination and mercenary services.' },
      { name: 'PROVIDENCE', desc: 'A secretive cabal of the worlds most powerful individuals, controlling global affairs from the shadows.' }
    ],
    weapons: [
      { name: 'SILVERBALLERS', desc: 'Agent 47s signature custom dual AMT Hardballer pistols, highly accurate and suppressible.', icon: '🔫' },
      { name: 'FIBER WIRE', desc: 'A highly concealable garrote wire used for swift, silent takedowns from behind.', icon: '🧵' },
      { name: 'LOCKPICK', desc: 'An essential tool for bypassing locked doors quietly without raising suspicion.', icon: '🗝️' }
    ],
    publishData: {
      progress: 100,
      phases: [
        { name: 'Level Design Sandbox', done: true },
        { name: 'AI Suspicion Mechanics', done: true },
        { name: 'Disguise System', done: true },
        { name: 'Elusive Targets', done: true }
      ],
      updates: [
        { version: 'v3.150.1', date: '2 weeks ago', desc: 'Added new Freelancer mode safehouse decorations.' },
        { version: 'v3.140.0', date: '2 months ago', desc: 'Introduced the Freelancer roguelike mode.' }
      ],
      testing: [
        { name: 'AI Crowd Behavior', status: 'Completed', icon: '✓', color: '#00ff88' },
        { name: 'Freelancer Balancing', status: 'Monitoring', icon: '⟳', color: '#ffcc00' }
      ],
      issues: [
        'NPCs occasionally spot bodies through specific walls in Mumbai',
        'Briefcase homing physics behaves erratically'
      ],
      roadmap: [
        { milestone: 'Hitman 3 Launch', date: 'Jan 2021' },
        { milestone: 'Year 2 Content', date: 'Jan 2022' },
        { milestone: 'Freelancer Update', date: 'Jan 2023' }
      ]
    },
    primary: '#8b939c',
    primaryRgb: '139, 147, 156',
    bgCore: '#0a0a0b',
    bgGlow: '#2a2d34',
    surface: 'rgba(15, 16, 18, 0.65)',
    particleColor: '#e2e6e9'
  }
}

// Added heroBg and logoImg to the games
export const CAROUSEL_GAMES = [
  {
    id: 'HITMAN',
    titleLines: ['HITMAN'],
    sub: 'STEALTH ACTION',
    color: 'text-white',
    heroBg: '/images/hitman-bg.jpg',
    logoImg: '/images/hitman-logo.png'
  },
  {
    id: 'RDR',
    titleLines: ['RED DEAD REDEMPTION'],
    sub: 'OPEN-WORLD WESTERN',
    color: 'text-red',
    heroBg: '/images/rdr-bg.jpg',
    logoImg: '/images/rdr-logo.png'
  },
  {
    id: 'GOW',
    titleLines: ['GOD OF WAR'],
    sub: 'MYTHIC ACTION',
    color: 'text-blue',
    heroBg: '/images/gow-bg.jpg', // Ensure this path matches where you put the file
    logoImg: '/images/gow-logo.png'
  },
  {
    id: 'AC',
    titleLines: ['ASSASSIN\'S', 'CREED'],
    sub: 'ACTION ADVENTURE',
    color: 'text-white',
    heroBg: '/images/ac-bg.jpg',
    logoImg: '/images/ac-logo.png'
  },
  {
    id: 'HL',
    titleLines: ['HOGWARTS LEGACY'],
    sub: 'FANTASY RPG',
    color: 'text-red',
    heroBg: '/images/hl-bg.jpg',
    logoImg: '/images/hl-logo.png'
  }
]