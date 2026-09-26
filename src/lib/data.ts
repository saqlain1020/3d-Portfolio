export const profile = {
  name: "Saqlain",
  fullName: "Syed Saqlain Riaz",
  handle: "saqlain1020",
  role: "Full-Stack · Web3 · AI Agents",
  className: "Chain Mage",
  tagline: "I build dApps, AI agents and interfaces that feel alive.",
  bio: "Ambitious problem solver from Karachi who ships across the entire stack — pixel-perfect React frontends, NestJS backends, cross-chain smart contracts and Google ADK agents. Currently powering Web3 & AI at Permission.io.",
  careerStart: new Date(2019, 0, 1),
  email: "saqlainprinters@gmail.com",
  links: {
    github: "https://github.com/saqlain1020",
    linkedin: "https://www.linkedin.com/in/saqlain1020/",
    fiverr: "https://www.fiverr.com/saqlain1020",
    site: "https://saqlain1020.com",
  },
  cv: "/Saqlain_CV.pdf",
};

export type Planet = {
  id: string;
  name: string;
  domain: string;
  color: string;
  emissive: string;
  size: number;
  orbit: number;
  speed: number;
  mastery: number;
  lore: string;
  boss: string;
  skills: string[];
};

export const planets: Planet[] = [
  {
    id: "frontend",
    name: "Pixel Prime",
    domain: "Frontend",
    color: "#00e5ff",
    emissive: "#0077ff",
    size: 1.15,
    orbit: 5,
    speed: 0.16,
    mastery: 95,
    lore: "Home planet. Seven years of crafting responsive, animated interfaces that users actually enjoy.",
    boss: "Shipped full frontends for NFT marketplaces, a DeFi yield aggregator, a MetaMask-rival wallet extension and Permission's web app + Chrome extension.",
    skills: [
      "React", "Next.js", "TypeScript", "JavaScript", "Redux Toolkit", "React Query", "Tailwind CSS", "MUI",
      "Framer Motion", "React Spring", "React Native", "Expo", "WXT Extensions", "Socket.IO", "Formik", "Vite", "Webpack",
    ],
  },
  {
    id: "backend",
    name: "Server Forge",
    domain: "Backend",
    color: "#8b6bff",
    emissive: "#4b1fff",
    size: 1,
    orbit: 7.4,
    speed: 0.11,
    mastery: 86,
    lore: "A volcanic world where APIs are forged. Queues hum, sockets crackle, databases never sleep.",
    boss: "Built Stripe checkout for TLD & .ASK domain purchases with carts, tax and webhooks, plus an off-chain indexer mirroring protocol agreements 1:1.",
    skills: [
      "Node.js", "NestJS", "Express", "BullMQ", "PostgreSQL", "MongoDB", "Mongoose", "MySQL", "Firebase",
      "REST APIs", "JWT", "Passport.js", "Auth.js", "Stripe", "Brevo",
    ],
  },
  {
    id: "web3",
    name: "Chainhold",
    domain: "Web3",
    color: "#ffb020",
    emissive: "#ff5a00",
    size: 1.35,
    orbit: 10,
    speed: 0.08,
    mastery: 92,
    lore: "A gas giant ringed with blocks. Every transaction here is permanent — so the code had better be good.",
    boss: "Deployed LayerZero OFT omnichain tokens across Base & Polygon mainnets, replaced Moralis with direct Viem RPCs ecosystem-wide, and built batch-withdrawal contracts.",
    skills: [
      "Solidity", "Viem", "Ethers.js", "Wagmi", "Hardhat", "LayerZero", "Account Abstraction", "ZeroDev",
      "Web3Auth", "The Graph", "Subgraphs", "Uniswap", "ERC-20/721/1155", "Tenderly", "Alchemy", "Reown AppKit",
      "Base", "Polygon", "Arbitrum",
    ],
  },
  {
    id: "ai",
    name: "Neural Nebula",
    domain: "AI Agents",
    color: "#ff2bd6",
    emissive: "#b0008a",
    size: 0.95,
    orbit: 12.6,
    speed: 0.06,
    mastery: 80,
    lore: "A newly discovered world, glowing with synapses. Agents here talk to blockchains without a UI.",
    boss: "Migrated Permission's Onboarding & Permission agents to Google ADK, audited every Gemini model across services, and exposed protocol state through an MCP-style agent API.",
    skills: ["Google ADK", "Gemini APIs", "Vertex AI", "A2UI", "MCP", "Python", "Agent Chat UIs", "Prompt Design"],
  },
  {
    id: "devops",
    name: "Cloud Citadel",
    domain: "DevOps",
    color: "#b6ff3b",
    emissive: "#3f9900",
    size: 0.85,
    orbit: 15,
    speed: 0.045,
    mastery: 78,
    lore: "A floating fortress above the clouds where pipelines run and deployments land softly.",
    boss: "Full-stack deployments from DB to CDN across AWS, GCP, Azure and the edge — with CI/CD pipelines and monorepos wired end-to-end.",
    skills: [
      "AWS (EC2, S3, Amplify)", "CodePipeline", "CodeBuild", "Elastic Beanstalk", "Route 53", "Google Cloud",
      "Azure VM", "Vercel", "Netlify", "Fly.io", "Railway", "Heroku", "GitHub Actions", "Turborepo", "Monorepos",
    ],
  },
  {
    id: "arsenal",
    name: "The Arsenal",
    domain: "Side Quests",
    color: "#9fb4ff",
    emissive: "#34427a",
    size: 0.6,
    orbit: 17.4,
    speed: 0.035,
    mastery: 70,
    lore: "A small moon full of spare gear picked up along the way. Surprisingly useful in boss fights.",
    boss: "A graphics designer before a developer — and a growth-minded marketer who understands funnels as well as functions.",
    skills: [
      "Java", "C#", "Rust", "Photoshop", "Illustrator", "PostHog", "Google Analytics", "Meta Ads", "Jira", "Git",
    ],
  },
];

export const stats = [
  { key: "FRONT", label: "Frontend", value: 95 },
  { key: "CHAIN", label: "Web3", value: 92 },
  { key: "BACK", label: "Backend", value: 86 },
  { key: "AI", label: "AI Agents", value: 80 },
  { key: "OPS", label: "DevOps", value: 78 },
  { key: "ART", label: "Design", value: 72 },
];

export const perks = [
  { icon: "⛓️", name: "Omnichain", desc: "Moves tokens across chains like it's nothing (LayerZero OFT)." },
  { icon: "🧠", name: "Agent Whisperer", desc: "Builds and upgrades Google ADK agents in production." },
  { icon: "⚡", name: "Gas Saver", desc: "Paymasters & sponsored gas so users never touch ETH." },
  { icon: "🧩", name: "Extension Crafter", desc: "Chrome extensions & wallets with WXT and React." },
  { icon: "🎨", name: "Designer Roots", desc: "Started in graphic design — still sweats the pixels." },
  { icon: "🏆", name: "Webicamp Winner", desc: "Module winner. Also IELTS band 7.5." },
];

export type Quest = {
  id: string;
  title: string;
  org: string;
  period: string;
  status: "ACTIVE" | "COMPLETE";
  tier: string;
  summary: string;
  objectives: string[];
  rewards: string[];
};

export const quests: Quest[] = [
  {
    id: "permission",
    title: "The Permission Protocol",
    org: "Permission.io · US Remote",
    period: "Oct 2024 — Now",
    status: "ACTIVE",
    tier: "MAIN QUEST",
    summary:
      "Full-Stack Web3 & AI engineer owning the Web3 feature set — omnichain tokens, withdrawals, wallets — while shipping the web app, Chrome extension and ADK-powered AI agents.",
    objectives: [
      "Deployed LayerZero OFT contracts across Base & Polygon testnets and mainnets",
      "Replaced Moralis with direct Ankr/Viem RPCs across Connect API, Portal, Search & airdrops",
      "Hardened withdrawals: gas management, balance checks, timeouts, concurrency caps, batch contracts",
      "Migrated Onboarding & Permission agents to Google ADK; audited all Gemini model usage",
      "Exposed protocol state via an MCP-style agent API; architected an off-chain indexer",
      "Built Stripe checkout for TLD & .ASK domains; spiked paymaster-sponsored gas on Base",
    ],
    rewards: ["LayerZero", "Google ADK", "Viem", "NestJS", "WXT", "Stripe"],
  },
  {
    id: "dechains",
    title: "Forge of Dechains",
    org: "Dechains",
    period: "2021 — 2024",
    status: "COMPLETE",
    tier: "EPIC QUEST",
    summary:
      "Senior frontend turned full-stack engineer building responsive frontends for blockchain products — NFT marketplaces, a yield aggregator and a crypto wallet.",
    objectives: [
      "Built entire frontends for NFT marketplaces, dashboards and GameFi dApps",
      "Integrated smart contracts with wallets; deployed and managed subgraphs",
      "Authored modular API + chain libraries published to npm (Webpack / Rollup)",
      "Owned deployments and CI/CD pipelines",
    ],
    rewards: ["Solidity", "The Graph", "Ethers.js", "Rollup", "CI/CD"],
  },
  {
    id: "slectus",
    title: "The Marketplace Siege",
    org: "Slectus · US",
    period: "2020 — 2021",
    status: "COMPLETE",
    tier: "SIDE QUEST",
    summary:
      "Frontend developer on a multi-vendor e-commerce MERN platform with commissions, complex profile & product management and realtime features.",
    objectives: ["Owned all frontend work and integrations", "Realtime features with Socket.IO", "Occasional backend patches"],
    rewards: ["MERN", "Socket.IO", "Redux"],
  },
  {
    id: "novasoft",
    title: "First Contract",
    org: "Novasoft",
    period: "2020",
    status: "COMPLETE",
    tier: "SIDE QUEST",
    summary: "Joined a software house as a React developer and built the company's own website.",
    objectives: ["Shipped novasoft.tech in React", "Learned team workflows the hard way"],
    rewards: ["React", "Teamwork"],
  },
  {
    id: "fiverr",
    title: "Mercenary for Hire",
    org: "Freelance · Fiverr",
    period: "2019 — Now",
    status: "ACTIVE",
    tier: "BOUNTY BOARD",
    summary: "Freelance work on web and desktop projects in React, Java, C#, C++ and Python — with a trail of 5-star reviews.",
    objectives: ["5-star reviews from clients in PK, GR, CR and US", "Web, desktop and design gigs"],
    rewards: ["Client wrangling", "Speed"],
  },
  {
    id: "ubit",
    title: "Training Grounds",
    org: "University of Karachi · UBIT",
    period: "2019 — 2023",
    status: "COMPLETE",
    tier: "TUTORIAL",
    summary: "Bachelor's in Software Engineering. Before that: A grades at Adamjee Govt Science College and a year of graphic design at Al-Raheem Printing.",
    objectives: ["BS Software Engineering", "Webicamp module winner", "IELTS band 7.5"],
    rewards: ["CS Fundamentals", "Design eye"],
  },
];

export const npcs = [
  { name: "abdul_rafay_", from: "PK", line: "Expert React developer — beautiful UI, fast delivery and clean code. Will definitely work with him again." },
  { name: "jesusalc", from: "GR", line: "Good communication. If he doesn't know, he'll figure it out and build it with you. Good design ideas." },
  { name: "style2u", from: "CR", line: "Highly recommend Saqlain as a professional to work with. I will use his service again." },
  { name: "perecodina", from: "US", line: "Great experience. Really recommend working with this seller." },
];

export type Rarity = "LEGENDARY" | "EPIC" | "RARE" | "UNCOMMON";

export type Project = {
  id: string;
  title: string;
  rarity: Rarity;
  type: string;
  desc: string;
  stack: string[];
  link?: string;
  images: string[];
  power: number;
};

const imgs = (folder: string, n: number, ext = "jpg") =>
  Array.from({ length: n }, (_, i) => `/projects/${folder}/${i + 1}.${ext}`);

export const projects: Project[] = [
  {
    id: "pitchfi",
    title: "PitchFi",
    rarity: "LEGENDARY",
    type: "DeFi Crowdfunding",
    desc: "Milestone-based decentralized crowdfunding. USDC treasury, Merkle-proof voting weighted by contribution, creator protection payouts and a configurable platform fee. Sole developer — contracts and UI.",
    stack: ["Solidity", "Hardhat Ignition", "Next.js", "Viem", "Merkle Trees"],
    link: "https://pitchfi.io",
    images: imgs("PitchFi", 6),
    power: 98,
  },
  {
    id: "pmpy",
    title: "Pmpy Wallet",
    rarity: "EPIC",
    type: "Chrome + Mobile Wallet",
    desc: "Non-custodial Ethereum wallet — a MetaMask competitor. Create/import seeds, send, receive and connect to dApps. Ships as a Chrome extension and a cross-platform React Native app.",
    stack: ["React", "React Native", "Ethers.js", "Chrome Extension"],
    images: imgs("PmpyWalletExtension", 10),
    power: 94,
  },
  {
    id: "contrax",
    title: "Contrax Finance",
    rarity: "EPIC",
    type: "Yield Aggregator",
    desc: "Non-custodial yield farming aggregator with ETH zapping, social logins, swaps, on/off-ramps and bridges.",
    stack: ["React", "Ethers", "Subgraph", "Solidity", "Webpack", "CI/CD"],
    link: "https://beta.contrax.finance",
    images: imgs("Contrax", 9),
    power: 93,
  },
  {
    id: "chailabs",
    title: "Chailabs",
    rarity: "EPIC",
    type: "Decentralized Chat",
    desc: "Decentralized chat with communities and DAOs — on-chain and off-chain proposals for decentralized organizations.",
    stack: ["React", "Web3", "DAOs", "Realtime"],
    link: "https://chailabs-chat.vercel.app",
    images: imgs("Chailabs", 5),
    power: 88,
  },
  {
    id: "froggo",
    title: "Mutant Froggo",
    rarity: "RARE",
    type: "NFT Dashboard",
    desc: "A complete dApp with minting and NFT management behind a full dashboard, powered by smart contracts and The Graph.",
    stack: ["React Query", "Ethers", "The Graph"],
    link: "https://www.dashboard.mutantfroggo.com",
    images: imgs("FroggoDashboard", 5),
    power: 84,
  },
  {
    id: "gameantz",
    title: "GameAntz",
    rarity: "RARE",
    type: "GameFi Ecosystem",
    desc: "Joins a decentralized token economy with a centralized MMORPG — holders trade on DEX/CEX and battle private missions for token prizes.",
    stack: ["React", "Web3", "Tokenomics"],
    link: "https://gameantz.com/",
    images: imgs("GameAntz", 6),
    power: 82,
  },
  {
    id: "petoverse",
    title: "Petoverse",
    rarity: "RARE",
    type: "Crypto Game dApp",
    desc: "Blockchain game and NFT dApp for Petoverse, with a companion dashboard.",
    stack: ["React", "NFTs", "Smart Contracts"],
    link: "https://www.petoverse.io/",
    images: imgs("Petoverse", 5),
    power: 78,
  },
  {
    id: "swippy",
    title: "Swippy",
    rarity: "UNCOMMON",
    type: "Social Link + NFC",
    desc: "Share every social link from one profile — tap someone's NFC tag to jump straight to their profile or a chosen account.",
    stack: ["React", "Redux", "Firebase", "NFC"],
    link: "https://competent-jennings-aee101.netlify.app/",
    images: imgs("Swippy", 7, "png"),
    power: 72,
  },
  {
    id: "kelekshen",
    title: "Kelekshen",
    rarity: "UNCOMMON",
    type: "Trading UI",
    desc: "Blockchain trading frontend with a custom theme and a lot of hand-designed components and modals.",
    stack: ["React", "MUI"],
    link: "https://kelekshen.netlify.app/",
    images: imgs("Kelekshen", 6, "png"),
    power: 70,
  },
  {
    id: "elvantis",
    title: "Elvantis",
    rarity: "UNCOMMON",
    type: "GameFi + NFTs",
    desc: "dApp for the Elvantis crypto game and NFT collection.",
    stack: ["React", "Web3"],
    images: imgs("Elvantis", 5),
    power: 68,
  },
];

export const archive = [
  { title: "NFT Comics", year: "2021", link: "https://hungry-kalam-cd5768.netlify.app/", img: "/projects/NFTComics/1.png" },
  { title: "Project Kaito", year: "2021", link: "https://main.d3bb7dqy819dov.amplifyapp.com", img: "/projects/Kaito/1.jpg" },
  { title: "Petoverse Dashboard", year: "2022", link: "https://petoverse-frontend.netlify.app/", img: "/projects/PetoverseDashboard/1.jpg" },
  { title: "Novasoft", year: "2020", link: "https://novasoft.tech/", img: "/projects/Novasoft/1.png" },
  { title: "Fantopia", year: "2021", img: "/projects/Fantopia/1.png" },
  { title: "Drag Editor", year: "2020", link: "https://mystifying-bardeen-45fd62.netlify.app/", img: "/projects/DragEditor/1.png" },
  { title: "Reddit Redesign", year: "2020", link: "https://hardcore-carson-11d2eb.netlify.app/", img: "/projects/RedditRedesign/1.jpg" },
  { title: "Shopian", year: "2020", link: "https://shopian-app.web.app/", img: "/projects/Shopian/1.png" },
  { title: "Wallet Tracker", year: "2019", link: "https://wallet-tracker-js-ce5d2.web.app/", img: "/projects/WalletTracker/1.png" },
  { title: "Saqlain Printers", year: "2019", link: "https://saqlainprinters.web.app/", img: "/projects/SaqlainPrinters/1.png" },
  { title: "MapKit JS", year: "2020", link: "https://determined-kalam-e70242.netlify.app/", img: "/projects/MapkitJS.png" },
];

export const sections = [
  { id: "home", label: "Start", world: "0-0" },
  { id: "galaxy", label: "Skill Galaxy", world: "1-1" },
  { id: "character", label: "Character", world: "1-2" },
  { id: "quests", label: "Quest Log", world: "2-1" },
  { id: "inventory", label: "Inventory", world: "2-2" },
  { id: "arcade", label: "Arcade", world: "3-1" },
  { id: "contact", label: "Final Boss", world: "4-1" },
] as const;
