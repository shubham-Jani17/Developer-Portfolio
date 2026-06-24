/**
 * Portfolio content — edit this file to update the site.
 */

/** Optional photo: place `hero-portrait.jpg` in the `public/` folder */
export const HERO_PORTRAIT_URL = "/hero-portrait.jpg";

export const site = {
  name: "Shubham Jani",
  title: "Full Stack Developer",
  initials: "SJ",
  domain: "shubham.dev",
  location: "Ahmedabad, India",
  email: "shubhamjani1731@gmail.com",
  resumeUrl: "/Shubham Jani Resume.pdf",
  availability: "Open for internships, freelance & collaborations",
};

export const hero = {
  availabilityBadge: "AVAILABLE FOR NEW WORK",
  firstName: "Shubham",
  lastName: "Jani.",
  roles: ["Python & Flask Engineer", "Full Stack Developer", "FastAPI & SvelteKit Builder"],
  bio:
    "M.Sc. Computer Applications & IT at Gujarat University. I build real-world products with Python, Flask, FastAPI, and SvelteKit — from construction platforms to voice AI assistants.",
  techTag: "Python • Flask • FastAPI",
  shippedLabel: "shipped 4+",
  statusLabel: "STATUS",
  statusText: "Currently building real-world products",
  serverStatus: "Spinning up Servers",
  image: HERO_PORTRAIT_URL,
  imageAlt: "Shubham Jani portrait",
};

export const statement = {
  title: { before: "A student builder with a ", highlight: "product mind.", after: "" },
  subtitle:
    "I love turning real-world problems into elegant, usable software — one focused project at a time.",
};

export const mission = {
  eyebrow: "MISSION",
  title: {
    before: "I build digital products that feel ",
    highlight: "obvious to use",
    after: " — fast, practical, and rooted in solving genuine problems.",
  },
  body:
    "Computer Applications student at Gujarat University. I ship full-stack apps with Python, Flask, FastAPI, and SvelteKit — including BuildTrack (construction management) and Sarthi (voice AI assistant).",
  tags: [
    "FULL STACK",
    "PYTHON / FLASK",
    "FASTAPI",
    "SVELTEKIT",
    "SQL / SQLITE",
    "OPENCV / AI",
  ],
};

export const stats = [
  { value: "4+", label: "PROJECTS SHIPPED", color: "#7dd3fc" },
  { value: "12+", label: "TECH STACKS MASTERED", color: "#60a5fa" },
  { value: "850+", label: "GITHUB COMMITS", color: "#22d3ee" },
  { value: "2,000+", label: "COFFEE/CODE HOURS", color: "#c4b5fd" },
];

export const social = [
  { label: "GitHub", href: "https://github.com/shubham-Jani17", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/shubhamjani", icon: "linkedin" },
  { label: "Email", href: "mailto:shubhamjani1731@gmail.com", icon: "mail" },
];

export const contactSection = {
  eyebrow: "GET IN TOUCH",
  title: { before: "Let's build ", highlight: "something", after: " great." },
  subtitle:
    "Whether you have a brief, an idea, or just want to chat about craft — my inbox is open.",
  statusBadge: "OPEN FOR INTERNSHIPS, FREELANCE & COLLABORATIONS",
  infoTitle: "Reply within 24 hours.",
  infoBody:
    "I'm currently looking for full-stack internships, freelance projects and meaningful collaborations — especially around Python, FastAPI and applied AI.",
  responseTime: "avg. response time • ~6 hours",
  placeholders: {
    name: "Jane Doe",
    email: "jane@company.com",
    message: "Tell me about your project, timelines, and what success looks like…",
  },
};

export const footer = {
  tagline:
    "Engineered, designed and shipped with obsessive attention to detail. Built with React, Tailwind and Framer Motion.",
  navigate: [
    [
      { id: "about", label: "About" },
      { id: "projects", label: "Projects" },
      { id: "blog", label: "Blog" },
    ],
    [
      { id: "skills", label: "Skills" },
      { id: "experience", label: "Experience" },
      { id: "contact", label: "Contact" },
    ],
  ],
  designedIn: "Designed in Figma",
  shippedFrom: "Ahmedabad",
};

export const navLinks = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];

export const skillsSection = {
  eyebrow: "SKILLS",
  title: { before: "Tools I bend to ", highlight: "my", after: " will." },
  subtitle: "A focused stack chosen for performance, longevity and developer happiness.",
  orbit: [
    "JavaScript",
    "SvelteKit",
    "Bootstrap",
    "SQLite",
    "Git",
    "FastAPI",
    "Flask",
    "OpenCV",
    "Python",
    "MySQL",
    "Tailwind",
    "SQLAlchemy",
  ],
  categories: [
    {
      name: "Frontend",
      items: [
        { name: "HTML & CSS" },
        { name: "JavaScript" },
        { name: "Bootstrap" },
        { name: "Tailwind" },
        { name: "SvelteKit" },
      ],
    },
    {
      name: "Backend & Data",
      items: [
        { name: "Python" },
        { name: "Flask" },
        { name: "FastAPI" },
        { name: "SQL / MySQL" },
        { name: "SQLAlchemy" },
      ],
    },
    {
      name: "AI & IoT",
      items: [
        { name: "OpenCV" },
        { name: "Face Recognition" },
        { name: "NLP / Voice AI" },
        { name: "IoT Prototyping" },
        { name: "Computer Vision" },
      ],
    },
    {
      name: "Tools & Concepts",
      items: [
        { name: "Git & GitHub" },
        { name: "VS Code" },
        { name: "SQLite" },
        { name: "EmailJS / FormSubmit" },
        { name: "DBMS / OOP" },
      ],
    },
  ],
};

export const projectsSection = {
  eyebrow: "SELECTED WORK",
  title: { before: "Projects I'm ", highlight: "proud", after: " of." },
  subtitle: "A small selection of recent products — each one shipped with obsessive care.",
};

export const projects = [
  {
    title: "BuildTrack",
    category: "FULL STACK",
    description:
      "Construction management platform for tracking sites, materials, and teams — built with Flask and SQLite for real deployment.",
    image: "",
    tags: ["FLASK", "PYTHON", "SQLITE"],
    liveUrl: "",
    repoUrl: "https://github.com/yourusername/buildtrack",
  },
  {
    title: "Sarthi Voice Assistant AI",
    category: "AI",
    description:
      "Voice-first assistant with NLP pipeline, FastAPI backend, and SvelteKit UI for hands-free task flows.",
    image: "",
    tags: ["SVELTEKIT", "FASTAPI", "PYTHON", "NLP"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/yourusername/sarthi",
  },
  {
    title: "IoT Smart Monitor",
    category: "IOT",
    description: "Sensor dashboard with real-time readings, alerts, and lightweight edge integration.",
    image: "",
    tags: ["PYTHON", "IOT", "FLASK"],
    liveUrl: "",
    repoUrl: "https://github.com/yourusername/iot-monitor",
  },
];

export const experienceSection = {
  eyebrow: "MY JOURNEY",
  title: {
    before: "A timeline of ",
    craft: "craft",
    mid: " & ",
    growth: "growth",
    after: ".",
  },
  subtitle:
    "Education, projects, and hands-on building — each chapter shaping how I design and ship software.",
};

export const experience = [
  {
    period: "2025 — 2027",
    title: "M.Sc. (CA & IT)",
    subtitle: "K. S. School of Business Management & IT",
    description:
      "Postgraduate focus on advanced computing, databases, and applied software engineering with research-oriented projects.",
    tech: ["FULL STACK", "AI", "DBMS"],
  },
  {
    period: "2023 — 2025",
    title: "Student Builder · Freelance",
    subtitle: "Independent / Client work",
    description:
      "Shipped portfolio and client apps with Python, Flask, FastAPI, and SvelteKit — from APIs to polished UIs.",
    tech: ["PYTHON", "FLASK", "SVELTEKIT"],
  },
  {
    period: "2021 — 2023",
    title: "B.Sc. Computer Applications",
    subtitle: "Gujarat University",
    description:
      "Built foundations in programming, OOP, web fundamentals, and capstone demos with measurable outcomes.",
    tech: ["OOP", "SQL", "WEB"],
  },
  {
    period: "2020 — Present",
    title: "Projects & Open Source",
    subtitle: "Self-directed learning",
    description:
      "BuildTrack, Sarthi Voice AI, and IoT experiments — learning by shipping real-world products end to end.",
    tech: ["FASTAPI", "OPENCV", "IOT"],
  },
];

export const sections = {
  blogs: true,
};

export const blogs = [
  {
    title: "Building BuildTrack from scratch",
    excerpt: "Lessons from shipping a Flask app for construction teams.",
    url: "https://medium.com/@you/post",
    date: "2025-01-15",
  },
];
