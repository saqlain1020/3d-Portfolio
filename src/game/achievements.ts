export type Achievement = {
  id: string;
  title: string;
  desc: string;
  xp: number;
  icon: string;
  secret?: boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "start", title: "Player One", desc: "Pressed start. The adventure begins.", xp: 25, icon: "🎮" },
  { id: "visit-galaxy", title: "Liftoff", desc: "Entered the Skill Galaxy.", xp: 20, icon: "🚀" },
  { id: "visit-character", title: "Know Thyself", desc: "Inspected the character sheet.", xp: 20, icon: "🧬" },
  { id: "visit-quests", title: "Lore Seeker", desc: "Opened the quest log.", xp: 20, icon: "📜" },
  { id: "visit-inventory", title: "Treasure Hunter", desc: "Found the inventory.", xp: 20, icon: "🎒" },
  { id: "visit-arcade", title: "Insert Coin", desc: "Walked into the arcade.", xp: 20, icon: "🕹️" },
  { id: "visit-contact", title: "Boss Room", desc: "Reached the final boss.", xp: 20, icon: "🐉" },
  { id: "planet", title: "First Landing", desc: "Landed on your first planet.", xp: 30, icon: "🪐" },
  { id: "cartographer", title: "Cartographer", desc: "Landed on every planet in the galaxy.", xp: 150, icon: "🗺️" },
  { id: "quests-all", title: "Lore Master", desc: "Read every quest in the log.", xp: 80, icon: "📚" },
  { id: "loot", title: "Looter", desc: "Inspected a legendary item.", xp: 30, icon: "💎" },
  { id: "hoarder", title: "Hoarder", desc: "Inspected 5 different items.", xp: 80, icon: "🐲" },
  { id: "miner", title: "Block Miner", desc: "Mined your first block in the arcade.", xp: 20, icon: "⛏️" },
  { id: "miner-10", title: "Chain Builder", desc: "Stacked 10 blocks in Mine the Chain.", xp: 80, icon: "⛓️" },
  { id: "miner-25", title: "Whale", desc: "Stacked 25 blocks. Absolute degen.", xp: 200, icon: "🐋" },
  { id: "perfect", title: "Pixel Perfect", desc: "Landed a perfect block.", xp: 40, icon: "✨" },
  { id: "terminal", title: "Hacker Voice", desc: "Opened the secret terminal.", xp: 40, icon: "💻", secret: true },
  { id: "sudo", title: "Root Access", desc: "Used sudo to hire Saqlain.", xp: 60, icon: "🔓", secret: true },
  { id: "konami", title: "God Mode", desc: "↑↑↓↓←→←→BA. You know the code.", xp: 150, icon: "🌈", secret: true },
  { id: "poke", title: "Stop Poking Me", desc: "Poked the avatar 5 times.", xp: 30, icon: "👉", secret: true },
  { id: "cv", title: "Paper Trail", desc: "Downloaded the CV.", xp: 40, icon: "📄" },
  { id: "npc", title: "Chatterbox", desc: "Talked to every NPC.", xp: 50, icon: "💬" },
  { id: "boss", title: "Boss Defeated", desc: "Sent a message. Saqlain will reply soon.", xp: 250, icon: "🏆" },
  { id: "night", title: "Night Owl", desc: "Exploring past midnight. Respect.", xp: 30, icon: "🦉", secret: true },
  { id: "sound", title: "Turn It Up", desc: "Enabled sound effects.", xp: 15, icon: "🔊" },
  { id: "dj", title: "Drop The Beat", desc: "Turned on the soundtrack.", xp: 15, icon: "🎧" },
];

export const byId = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

export const levelFromXp = (xp: number) => Math.floor(Math.sqrt(xp / 40)) + 1;
export const xpForLevel = (lvl: number) => (lvl - 1) ** 2 * 40;

export const TITLES = ["Visitor", "Recruit", "Explorer", "Adventurer", "Veteran", "Champion", "Legend", "Mythic", "Co-Founder?"];
export const titleFor = (lvl: number) => TITLES[Math.min(lvl - 1, TITLES.length - 1)];
