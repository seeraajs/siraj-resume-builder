export type ThemeID = 
  | 'cyber-ai'
  | 'apple-vision-pro'
  | 'neon-glass-pro'
  | 'royal-blue' 
  | 'ferrari-red-gold'
  | 'rolex-emerald-gold'
  | 'executive-red-black'
  | 'orange-purple-mesh'
  | 'gem-emerald'
  | 'gem-sapphire'
  | 'gem-amethyst'
  | 'gem-ruby'
  | 'gem-citrine'
  | 'windows-95-teal';

export interface ThemeConfig {
  id: ThemeID;
  name: string;
  bgClass: string;
  cardClass: string;
  textClass: string;
  accentColor: string;
  description: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'cyber-ai',
    name: 'Cyber AI Quantum Terminal 🧪🤖',
    bgClass: 'bg-[#02040a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,242,254,0.15),rgba(255,0,128,0.05),transparent)]',
    cardClass: 'bg-[#050b14]/75 backdrop-blur-3xl border border-cyan-500/20 shadow-[0_0_40px_rgba(0,242,254,0.08)] hover:shadow-[0_0_60px_rgba(0,242,254,0.15)] text-cyan-50 relative transition-all duration-500 hover:border-pink-500/40',
    textClass: 'text-cyan-50/90',
    accentColor: '#00f2fe',
    description: 'Futuristic AI platform aesthetic. Features animating cybernetic lines, deep tech-grid grids, electric cyber cyan and hot pink neural glow borders, and high-tech status monitoring panels.'
  },
  {
    id: 'apple-vision-pro',
    name: 'Apple Vision Pro (Spatial OS) 🕶️',
    bgClass: 'bg-[#0b0c10] bg-gradient-to-tr from-[#090a0f] via-[#161823] to-[#252836]',
    cardClass: 'bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(255,255,255,0.05)] hover:shadow-[0_25px_60px_rgba(255,255,255,0.1)] text-white relative transition-all duration-500',
    textClass: 'text-white/95',
    accentColor: '#f5f5f7',
    description: 'A revolutionary spatial interface inspired by VisionOS. Translucent frosted glass card layers, large editorial typography, pristine white and silver highlights, and organic floating light orbs.'
  },
  {
    id: 'neon-glass-pro',
    name: 'Neon Glass Pro (Premium) ✨',
    bgClass: 'bg-[#030014] bg-gradient-to-br from-[#030014] via-[#080721] to-[#02000d]',
    cardClass: 'bg-[#090620]/45 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.18)] hover:shadow-[0_0_60px_rgba(139,92,246,0.25)] text-white relative transition-all duration-300',
    textClass: 'text-white/90',
    accentColor: '#8b5cf6',
    description: 'Ultra-premium dark glassmorphic interface styled with rich neon violet, electric blue, and cyber cyan gradients. Includes real-time floating holographic orbs, neon glow paths, and immersive blur controls.'
  },

  {
    id: 'ferrari-red-gold',
    name: 'Ferrari & Cartier: Red & Gold',
    bgClass: 'bg-gradient-to-tr from-[#3b0712] via-[#7f1d1d] to-[#ef4444]',
    cardClass: 'bg-black/55 backdrop-blur-xl border border-amber-400/40 shadow-2xl shadow-red-950/60 text-amber-50',
    textClass: 'text-amber-100',
    accentColor: '#fbbf24',
    description: 'Luxurious Royal Red and Gold colors with glassmorphism cards and subtle 3D elements. Inspired by Ferrari and Cartier.'
  },
  {
    id: 'rolex-emerald-gold',
    name: 'Rolex & Islamic Art: Green & Gold',
    bgClass: 'bg-gradient-to-tr from-[#022c22] via-[#064e3b] to-[#10b981]',
    cardClass: 'bg-[#042018]/65 backdrop-blur-xl border border-yellow-500/45 shadow-2.5xl shadow-emerald-950/70 text-yellow-50',
    textClass: 'text-yellow-50',
    accentColor: '#fbbf24',
    description: 'Premium Emerald Green and Gold colors with glassmorphism cards, floating crystal spheres and elegant shadows. Inspired by Rolex and luxury Islamic art.'
  },

  {
    id: 'orange-purple-mesh',
    name: 'Futuristic: Orange & Purple Mesh',
    bgClass: 'bg-gradient-to-bl from-[#2e1065] via-[#4c1d95] to-[#7c2d12]',
    cardClass: 'bg-white/5 backdrop-blur-2xl border border-purple-500/30 shadow-2xl shadow-purple-950/50 text-white',
    textClass: 'text-purple-100',
    accentColor: '#f97316',
    description: 'Colorful Orange and Purple gradients with beautiful 3D blobs, mesh waves and crystal cards. Futuristic and artistic.'
  },
  {
    id: 'gem-emerald',
    name: 'Emerald (Luxury & Growth)',
    bgClass: 'bg-gradient-to-tr from-[#00202e] via-[#01796F] to-[#50c878]',
    cardClass: 'bg-[#00202e]/75 backdrop-blur-xl border border-[#50c878]/45 shadow-2xl shadow-black/80 text-white',
    textClass: 'text-[#50c878]',
    accentColor: '#50c878',
    description: 'Precious Paris Green, Pine Green, and Jade accents on a Deep Slate background.'
  },
  {
    id: 'gem-sapphire',
    name: 'Sapphire (Trust & Calm)',
    bgClass: 'bg-gradient-to-tr from-[#29609C] via-[#0f52ba] to-[#3aafb9]',
    cardClass: 'bg-[#172554]/75 backdrop-blur-xl border border-[#3aafb9]/45 shadow-2xl shadow-black/70 text-white',
    textClass: 'text-[#3aafb9]',
    accentColor: '#0f52ba',
    description: 'Deep soothing aquatic and royal tones of Royal Blue and Turquoise over Forest Blue.'
  },
  {
    id: 'gem-amethyst',
    name: 'Amethyst (Creativity & Royalty)',
    bgClass: 'bg-gradient-to-tr from-[#4c0043] via-[#4a47a3] to-[#9966cc]',
    cardClass: 'bg-[#120015]/75 backdrop-blur-xl border border-[#9966cc]/45 shadow-2xl shadow-black/80 text-white',
    textClass: 'text-[#a4a0c6]',
    accentColor: '#9966cc',
    description: 'Fascinating Amethyst Purple and Deep Orchid luxury gradients with Plum accents.'
  },

];

export interface ResumeTemplate {
  id: number;
  name: string;
  category: 'Standard & Professional Layouts' | 'Split & Sidebar Layouts' | 'Creative & Modern Layouts' | 'Specialized & Minimalist Layouts';
  difficulty: 'Easy' | 'Expert' | 'Trending';
  layout: string;
  downloads: string;
  primaryColor: string;
  accentHex: string;
}

export const TEMPLATES: ResumeTemplate[] = [
  // 1. Standard & Professional Layouts
  { id: 101, name: 'Classic Traditional', category: 'Standard & Professional Layouts', difficulty: 'Easy', layout: 'Classic', downloads: '25.6k', primaryColor: 'from-[#1e293b] to-[#0f172a]', accentHex: '#2563eb' },
  { id: 102, name: 'Executive Corporate', category: 'Standard & Professional Layouts', difficulty: 'Expert', layout: 'Executive', downloads: '32.4k', primaryColor: 'from-[#0f172a] via-[#1e293b] to-[#fbbf24]', accentHex: '#fbbf24' },
  { id: 103, name: 'Academic Research CV', category: 'Standard & Professional Layouts', difficulty: 'Trending', layout: 'Academic', downloads: '18.9k', primaryColor: 'from-[#0c0a09] to-[#1c1917]', accentHex: '#1c1917' },
  { id: 104, name: 'Formal Government ATS', category: 'Standard & Professional Layouts', difficulty: 'Easy', layout: 'Government', downloads: '29.2k', primaryColor: 'from-[#000000] to-[#171717]', accentHex: '#000000' },
  { id: 105, name: 'Compact Dense Single Page', category: 'Standard & Professional Layouts', difficulty: 'Trending', layout: 'Compact', downloads: '21.5k', primaryColor: 'from-[#1e3a8a] to-[#1e1b4b]', accentHex: '#3b82f6' },
  { id: 106, name: 'Startup Growth Leader', category: 'Standard & Professional Layouts', difficulty: 'Expert', layout: 'Startup Lead', downloads: '24.2k', primaryColor: 'from-[#0f172a] via-[#1e293b] to-[#10b981]', accentHex: '#10b981' },

  // 2. Split & Sidebar Layouts
  { id: 107, name: 'Sidebar Left Split', category: 'Split & Sidebar Layouts', difficulty: 'Expert', layout: 'Sidebar Left', downloads: '28.9k', primaryColor: 'from-[#0f172a] via-[#1e293b] to-[#3b82f6]', accentHex: '#3b82f6' },
  { id: 108, name: 'Sidebar Right Split', category: 'Split & Sidebar Layouts', difficulty: 'Expert', layout: 'Sidebar Right', downloads: '19.4k', primaryColor: 'from-[#0f172a] via-[#1e293b] to-[#8b5cf6]', accentHex: '#8b5cf6' },
  { id: 109, name: 'Newspaper Editorial', category: 'Split & Sidebar Layouts', difficulty: 'Trending', layout: 'Newspaper', downloads: '14.8k', primaryColor: 'from-[#1c1917] to-[#44403c]', accentHex: '#78716c' },

  // 3. Creative & Modern Layouts
  { id: 110, name: 'Centered Alignment', category: 'Creative & Modern Layouts', difficulty: 'Easy', layout: 'Centered', downloads: '15.2k', primaryColor: 'from-[#311042] via-[#6d28d9] to-[#db2777]', accentHex: '#6d28d9' },
  { id: 111, name: 'Magazine Hero Header', category: 'Creative & Modern Layouts', difficulty: 'Trending', layout: 'Magazine', downloads: '22.1k', primaryColor: 'from-[#701a75] via-[#a21caf] to-[#f0abfc]', accentHex: '#a21caf' },
  { id: 112, name: 'Creative Portfolio', category: 'Creative & Modern Layouts', difficulty: 'Expert', layout: 'Creative', downloads: '27.5k', primaryColor: 'from-[#4c1d95] via-[#7c3aed] to-[#c026d3]', accentHex: '#7c3aed' },
  { id: 113, name: 'Infographic Skill Focused', category: 'Creative & Modern Layouts', difficulty: 'Expert', layout: 'Infographic', downloads: '16.7k', primaryColor: 'from-[#0284c7] via-[#0d9488] to-[#2dd4bf]', accentHex: '#0d9488' },
  { id: 114, name: 'High Contrast Dark Header', category: 'Creative & Modern Layouts', difficulty: 'Trending', layout: 'High Contrast', downloads: '13.9k', primaryColor: 'from-[#09090b] via-[#121214] to-[#10b981]', accentHex: '#10b981' },
  { id: 115, name: 'Grid Portfolio Cards', category: 'Creative & Modern Layouts', difficulty: 'Expert', layout: 'Portfolio Grid', downloads: '11.8k', primaryColor: 'from-[#020617] via-[#0f172a] to-[#00f5d4]', accentHex: '#00f5d4' },

  // 4. Specialized & Minimalist Layouts
  { id: 116, name: 'Vertical Career Timeline', category: 'Specialized & Minimalist Layouts', difficulty: 'Expert', layout: 'Timeline', downloads: '25.4k', primaryColor: 'from-[#1e3a8a] via-[#3b82f6] to-[#60a5fa]', accentHex: '#3b82f6' },
  { id: 117, name: 'Minimal Whitespace', category: 'Specialized & Minimalist Layouts', difficulty: 'Easy', layout: 'Minimal', downloads: '35.4k', primaryColor: 'from-[#ffffff] to-[#f8fafc]', accentHex: '#0f172a' },
  { id: 118, name: 'Developer Tech Spec', category: 'Specialized & Minimalist Layouts', difficulty: 'Expert', layout: 'Tech', downloads: '29.9k', primaryColor: 'from-[#020617] to-[#10b981]', accentHex: '#10b981' },
  { id: 119, name: 'Modern Clean Line', category: 'Specialized & Minimalist Layouts', difficulty: 'Easy', layout: 'Modern Clean', downloads: '16.1k', primaryColor: 'from-[#09090b] via-[#27272a] to-[#fbbf24]', accentHex: '#fbbf24' },
  { id: 120, name: 'Elegant Bookish Serif', category: 'Specialized & Minimalist Layouts', difficulty: 'Trending', layout: 'Elegant Serif', downloads: '13.7k', primaryColor: 'from-[#451a03] via-[#b45309] to-[#f59e0b]', accentHex: '#b45309' }
];

export const EXECUTIVE_SUMMARY_TEMPLATES = [
  {
    id: 1,
    title: 'General Professional',
    text: 'Results-driven and highly motivated professional with excellent communication and problem-solving skills. Committed to delivering quality work and contributing to organizational success.'
  },
  {
    id: 2,
    title: 'Fresher / Entry-Level',
    text: 'Enthusiastic and dedicated individual seeking an opportunity to apply knowledge and develop professional skills while contributing to the growth and success of the organization.'
  },
  {
    id: 3,
    title: 'Administrative Professional',
    text: 'Organized and detail-oriented professional with strong administrative and communication skills, capable of managing multiple tasks efficiently in a fast-paced environment.'
  },
  {
    id: 4,
    title: 'Customer Service',
    text: 'Customer-focused professional with excellent interpersonal skills and a passion for delivering exceptional service and building positive client relationships.'
  },
  {
    id: 5,
    title: 'Sales Executive',
    text: 'Dynamic and goal-oriented sales professional with a proven ability to identify opportunities, build relationships, and achieve business targets.'
  },
  {
    id: 6,
    title: 'Accountant',
    text: 'Dedicated accounting professional with strong analytical abilities and expertise in financial reporting, budgeting, and maintaining accurate records.'
  },
  {
    id: 7,
    title: 'Teacher / Educator',
    text: 'Passionate educator committed to fostering a positive learning environment and helping students achieve academic excellence.'
  },
  {
    id: 8,
    title: 'IT Professional',
    text: 'Innovative IT professional with strong technical skills and experience in troubleshooting, system management, and delivering technology-driven solutions.'
  },
  {
    id: 9,
    title: 'Software Developer',
    text: 'Creative and solution-oriented software developer with expertise in building efficient and scalable applications using modern technologies.'
  },
  {
    id: 10,
    title: 'Graphic Designer',
    text: 'Creative designer with a strong eye for detail and a passion for creating visually compelling designs that effectively communicate ideas.'
  },
  {
    id: 11,
    title: 'Project Manager',
    text: 'Results-oriented project manager with excellent leadership skills and a proven ability to deliver projects on time and within budget.'
  },
  {
    id: 12,
    title: 'Human Resources',
    text: 'Dedicated HR professional skilled in talent acquisition, employee relations, and fostering a productive workplace culture.'
  },
  {
    id: 13,
    title: 'Engineer',
    text: 'Highly motivated engineer with strong technical knowledge and problem-solving abilities, committed to delivering innovative solutions.'
  },
  {
    id: 14,
    title: 'Healthcare Professional',
    text: 'Compassionate healthcare professional committed to providing high-quality care and improving patient outcomes.'
  },
  {
    id: 15,
    title: 'Marketing Professional',
    text: 'Creative marketing professional with expertise in brand development, digital marketing, and customer engagement strategies.'
  },
  {
    id: 16,
    title: 'Business Analyst',
    text: 'Analytical and detail-oriented business analyst with a strong ability to identify opportunities and improve business processes.'
  },
  {
    id: 17,
    title: 'Banking Professional',
    text: 'Dedicated banking professional with expertise in customer service, financial operations, and relationship management.'
  },
  {
    id: 18,
    title: 'Logistics & Supply Chain',
    text: 'Efficient logistics professional with experience in inventory management, supply chain operations, and process optimization.'
  },
  {
    id: 19,
    title: 'Hospitality Industry',
    text: 'Service-oriented professional with a passion for delivering exceptional guest experiences and maintaining high standards of hospitality.'
  },
  {
    id: 20,
    title: 'Retail Professional',
    text: 'Customer-focused retail professional with strong sales abilities and a commitment to providing excellent customer experiences.'
  },
  {
    id: 21,
    title: 'Executive Level',
    text: 'Strategic and results-driven executive with extensive experience in leadership, business development, and organizational growth.'
  },
  {
    id: 22,
    title: 'Entrepreneur',
    text: 'Innovative and self-motivated entrepreneur with strong leadership skills and a passion for identifying opportunities and driving success.'
  },
  {
    id: 23,
    title: 'Data Analyst',
    text: 'Detail-oriented data analyst with expertise in data interpretation, reporting, and transforming insights into actionable strategies.'
  },
  {
    id: 24,
    title: 'Operations Manager',
    text: 'Experienced operations professional with strong leadership skills and a proven ability to improve efficiency and achieve organizational goals.'
  },
  {
    id: 25,
    title: 'Universal Professional Summary ⭐',
    text: 'Highly motivated and adaptable professional with excellent communication, leadership, and problem-solving skills. Committed to continuous learning and delivering high-quality results while contributing to the success and growth of the organization.'
  }
];

export const COVER_LETTER_TEMPLATES = [
  {
    id: 1,
    title: 'Modern Tech & Lead Architect',
    subject: 'Application for Lead Solutions Architect & Full-Stack Developer',
    greeting: 'Dear Hiring Manager',
    bodyText: 'I am writing to express my strong interest in joining your team as a Lead Solutions Architect. With over several years of hands-on experience designing and implementing highly available systems, Next.js applications, and state-of-the-art cloud infrastructures, I am eager to contribute to your continuous technological growth.\n\nIn my previous roles, I have consistently focused on bridge-building between engineering and visual design. I have designed high-performance corporate architectures, optimized core databases, and spearheaded teams of developers toward robust and modular releases. I thrive in responsive and adaptive environments that prioritize continuous scaling, clean typography, and polished user journeys.\n\nI would welcome the opportunity to discuss how my competencies and technical alignment can serve your objectives. Thank you for your time, consideration, and dedication to craftsmanship.',
    closing: 'Sincerely',
    text: `Subject: Application for Lead Solutions Architect & Full-Stack Developer\n\nDear Hiring Manager,\n\nI am writing to express my strong interest in joining your team as a Lead Solutions Architect. With over several years of hands-on experience designing and implementing highly available systems, Next.js applications, and state-of-the-art cloud infrastructures, I am eager to contribute to your continuous technological growth.\n\nIn my previous roles, I have consistently focused on bridge-building between engineering and visual design. I have designed high-performance corporate architectures, optimized core databases, and spearheaded teams of developers toward robust and modular releases. I thrive in responsive and adaptive environments that prioritize continuous scaling, clean typography, and polished user journeys.\n\nI would welcome the opportunity to discuss how my competencies and technical alignment can serve your objectives. Thank you for your time, consideration, and dedication to craftsmanship.\n\nSincerely,\n[Your Name]\nDubai, UAE`
  },
  {
    id: 2,
    title: 'General Engineering & Full-Stack',
    subject: 'Application for Software Engineer & Full-Stack Developer Position',
    greeting: 'Dear Selection Committee',
    bodyText: 'I am writing to enthusiastically apply for the Software Engineering role. As a dedicated Full-Stack Developer, I love building interactive canvas systems, writing type-safe TypeScript code, and designing premium user interfaces modeled behind contemporary layout philosophies.\n\nThroughout my career, I have prioritized modular code architectures, clean layouts, and standard API integrations. I love turning complex business requirements into intuitive layouts that scale. I have successfully worked in agile teams and led several client initiatives to delivery.\n\nI would love to learn more about your team\'s vision and explore how my alignment can accelerate your milestones. Thank you for scanning my credentials.',
    closing: 'With warm regards',
    text: `Subject: Application for Software Engineer & Full-Stack Developer Position\n\nDear Selection Committee,\n\nI am writing to enthusiastically apply for the Software Engineering role. As a dedicated Full-Stack Developer, I love building interactive canvas systems, writing type-safe TypeScript code, and designing premium user interfaces modeled behind contemporary layout philosophies.\n\nThroughout my career, I have prioritized modular code architectures, clean layouts, and standard API integrations. I love turning complex business requirements into intuitive layouts that scale. I have successfully worked in agile teams and led several client initiatives to delivery.\n\nI would love to learn more about your team's vision and explore how my alignment can accelerate your milestones. Thank you for scanning my credentials.\n\nWith warm regards,\n[Your Name]\nDubai, UAE`
  },
  {
    id: 3,
    title: 'Fresh Graduate / Career Starter',
    subject: 'Expressing Interest in Entry Level / Graduate Developer Position',
    greeting: 'Dear Hiring Team',
    bodyText: 'I am writing to present my application for the Entry Level Developer opportunity. As a recent graduate with a passion for creative web development, state transition layout mechanics, and interactive UI designs, I am ready to bring my energy, dedication, and technical foundation to your organization.\n\nDuring my academic tenure, I built several projects leveraging React, TypeScript, and modern styling utilities. I focused on building clean layout designs, creating intuitive inputs, and crafting ATS-compliant models. I have a strong foundation in algorithmic reasoning and am highly adaptable.',
    closing: 'Sincerely',
    text: `Subject: Expressing Interest in Entry Level / Graduate Developer Position\n\nDear Hiring Team,\n\nI am writing to present my application for the Entry Level Developer opportunity. As a recent graduate with a passion for creative web development, state transition layout mechanics, and interactive UI designs, I am ready to bring my energy, dedication, and technical foundation to your organization.\n\nDuring my academic tenure, I built several projects leveraging React, TypeScript, and modern styling utilities. I focused on building clean layout designs, creating intuitive inputs, and crafting ATS-compliant models. I have a strong foundation in algorithmic reasoning and am highly adaptable.\n\nI appreciate your consideration and hope to discuss how my academic grit and potential can add value to your team. Thank you for your time.\n\nSincerely,\n[Your Name]`
  },
  {
    id: 4,
    title: 'Senior Data Scientist & AI',
    subject: 'Application for Senior Data Scientist & AI Research Lead',
    greeting: 'Dear Dr. Hiring Manager',
    bodyText: 'I am excited to submit my candidacy for the Senior Data Scientist position. With extensive experience in artificial intelligence, machine learning, and deep neural architectures, I specialize in translating complex multidimensional datasets into actionable commercial systems.\n\nAt my previous tenure, I led the deployment of production-grade LLM pipelines, reducing semantic search latency by 45%. I have designed server-side predictive engines, collaborated with research teams, and established robust ETL pipelines utilizing SQL and Python. I thrive on solving high-complexity problems that require rigorous technical skill.\n\nI look forward to discussing how my ML expertise and analytical focus can drive your product initiatives.',
    closing: 'Best regards',
    text: 'Data Scientist Cover Letter'
  },
  {
    id: 5,
    title: 'Creative UI/UX Designer',
    subject: 'Application for Senior UI/UX & Digital Brand Product Designer',
    greeting: 'Dear Creative Director',
    bodyText: 'I am writing to express my enthusiasm for the UI/UX Designer vacancy. I am a design-driven product architect who believes that every user interface should be an intentional pairing of typography, contrast, rhythm, and purpose.\n\nOver the past few years, I have crafted layouts that focus heavily on high-visual resonance, using micro-interactions, responsive grids, and clean design tokens. I love building design libraries that make engineering seamless while preserving pristine optical layouts. I am extremely comfortable with both visual ideation and front-end coding templates.\n\nThank you for exploring my layout portfolio, and I am excited to collaborate on new interactive experiences.',
    closing: 'Warmest wishes',
    text: 'UI/UX Designer Cover Letter'
  },
  {
    id: 6,
    title: 'Project Lead & Scrum Master',
    subject: 'Application for Project Lead & Certified Scrum Master',
    greeting: 'Dear VP of Operations',
    bodyText: 'I am writing to apply for the Project Lead position. As an agile advocate with years of managing cross-functional technical teams, I excel at removing system bottlenecks, driving delivery velocity, and aligning cross-team stakeholders toward high-impact releases.\n\nI have successfully governed multiple fast-turnaround software initiatives, incorporating scrum guidelines and modern project tracking platforms. I enjoy establishing transparent communications, tracking milestones, and delivering predictable, high-quality milestones.\n\nI would be delighted to bring my operational rigor and team empowerment strategies to your organization.',
    closing: 'Respectfully yours',
    text: 'Project Lead Cover Letter'
  },
  {
    id: 7,
    title: 'DevOps & Infrastructure Lead',
    subject: 'Application for Senior DevOps & Cloud Infrastructure Architect',
    greeting: 'Dear Director of Engineering',
    bodyText: 'I am excited to apply for the DevOps & Infrastructure Lead position. I specialize in building zero-downtime microservice pipelines, automated deployment scripts, and highly robust cloud networking environments.\n\nI have managed production clusters supporting millions of requests, configuring Kubernetes orchestrations, auto-scale load balancing, and secure secrets management. I focus on container optimization, CI/CD speed improvement, and detailed monitoring telemetry to verify health on every deployment.\n\nI look forward to discussing how my infrastructure solutions can ensure perfect uptime and developers velocity.',
    closing: 'Sincerely',
    text: 'DevOps Cover Letter'
  },
  {
    id: 8,
    title: 'Marketing Specialist & Growth',
    subject: 'Application for Growth Marketing Specialist / Digital Strategist',
    greeting: 'Dear Marketing Team',
    bodyText: 'I am writing to present my strategy and application for the Growth Marketing Specialist role. I bring a highly analytical, data-driven approach to digital marketing across organic SEO, paid acquisitions, and customer retention campaigns.\n\nIn my previous team, I engineered a multi-channel growth funnel that improved user acquisition by 3x and decreased conversion costs by 35%. I am highly comfortable with web analytics tools, A/B testing frameworks, and content engagement workflows. I thrive in creative agencies and product teams alike.\n\nThank you for considering my background, and I look forward to exploring how to build your market presence.',
    closing: 'Best wishes',
    text: 'Marketing Cover Letter'
  },
  {
    id: 9,
    title: 'Product Manager & Strategist',
    subject: 'Application for Technical Product Manager',
    greeting: 'Dear VP of Product',
    bodyText: 'I am thrilled to apply for the Product Manager role. I am a product-oriented decision maker who bridges the gap between deep customer empathy, technical constraints, and long-term business goals.\n\nI have owned product roadmaps from inception to final commercial launch, writing clear specs, conducting user researches, and collaborating directly with design and engineering teams. My focus is on metrics-driven iterative development to achieve strong market fit.\n\nI am eager to discuss my experiences of scaling user-centric product lines with your executive team.',
    closing: 'Sincerely',
    text: 'PM Cover Letter'
  },
  {
    id: 10,
    title: 'Account Executive & Sales',
    subject: 'Application for Enterprise Account Executive',
    greeting: 'Dear Director of Sales',
    bodyText: 'I am writing to apply for the Enterprise Account Executive position. I am a target-driven sales professional with a track record of identifying high-value opportunities, nurturing executive relationships, and closing enterprise accounts.\n\nOver my sales career, I have consistently exceeded quotas by up to 130% through disciplined sales pipelines, strategic client consulting, and high-impact custom product demonstrations. I enjoy understanding a client\'s exact pain points and presenting tailored, high-ROI solutions.\n\nI am excited to bring my business development drive and negotiation skills to accelerate your growth metrics.',
    closing: 'Kindest regards',
    text: 'Sales Cover Letter'
  },
  {
    id: 11,
    title: 'Human Resources & Talent',
    subject: 'Application for Human Resources Specialist & Talent Partner',
    greeting: 'Dear HR Director',
    bodyText: 'I am writing to apply for the Human Resources Specialist opening. I am a certified HR professional who is passionate about creating high-trust workplace cultures, developing modern onboarding flows, and recruiting world-class engineering teams.\n\nI have successfully revamped performance evaluation matrices, managed employee benefits, and conducted compliance training. My goal is to foster an inclusive environment where individuals can do their best work while staying aligned with company objectives.\n\nThank you for considering my application to help scale your company culture.',
    closing: 'With respect',
    text: 'HR Cover Letter'
  },
  {
    id: 12,
    title: 'Financial Analyst',
    subject: 'Application for Senior Corporate Financial Analyst',
    greeting: 'Dear Chief Financial Officer',
    bodyText: 'I am writing to apply for the Financial Analyst vacancy. With a strong quantitative background in corporate finance, budgeting, and predictive modeling, I specialize in identifying operation savings and optimizing portfolio allocations.\n\nI have designed several automated reporting sheets, analyzed cost-benefit ratios, and prepared high-level executive charts for board presentations. I pay close attention to macro-financial trends and love providing actionable numeric analysis to guide strategic decisions.\n\nI would love to explore how my analytical skills can help optimize your capital expenditures.',
    closing: 'Sincerely',
    text: 'Finance Cover Letter'
  },
  {
    id: 13,
    title: 'Customer Success Specialist',
    subject: 'Application for Partner Customer Success Specialist',
    greeting: 'Dear Customer Success Lead',
    bodyText: 'I am excited to apply for the Customer Success Specialist opening. I am a patient, empathetic client advocate with a history of increasing user retention rates, managing accounts, and resolving high-tier technical customer complaints.\n\nIn my previous role, I maintained an average Net Promoter Score (NPS) of 96, while reducing user churn by 18% through proactive coaching sessions and clear customer feedback loops. I love creating comprehensive video tutorials and helpful guides to make software onboarding smooth.\n\nI hope to discuss how my customer-centric methods can ensure excellent retention for your platform.',
    closing: 'Best regards',
    text: 'CS Cover Letter'
  },
  {
    id: 14,
    title: 'Content Writer & Specialist',
    subject: 'Application for Digital Content Writer & Editor',
    greeting: 'Dear Managing Editor',
    bodyText: 'I am writing to express my strong interest in the Digital Content Writer position. I am a versatile storyteller and brand writer who excels at turning dense technical topics into engaging articles, newsletters, and conversion-focused copy.\n\nI have managed editorial calendars, researched industry-specific trends, and written copy that routinely ranked on first-page search results. I understand tone adjustment, brand guidelines, and basic SEO principles that drive organic user interest.\n\nI am eager to contribute my editorial skills and write high-converting copy that matches your voice.',
    closing: 'Sincerely',
    text: 'Writer Cover Letter'
  },
  {
    id: 15,
    title: 'QA & Software Test Engineer',
    subject: 'Application for QA Automation & Manual Software Test Engineer',
    greeting: 'Dear QA Director',
    bodyText: 'I am excited to apply for the QA Engineer role. I am a quality-obsessed technical analyst with extensive experience in designing automated end-to-end regression tests, load testing, and thorough exploratory testing.\n\nI have configured Selenium, Cypress, and unit test suites that increased deploy stability by 98%. I enjoy setting up detailed edge-case bug tickets, collaborating closely with developers, and testing responsiveness across different viewports and rendering engines.\n\nI would love to discuss how my solid testing architectures will ensure the stability of your releases.',
    closing: 'Sincerely yours',
    text: 'QA Cover Letter'
  },
  {
    id: 16,
    title: 'Cybersecurity Analyst',
    subject: 'Application for Information Security & Cyber Threat Analyst',
    greeting: 'Dear CISO / Security Manager',
    bodyText: 'I am writing to express my interest in joining your security team as a Cybersecurity Analyst. I am dedicated to safeguarding enterprise assets, auditing permission structures, and monitoring network traffic for anomalous behaviors.\n\nI have implemented robust perimeter defenses, conducted vulnerability scans, and established clear disaster recovery protocols. I believe in continuous security training and proactive threat mitigation to prevent system compromises before they can impact production.\n\nThank you for considering my security credentials, and I hope to discuss our defense alignment.',
    closing: 'Sincerely',
    text: 'Security Cover Letter'
  },
  {
    id: 17,
    title: 'Mobile Developer (iOS/Android)',
    subject: 'Application for Senior Mobile Application Developer',
    greeting: 'Dear Engineering Lead',
    bodyText: 'I am writing to apply for the Mobile Developer opportunity. I am a dedicated app architect with expertise in building highly responsive, low-latency mobile layouts across natively compiled Swift and modern cross-platform frameworks.\n\nI have successfully shipped multiple rated applications to public app stores, focusing on clean memory management, responsive touch targets, offline caching, and native hardware API integrations. I love polished transitions and robust state controllers.\n\nI would be thrilled to bring my mobile development skills and portfolio of live apps to your engineering team.',
    closing: 'With warm regards',
    text: 'Mobile Cover Letter'
  },
  {
    id: 18,
    title: 'Business Analyst',
    subject: 'Application for Senior Technical Business Analyst',
    greeting: 'Dear Operations Director',
    bodyText: 'I am writing to submit my application for the Business Analyst vacancy. I specialize in mapping out enterprise requirements, modeling business processes, and translating abstract requests into precise engineering tickets.\n\nI have acted as the primary conduit between sales, operations, and development departments, facilitating workshops and drafting detailed system design maps. My analytical work has helped client operations cut redundant tasks by up to 25%.\n\nI look forward to discussing how my strategic process analysis can improve your operational efficacy.',
    closing: 'Sincerely',
    text: 'Analyst Cover Letter'
  },
  {
    id: 19,
    title: 'System & Network Admin',
    subject: 'Application for System Administrator & Network Engineer',
    greeting: 'Dear IT Department Manager',
    bodyText: 'I am writing to apply for the System Administrator position. I bring extensive experience in managing enterprise server rooms, active directories, network routers, and secure VPN routing architectures.\n\nI am committed to ensuring maximum internal utility uptime, configuring robust data backups, and resolving hardware issues. I have migrated several outdated physical servers to high-performance secure virtual structures while keeping internal service disruptions to absolute zero.\n\nI hope to discuss my background in managing stable, high-availability corporate network infrastructure.',
    closing: 'Best regards',
    text: 'SysAdmin Cover Letter'
  },
  {
    id: 20,
    title: 'E-commerce Specialist',
    subject: 'Application for E-commerce Operations Manager',
    greeting: 'Dear Store Owner / General Manager',
    bodyText: 'I am excited to apply for the E-commerce Operations Manager opening. I am a conversion-focused merchant with experience in inventory management, layout optimization, advertising catalogs, and checkout experience enhancement.\n\nI have managed stores generating significant revenues, optimizing delivery logistics, resolving payment gateway issues, and running successful seasonal campaigns. I pay close attention to basket sizes and customer Lifetime Value (LTV) metrics.\n\nI look forward to discussing how to leverage my digital retail knowledge to drive your online sales.',
    closing: 'Sincerely',
    text: 'Ecom Cover Letter'
  },
  {
    id: 21,
    title: 'Executive Assistant',
    subject: 'Application for Senior Executive & Administrative Assistant',
    greeting: 'Dear Chief of Staff',
    bodyText: 'I am writing to apply for the Executive Assistant position. I am a highly organized, discreet, and proactive partner with extensive experience in coordinating international calendars, managing travel plans, and drafting executive agendas.\n\nI excel under high-pressure conditions, keeping schedules running smoothly while handling all correspondence and client communications with utmost poise. I am familiar with modern calendar packages and pride myself on resolving logistical conflicts before they register.\n\nI look forward to discussing how my administrative expertise can support your executive suite.',
    closing: 'Respectfully yours',
    text: 'Assistant Cover Letter'
  },
  {
    id: 22,
    title: 'Graphic Artist & Brand Art',
    subject: 'Application for Lead Graphic Artist & Visual Brand Designer',
    greeting: 'Dear Art Director',
    bodyText: 'I am writing to apply for the Graphic Artist position. I bring a highly creative visual approach to digital branding, logo design, marketing collateral, and packaging layouts.\n\nI am proficient in leading standard vector suites, photo edits, and 3D mockup tools. I focus heavily on visual storytelling, color narratives, and typography tracking that elevate product values. I have collaborated with digital agencies to establish distinctive corporate identities.\n\nThank you for reviewing my visual assets portfolio, and I am excited to discuss our next design project.',
    closing: 'Warm regards',
    text: 'Graphic Cover Letter'
  },
  {
    id: 23,
    title: 'Healthcare Coordinator',
    subject: 'Application for Clinical Coordinator & Healthcare Administrator',
    greeting: 'Dear Clinical Director',
    bodyText: 'I am writing to submit my candidacy for the Clinical Coordinator role. With a background in hospital administration, patient scheduling, and health guidelines compliance, I specialize in keeping medical offices organized.\n\nI have lead teams of clinic receptionists, automated EHR record keeping, and designed employee sheets that ensured optimal nurse staffing rotations. My administrative focus is on patient safety, file accuracy, and friendly client services.\n\nI look forward to discussing my experiences in clinic management and patient records care.',
    closing: 'Sincerely',
    text: 'Health Cover Letter'
  },
  {
    id: 24,
    title: 'Education Program Coordinator',
    subject: 'Application for Education Program Coordinator & Instructor',
    greeting: 'Dear Academic Dean',
    bodyText: 'I am writing to express my interest in joining your school as an Education Program Coordinator. I specialize in designing contemporary academic curriculums, scheduling lectures, and leading student support networks.\n\nI have coordinated several public education events, monitored classroom assessments, and trained instructors in adopting modern digital classroom suites. I believe in active learning environments that empower student curiosity while staying aligned with academic targets.\n\nI hope to discuss how my educational design skills can contribute to student progress.',
    closing: 'Sincerely yours',
    text: 'Education Cover Letter'
  },
  {
    id: 25,
    title: 'Executive Officer Operations',
    subject: 'Application for Vice President & Executive Director of Operations',
    greeting: 'Dear Board of Directors',
    bodyText: 'I am writing to express my candidacy for the Executive Director of Operations vacancy. I am a veteran operations leader who specializes in scaling corporate units, aligning budget expenses, and establishing high-efficiency supply networks.\n\nThroughout my career, I have overseen multi-million-dollar budgets, designed operational procedures that cut waste by 30%, and coached mid-level business managers toward scalable quarterly targets. I thrive in leading corporate restructuring efforts that drive sustainable profitability.\n\nI would be honored to discuss how my enterprise leadership can accelerate your corporate objectives.',
    closing: 'With highest regard',
    text: 'Executive Cover Letter'
  }
];

export const getPhoneFlag = (phone?: string): string => {
  if (!phone) return '';
  const cleanPhone = phone.replace(/\s+/g, '');
  if (cleanPhone.startsWith('+971')) return '🇦🇪';
  if (cleanPhone.startsWith('+91')) return '🇮🇳';
  if (cleanPhone.startsWith('+92')) return '🇵🇰';
  if (cleanPhone.startsWith('+44')) return '🇬🇧';
  if (cleanPhone.startsWith('+1')) return '🇺🇸';
  if (cleanPhone.startsWith('+61')) return '🇦🇺';
  if (cleanPhone.startsWith('+20')) return '🇪🇬';
  if (cleanPhone.startsWith('+966')) return '🇸🇦';
  if (cleanPhone.startsWith('+962')) return '🇯🇴';
  if (cleanPhone.startsWith('+963')) return '🇸🇾';
  if (cleanPhone.startsWith('+961')) return '🇱🇧';
  if (cleanPhone.startsWith('+968')) return '🇴🇲';
  if (cleanPhone.startsWith('+973')) return '🇧🇭';
  if (cleanPhone.startsWith('+965')) return '🇰🇼';
  if (cleanPhone.startsWith('+974')) return '🇶🇦';
  if (cleanPhone.startsWith('+967')) return '🇾🇪';
  if (cleanPhone.startsWith('+249')) return '🇸🇩';
  if (cleanPhone.startsWith('+964')) return '🇮🇶';
  if (cleanPhone.startsWith('+212')) return '🇲🇦';
  if (cleanPhone.startsWith('+27')) return '🇿🇦';
  if (cleanPhone.startsWith('+49')) return '🇩🇪';
  if (cleanPhone.startsWith('+33')) return '🇫🇷';
  if (cleanPhone.startsWith('+39')) return '🇮🇹';
  if (cleanPhone.startsWith('+34')) return '🇪🇸';
  if (cleanPhone.startsWith('+7')) return '🇷🇺';
  if (cleanPhone.startsWith('+90')) return '🇹🇷';
  if (cleanPhone.startsWith('+63')) return '🇵🇭';
  if (cleanPhone.startsWith('+880')) return '🇧🇩';
  if (cleanPhone.startsWith('+86')) return '🇨🇳';
  if (cleanPhone.startsWith('+81')) return '🇯🇵';
  if (cleanPhone.startsWith('+82')) return '🇰🇷';
  if (cleanPhone.startsWith('+65')) return '🇸🇬';
  return '';
};

export const getNationalityFlag = (nationality?: string): string => {
  if (!nationality) return '🌐';
  const natLower = nationality.toLowerCase().trim();
  if (natLower.includes('emirati') || natLower.includes('uae')) return '🇦🇪';
  if (natLower.includes('indian')) return '🇮🇳';
  if (natLower.includes('pakistani')) return '🇵🇰';
  if (natLower.includes('british') || natLower.includes('uk')) return '🇬🇧';
  if (natLower.includes('american') || natLower.includes('us')) return '🇺🇸';
  if (natLower.includes('canadian')) return '🇨🇦';
  if (natLower.includes('australian')) return '🇦🇺';
  if (natLower.includes('egyptian')) return '🇪🇬';
  if (natLower.includes('saudi')) return '🇸🇦';
  if (natLower.includes('jordanian')) return '🇯🇴';
  if (natLower.includes('syrian')) return '🇸🇾';
  if (natLower.includes('lebanese')) return '🇱🇧';
  if (natLower.includes('omani')) return '🇴🇲';
  if (natLower.includes('bahraini')) return '🇧🇭';
  if (natLower.includes('kuwaiti')) return '🇰🇼';
  if (natLower.includes('qatari')) return '🇶🇦';
  if (natLower.includes('yemeni')) return '🇾🇪';
  if (natLower.includes('sudanese')) return '🇸🇩';
  if (natLower.includes('iraqi')) return '🇮🇶';
  if (natLower.includes('moroccan')) return '🇲🇦';
  if (natLower.includes('south african')) return '🇿🇦';
  if (natLower.includes('german')) return '🇩🇪';
  if (natLower.includes('french')) return '🇫🇷';
  if (natLower.includes('italian')) return '🇮🇹';
  if (natLower.includes('spanish')) return '🇪🇸';
  if (natLower.includes('russian')) return '🇷🇺';
  if (natLower.includes('turkish')) return '🇹🇷';
  if (natLower.includes('filipino')) return '🇵🇭';
  if (natLower.includes('bangladeshi')) return '🇧🇩';
  if (natLower.includes('chinese')) return '🇨🇳';
  if (natLower.includes('japanese')) return '🇯🇵';
  if (natLower.includes('korean')) return '🇰🇷';
  if (natLower.includes('singaporean')) return '🇸🇬';
  return '🌐';
};
