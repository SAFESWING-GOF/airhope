import { User, Server, Channel, Message, DM, Friend } from '../types';

export const MOCK_USERS: Record<string, User> = {
  me: {
    id: 'u_me',
    username: 'Guest_User',
    avatar: 'bg-emerald-500',
    status: 'online',
    customStatus: 'Exploring Airhope!',
  },
  hope_bot: {
    id: 'u_hope_bot',
    username: 'Hope AI',
    avatar: 'bg-indigo-600',
    status: 'online',
    customStatus: 'Here to help! Ask me anything.',
    isBot: true,
    activity: {
      name: 'System Diagnostics',
      type: 'playing',
      details: 'Optimizing Airhope server'
    }
  },
  zenith_gamer: {
    id: 'u_zenith_gamer',
    username: 'Zenith_Gamer',
    avatar: 'bg-rose-500',
    status: 'online',
    customStatus: 'Climbing the ranks 🎮',
    activity: {
      name: 'Valorant',
      type: 'playing',
      details: 'Ranked Match - 14/12/5'
    }
  },
  astro_coder: {
    id: 'u_astro_coder',
    username: 'AstroCoder',
    avatar: 'bg-cyan-500',
    status: 'dnd',
    customStatus: 'Code is poetry 💻',
    activity: {
      name: 'VS Code',
      type: 'playing',
      details: 'Refactoring Typescript components'
    }
  },
  chill_vibes: {
    id: 'u_chill_vibes',
    username: 'Chill_Vibes',
    avatar: 'bg-amber-500',
    status: 'idle',
    customStatus: 'Relaxing with lofi',
    activity: {
      name: 'Spotify',
      type: 'listening',
      details: 'Lofi hip hop radio - beats to study/relax to'
    }
  },
  pixel_queen: {
    id: 'u_pixel_queen',
    username: 'PixelQueen',
    avatar: 'bg-purple-500',
    status: 'online',
    customStatus: 'Drawing cute sprites ✨',
    activity: {
      name: 'Aseprite',
      type: 'playing',
      details: 'Drawing character sprites'
    }
  },
  matrix_neo: {
    id: 'u_matrix_neo',
    username: 'Neo_The_One',
    avatar: 'bg-neutral-800',
    status: 'offline',
  }
};

export const DEFAULT_SERVERS: Server[] = [
  {
    id: 's_airhope',
    name: 'Airhope Official',
    icon: 'AH',
    iconBg: 'bg-indigo-600',
    banner: 'bg-gradient-to-r from-indigo-600 to-sky-500',
    ownerId: 'u_hope_bot',
    channels: [
      { id: 'c_welcome', name: 'welcome-rules', type: 'text', description: 'Rules and general info for Airhope!' },
      { id: 'c_general', name: 'general-chat', type: 'text', description: 'The main place to hang out and talk.' },
      { id: 'c_tech', name: 'tech-talk', type: 'text', description: 'Let\'s talk programming, hardware, and tech!' },
      { id: 'c_memes', name: 'memes', type: 'text', description: 'Post your funniest memes here.' },
      { id: 'c_lounge_v', name: 'Lounge 🔊', type: 'voice' },
      { id: 'c_gaming_v', name: 'Gaming Zone 🔊', type: 'voice' },
      { id: 'c_music_v', name: 'Music Jam 🔊', type: 'voice' },
    ]
  },
  {
    id: 's_gamers',
    name: 'Gamers Guild',
    icon: 'GG',
    iconBg: 'bg-rose-600',
    banner: 'bg-gradient-to-r from-rose-500 to-orange-500',
    ownerId: 'u_zenith_gamer',
    channels: [
      { id: 'c_game_news', name: 'gaming-news', type: 'text', description: 'Latest news, patch updates, and esports.' },
      { id: 'c_party_up', name: 'lfg-party', type: 'text', description: 'Find teammates and players for active lobby calls.' },
      { id: 'c_clips', name: 'epic-clips', type: 'text', description: 'Share your highlights and game screenshots.' },
      { id: 'c_squad1_v', name: 'Squad Call 1 🔊', type: 'voice' },
      { id: 'c_squad2_v', name: 'Squad Call 2 🔊', type: 'voice' },
    ]
  },
  {
    id: 's_creatives',
    name: 'Chill Lounge',
    icon: 'CL',
    iconBg: 'bg-amber-600',
    banner: 'bg-gradient-to-r from-amber-500 to-amber-700',
    ownerId: 'u_chill_vibes',
    channels: [
      { id: 'c_lofi', name: 'lofi-cafe', type: 'text', description: 'Cozy vibes only. Share music and relax.' },
      { id: 'c_art', name: 'creative-gallery', type: 'text', description: 'Showcase your artwork, photos, and digital designs.' },
      { id: 'c_cafe_v', name: 'Fireside Chat 🔊', type: 'voice' },
    ]
  }
];

export const DEFAULT_FRIENDS: Friend[] = [
  { id: 'f1', user: MOCK_USERS.hope_bot, relation: 'friend' },
  { id: 'f2', user: MOCK_USERS.zenith_gamer, relation: 'friend' },
  { id: 'f3', user: MOCK_USERS.astro_coder, relation: 'friend' },
  { id: 'f4', user: MOCK_USERS.chill_vibes, relation: 'friend' },
  { id: 'f5', user: MOCK_USERS.pixel_queen, relation: 'friend' },
  { id: 'f6', user: MOCK_USERS.matrix_neo, relation: 'blocked' }
];

export const DEFAULT_DMS: DM[] = [
  { id: 'dm_hope_bot', participant: MOCK_USERS.hope_bot, unreadCount: 0 },
  { id: 'dm_zenith_gamer', participant: MOCK_USERS.zenith_gamer, unreadCount: 0 },
  { id: 'dm_astro_coder', participant: MOCK_USERS.astro_coder, unreadCount: 0 }
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  c_welcome: [
    {
      id: 'w1',
      channelId: 'c_welcome',
      sender: MOCK_USERS.hope_bot,
      content: 'Welcome to **Airhope**! 🚀 This is a modern collaboration space styled precisely like Discord. Feel free to explore other channels, join the voice simulator, text with friends on **AirHope.net**, or create your own servers!',
      timestamp: 'Today at 9:00 AM'
    },
    {
      id: 'w2',
      channelId: 'c_welcome',
      sender: MOCK_USERS.hope_bot,
      content: '📝 **Quick Rules:**\n1. Be friendly and respectful.\n2. No spam or self-promotion.\n3. Keep topics matching channel names!\n\nHave fun chatting!',
      timestamp: 'Today at 9:01 AM'
    }
  ],
  c_general: [
    {
      id: 'g1',
      channelId: 'c_general',
      sender: MOCK_USERS.chill_vibes,
      content: 'hey everyone, just joined the new Airhope app! The UI feels incredibly snappy.',
      timestamp: 'Today at 10:15 AM'
    },
    {
      id: 'g2',
      channelId: 'c_general',
      sender: MOCK_USERS.pixel_queen,
      content: 'Right? I love the round animations on the server sidebar icons! Looks beautiful on mobile too.',
      timestamp: 'Today at 10:16 AM'
    },
    {
      id: 'g3',
      channelId: 'c_general',
      sender: MOCK_USERS.zenith_gamer,
      content: 'Who is down for some Valorant or CS2 custom matches later today? Ping me 🎮',
      timestamp: 'Today at 10:20 AM'
    }
  ],
  c_tech: [
    {
      id: 't1',
      channelId: 'c_tech',
      sender: MOCK_USERS.astro_coder,
      content: 'Anyone else building with Vite + React 19? The fast bundle speeds are insane.',
      timestamp: 'Today at 10:30 AM'
    },
    {
      id: 't2',
      channelId: 'c_tech',
      sender: MOCK_USERS.hope_bot,
      content: 'Vite 6 is incredibly powerful, especially when combined with Tailwind CSS v4! It supports native CSS imports and lightning-fast compilations.',
      timestamp: 'Today at 10:32 AM'
    }
  ],
  c_memes: [
    {
      id: 'm1',
      channelId: 'c_memes',
      sender: MOCK_USERS.zenith_gamer,
      content: 'When your code works on local but crashes on deployment: 🤡',
      timestamp: 'Today at 10:45 AM'
    }
  ],
  c_game_news: [
    {
      id: 'gn1',
      channelId: 'c_game_news',
      sender: MOCK_USERS.zenith_gamer,
      content: 'The new regional tournament was announced! Looking forward to drafting a custom team.',
      timestamp: 'Today at 11:00 AM'
    }
  ],
  c_party_up: [
    {
      id: 'pu1',
      channelId: 'c_party_up',
      sender: MOCK_USERS.zenith_gamer,
      content: 'Need 2 more players for ranked play. Drop tag or join Squad Call 1! 🔊',
      timestamp: 'Today at 11:12 AM'
    }
  ],
  c_clips: [
    {
      id: 'cl1',
      channelId: 'c_clips',
      sender: MOCK_USERS.pixel_queen,
      content: 'Just finished this voxel character render! Tell me what you think.',
      timestamp: 'Today at 11:15 AM'
    }
  ],
  c_lofi: [
    {
      id: 'lf1',
      channelId: 'c_lofi',
      sender: MOCK_USERS.chill_vibes,
      content: 'Throwing on the lofi radio. Perfect soundtrack for drawing or writing code today ☕',
      timestamp: 'Today at 11:30 AM'
    }
  ],
  c_art: [
    {
      id: 'a1',
      channelId: 'c_art',
      sender: MOCK_USERS.pixel_queen,
      content: 'Working on a new banner background for our Airhope communities. Let me know if we should go with retro space neon or deep slate colors.',
      timestamp: 'Today at 11:40 AM'
    }
  ],
  dm_hope_bot: [
    {
      id: 'dh1',
      channelId: 'dm_hope_bot',
      sender: MOCK_USERS.hope_bot,
      content: 'Hello! I am **Hope AI**, your personal Airhope assistant. You can chat with me, ask questions about the app, or ask for a programming joke!',
      timestamp: 'Today at 9:00 AM'
    }
  ],
  dm_zenith_gamer: [
    {
      id: 'dz1',
      channelId: 'dm_zenith_gamer',
      sender: MOCK_USERS.zenith_gamer,
      content: 'Hey buddy, did you see my message in #lfg-party? Let me know if you can jump in later!',
      timestamp: 'Today at 10:25 AM'
    }
  ],
  dm_astro_coder: [
    {
      id: 'da1',
      channelId: 'dm_astro_coder',
      sender: MOCK_USERS.astro_coder,
      content: 'Hey! Saw your profile status, hope you are enjoying Airhope. Let me know if you want to look at some TypeScript designs.',
      timestamp: 'Today at 10:35 AM'
    }
  ]
};

// Interactive Bot Reply Generator
export function getBotResponse(channelId: string, userMessage: string, senderUser: User): { user: User; text: string } | null {
  const textLower = userMessage.toLowerCase();

  // If DMing hope_bot
  if (channelId === 'dm_hope_bot') {
    if (textLower.includes('joke')) {
      const jokes = [
        "Why do programmers wear glasses? Because they can't C#! 😂",
        "There are 10 types of people in this world: Those who understand binary, and those who don't.",
        "How many programmers does it take to change a lightbulb? None, that's a hardware problem!",
        "['hip', 'hip'] (hip hip array!) 🥳",
        "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'"
      ];
      return {
        user: MOCK_USERS.hope_bot,
        text: jokes[Math.floor(Math.random() * jokes.length)]
      };
    }

    if (textLower.includes('help') || textLower.includes('how') || textLower.includes('guide')) {
      return {
        user: MOCK_USERS.hope_bot,
        text: 'I can help you understand how **Airhope** works! Here is a guide:\n\n- **Create Server**: Click the **`+`** icon on the leftmost server sidebar to spin up your own custom gaming, study, or family server!\n- **Voice Calling**: Click any channel with a speaker **`🔊`** icon to join. You will hear an audio cue and see active speakers mock-talking!\n- **Member List**: Toggle the members icon in the top right to see active server members.\n- **Friends**: Go to the Direct Messages (Home) button on top of the server list to manage friends, view statuses, or send direct chats.'
      };
    }

    if (textLower.includes('hello') || textLower.includes('hi') || textLower.includes('hey')) {
      return {
        user: MOCK_USERS.hope_bot,
        text: `Hey there, **${senderUser.username}**! Welcome to the Airhope private lounge. How is your day going? Let me know if you need any help or want to hear a programmer joke!`
      };
    }

    return {
      user: MOCK_USERS.hope_bot,
      text: "That's awesome! Airhope is powered by a high-fidelity client engine. Ask me about **'help'** or **'joke'** to test out my reactive features!"
    };
  }

  // If DMing Zenith Gamer
  if (channelId === 'dm_zenith_gamer') {
    if (textLower.includes('game') || textLower.includes('play') || textLower.includes('party') || textLower.includes('valorant')) {
      return {
        user: MOCK_USERS.zenith_gamer,
        text: 'Heck yeah! I am warming up in Deathmatch right now. Hop into Squad Call 1 voice channel, and let\'s link up in 5 minutes! 🎮'
      };
    }
    return {
      user: MOCK_USERS.zenith_gamer,
      text: 'Yo! Just saw your text. Ping me if you want to play a game, or meet me in the #lfg-party text channel!'
    };
  }

  // If DMing AstroCoder
  if (channelId === 'dm_astro_coder') {
    if (textLower.includes('code') || textLower.includes('typescript') || textLower.includes('javascript') || textLower.includes('bug')) {
      return {
        user: MOCK_USERS.astro_coder,
        text: 'Nice! Code bugs are just undocumented features. Have you tried wrapping it in a nice Try/Catch, or checking the dependency array in your React useEffect hooks? 🧑‍💻'
      };
    }
    return {
      user: MOCK_USERS.astro_coder,
      text: 'Hey! I\'m currently wrapping up a sprint, but I will review this shortly. Let me know if you need help debugging some code!'
    };
  }

  // Server Channel responses
  if (channelId === 'c_general') {
    if (textLower.includes('hello') || textLower.includes('hi') || textLower.includes('hey') || textLower.includes('welcome')) {
      const users = [MOCK_USERS.chill_vibes, MOCK_USERS.pixel_queen, MOCK_USERS.zenith_gamer];
      const selected = users[Math.floor(Math.random() * users.length)];
      const greets = [
        `Hey @${senderUser.username}! Welcome to the channel! 🍻`,
        `Yoo @${senderUser.username}! Good to have you here!`,
        `Welcome to Airhope @${senderUser.username}! What are you working on today?`
      ];
      return {
        user: selected,
        text: greets[Math.floor(Math.random() * greets.length)]
      };
    }
  }

  if (channelId === 'c_tech') {
    if (textLower.includes('typescript') || textLower.includes('react') || textLower.includes('vite') || textLower.includes('framework')) {
      return {
        user: MOCK_USERS.astro_coder,
        text: 'Fully agree! TypeScript makes scale-up development so much more comfortable. Autocomplete, interface checking, and explicit return typing are absolute game-changers.'
      };
    }
  }

  if (channelId === 'c_memes') {
    return {
      user: MOCK_USERS.chill_vibes,
      text: 'haha that is so real! 😂 saving that to my local album.'
    };
  }

  return null;
}

// Random ambient message simulation generator
const AMBIENT_CHANNELS = ['c_general', 'c_tech', 'c_memes', 'c_game_news', 'c_lofi', 'c_art'];
const AMBIENT_QUOTES: { user: User; text: string; channelId: string }[] = [
  {
    user: MOCK_USERS.chill_vibes,
    channelId: 'c_lofi',
    text: 'Listen to this track: "Summer Chill Out" beat. Perfect mood.'
  },
  {
    user: MOCK_USERS.pixel_queen,
    channelId: 'c_art',
    text: 'Just uploaded my voxel study model to the design folder! Feel free to critique!'
  },
  {
    user: MOCK_USERS.astro_coder,
    channelId: 'c_tech',
    text: 'TIL: In TypeScript, you can use `satisfies` operator to check type-safety without widening the expression\'s type. Super neat!'
  },
  {
    user: MOCK_USERS.zenith_gamer,
    channelId: 'c_general',
    text: 'Just got a 5k clutch! I am clipping it right now to show you guys.'
  },
  {
    user: MOCK_USERS.pixel_queen,
    channelId: 'c_general',
    text: 'Has anyone tried drawing pixel art using grid layouts in CSS? It is tedious but quite satisfying.'
  },
  {
    user: MOCK_USERS.chill_vibes,
    channelId: 'c_general',
    text: 'Grabbing some coffee ☕ What are you guys up to?'
  }
];

export function getRandomAmbientMessage(): { user: User; text: string; channelId: string } {
  return AMBIENT_QUOTES[Math.floor(Math.random() * AMBIENT_QUOTES.length)];
}
