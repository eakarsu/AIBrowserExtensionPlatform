const bcrypt = require('bcryptjs');
const { sequelize, User, Research, AutoFill, Summary, TabGroup, Bookmark, PasswordEntry, AdBlockRule, ReadingItem, Translation, Screenshot, EmailTemplate, PriceTracker, GrammarCheck, Citation, DarkModeRule, Note, Todo, PomodoroSession, Habit, Expense, ClipboardEntry, BlockedSite, QuickLink, SavedSession, Countdown, ColorPalette, Snippet, RSSFeed, Contact, Workout } = require('../models');

async function seed() {
  if (process.env.CONFIRM_DEMO_SEED !== 'yes' || process.env.NODE_ENV === 'production') throw new Error('Demo seed requires CONFIRM_DEMO_SEED=yes outside production');
  if (!process.env.DEMO_PASSWORD || process.env.DEMO_PASSWORD.length < 12) throw new Error('DEMO_PASSWORD must contain at least 12 characters');
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // Seed Users
    const hashedPassword = await bcrypt.hash(process.env.DEMO_PASSWORD, 10);
    await User.bulkCreate([
      { email: 'admin@aiextension.com', password: hashedPassword, name: 'Admin User', role: 'admin' },
      { email: 'demo@aiextension.com', password: hashedPassword, name: 'Demo User', role: 'user' }
    ]);
    console.log('Users seeded.');

    // Seed Research (15 items)
    await Research.bulkCreate([
      { title: 'AI in Healthcare 2024', query: 'Latest AI applications in healthcare diagnostics', summary: 'AI is revolutionizing healthcare with advanced diagnostic tools...', sources: 'Nature Medicine, The Lancet Digital Health', status: 'completed', category: 'Technology', tags: 'AI, Healthcare, Diagnostics' },
      { title: 'Quantum Computing Advances', query: 'Recent breakthroughs in quantum computing', summary: 'Quantum supremacy achieved in multiple domains...', sources: 'Nature Physics, IBM Research', status: 'completed', category: 'Technology', tags: 'Quantum, Computing, Physics' },
      { title: 'Climate Change Solutions', query: 'Innovative solutions for climate change mitigation', summary: 'Carbon capture technology and renewable energy innovations...', sources: 'Science, Nature Climate Change', status: 'completed', category: 'Environment', tags: 'Climate, Green Energy, Carbon' },
      { title: 'Web3 & Blockchain Trends', query: 'Current state of Web3 and blockchain technology', summary: 'DeFi, NFTs, and enterprise blockchain adoption trends...', sources: 'CoinDesk, Ethereum Foundation', status: 'completed', category: 'Technology', tags: 'Blockchain, Web3, DeFi' },
      { title: 'Remote Work Productivity', query: 'Studies on remote work productivity and well-being', summary: 'Remote work shows increased productivity with proper tools...', sources: 'Harvard Business Review, Stanford Research', status: 'completed', category: 'Business', tags: 'Remote Work, Productivity' },
      { title: 'Cybersecurity Threats 2024', query: 'Emerging cybersecurity threats and defenses', summary: 'AI-powered attacks and zero-trust architecture adoption...', sources: 'NIST, Mandiant Reports', status: 'completed', category: 'Security', tags: 'Cybersecurity, AI, Zero Trust' },
      { title: 'Electric Vehicle Market', query: 'EV market trends and future projections', summary: 'EV adoption accelerating with new battery technologies...', sources: 'Bloomberg NEF, IEA', status: 'completed', category: 'Automotive', tags: 'EV, Battery, Tesla' },
      { title: 'Space Exploration Updates', query: 'Latest developments in space exploration', summary: 'Mars missions, Artemis program, and commercial space...', sources: 'NASA, SpaceX Updates', status: 'in_progress', category: 'Science', tags: 'Space, NASA, Mars' },
      { title: 'Machine Learning in Finance', query: 'ML applications in financial markets', summary: 'Algorithmic trading and fraud detection advances...', sources: 'Journal of Financial Economics', status: 'completed', category: 'Finance', tags: 'ML, Finance, Trading' },
      { title: 'Sustainable Agriculture', query: 'AI and technology in sustainable farming', summary: 'Precision agriculture and vertical farming innovations...', sources: 'FAO Reports, AgriTech journals', status: 'completed', category: 'Agriculture', tags: 'Farming, AI, Sustainability' },
      { title: 'Mental Health Tech', query: 'Technology solutions for mental health', summary: 'Digital therapeutics and AI-powered mental health tools...', sources: 'WHO, APA journals', status: 'in_progress', category: 'Health', tags: 'Mental Health, Apps, AI' },
      { title: '5G Network Deployment', query: 'Global 5G rollout and applications', summary: 'Global coverage expanding with new use cases...', sources: 'GSMA, Qualcomm Research', status: 'completed', category: 'Telecom', tags: '5G, Network, IoT' },
      { title: 'Biotechnology Breakthroughs', query: 'Latest biotech innovations and CRISPR advances', summary: 'Gene editing therapies entering clinical trials...', sources: 'Nature Biotechnology, CRISPR Journal', status: 'completed', category: 'Science', tags: 'Biotech, CRISPR, Genes' },
      { title: 'EdTech Revolution', query: 'AI in education and personalized learning', summary: 'Adaptive learning platforms transforming education...', sources: 'EdSurge, MIT Technology Review', status: 'completed', category: 'Education', tags: 'Education, AI, Learning' },
      { title: 'Autonomous Vehicles', query: 'Self-driving car technology and regulations', summary: 'Level 4 autonomy achieved with regulatory progress...', sources: 'SAE International, NHTSA', status: 'in_progress', category: 'Automotive', tags: 'Autonomous, Cars, AI' }
    ]);
    console.log('Research seeded.');

    // Seed AutoFill (15 items)
    await AutoFill.bulkCreate([
      { name: 'Job Application Form', formType: 'employment', fieldMappings: '{"fullName":"John Doe","email":"john@example.com","phone":"555-0123","position":"Software Engineer"}', websiteUrl: 'linkedin.com', isActive: true, usageCount: 45, category: 'Employment' },
      { name: 'Online Shopping Checkout', formType: 'commerce', fieldMappings: '{"name":"John Doe","address":"123 Main St","city":"San Francisco","zip":"94102","card":"****4242"}', websiteUrl: 'amazon.com', isActive: true, usageCount: 128, category: 'Shopping' },
      { name: 'Contact Us Form', formType: 'contact', fieldMappings: '{"name":"John Doe","email":"john@example.com","subject":"Inquiry","message":""}', websiteUrl: 'general', isActive: true, usageCount: 33, category: 'General' },
      { name: 'Newsletter Signup', formType: 'subscription', fieldMappings: '{"email":"john@example.com","firstName":"John","interests":"Technology, AI"}', websiteUrl: 'general', isActive: true, usageCount: 67, category: 'Marketing' },
      { name: 'Social Media Profile', formType: 'profile', fieldMappings: '{"username":"johndoe","bio":"Tech enthusiast","location":"SF Bay Area","website":"johndoe.com"}', websiteUrl: 'twitter.com', isActive: true, usageCount: 12, category: 'Social' },
      { name: 'Hotel Booking Form', formType: 'booking', fieldMappings: '{"name":"John Doe","email":"john@example.com","phone":"555-0123","guests":"2","roomType":"Standard"}', websiteUrl: 'booking.com', isActive: true, usageCount: 23, category: 'Travel' },
      { name: 'Insurance Application', formType: 'insurance', fieldMappings: '{"fullName":"John Doe","dob":"1990-01-15","ssn":"***-**-4321","address":"123 Main St"}', websiteUrl: 'general', isActive: true, usageCount: 8, category: 'Finance' },
      { name: 'Medical Intake Form', formType: 'medical', fieldMappings: '{"name":"John Doe","dob":"1990-01-15","allergies":"None","medications":"None"}', websiteUrl: 'general', isActive: true, usageCount: 15, category: 'Health' },
      { name: 'Event Registration', formType: 'event', fieldMappings: '{"name":"John Doe","email":"john@example.com","company":"Tech Corp","dietary":"None"}', websiteUrl: 'eventbrite.com', isActive: true, usageCount: 29, category: 'Events' },
      { name: 'Bug Report Form', formType: 'support', fieldMappings: '{"name":"John Doe","email":"john@example.com","severity":"Medium","browser":"Chrome"}', websiteUrl: 'github.com', isActive: true, usageCount: 41, category: 'Development' },
      { name: 'Apartment Application', formType: 'housing', fieldMappings: '{"name":"John Doe","income":"100000","employer":"Tech Corp","pets":"None"}', websiteUrl: 'zillow.com', isActive: false, usageCount: 5, category: 'Housing' },
      { name: 'University Application', formType: 'education', fieldMappings: '{"name":"John Doe","gpa":"3.8","major":"Computer Science","year":"2024"}', websiteUrl: 'commonapp.org', isActive: true, usageCount: 3, category: 'Education' },
      { name: 'Restaurant Reservation', formType: 'booking', fieldMappings: '{"name":"John Doe","phone":"555-0123","guests":"4","time":"7:00 PM"}', websiteUrl: 'opentable.com', isActive: true, usageCount: 37, category: 'Dining' },
      { name: 'Survey Feedback Form', formType: 'survey', fieldMappings: '{"name":"John Doe","rating":"5","feedback":"","recommend":"Yes"}', websiteUrl: 'general', isActive: true, usageCount: 54, category: 'General' },
      { name: 'Freelancer Profile', formType: 'profile', fieldMappings: '{"name":"John Doe","title":"Full Stack Developer","hourlyRate":"150","skills":"React, Node.js, Python"}', websiteUrl: 'upwork.com', isActive: true, usageCount: 9, category: 'Employment' }
    ]);
    console.log('AutoFill seeded.');

    // Seed Summaries (15 items)
    await Summary.bulkCreate([
      { title: 'The Future of AI in 2025', originalUrl: 'https://techcrunch.com/ai-future', originalContent: 'Artificial intelligence continues to evolve at an unprecedented pace...', summary: 'AI is rapidly advancing with focus on AGI, multimodal models, and enterprise adoption. Key developments include improved reasoning capabilities and ethical AI frameworks.', keyPoints: 'AGI research progress, Multimodal AI expansion, Enterprise AI adoption, Ethical frameworks development', wordCount: 2500, readTime: '10 min', category: 'Technology' },
      { title: 'Understanding React Server Components', originalUrl: 'https://react.dev/blog/rsc', originalContent: 'React Server Components represent a paradigm shift...', summary: 'RSC enables server-side rendering of components, reducing client bundle size and improving performance.', keyPoints: 'Server-side rendering, Reduced bundle size, Streaming support, Better SEO', wordCount: 3200, readTime: '13 min', category: 'Development' },
      { title: 'Global Economic Outlook 2024', originalUrl: 'https://imf.org/outlook', originalContent: 'The global economy faces mixed signals...', summary: 'Mixed economic signals with cautious optimism. Inflation moderating but geopolitical risks remain.', keyPoints: 'Inflation declining, GDP growth steady, Tech sector resilient, Emerging markets recovery', wordCount: 4100, readTime: '16 min', category: 'Economy' },
      { title: 'Best Practices for API Design', originalUrl: 'https://swagger.io/best-practices', originalContent: 'RESTful API design requires careful planning...', summary: 'Comprehensive guide to REST API design covering versioning, authentication, error handling, and documentation.', keyPoints: 'REST principles, Versioning strategies, Auth patterns, Error handling', wordCount: 2800, readTime: '11 min', category: 'Development' },
      { title: 'The Rise of Rust Programming', originalUrl: 'https://blog.rust-lang.org', originalContent: 'Rust has seen explosive growth in systems programming...', summary: 'Rust adoption growing in systems programming, WebAssembly, and backend development due to memory safety.', keyPoints: 'Memory safety, Performance, Growing ecosystem, WebAssembly support', wordCount: 1800, readTime: '7 min', category: 'Development' },
      { title: 'Renewable Energy Milestone', originalUrl: 'https://energy.gov/renewable', originalContent: 'Renewable energy sources now account for...', summary: 'Renewables hit record capacity. Solar and wind lead growth with improved storage solutions.', keyPoints: 'Record solar capacity, Wind energy growth, Battery storage advances, Grid modernization', wordCount: 2100, readTime: '8 min', category: 'Energy' },
      { title: 'Neuroscience of Learning', originalUrl: 'https://nature.com/neuroscience', originalContent: 'New research reveals how the brain forms memories...', summary: 'Brain plasticity research reveals optimal learning strategies backed by neuroscience.', keyPoints: 'Spaced repetition, Sleep importance, Active recall, Neuroplasticity', wordCount: 3500, readTime: '14 min', category: 'Science' },
      { title: 'Kubernetes Best Practices', originalUrl: 'https://kubernetes.io/blog', originalContent: 'Running production workloads on Kubernetes...', summary: 'Essential Kubernetes practices for production including security, scaling, and monitoring.', keyPoints: 'Pod security, Auto-scaling, Monitoring setup, Resource limits', wordCount: 4200, readTime: '17 min', category: 'DevOps' },
      { title: 'Psychology of User Experience', originalUrl: 'https://nngroup.com/articles/ux', originalContent: 'User experience design relies heavily on psychology...', summary: 'UX design principles grounded in cognitive psychology for better user engagement.', keyPoints: 'Cognitive load, Visual hierarchy, Feedback loops, Accessibility', wordCount: 2600, readTime: '10 min', category: 'Design' },
      { title: 'Cryptocurrency Regulation Update', originalUrl: 'https://reuters.com/crypto-regulation', originalContent: 'Governments worldwide are establishing crypto frameworks...', summary: 'Global crypto regulation landscape evolving with new frameworks from major economies.', keyPoints: 'SEC guidelines, EU MiCA regulation, CBDC development, DeFi oversight', wordCount: 1900, readTime: '8 min', category: 'Finance' },
      { title: 'Future of Remote Collaboration', originalUrl: 'https://hbr.org/remote-work', originalContent: 'The shift to remote work has transformed...', summary: 'Remote collaboration tools and practices that drive productivity in distributed teams.', keyPoints: 'Async communication, Virtual whiteboards, AI meeting assistants, Time zone management', wordCount: 2300, readTime: '9 min', category: 'Business' },
      { title: 'Machine Learning Operations Guide', originalUrl: 'https://mlops.community', originalContent: 'MLOps bridges the gap between ML development...', summary: 'MLOps practices for deploying and maintaining ML models in production environments.', keyPoints: 'Model versioning, CI/CD for ML, Monitoring, Feature stores', wordCount: 3800, readTime: '15 min', category: 'Data Science' },
      { title: 'Sustainable Software Engineering', originalUrl: 'https://greensoftware.foundation', originalContent: 'Software has a carbon footprint that often goes unnoticed...', summary: 'Green software practices to reduce the environmental impact of software systems.', keyPoints: 'Carbon-aware computing, Energy efficiency, Green hosting, Measurement tools', wordCount: 2000, readTime: '8 min', category: 'Environment' },
      { title: 'TypeScript 5.x New Features', originalUrl: 'https://devblogs.microsoft.com/typescript', originalContent: 'TypeScript continues to evolve with powerful new features...', summary: 'TypeScript 5.x brings decorators, const type parameters, and improved inference.', keyPoints: 'Decorators support, Const type params, Better inference, Performance improvements', wordCount: 2700, readTime: '11 min', category: 'Development' },
      { title: 'Digital Privacy in 2024', originalUrl: 'https://eff.org/privacy-report', originalContent: 'Digital privacy continues to be a pressing concern...', summary: 'Privacy landscape shifting with new regulations and growing surveillance concerns.', keyPoints: 'GDPR enforcement, Data broker crackdown, Privacy-first browsers, End-to-end encryption', wordCount: 3100, readTime: '12 min', category: 'Privacy' }
    ]);
    console.log('Summaries seeded.');

    // Seed Tab Groups (15 items)
    await TabGroup.bulkCreate([
      { name: 'Work Projects', description: 'Active work project tabs', tabs: '[{"title":"Jira Board","url":"https://jira.atlassian.com"},{"title":"GitHub PRs","url":"https://github.com/pulls"},{"title":"Confluence Docs","url":"https://confluence.com"}]', tabCount: 3, color: '#4F46E5', isActive: true, category: 'Work' },
      { name: 'Research Papers', description: 'Academic research tabs', tabs: '[{"title":"Google Scholar","url":"https://scholar.google.com"},{"title":"ArXiv","url":"https://arxiv.org"},{"title":"IEEE Xplore","url":"https://ieeexplore.ieee.org"}]', tabCount: 3, color: '#059669', isActive: true, category: 'Research' },
      { name: 'Social Media', description: 'Social media dashboards', tabs: '[{"title":"Twitter","url":"https://twitter.com"},{"title":"LinkedIn","url":"https://linkedin.com"},{"title":"Reddit","url":"https://reddit.com"}]', tabCount: 3, color: '#DC2626', isActive: true, category: 'Social' },
      { name: 'News & Updates', description: 'Daily news sources', tabs: '[{"title":"TechCrunch","url":"https://techcrunch.com"},{"title":"Hacker News","url":"https://news.ycombinator.com"},{"title":"The Verge","url":"https://theverge.com"}]', tabCount: 3, color: '#D97706', isActive: true, category: 'News' },
      { name: 'Learning', description: 'Online courses and tutorials', tabs: '[{"title":"Udemy","url":"https://udemy.com"},{"title":"Coursera","url":"https://coursera.org"},{"title":"YouTube Tutorials","url":"https://youtube.com"}]', tabCount: 3, color: '#7C3AED', isActive: true, category: 'Education' },
      { name: 'Shopping Lists', description: 'Online shopping tabs', tabs: '[{"title":"Amazon Cart","url":"https://amazon.com/cart"},{"title":"eBay Watchlist","url":"https://ebay.com/watchlist"}]', tabCount: 2, color: '#EC4899', isActive: false, category: 'Shopping' },
      { name: 'DevOps Monitoring', description: 'Infrastructure monitoring dashboards', tabs: '[{"title":"Grafana","url":"https://grafana.com"},{"title":"Datadog","url":"https://app.datadoghq.com"},{"title":"AWS Console","url":"https://console.aws.amazon.com"}]', tabCount: 3, color: '#F97316', isActive: true, category: 'DevOps' },
      { name: 'Design Resources', description: 'Design tools and inspiration', tabs: '[{"title":"Figma","url":"https://figma.com"},{"title":"Dribbble","url":"https://dribbble.com"},{"title":"Behance","url":"https://behance.net"}]', tabCount: 3, color: '#06B6D4', isActive: true, category: 'Design' },
      { name: 'Documentation', description: 'API and framework docs', tabs: '[{"title":"React Docs","url":"https://react.dev"},{"title":"MDN Web Docs","url":"https://developer.mozilla.org"},{"title":"Node.js Docs","url":"https://nodejs.org/docs"}]', tabCount: 3, color: '#84CC16', isActive: true, category: 'Development' },
      { name: 'Finance & Banking', description: 'Financial accounts and tools', tabs: '[{"title":"Bank Account","url":"https://chase.com"},{"title":"Investment Portfolio","url":"https://vanguard.com"},{"title":"Budget Tracker","url":"https://mint.com"}]', tabCount: 3, color: '#14B8A6', isActive: true, category: 'Finance' },
      { name: 'Email Clients', description: 'Email accounts', tabs: '[{"title":"Gmail","url":"https://mail.google.com"},{"title":"Outlook","url":"https://outlook.live.com"}]', tabCount: 2, color: '#EF4444', isActive: true, category: 'Communication' },
      { name: 'Travel Planning', description: 'Upcoming trip planning', tabs: '[{"title":"Google Flights","url":"https://flights.google.com"},{"title":"Airbnb","url":"https://airbnb.com"},{"title":"TripAdvisor","url":"https://tripadvisor.com"}]', tabCount: 3, color: '#8B5CF6', isActive: false, category: 'Travel' },
      { name: 'Health & Fitness', description: 'Health tracking and fitness resources', tabs: '[{"title":"MyFitnessPal","url":"https://myfitnesspal.com"},{"title":"Strava","url":"https://strava.com"}]', tabCount: 2, color: '#10B981', isActive: true, category: 'Health' },
      { name: 'Music & Entertainment', description: 'Streaming and entertainment', tabs: '[{"title":"Spotify","url":"https://open.spotify.com"},{"title":"Netflix","url":"https://netflix.com"},{"title":"YouTube Music","url":"https://music.youtube.com"}]', tabCount: 3, color: '#F59E0B', isActive: true, category: 'Entertainment' },
      { name: 'Job Search', description: 'Job hunting resources', tabs: '[{"title":"LinkedIn Jobs","url":"https://linkedin.com/jobs"},{"title":"Indeed","url":"https://indeed.com"},{"title":"Glassdoor","url":"https://glassdoor.com"}]', tabCount: 3, color: '#3B82F6', isActive: true, category: 'Career' }
    ]);
    console.log('Tab Groups seeded.');

    // Seed Bookmarks (15 items)
    await Bookmark.bulkCreate([
      { title: 'React Documentation', url: 'https://react.dev', description: 'Official React documentation and guides', folder: 'Development', tags: 'React, JavaScript, Frontend', favicon: 'https://react.dev/favicon.ico', isActive: true },
      { title: 'GitHub Repository', url: 'https://github.com', description: 'Source code hosting and collaboration', folder: 'Development', tags: 'Git, Code, Collaboration', favicon: 'https://github.com/favicon.ico', isActive: true },
      { title: 'Stack Overflow', url: 'https://stackoverflow.com', description: 'Programming Q&A community', folder: 'Development', tags: 'Q&A, Programming, Help', favicon: 'https://stackoverflow.com/favicon.ico', isActive: true },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Web technology documentation', folder: 'Development', tags: 'Web, HTML, CSS, JavaScript', favicon: '', isActive: true },
      { title: 'Hacker News', url: 'https://news.ycombinator.com', description: 'Tech news and discussions', folder: 'News', tags: 'Tech, News, Startups', favicon: '', isActive: true },
      { title: 'Medium', url: 'https://medium.com', description: 'Blog platform for tech articles', folder: 'Reading', tags: 'Blog, Articles, Tech', favicon: '', isActive: true },
      { title: 'AWS Console', url: 'https://console.aws.amazon.com', description: 'Amazon Web Services dashboard', folder: 'Cloud', tags: 'AWS, Cloud, Infrastructure', favicon: '', isActive: true },
      { title: 'Figma Design', url: 'https://figma.com', description: 'Collaborative design tool', folder: 'Design', tags: 'Design, UI, Collaboration', favicon: '', isActive: true },
      { title: 'ChatGPT', url: 'https://chat.openai.com', description: 'AI assistant chatbot', folder: 'AI Tools', tags: 'AI, ChatBot, OpenAI', favicon: '', isActive: true },
      { title: 'Vercel Dashboard', url: 'https://vercel.com/dashboard', description: 'Deployment and hosting platform', folder: 'DevOps', tags: 'Deploy, Hosting, Next.js', favicon: '', isActive: true },
      { title: 'YouTube', url: 'https://youtube.com', description: 'Video streaming platform', folder: 'Entertainment', tags: 'Video, Tutorials, Entertainment', favicon: '', isActive: true },
      { title: 'Notion', url: 'https://notion.so', description: 'All-in-one workspace for notes and docs', folder: 'Productivity', tags: 'Notes, Docs, Wiki', favicon: '', isActive: true },
      { title: 'Docker Hub', url: 'https://hub.docker.com', description: 'Container image registry', folder: 'DevOps', tags: 'Docker, Containers, DevOps', favicon: '', isActive: true },
      { title: 'NPM Registry', url: 'https://npmjs.com', description: 'Node.js package manager', folder: 'Development', tags: 'NPM, Packages, Node.js', favicon: '', isActive: true },
      { title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: 'Utility-first CSS framework', folder: 'Development', tags: 'CSS, Tailwind, Styling', favicon: '', isActive: true }
    ]);
    console.log('Bookmarks seeded.');

    // Seed Password Entries (15 items)
    await PasswordEntry.bulkCreate([
      { siteName: 'Gmail', siteUrl: 'https://mail.google.com', username: 'john.doe@gmail.com', encryptedPassword: '***encrypted***', category: 'Email', strength: 'Strong', lastUsed: new Date(), notes: 'Personal email' },
      { siteName: 'GitHub', siteUrl: 'https://github.com', username: 'johndoe', encryptedPassword: '***encrypted***', category: 'Development', strength: 'Very Strong', lastUsed: new Date(), notes: '2FA enabled' },
      { siteName: 'AWS Console', siteUrl: 'https://aws.amazon.com', username: 'admin@company.com', encryptedPassword: '***encrypted***', category: 'Cloud', strength: 'Very Strong', lastUsed: new Date(), notes: 'MFA enabled' },
      { siteName: 'LinkedIn', siteUrl: 'https://linkedin.com', username: 'john.doe@gmail.com', encryptedPassword: '***encrypted***', category: 'Social', strength: 'Strong', lastUsed: new Date(), notes: '' },
      { siteName: 'Netflix', siteUrl: 'https://netflix.com', username: 'john@gmail.com', encryptedPassword: '***encrypted***', category: 'Entertainment', strength: 'Medium', lastUsed: new Date(), notes: 'Family plan' },
      { siteName: 'Slack', siteUrl: 'https://slack.com', username: 'john.doe@company.com', encryptedPassword: '***encrypted***', category: 'Work', strength: 'Strong', lastUsed: new Date(), notes: 'SSO via Google' },
      { siteName: 'Amazon', siteUrl: 'https://amazon.com', username: 'john@gmail.com', encryptedPassword: '***encrypted***', category: 'Shopping', strength: 'Strong', lastUsed: new Date(), notes: 'Prime member' },
      { siteName: 'Dropbox', siteUrl: 'https://dropbox.com', username: 'john@gmail.com', encryptedPassword: '***encrypted***', category: 'Cloud', strength: 'Medium', lastUsed: new Date(), notes: '' },
      { siteName: 'Spotify', siteUrl: 'https://spotify.com', username: 'johndoe', encryptedPassword: '***encrypted***', category: 'Entertainment', strength: 'Medium', lastUsed: new Date(), notes: 'Premium plan' },
      { siteName: 'Twitter/X', siteUrl: 'https://x.com', username: '@johndoe', encryptedPassword: '***encrypted***', category: 'Social', strength: 'Strong', lastUsed: new Date(), notes: '2FA enabled' },
      { siteName: 'Figma', siteUrl: 'https://figma.com', username: 'john@company.com', encryptedPassword: '***encrypted***', category: 'Design', strength: 'Strong', lastUsed: new Date(), notes: 'Pro plan' },
      { siteName: 'Notion', siteUrl: 'https://notion.so', username: 'john@gmail.com', encryptedPassword: '***encrypted***', category: 'Productivity', strength: 'Strong', lastUsed: new Date(), notes: 'Personal workspace' },
      { siteName: 'Chase Bank', siteUrl: 'https://chase.com', username: 'john.doe', encryptedPassword: '***encrypted***', category: 'Finance', strength: 'Very Strong', lastUsed: new Date(), notes: 'MFA enabled, security questions set' },
      { siteName: 'Vercel', siteUrl: 'https://vercel.com', username: 'johndoe', encryptedPassword: '***encrypted***', category: 'Development', strength: 'Strong', lastUsed: new Date(), notes: 'GitHub SSO' },
      { siteName: 'Docker Hub', siteUrl: 'https://hub.docker.com', username: 'johndoe', encryptedPassword: '***encrypted***', category: 'Development', strength: 'Medium', lastUsed: new Date(), notes: '' }
    ]);
    console.log('Password Entries seeded.');

    // Seed Ad Block Rules (15 items)
    await AdBlockRule.bulkCreate([
      { name: 'Google Ads Banner', pattern: '##.ad-banner', ruleType: 'element', domain: 'google.com', isActive: true, blockedCount: 1250, category: 'Advertising' },
      { name: 'YouTube Pre-roll', pattern: '||youtube.com/ad_*', ruleType: 'network', domain: 'youtube.com', isActive: true, blockedCount: 890, category: 'Video Ads' },
      { name: 'Facebook Sponsored', pattern: '##[data-testid="sponsored"]', ruleType: 'element', domain: 'facebook.com', isActive: true, blockedCount: 567, category: 'Social Ads' },
      { name: 'Reddit Promoted Posts', pattern: '##.promoted', ruleType: 'element', domain: 'reddit.com', isActive: true, blockedCount: 334, category: 'Social Ads' },
      { name: 'Generic Popup Overlay', pattern: '##.popup-overlay', ruleType: 'element', domain: '*', isActive: true, blockedCount: 2100, category: 'Popups' },
      { name: 'Cookie Consent Banner', pattern: '##.cookie-banner', ruleType: 'element', domain: '*', isActive: false, blockedCount: 1800, category: 'Annoyances' },
      { name: 'Newsletter Popup', pattern: '##.newsletter-popup', ruleType: 'element', domain: '*', isActive: true, blockedCount: 950, category: 'Popups' },
      { name: 'Tracking Pixel Block', pattern: '||tracking.*.com', ruleType: 'network', domain: '*', isActive: true, blockedCount: 3400, category: 'Tracking' },
      { name: 'Amazon Sponsored Products', pattern: '##.s-sponsored-list-header', ruleType: 'element', domain: 'amazon.com', isActive: true, blockedCount: 445, category: 'Shopping Ads' },
      { name: 'Twitter Promoted Tweets', pattern: '##[data-testid="promotedTweet"]', ruleType: 'element', domain: 'x.com', isActive: true, blockedCount: 278, category: 'Social Ads' },
      { name: 'Medium Paywall', pattern: '##.meteredContent', ruleType: 'element', domain: 'medium.com', isActive: false, blockedCount: 156, category: 'Paywalls' },
      { name: 'Forbes Interstitial', pattern: '##.interstitial-wrapper', ruleType: 'element', domain: 'forbes.com', isActive: true, blockedCount: 89, category: 'Annoyances' },
      { name: 'Analytics Tracker', pattern: '||google-analytics.com', ruleType: 'network', domain: '*', isActive: true, blockedCount: 5600, category: 'Tracking' },
      { name: 'Push Notification Request', pattern: '##.push-notification-prompt', ruleType: 'element', domain: '*', isActive: true, blockedCount: 1200, category: 'Annoyances' },
      { name: 'Sidebar Ad Widget', pattern: '##.sidebar-ad', ruleType: 'element', domain: '*', isActive: true, blockedCount: 780, category: 'Advertising' }
    ]);
    console.log('Ad Block Rules seeded.');

    // Seed Reading Items (15 items)
    await ReadingItem.bulkCreate([
      { title: 'Building Microservices with Go', url: 'https://blog.golang.org/microservices', excerpt: 'A comprehensive guide to building microservices using Go...', author: 'Rob Pike', estimatedReadTime: '15 min', isRead: false, priority: 'high', category: 'Development', tags: 'Go, Microservices, Backend' },
      { title: 'The Art of Code Review', url: 'https://google.github.io/code-review', excerpt: 'Best practices for conducting effective code reviews...', author: 'Google Engineering', estimatedReadTime: '12 min', isRead: true, priority: 'high', category: 'Engineering', tags: 'Code Review, Best Practices' },
      { title: 'Understanding WebAssembly', url: 'https://webassembly.org/docs', excerpt: 'WebAssembly enables high-performance applications on the web...', author: 'W3C', estimatedReadTime: '20 min', isRead: false, priority: 'medium', category: 'Web', tags: 'WASM, Performance, Web' },
      { title: 'Database Internals Deep Dive', url: 'https://databaseinternals.com', excerpt: 'How modern databases store and retrieve data...', author: 'Alex Petrov', estimatedReadTime: '25 min', isRead: false, priority: 'medium', category: 'Database', tags: 'Database, B-Tree, Storage' },
      { title: 'Effective Remote Team Management', url: 'https://hbr.org/remote-management', excerpt: 'Strategies for managing distributed teams effectively...', author: 'HBR Staff', estimatedReadTime: '10 min', isRead: true, priority: 'low', category: 'Management', tags: 'Remote, Leadership, Teams' },
      { title: 'Introduction to Rust', url: 'https://doc.rust-lang.org/book', excerpt: 'The Rust programming language book for beginners...', author: 'Rust Team', estimatedReadTime: '30 min', isRead: false, priority: 'high', category: 'Development', tags: 'Rust, Systems, Programming' },
      { title: 'CSS Grid Complete Guide', url: 'https://css-tricks.com/grid', excerpt: 'Everything you need to know about CSS Grid layout...', author: 'Chris Coyier', estimatedReadTime: '18 min', isRead: true, priority: 'medium', category: 'Frontend', tags: 'CSS, Grid, Layout' },
      { title: 'GraphQL vs REST', url: 'https://apollographql.com/blog/graphql-vs-rest', excerpt: 'Comparing GraphQL and REST API approaches...', author: 'Apollo Team', estimatedReadTime: '14 min', isRead: false, priority: 'medium', category: 'API', tags: 'GraphQL, REST, API Design' },
      { title: 'Machine Learning for Developers', url: 'https://developers.google.com/ml', excerpt: 'Practical ML concepts for software developers...', author: 'Google AI', estimatedReadTime: '22 min', isRead: false, priority: 'high', category: 'AI/ML', tags: 'ML, AI, TensorFlow' },
      { title: 'Git Advanced Techniques', url: 'https://git-scm.com/book/advanced', excerpt: 'Advanced Git workflows and techniques...', author: 'Scott Chacon', estimatedReadTime: '16 min', isRead: true, priority: 'low', category: 'Tools', tags: 'Git, Version Control' },
      { title: 'Kubernetes Security Guide', url: 'https://kubernetes.io/security', excerpt: 'Securing your Kubernetes clusters and workloads...', author: 'K8s SIG Security', estimatedReadTime: '20 min', isRead: false, priority: 'high', category: 'Security', tags: 'K8s, Security, DevOps' },
      { title: 'Design Systems at Scale', url: 'https://designsystems.com', excerpt: 'Building and maintaining design systems for large organizations...', author: 'Design Systems Team', estimatedReadTime: '13 min', isRead: false, priority: 'medium', category: 'Design', tags: 'Design System, UI, Components' },
      { title: 'PostgreSQL Performance Tuning', url: 'https://wiki.postgresql.org/tuning', excerpt: 'Tips and techniques for optimizing PostgreSQL queries...', author: 'PG Community', estimatedReadTime: '19 min', isRead: false, priority: 'high', category: 'Database', tags: 'PostgreSQL, Performance, SQL' },
      { title: 'The Psychology of UX Writing', url: 'https://uxwritinghub.com', excerpt: 'How words shape user experience...', author: 'Torrey Podmajersky', estimatedReadTime: '11 min', isRead: true, priority: 'low', category: 'UX', tags: 'UX Writing, Copy, Design' },
      { title: 'Serverless Architecture Patterns', url: 'https://aws.amazon.com/serverless', excerpt: 'Common patterns for serverless application architectures...', author: 'AWS Team', estimatedReadTime: '17 min', isRead: false, priority: 'medium', category: 'Architecture', tags: 'Serverless, Lambda, Cloud' }
    ]);
    console.log('Reading Items seeded.');

    // Seed Translations (15 items)
    await Translation.bulkCreate([
      { originalText: 'Hello, how are you?', translatedText: 'Hola, ¿cómo estás?', sourceLang: 'English', targetLang: 'Spanish', sourceUrl: 'https://example.com', category: 'Greetings', isFavorite: true },
      { originalText: 'The quick brown fox jumps over the lazy dog', translatedText: 'Le rapide renard brun saute par-dessus le chien paresseux', sourceLang: 'English', targetLang: 'French', sourceUrl: '', category: 'General', isFavorite: false },
      { originalText: 'Good morning', translatedText: 'おはようございます', sourceLang: 'English', targetLang: 'Japanese', sourceUrl: '', category: 'Greetings', isFavorite: true },
      { originalText: 'I would like to order coffee', translatedText: 'Ich möchte Kaffee bestellen', sourceLang: 'English', targetLang: 'German', sourceUrl: 'https://cafe-example.com', category: 'Travel', isFavorite: false },
      { originalText: 'Where is the nearest hospital?', translatedText: '가장 가까운 병원이 어디에 있나요?', sourceLang: 'English', targetLang: 'Korean', sourceUrl: '', category: 'Emergency', isFavorite: true },
      { originalText: 'Thank you very much', translatedText: '非常感谢', sourceLang: 'English', targetLang: 'Chinese', sourceUrl: '', category: 'Courtesy', isFavorite: true },
      { originalText: 'The meeting is at 3 PM', translatedText: 'La riunione è alle 15:00', sourceLang: 'English', targetLang: 'Italian', sourceUrl: '', category: 'Business', isFavorite: false },
      { originalText: 'Can you help me find my hotel?', translatedText: 'Pode me ajudar a encontrar meu hotel?', sourceLang: 'English', targetLang: 'Portuguese', sourceUrl: '', category: 'Travel', isFavorite: false },
      { originalText: 'I love programming', translatedText: 'Я люблю программирование', sourceLang: 'English', targetLang: 'Russian', sourceUrl: '', category: 'Personal', isFavorite: true },
      { originalText: 'The weather is beautiful today', translatedText: 'Het weer is vandaag prachtig', sourceLang: 'English', targetLang: 'Dutch', sourceUrl: '', category: 'Weather', isFavorite: false },
      { originalText: 'Please send me the report', translatedText: 'Vänligen skicka mig rapporten', sourceLang: 'English', targetLang: 'Swedish', sourceUrl: '', category: 'Business', isFavorite: false },
      { originalText: 'How much does this cost?', translatedText: 'Bu ne kadar?', sourceLang: 'English', targetLang: 'Turkish', sourceUrl: 'https://shop-example.com', category: 'Shopping', isFavorite: true },
      { originalText: 'Happy birthday!', translatedText: 'Wszystkiego najlepszego z okazji urodzin!', sourceLang: 'English', targetLang: 'Polish', sourceUrl: '', category: 'Celebrations', isFavorite: true },
      { originalText: 'The project deadline is next Friday', translatedText: 'La date limite du projet est vendredi prochain', sourceLang: 'English', targetLang: 'French', sourceUrl: '', category: 'Business', isFavorite: false },
      { originalText: 'I need a taxi to the airport', translatedText: 'Necesito un taxi al aeropuerto', sourceLang: 'English', targetLang: 'Spanish', sourceUrl: '', category: 'Travel', isFavorite: false }
    ]);
    console.log('Translations seeded.');

    // Seed Screenshots (15 items)
    await Screenshot.bulkCreate([
      { title: 'Homepage Redesign Mockup', description: 'New homepage layout with hero section', sourceUrl: 'https://figma.com/file/homepage', annotations: '[{"type":"arrow","text":"New CTA button"},{"type":"highlight","text":"Updated hero image"}]', tags: 'Design, Homepage, Redesign', format: 'png', category: 'Design' },
      { title: 'Bug Report - Login Page', description: 'Login button not responding on mobile', sourceUrl: 'https://app.example.com/login', annotations: '[{"type":"circle","text":"Broken button"},{"type":"note","text":"Only on iOS Safari"}]', tags: 'Bug, Login, Mobile', format: 'png', category: 'Bugs' },
      { title: 'API Response Example', description: 'Sample API response for user endpoint', sourceUrl: 'https://api.example.com/users', annotations: '[{"type":"highlight","text":"New fields added"}]', tags: 'API, Documentation', format: 'png', category: 'Documentation' },
      { title: 'Performance Dashboard', description: 'Grafana metrics for API latency', sourceUrl: 'https://grafana.internal/dashboard', annotations: '[{"type":"arrow","text":"Latency spike at 2PM"},{"type":"note","text":"Correlated with deployment"}]', tags: 'Performance, Monitoring', format: 'png', category: 'DevOps' },
      { title: 'User Flow Diagram', description: 'Checkout process user flow', sourceUrl: 'https://miro.com/board/checkout', annotations: '[{"type":"note","text":"Step 3 needs simplification"}]', tags: 'UX, Flow, Checkout', format: 'png', category: 'UX' },
      { title: 'Error Log Screenshot', description: 'Production error stack trace', sourceUrl: 'https://sentry.io/issues/12345', annotations: '[{"type":"highlight","text":"Root cause line"}]', tags: 'Error, Production, Debug', format: 'png', category: 'Debugging' },
      { title: 'Competitor Analysis', description: 'Competitor pricing page comparison', sourceUrl: 'https://competitor.com/pricing', annotations: '[{"type":"note","text":"Their premium tier is cheaper"}]', tags: 'Competition, Pricing', format: 'png', category: 'Business' },
      { title: 'Database Schema Diagram', description: 'Updated ER diagram for user module', sourceUrl: 'https://dbdiagram.io/user-schema', annotations: '[{"type":"arrow","text":"New relation added"}]', tags: 'Database, Schema, ERD', format: 'png', category: 'Architecture' },
      { title: 'Mobile App Screenshot', description: 'iOS app home screen design', sourceUrl: 'https://figma.com/mobile-home', annotations: '[{"type":"note","text":"Follow iOS HIG guidelines"}]', tags: 'Mobile, iOS, Design', format: 'png', category: 'Design' },
      { title: 'A/B Test Results', description: 'Conversion rate comparison', sourceUrl: 'https://optimizely.com/results', annotations: '[{"type":"highlight","text":"Variant B wins by 15%"}]', tags: 'A/B Test, Analytics', format: 'png', category: 'Analytics' },
      { title: 'Deployment Pipeline', description: 'CI/CD pipeline visualization', sourceUrl: 'https://github.com/actions', annotations: '[{"type":"circle","text":"Failed step"},{"type":"note","text":"Lint check failing"}]', tags: 'CI/CD, Pipeline, DevOps', format: 'png', category: 'DevOps' },
      { title: 'Accessibility Audit', description: 'WCAG compliance check results', sourceUrl: 'https://wave.webaim.org', annotations: '[{"type":"highlight","text":"3 critical issues found"}]', tags: 'Accessibility, WCAG, Audit', format: 'png', category: 'QA' },
      { title: 'Network Waterfall Chart', description: 'Page load network analysis', sourceUrl: 'https://webpagetest.org', annotations: '[{"type":"arrow","text":"Largest blocking resource"}]', tags: 'Performance, Network, Loading', format: 'png', category: 'Performance' },
      { title: 'Settings Page Update', description: 'New settings page with dark mode toggle', sourceUrl: 'https://app.example.com/settings', annotations: '[{"type":"note","text":"Toggle needs animation"}]', tags: 'Settings, UI, Dark Mode', format: 'png', category: 'Feature' },
      { title: 'Customer Feedback Widget', description: 'New feedback widget placement', sourceUrl: 'https://app.example.com', annotations: '[{"type":"arrow","text":"Widget position"},{"type":"note","text":"Should not overlap chat"}]', tags: 'Feedback, Widget, UX', format: 'png', category: 'UX' }
    ]);
    console.log('Screenshots seeded.');

    // Seed Email Templates (15 items)
    await EmailTemplate.bulkCreate([
      { name: 'Welcome Email', subject: 'Welcome to Our Platform!', body: 'Dear {name},\n\nWelcome to our platform! We\'re excited to have you on board.\n\nHere\'s what you can do next:\n- Complete your profile\n- Explore our features\n- Join our community\n\nBest regards,\nThe Team', category: 'Onboarding', tone: 'Friendly', isActive: true, usageCount: 234 },
      { name: 'Meeting Request', subject: 'Meeting Request: {topic}', body: 'Hi {name},\n\nI would like to schedule a meeting to discuss {topic}.\n\nProposed times:\n- {time1}\n- {time2}\n\nPlease let me know your availability.\n\nBest,\n{sender}', category: 'Business', tone: 'Professional', isActive: true, usageCount: 156 },
      { name: 'Follow-up After Interview', subject: 'Thank You for the Interview', body: 'Dear {interviewer},\n\nThank you for taking the time to meet with me today. I enjoyed learning about the {position} role and {company}.\n\nI am very enthusiastic about the opportunity and look forward to hearing from you.\n\nBest regards,\n{name}', category: 'Career', tone: 'Professional', isActive: true, usageCount: 89 },
      { name: 'Bug Report to Team', subject: '[Bug] {bug_title} - Priority: {priority}', body: 'Team,\n\nA new bug has been identified:\n\n**Description:** {description}\n**Steps to Reproduce:**\n1. {step1}\n2. {step2}\n\n**Expected:** {expected}\n**Actual:** {actual}\n**Environment:** {env}\n\nPlease prioritize accordingly.', category: 'Development', tone: 'Technical', isActive: true, usageCount: 67 },
      { name: 'Project Update', subject: 'Weekly Project Update - {project_name}', body: 'Hi Team,\n\n**Status:** {status}\n\n**Completed this week:**\n- {item1}\n- {item2}\n\n**Planned for next week:**\n- {plan1}\n- {plan2}\n\n**Blockers:**\n- {blocker}\n\nLet me know if you have questions.', category: 'Management', tone: 'Professional', isActive: true, usageCount: 198 },
      { name: 'Customer Support Reply', subject: 'Re: {ticket_subject}', body: 'Hi {customer_name},\n\nThank you for reaching out. I understand your concern about {issue}.\n\n{solution}\n\nIf you need further assistance, please don\'t hesitate to ask.\n\nBest regards,\n{agent_name}\nSupport Team', category: 'Support', tone: 'Empathetic', isActive: true, usageCount: 312 },
      { name: 'Invoice Reminder', subject: 'Reminder: Invoice #{invoice_number} Due', body: 'Dear {client_name},\n\nThis is a friendly reminder that invoice #{invoice_number} for ${amount} is due on {due_date}.\n\nPayment can be made via {payment_methods}.\n\nPlease disregard if already paid.\n\nThank you,\n{company}', category: 'Finance', tone: 'Professional', isActive: true, usageCount: 78 },
      { name: 'Newsletter', subject: '{month} Newsletter - {company}', body: 'Hello {subscriber},\n\n**This Month\'s Highlights:**\n\n📌 {highlight1}\n📌 {highlight2}\n📌 {highlight3}\n\n**Coming Up:**\n{upcoming}\n\nStay tuned for more updates!\n\nThe {company} Team', category: 'Marketing', tone: 'Casual', isActive: true, usageCount: 445 },
      { name: 'Vacation Auto-Reply', subject: 'Out of Office: {name}', body: 'Thank you for your email. I am currently out of office from {start_date} to {end_date}.\n\nFor urgent matters, please contact {backup_name} at {backup_email}.\n\nI will respond to your email upon my return.\n\nBest regards,\n{name}', category: 'Personal', tone: 'Professional', isActive: true, usageCount: 34 },
      { name: 'Partnership Proposal', subject: 'Partnership Opportunity: {company1} x {company2}', body: 'Dear {recipient},\n\nI am writing to propose a partnership between {company1} and {company2}.\n\n**Value Proposition:**\n{value_prop}\n\n**Proposed Terms:**\n{terms}\n\nI would love to schedule a call to discuss this further.\n\nBest,\n{sender}', category: 'Business', tone: 'Professional', isActive: true, usageCount: 23 },
      { name: 'Feature Request Response', subject: 'Re: Feature Request - {feature_name}', body: 'Hi {user_name},\n\nThank you for your feature request regarding {feature_name}.\n\nWe\'ve added this to our roadmap and it\'s currently {status}.\n\n{additional_details}\n\nWe\'ll keep you updated on the progress.\n\nBest,\nProduct Team', category: 'Product', tone: 'Friendly', isActive: true, usageCount: 56 },
      { name: 'Event Invitation', subject: 'You\'re Invited: {event_name}', body: 'Dear {guest_name},\n\nYou are cordially invited to {event_name}!\n\n📅 Date: {date}\n🕐 Time: {time}\n📍 Location: {location}\n\n{description}\n\nPlease RSVP by {rsvp_date}.\n\nWe look forward to seeing you!\n\n{organizer}', category: 'Events', tone: 'Formal', isActive: true, usageCount: 67 },
      { name: 'Apology Email', subject: 'Our Sincere Apologies - {issue}', body: 'Dear {customer_name},\n\nWe sincerely apologize for {issue}. We understand this has impacted your experience.\n\n**What happened:** {explanation}\n**What we\'re doing:** {resolution}\n**Compensation:** {compensation}\n\nThank you for your patience.\n\n{company} Team', category: 'Support', tone: 'Empathetic', isActive: true, usageCount: 45 },
      { name: 'Code Review Request', subject: 'PR Review Request: {pr_title}', body: 'Hi {reviewer},\n\nCould you please review this PR?\n\n**PR:** {pr_link}\n**Description:** {description}\n**Changes:** {changes_summary}\n\n**Testing done:**\n- {test1}\n- {test2}\n\nThanks!', category: 'Development', tone: 'Casual', isActive: true, usageCount: 134 },
      { name: 'Onboarding Checklist', subject: 'Your First Week at {company}', body: 'Welcome to {company}, {new_hire}!\n\n**Day 1:**\n☐ Set up your workstation\n☐ Complete HR paperwork\n☐ Meet your buddy: {buddy_name}\n\n**Week 1:**\n☐ Complete security training\n☐ Set up development environment\n☐ Attend team standup\n\nYour manager {manager_name} will guide you through the process.\n\nWelcome aboard!', category: 'HR', tone: 'Friendly', isActive: true, usageCount: 28 }
    ]);
    console.log('Email Templates seeded.');

    // Seed Price Trackers (15 items)
    await PriceTracker.bulkCreate([
      { productName: 'MacBook Pro 16" M3 Max', productUrl: 'https://apple.com/macbook-pro', currentPrice: 3499.00, targetPrice: 2999.00, priceHistory: '[{"date":"2024-01","price":3499},{"date":"2024-02","price":3499},{"date":"2024-03","price":3299}]', store: 'Apple Store', isTracking: true, category: 'Electronics' },
      { productName: 'Sony WH-1000XM5 Headphones', productUrl: 'https://amazon.com/dp/B0BX2L8PZP', currentPrice: 348.00, targetPrice: 278.00, priceHistory: '[{"date":"2024-01","price":398},{"date":"2024-02","price":348},{"date":"2024-03","price":348}]', store: 'Amazon', isTracking: true, category: 'Electronics' },
      { productName: 'Samsung 65" 4K OLED TV', productUrl: 'https://bestbuy.com/samsung-oled', currentPrice: 1799.99, targetPrice: 1499.99, priceHistory: '[{"date":"2024-01","price":2199},{"date":"2024-02","price":1999},{"date":"2024-03","price":1799}]', store: 'Best Buy', isTracking: true, category: 'Electronics' },
      { productName: 'Herman Miller Aeron Chair', productUrl: 'https://hermanmiller.com/aeron', currentPrice: 1395.00, targetPrice: 1095.00, priceHistory: '[{"date":"2024-01","price":1395},{"date":"2024-02","price":1395}]', store: 'Herman Miller', isTracking: true, category: 'Furniture' },
      { productName: 'iPad Pro 12.9" M2', productUrl: 'https://apple.com/ipad-pro', currentPrice: 1099.00, targetPrice: 899.00, priceHistory: '[{"date":"2024-01","price":1099},{"date":"2024-02","price":1049},{"date":"2024-03","price":1099}]', store: 'Apple Store', isTracking: true, category: 'Electronics' },
      { productName: 'Dyson V15 Detect Vacuum', productUrl: 'https://dyson.com/v15', currentPrice: 749.99, targetPrice: 599.99, priceHistory: '[{"date":"2024-01","price":749},{"date":"2024-02","price":699}]', store: 'Dyson', isTracking: true, category: 'Home' },
      { productName: 'Nike Air Max 90', productUrl: 'https://nike.com/air-max-90', currentPrice: 130.00, targetPrice: 89.99, priceHistory: '[{"date":"2024-01","price":130},{"date":"2024-02","price":130},{"date":"2024-03","price":110}]', store: 'Nike', isTracking: false, category: 'Footwear' },
      { productName: 'Kindle Paperwhite', productUrl: 'https://amazon.com/kindle-paperwhite', currentPrice: 149.99, targetPrice: 109.99, priceHistory: '[{"date":"2024-01","price":149},{"date":"2024-02","price":129}]', store: 'Amazon', isTracking: true, category: 'Electronics' },
      { productName: 'Lego Star Wars UCS Set', productUrl: 'https://lego.com/star-wars-ucs', currentPrice: 849.99, targetPrice: 679.99, priceHistory: '[{"date":"2024-01","price":849},{"date":"2024-02","price":849}]', store: 'Lego', isTracking: true, category: 'Toys' },
      { productName: 'Bose SoundLink Max', productUrl: 'https://bose.com/soundlink-max', currentPrice: 399.00, targetPrice: 299.00, priceHistory: '[{"date":"2024-01","price":399},{"date":"2024-02","price":379}]', store: 'Bose', isTracking: true, category: 'Electronics' },
      { productName: 'Vitamix A3500 Blender', productUrl: 'https://vitamix.com/a3500', currentPrice: 649.95, targetPrice: 499.95, priceHistory: '[{"date":"2024-01","price":649},{"date":"2024-02","price":599}]', store: 'Vitamix', isTracking: false, category: 'Kitchen' },
      { productName: 'PS5 Pro Console', productUrl: 'https://playstation.com/ps5-pro', currentPrice: 699.99, targetPrice: 599.99, priceHistory: '[{"date":"2024-01","price":699},{"date":"2024-02","price":699}]', store: 'PlayStation', isTracking: true, category: 'Gaming' },
      { productName: 'Breville Oracle Touch', productUrl: 'https://breville.com/oracle-touch', currentPrice: 2499.95, targetPrice: 1999.95, priceHistory: '[{"date":"2024-01","price":2499},{"date":"2024-02","price":2499}]', store: 'Breville', isTracking: true, category: 'Kitchen' },
      { productName: 'Theragun Pro Plus', productUrl: 'https://therabody.com/pro-plus', currentPrice: 499.00, targetPrice: 399.00, priceHistory: '[{"date":"2024-01","price":499},{"date":"2024-02","price":449}]', store: 'Therabody', isTracking: true, category: 'Fitness' },
      { productName: 'LG Ultrafine 5K Monitor', productUrl: 'https://lg.com/ultrafine-5k', currentPrice: 1299.99, targetPrice: 999.99, priceHistory: '[{"date":"2024-01","price":1299},{"date":"2024-02","price":1199}]', store: 'LG', isTracking: true, category: 'Electronics' }
    ]);
    console.log('Price Trackers seeded.');

    // Seed Grammar Checks (15 items)
    await GrammarCheck.bulkCreate([
      { title: 'Email Draft Review', originalText: 'Their going to the store tommorrow to by some supplys.', correctedText: 'They\'re going to the store tomorrow to buy some supplies.', corrections: '[{"type":"grammar","original":"Their","corrected":"They\'re"},{"type":"spelling","original":"tommorrow","corrected":"tomorrow"},{"type":"spelling","original":"by","corrected":"buy"},{"type":"spelling","original":"supplys","corrected":"supplies"}]', errorCount: 4, sourceUrl: '', category: 'Email' },
      { title: 'Blog Post Intro', originalText: 'The artical discusses how tecnology has effected our daily lifes.', correctedText: 'The article discusses how technology has affected our daily lives.', corrections: '[{"type":"spelling","original":"artical","corrected":"article"},{"type":"spelling","original":"tecnology","corrected":"technology"},{"type":"grammar","original":"effected","corrected":"affected"},{"type":"spelling","original":"lifes","corrected":"lives"}]', errorCount: 4, sourceUrl: 'https://blog.example.com', category: 'Blog' },
      { title: 'Resume Summary', originalText: 'Experianced software devloper with 5 years of proffesional expirience.', correctedText: 'Experienced software developer with 5 years of professional experience.', corrections: '[{"type":"spelling","original":"Experianced","corrected":"Experienced"},{"type":"spelling","original":"devloper","corrected":"developer"},{"type":"spelling","original":"proffesional","corrected":"professional"},{"type":"spelling","original":"expirience","corrected":"experience"}]', errorCount: 4, sourceUrl: '', category: 'Resume' },
      { title: 'Product Description', originalText: 'This product is more better then the competion and its very affordible.', correctedText: 'This product is better than the competition and it\'s very affordable.', corrections: '[{"type":"grammar","original":"more better","corrected":"better"},{"type":"spelling","original":"then","corrected":"than"},{"type":"spelling","original":"competion","corrected":"competition"},{"type":"grammar","original":"its","corrected":"it\'s"},{"type":"spelling","original":"affordible","corrected":"affordable"}]', errorCount: 5, sourceUrl: '', category: 'Marketing' },
      { title: 'Academic Paper', originalText: 'The reserch indacates that the hipothesis was supported by the datas.', correctedText: 'The research indicates that the hypothesis was supported by the data.', corrections: '[{"type":"spelling","original":"reserch","corrected":"research"},{"type":"spelling","original":"indacates","corrected":"indicates"},{"type":"spelling","original":"hipothesis","corrected":"hypothesis"},{"type":"grammar","original":"datas","corrected":"data"}]', errorCount: 4, sourceUrl: '', category: 'Academic' },
      { title: 'Social Media Post', originalText: 'Just finished an amazing project! Me and my team worked really hardly on it.', correctedText: 'Just finished an amazing project! My team and I worked really hard on it.', corrections: '[{"type":"grammar","original":"Me and my team","corrected":"My team and I"},{"type":"grammar","original":"hardly","corrected":"hard"}]', errorCount: 2, sourceUrl: '', category: 'Social Media' },
      { title: 'Business Proposal', originalText: 'We beleive this partnership will be mutualy benificial for both partys.', correctedText: 'We believe this partnership will be mutually beneficial for both parties.', corrections: '[{"type":"spelling","original":"beleive","corrected":"believe"},{"type":"spelling","original":"mutualy","corrected":"mutually"},{"type":"spelling","original":"benificial","corrected":"beneficial"},{"type":"spelling","original":"partys","corrected":"parties"}]', errorCount: 4, sourceUrl: '', category: 'Business' },
      { title: 'Support Ticket Reply', originalText: 'I appologize for the incovienence. We will definately resolve this issue.', correctedText: 'I apologize for the inconvenience. We will definitely resolve this issue.', corrections: '[{"type":"spelling","original":"appologize","corrected":"apologize"},{"type":"spelling","original":"incovienence","corrected":"inconvenience"},{"type":"spelling","original":"definately","corrected":"definitely"}]', errorCount: 3, sourceUrl: '', category: 'Support' },
      { title: 'Meeting Notes', originalText: 'The team desided to procede with option A irregardless of the cost.', correctedText: 'The team decided to proceed with option A regardless of the cost.', corrections: '[{"type":"spelling","original":"desided","corrected":"decided"},{"type":"spelling","original":"procede","corrected":"proceed"},{"type":"grammar","original":"irregardless","corrected":"regardless"}]', errorCount: 3, sourceUrl: '', category: 'Notes' },
      { title: 'Newsletter Content', originalText: 'Our compeny is commited to providing the best sevice to our costumers.', correctedText: 'Our company is committed to providing the best service to our customers.', corrections: '[{"type":"spelling","original":"compeny","corrected":"company"},{"type":"spelling","original":"commited","corrected":"committed"},{"type":"spelling","original":"sevice","corrected":"service"},{"type":"spelling","original":"costumers","corrected":"customers"}]', errorCount: 4, sourceUrl: '', category: 'Marketing' },
      { title: 'Code Comment Review', originalText: 'This function recieve the user imput and proccess it accordingly.', correctedText: 'This function receives the user input and processes it accordingly.', corrections: '[{"type":"spelling","original":"recieve","corrected":"receives"},{"type":"spelling","original":"imput","corrected":"input"},{"type":"spelling","original":"proccess","corrected":"processes"}]', errorCount: 3, sourceUrl: '', category: 'Development' },
      { title: 'Job Posting', originalText: 'We are looking for a candiate who is responsable and has excelent communication skills.', correctedText: 'We are looking for a candidate who is responsible and has excellent communication skills.', corrections: '[{"type":"spelling","original":"candiate","corrected":"candidate"},{"type":"spelling","original":"responsable","corrected":"responsible"},{"type":"spelling","original":"excelent","corrected":"excellent"}]', errorCount: 3, sourceUrl: '', category: 'HR' },
      { title: 'Technical Documentation', originalText: 'The API endpont acceptes a JSON playload and returnes the responce.', correctedText: 'The API endpoint accepts a JSON payload and returns the response.', corrections: '[{"type":"spelling","original":"endpont","corrected":"endpoint"},{"type":"spelling","original":"acceptes","corrected":"accepts"},{"type":"spelling","original":"playload","corrected":"payload"},{"type":"spelling","original":"returnes","corrected":"returns"},{"type":"spelling","original":"responce","corrected":"response"}]', errorCount: 5, sourceUrl: '', category: 'Documentation' },
      { title: 'Personal Statement', originalText: 'Throught my carreer, I have always strivved to achive excellance.', correctedText: 'Throughout my career, I have always strived to achieve excellence.', corrections: '[{"type":"spelling","original":"Throught","corrected":"Throughout"},{"type":"spelling","original":"carreer","corrected":"career"},{"type":"spelling","original":"strivved","corrected":"strived"},{"type":"spelling","original":"achive","corrected":"achieve"},{"type":"spelling","original":"excellance","corrected":"excellence"}]', errorCount: 5, sourceUrl: '', category: 'Personal' },
      { title: 'Presentation Script', originalText: 'Today I will be discusing the importence of cybersecuirty in the modren workplace.', correctedText: 'Today I will be discussing the importance of cybersecurity in the modern workplace.', corrections: '[{"type":"spelling","original":"discusing","corrected":"discussing"},{"type":"spelling","original":"importence","corrected":"importance"},{"type":"spelling","original":"cybersecuirty","corrected":"cybersecurity"},{"type":"spelling","original":"modren","corrected":"modern"}]', errorCount: 4, sourceUrl: '', category: 'Presentation' }
    ]);
    console.log('Grammar Checks seeded.');

    // Seed Citations (15 items)
    await Citation.bulkCreate([
      { title: 'Attention Is All You Need', authors: 'Vaswani, A., Shazeer, N., Parmar, N.', sourceUrl: 'https://arxiv.org/abs/1706.03762', publicationDate: '2017', publisher: 'NeurIPS', citationType: 'APA', formattedCitation: 'Vaswani, A., Shazeer, N., & Parmar, N. (2017). Attention is all you need. Advances in Neural Information Processing Systems, 30.', category: 'AI/ML' },
      { title: 'Clean Code', authors: 'Martin, Robert C.', sourceUrl: '', publicationDate: '2008', publisher: 'Prentice Hall', citationType: 'APA', formattedCitation: 'Martin, R. C. (2008). Clean code: A handbook of agile software craftsmanship. Prentice Hall.', category: 'Software Engineering' },
      { title: 'Design Patterns', authors: 'Gamma, E., Helm, R., Johnson, R., Vlissides, J.', sourceUrl: '', publicationDate: '1994', publisher: 'Addison-Wesley', citationType: 'MLA', formattedCitation: 'Gamma, Erich, et al. Design Patterns: Elements of Reusable Object-Oriented Software. Addison-Wesley, 1994.', category: 'Software Engineering' },
      { title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin, J., Chang, M., Lee, K., Toutanova, K.', sourceUrl: 'https://arxiv.org/abs/1810.04805', publicationDate: '2019', publisher: 'NAACL', citationType: 'APA', formattedCitation: 'Devlin, J., Chang, M., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of deep bidirectional transformers for language understanding. NAACL-HLT.', category: 'NLP' },
      { title: 'Introduction to Algorithms', authors: 'Cormen, T., Leiserson, C., Rivest, R., Stein, C.', sourceUrl: '', publicationDate: '2009', publisher: 'MIT Press', citationType: 'Chicago', formattedCitation: 'Cormen, Thomas H., et al. Introduction to Algorithms. 3rd ed. MIT Press, 2009.', category: 'Computer Science' },
      { title: 'The Pragmatic Programmer', authors: 'Hunt, A., Thomas, D.', sourceUrl: '', publicationDate: '2019', publisher: 'Addison-Wesley', citationType: 'APA', formattedCitation: 'Hunt, A., & Thomas, D. (2019). The pragmatic programmer: Your journey to mastery (20th anniversary ed.). Addison-Wesley.', category: 'Software Engineering' },
      { title: 'ImageNet Classification with Deep CNNs', authors: 'Krizhevsky, A., Sutskever, I., Hinton, G.', sourceUrl: 'https://papers.nips.cc/paper/4824', publicationDate: '2012', publisher: 'NeurIPS', citationType: 'IEEE', formattedCitation: 'A. Krizhevsky, I. Sutskever, and G. Hinton, "ImageNet classification with deep convolutional neural networks," in Proc. NeurIPS, 2012.', category: 'Computer Vision' },
      { title: 'Thinking, Fast and Slow', authors: 'Kahneman, Daniel', sourceUrl: '', publicationDate: '2011', publisher: 'Farrar, Straus and Giroux', citationType: 'APA', formattedCitation: 'Kahneman, D. (2011). Thinking, fast and slow. Farrar, Straus and Giroux.', category: 'Psychology' },
      { title: 'TCP/IP Illustrated', authors: 'Stevens, W. Richard', sourceUrl: '', publicationDate: '1994', publisher: 'Addison-Wesley', citationType: 'APA', formattedCitation: 'Stevens, W. R. (1994). TCP/IP illustrated, Volume 1: The protocols. Addison-Wesley.', category: 'Networking' },
      { title: 'GPT-4 Technical Report', authors: 'OpenAI', sourceUrl: 'https://arxiv.org/abs/2303.08774', publicationDate: '2023', publisher: 'arXiv', citationType: 'APA', formattedCitation: 'OpenAI. (2023). GPT-4 technical report. arXiv preprint arXiv:2303.08774.', category: 'AI/ML' },
      { title: 'React: Making Faster UI', authors: 'Abramov, D., Clark, A.', sourceUrl: 'https://react.dev/blog', publicationDate: '2023', publisher: 'Meta', citationType: 'APA', formattedCitation: 'Abramov, D., & Clark, A. (2023). React: Making faster user interfaces. Meta Engineering Blog.', category: 'Web Development' },
      { title: 'The Mythical Man-Month', authors: 'Brooks, Frederick P.', sourceUrl: '', publicationDate: '1975', publisher: 'Addison-Wesley', citationType: 'MLA', formattedCitation: 'Brooks, Frederick P. The Mythical Man-Month: Essays on Software Engineering. Addison-Wesley, 1975.', category: 'Project Management' },
      { title: 'Refactoring', authors: 'Fowler, Martin', sourceUrl: '', publicationDate: '2018', publisher: 'Addison-Wesley', citationType: 'APA', formattedCitation: 'Fowler, M. (2018). Refactoring: Improving the design of existing code (2nd ed.). Addison-Wesley.', category: 'Software Engineering' },
      { title: 'Distributed Systems', authors: 'Kleppmann, Martin', sourceUrl: '', publicationDate: '2017', publisher: 'O\'Reilly Media', citationType: 'APA', formattedCitation: 'Kleppmann, M. (2017). Designing data-intensive applications. O\'Reilly Media.', category: 'Distributed Systems' },
      { title: 'Deep Learning', authors: 'Goodfellow, I., Bengio, Y., Courville, A.', sourceUrl: 'https://www.deeplearningbook.org', publicationDate: '2016', publisher: 'MIT Press', citationType: 'APA', formattedCitation: 'Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep learning. MIT Press.', category: 'AI/ML' }
    ]);
    console.log('Citations seeded.');

    // Seed Dark Mode Rules (15 items)
    await DarkModeRule.bulkCreate([
      { siteName: 'Google', siteUrl: 'https://google.com', isEnabled: true, theme: 'dark', brightness: 100, contrast: 100, customCss: 'body { background: #1a1a2e; color: #e0e0e0; }', category: 'Search' },
      { siteName: 'GitHub', siteUrl: 'https://github.com', isEnabled: false, theme: 'dark', brightness: 100, contrast: 100, customCss: '', category: 'Development' },
      { siteName: 'Wikipedia', siteUrl: 'https://wikipedia.org', isEnabled: true, theme: 'dark', brightness: 95, contrast: 105, customCss: 'body { background: #121212; color: #e0e0e0; } a { color: #bb86fc; }', category: 'Reference' },
      { siteName: 'Stack Overflow', siteUrl: 'https://stackoverflow.com', isEnabled: true, theme: 'dim', brightness: 90, contrast: 100, customCss: '', category: 'Development' },
      { siteName: 'Reddit', siteUrl: 'https://reddit.com', isEnabled: true, theme: 'dark', brightness: 100, contrast: 100, customCss: '', category: 'Social' },
      { siteName: 'Medium', siteUrl: 'https://medium.com', isEnabled: true, theme: 'sepia', brightness: 85, contrast: 95, customCss: 'article { background: #1a1a2e; }', category: 'Reading' },
      { siteName: 'Twitter/X', siteUrl: 'https://x.com', isEnabled: false, theme: 'dark', brightness: 100, contrast: 100, customCss: '', category: 'Social' },
      { siteName: 'YouTube', siteUrl: 'https://youtube.com', isEnabled: false, theme: 'dark', brightness: 100, contrast: 100, customCss: '', category: 'Video' },
      { siteName: 'CNN News', siteUrl: 'https://cnn.com', isEnabled: true, theme: 'dark', brightness: 95, contrast: 100, customCss: 'body { background: #0d1117; } .article-body { color: #c9d1d9; }', category: 'News' },
      { siteName: 'Amazon', siteUrl: 'https://amazon.com', isEnabled: true, theme: 'dark', brightness: 90, contrast: 105, customCss: '#nav-belt { background: #1a1a2e !important; }', category: 'Shopping' },
      { siteName: 'LinkedIn', siteUrl: 'https://linkedin.com', isEnabled: true, theme: 'dim', brightness: 95, contrast: 100, customCss: '', category: 'Professional' },
      { siteName: 'Netflix', siteUrl: 'https://netflix.com', isEnabled: false, theme: 'dark', brightness: 100, contrast: 100, customCss: '', category: 'Entertainment' },
      { siteName: 'MDN Web Docs', siteUrl: 'https://developer.mozilla.org', isEnabled: false, theme: 'dark', brightness: 100, contrast: 100, customCss: '', category: 'Documentation' },
      { siteName: 'Hacker News', siteUrl: 'https://news.ycombinator.com', isEnabled: true, theme: 'dark', brightness: 90, contrast: 100, customCss: 'body { background: #1a1a2e; color: #e0e0e0; } a:link { color: #6db3f2; }', category: 'News' },
      { siteName: 'Gmail', siteUrl: 'https://mail.google.com', isEnabled: true, theme: 'dark', brightness: 95, contrast: 100, customCss: '', category: 'Email' }
    ]);
    console.log('Dark Mode Rules seeded.');

    // ==================== NON-AI FEATURES SEED DATA ====================

    // Seed Notes (15 items)
    await Note.bulkCreate([
      { title: 'Project Architecture Notes', content: 'Microservices architecture with API gateway pattern. Each service has its own database. Communication via message queue.', folder: 'Work', tags: 'architecture, microservices', isPinned: true, color: '#1e293b', category: 'Development' },
      { title: 'Meeting Notes - Sprint Planning', content: 'Sprint goals: Complete auth module, fix payment bugs, deploy v2.1. Team velocity: 42 points.', folder: 'Meeting Notes', tags: 'sprint, planning', isPinned: false, color: '#1e293b', category: 'Work' },
      { title: 'Book Recommendations', content: 'Clean Code by Robert Martin, Designing Data-Intensive Applications, The Pragmatic Programmer, Refactoring by Martin Fowler', folder: 'Personal', tags: 'books, reading', isPinned: true, color: '#2d1b69', category: 'Learning' },
      { title: 'API Design Principles', content: 'Use nouns for resources, HTTP verbs for actions. Version your API. Use pagination for lists. Return proper status codes.', folder: 'Reference', tags: 'api, rest, design', isPinned: false, color: '#1e293b', category: 'Development' },
      { title: 'Grocery List', content: 'Milk, eggs, bread, chicken, rice, vegetables, olive oil, cheese, yogurt, fruit', folder: 'Personal', tags: 'shopping, food', isPinned: false, color: '#1b4332', category: 'Personal' },
      { title: 'Git Commands Cheatsheet', content: 'git rebase -i HEAD~3, git stash pop, git cherry-pick <hash>, git bisect start, git reflog', folder: 'Reference', tags: 'git, commands', isPinned: true, color: '#1e293b', category: 'Development' },
      { title: 'Startup Ideas', content: 'AI-powered code review tool, Smart home energy optimizer, Personalized learning platform, Health data aggregator', folder: 'Ideas', tags: 'startup, ideas', isPinned: false, color: '#4a1942', category: 'Business' },
      { title: 'Travel Packing List', content: 'Passport, charger, adapter, toiletries, 3 shirts, 2 pants, jacket, comfortable shoes, headphones, book', folder: 'Personal', tags: 'travel, packing', isPinned: false, color: '#1e293b', category: 'Travel' },
      { title: 'Docker Best Practices', content: 'Use multi-stage builds, minimize layers, use .dockerignore, run as non-root, use specific tags, scan for vulnerabilities', folder: 'Reference', tags: 'docker, devops', isPinned: false, color: '#1e293b', category: 'DevOps' },
      { title: 'Daily Standup Template', content: 'Yesterday: What I completed. Today: What I plan to work on. Blockers: Any impediments.', folder: 'Work', tags: 'standup, agile', isPinned: false, color: '#1e293b', category: 'Work' },
      { title: 'Workout Routine', content: 'Mon: Chest/Triceps, Tue: Back/Biceps, Wed: Rest, Thu: Legs, Fri: Shoulders/Core, Sat: Cardio, Sun: Rest', folder: 'Personal', tags: 'fitness, routine', isPinned: true, color: '#1b3a4b', category: 'Health' },
      { title: 'Interview Prep Questions', content: 'System design: Design Twitter. Coding: Binary tree traversal. Behavioral: Tell me about a challenging project.', folder: 'Work', tags: 'interview, prep', isPinned: false, color: '#1e293b', category: 'Career' },
      { title: 'Recipe: Pasta Carbonara', content: 'Spaghetti, eggs, pecorino romano, guanciale, black pepper. Cook pasta, fry guanciale, mix eggs with cheese, combine.', folder: 'Personal', tags: 'recipe, cooking', isPinned: false, color: '#3d2b1f', category: 'Personal' },
      { title: 'CSS Grid vs Flexbox', content: 'Grid: 2D layouts, complex grid structures. Flexbox: 1D layouts, alignment, distribution. Use Grid for page layout, Flexbox for components.', folder: 'Reference', tags: 'css, layout', isPinned: false, color: '#1e293b', category: 'Development' },
      { title: 'Meditation Journal', content: 'Week 1: 10 min daily, feeling calmer. Week 2: Increased to 15 min. Noticed improved focus during work.', folder: 'Journal', tags: 'meditation, mindfulness', isPinned: false, color: '#1e293b', category: 'Wellness' },
    ]);
    console.log('Notes seeded.');

    // Seed Todos (15 items)
    await Todo.bulkCreate([
      { title: 'Fix login page responsive layout', description: 'The login form breaks on mobile screens below 375px width', priority: 'high', status: 'in_progress', dueDate: '2026-03-25', category: 'Work', tags: 'bug, frontend', isCompleted: false },
      { title: 'Write unit tests for auth module', description: 'Cover login, register, password reset, and token refresh flows', priority: 'high', status: 'pending', dueDate: '2026-03-28', category: 'Work', tags: 'testing, auth', isCompleted: false },
      { title: 'Buy groceries', description: 'Weekly grocery shopping - check the list in Notes', priority: 'medium', status: 'pending', dueDate: '2026-03-22', category: 'Shopping', tags: 'personal, shopping', isCompleted: false },
      { title: 'Renew gym membership', description: 'Annual renewal due, check for promotions', priority: 'low', status: 'pending', dueDate: '2026-04-01', category: 'Health', tags: 'fitness', isCompleted: false },
      { title: 'Prepare Q1 presentation', description: 'Quarterly review slides with team metrics and achievements', priority: 'high', status: 'in_progress', dueDate: '2026-03-30', category: 'Work', tags: 'presentation, review', isCompleted: false },
      { title: 'Update resume', description: 'Add recent project experience and new skills', priority: 'medium', status: 'pending', dueDate: '2026-04-15', category: 'Personal', tags: 'career', isCompleted: false },
      { title: 'Pay electricity bill', description: 'Monthly utility bill payment', priority: 'high', status: 'completed', dueDate: '2026-03-20', category: 'Finance', tags: 'bills, monthly', isCompleted: true },
      { title: 'Read Clean Architecture book', description: 'Finish chapters 10-15 this week', priority: 'low', status: 'in_progress', dueDate: '2026-04-10', category: 'Learning', tags: 'reading, development', isCompleted: false },
      { title: 'Schedule dentist appointment', description: 'Routine 6-month checkup', priority: 'medium', status: 'pending', dueDate: '2026-04-05', category: 'Health', tags: 'health, appointment', isCompleted: false },
      { title: 'Refactor database queries', description: 'Optimize N+1 queries in the dashboard endpoint', priority: 'medium', status: 'pending', dueDate: '2026-04-01', category: 'Work', tags: 'optimization, backend', isCompleted: false },
      { title: 'Plan weekend hiking trip', description: 'Research trails, check weather, pack gear', priority: 'low', status: 'pending', dueDate: '2026-03-28', category: 'Personal', tags: 'hiking, outdoors', isCompleted: false },
      { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for auto-deploy to staging', priority: 'high', status: 'completed', dueDate: '2026-03-18', category: 'Work', tags: 'devops, ci/cd', isCompleted: true },
      { title: 'Clean and organize desk', description: 'Declutter workspace, organize cables, clean monitor', priority: 'low', status: 'pending', dueDate: '2026-03-23', category: 'Home', tags: 'cleaning, organization', isCompleted: false },
      { title: 'Review pull requests', description: 'Review 3 pending PRs from team members', priority: 'high', status: 'in_progress', dueDate: '2026-03-22', category: 'Work', tags: 'code review', isCompleted: false },
      { title: 'Learn TypeScript generics', description: 'Complete advanced TypeScript tutorial on generics and utility types', priority: 'medium', status: 'pending', dueDate: '2026-04-08', category: 'Learning', tags: 'typescript, learning', isCompleted: false },
    ]);
    console.log('Todos seeded.');

    // Seed Pomodoro Sessions (15 items)
    await PomodoroSession.bulkCreate([
      { taskName: 'Frontend Development', workDuration: 25, breakDuration: 5, sessionsCompleted: 4, totalMinutes: 100, status: 'completed', category: 'Development', notes: 'Completed login page redesign' },
      { taskName: 'Code Review', workDuration: 25, breakDuration: 5, sessionsCompleted: 2, totalMinutes: 50, status: 'completed', category: 'Development', notes: 'Reviewed 3 PRs' },
      { taskName: 'Writing Documentation', workDuration: 30, breakDuration: 10, sessionsCompleted: 3, totalMinutes: 90, status: 'completed', category: 'Writing', notes: 'API docs for v2' },
      { taskName: 'Bug Fixing', workDuration: 25, breakDuration: 5, sessionsCompleted: 6, totalMinutes: 150, status: 'completed', category: 'Development', notes: 'Fixed 4 critical bugs' },
      { taskName: 'Study Algorithms', workDuration: 45, breakDuration: 15, sessionsCompleted: 2, totalMinutes: 90, status: 'completed', category: 'Study', notes: 'Dynamic programming problems' },
      { taskName: 'Design Mockups', workDuration: 25, breakDuration: 5, sessionsCompleted: 3, totalMinutes: 75, status: 'completed', category: 'Design', notes: 'Dashboard wireframes' },
      { taskName: 'Database Migration', workDuration: 25, breakDuration: 5, sessionsCompleted: 2, totalMinutes: 50, status: 'in_progress', category: 'Development', notes: 'Migrating to PostgreSQL' },
      { taskName: 'Email Processing', workDuration: 15, breakDuration: 5, sessionsCompleted: 4, totalMinutes: 60, status: 'completed', category: 'Admin', notes: 'Cleared inbox' },
      { taskName: 'Research New Tech', workDuration: 25, breakDuration: 5, sessionsCompleted: 3, totalMinutes: 75, status: 'completed', category: 'Research', notes: 'Evaluated 3 frameworks' },
      { taskName: 'Sprint Planning', workDuration: 25, breakDuration: 5, sessionsCompleted: 2, totalMinutes: 50, status: 'completed', category: 'Planning', notes: 'Planned next sprint tasks' },
      { taskName: 'Unit Testing', workDuration: 25, breakDuration: 5, sessionsCompleted: 5, totalMinutes: 125, status: 'completed', category: 'Development', notes: '85% coverage achieved' },
      { taskName: 'Blog Post Writing', workDuration: 30, breakDuration: 10, sessionsCompleted: 4, totalMinutes: 120, status: 'completed', category: 'Writing', notes: 'React hooks tutorial' },
      { taskName: 'Performance Optimization', workDuration: 25, breakDuration: 5, sessionsCompleted: 3, totalMinutes: 75, status: 'in_progress', category: 'Development', notes: 'Optimizing render cycles' },
      { taskName: 'Learning Rust', workDuration: 45, breakDuration: 15, sessionsCompleted: 2, totalMinutes: 90, status: 'pending', category: 'Study', notes: 'Ownership and borrowing' },
      { taskName: 'Project Setup', workDuration: 25, breakDuration: 5, sessionsCompleted: 1, totalMinutes: 25, status: 'completed', category: 'Development', notes: 'Scaffolded new microservice' },
    ]);
    console.log('Pomodoro Sessions seeded.');

    // Seed Habits (15 items)
    await Habit.bulkCreate([
      { name: 'Morning Meditation', description: '10 minutes of mindfulness meditation', frequency: 'daily', currentStreak: 15, longestStreak: 30, totalCompletions: 120, isActive: true, category: 'Mindfulness', color: '#8b5cf6' },
      { name: 'Exercise', description: '30 minutes of physical activity', frequency: 'daily', currentStreak: 8, longestStreak: 45, totalCompletions: 200, isActive: true, category: 'Fitness', color: '#10b981' },
      { name: 'Read 30 Minutes', description: 'Read technical or non-fiction books', frequency: 'daily', currentStreak: 22, longestStreak: 60, totalCompletions: 180, isActive: true, category: 'Learning', color: '#3b82f6' },
      { name: 'Drink 8 Glasses Water', description: 'Stay hydrated throughout the day', frequency: 'daily', currentStreak: 5, longestStreak: 20, totalCompletions: 90, isActive: true, category: 'Health', color: '#06b6d4' },
      { name: 'Write Journal', description: 'Evening reflection and gratitude journal', frequency: 'daily', currentStreak: 10, longestStreak: 25, totalCompletions: 75, isActive: true, category: 'Mindfulness', color: '#f59e0b' },
      { name: 'Practice Coding', description: 'Solve at least one algorithm problem', frequency: 'daily', currentStreak: 30, longestStreak: 90, totalCompletions: 250, isActive: true, category: 'Learning', color: '#ef4444' },
      { name: 'Take Vitamins', description: 'Morning multivitamin and omega-3', frequency: 'daily', currentStreak: 12, longestStreak: 60, totalCompletions: 300, isActive: true, category: 'Health', color: '#22c55e' },
      { name: 'No Social Media Before Noon', description: 'Avoid social media until after lunch', frequency: 'daily', currentStreak: 3, longestStreak: 14, totalCompletions: 45, isActive: true, category: 'Productivity', color: '#ec4899' },
      { name: 'Weekly Meal Prep', description: 'Prepare meals for the work week', frequency: 'weekly', currentStreak: 6, longestStreak: 12, totalCompletions: 30, isActive: true, category: 'Health', color: '#14b8a6' },
      { name: 'Deep Work Sessions', description: '2 hours of uninterrupted deep work', frequency: '5x per week', currentStreak: 4, longestStreak: 20, totalCompletions: 100, isActive: true, category: 'Productivity', color: '#6366f1' },
      { name: 'Stretch Breaks', description: '5-minute stretch every 2 hours', frequency: 'daily', currentStreak: 7, longestStreak: 15, totalCompletions: 60, isActive: true, category: 'Health', color: '#a855f7' },
      { name: 'Learn a New Word', description: 'Learn one new vocabulary word in another language', frequency: 'daily', currentStreak: 18, longestStreak: 40, totalCompletions: 150, isActive: true, category: 'Learning', color: '#0ea5e9' },
      { name: 'Budget Review', description: 'Review spending and budget compliance', frequency: 'weekly', currentStreak: 3, longestStreak: 8, totalCompletions: 20, isActive: true, category: 'Finance', color: '#f97316' },
      { name: 'Call Family/Friends', description: 'Stay connected with loved ones', frequency: '3x per week', currentStreak: 2, longestStreak: 10, totalCompletions: 40, isActive: true, category: 'Social', color: '#d946ef' },
      { name: 'Digital Declutter', description: 'Clean inbox, organize files, clear downloads', frequency: 'weekly', currentStreak: 4, longestStreak: 8, totalCompletions: 15, isActive: true, category: 'Productivity', color: '#475569' },
    ]);
    console.log('Habits seeded.');

    // Seed Expenses (15 items)
    await Expense.bulkCreate([
      { description: 'Monthly Rent', amount: 2200.00, category: 'Housing', paymentMethod: 'Bank Transfer', date: '2026-03-01', isRecurring: true, tags: 'rent, monthly', notes: 'Apartment rent for March' },
      { description: 'Grocery Shopping', amount: 127.45, category: 'Food', paymentMethod: 'Credit Card', date: '2026-03-15', isRecurring: false, tags: 'groceries, food', notes: 'Weekly groceries from Whole Foods' },
      { description: 'Netflix Subscription', amount: 15.99, category: 'Subscriptions', paymentMethod: 'Credit Card', date: '2026-03-01', isRecurring: true, tags: 'streaming, entertainment', notes: 'Monthly subscription' },
      { description: 'Gas Station', amount: 52.30, category: 'Transport', paymentMethod: 'Debit Card', date: '2026-03-12', isRecurring: false, tags: 'gas, car', notes: 'Full tank' },
      { description: 'Gym Membership', amount: 49.99, category: 'Health', paymentMethod: 'Credit Card', date: '2026-03-01', isRecurring: true, tags: 'fitness, gym', notes: 'Monthly gym fee' },
      { description: 'AWS Cloud Services', amount: 45.67, category: 'Subscriptions', paymentMethod: 'Credit Card', date: '2026-03-05', isRecurring: true, tags: 'cloud, hosting', notes: 'EC2 and S3 usage' },
      { description: 'Coffee Shop', amount: 5.75, category: 'Food', paymentMethod: 'Cash', date: '2026-03-18', isRecurring: false, tags: 'coffee, cafe', notes: 'Latte and muffin' },
      { description: 'Electric Bill', amount: 89.42, category: 'Utilities', paymentMethod: 'Bank Transfer', date: '2026-03-10', isRecurring: true, tags: 'utilities, electric', notes: 'Monthly electric bill' },
      { description: 'Online Course - React Advanced', amount: 29.99, category: 'Education', paymentMethod: 'PayPal', date: '2026-03-08', isRecurring: false, tags: 'learning, course', notes: 'Udemy course on sale' },
      { description: 'Restaurant Dinner', amount: 67.80, category: 'Food', paymentMethod: 'Credit Card', date: '2026-03-14', isRecurring: false, tags: 'dining, restaurant', notes: 'Birthday dinner with friends' },
      { description: 'Phone Bill', amount: 85.00, category: 'Utilities', paymentMethod: 'Bank Transfer', date: '2026-03-05', isRecurring: true, tags: 'phone, monthly', notes: 'Unlimited plan' },
      { description: 'New Headphones', amount: 199.99, category: 'Shopping', paymentMethod: 'Credit Card', date: '2026-03-10', isRecurring: false, tags: 'electronics, headphones', notes: 'Sony WH-1000XM5' },
      { description: 'Car Insurance', amount: 145.00, category: 'Insurance', paymentMethod: 'Bank Transfer', date: '2026-03-01', isRecurring: true, tags: 'insurance, car', notes: 'Quarterly payment' },
      { description: 'Uber Ride', amount: 18.50, category: 'Transport', paymentMethod: 'PayPal', date: '2026-03-16', isRecurring: false, tags: 'uber, transport', notes: 'Ride to airport' },
      { description: 'Domain Renewal', amount: 12.99, category: 'Subscriptions', paymentMethod: 'Credit Card', date: '2026-03-20', isRecurring: true, tags: 'domain, hosting', notes: 'mysite.com annual renewal' },
    ]);
    console.log('Expenses seeded.');

    // Seed Clipboard Entries (15 items)
    await ClipboardEntry.bulkCreate([
      { content: 'const handleSubmit = async (e) => { e.preventDefault(); await api.post("/data", formData); }', contentType: 'code', sourceUrl: 'https://github.com', isFavorite: true, category: 'Code', tags: 'react, form' },
      { content: 'SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.name', contentType: 'code', sourceUrl: 'https://stackoverflow.com', isFavorite: true, category: 'SQL', tags: 'sql, query' },
      { content: 'john.doe@example.com', contentType: 'email', sourceUrl: '', isFavorite: false, category: 'Contact', tags: 'email' },
      { content: 'https://docs.google.com/spreadsheets/d/abc123/edit', contentType: 'url', sourceUrl: '', isFavorite: false, category: 'Link', tags: 'google, docs' },
      { content: '123 Main Street, San Francisco, CA 94102', contentType: 'address', sourceUrl: '', isFavorite: false, category: 'Address', tags: 'address, sf' },
      { content: 'docker run -d --name postgres -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:15', contentType: 'code', sourceUrl: 'https://docs.docker.com', isFavorite: true, category: 'DevOps', tags: 'docker, postgres' },
      { content: 'The quick brown fox jumps over the lazy dog', contentType: 'text', sourceUrl: '', isFavorite: false, category: 'General', tags: 'text, sample' },
      { content: 'npm install --save-dev @types/node @types/react typescript', contentType: 'code', sourceUrl: 'https://npmjs.com', isFavorite: false, category: 'Code', tags: 'npm, typescript' },
      { content: '+1 (555) 123-4567', contentType: 'phone', sourceUrl: '', isFavorite: false, category: 'Contact', tags: 'phone' },
      { content: 'git log --oneline --graph --all --decorate', contentType: 'code', sourceUrl: '', isFavorite: true, category: 'Git', tags: 'git, command' },
      { content: 'Meeting scheduled for March 25, 2026 at 2:00 PM PST', contentType: 'text', sourceUrl: 'https://calendar.google.com', isFavorite: false, category: 'Schedule', tags: 'meeting, calendar' },
      { content: '{"name":"John","age":30,"city":"SF","skills":["React","Node","Python"]}', contentType: 'code', sourceUrl: '', isFavorite: false, category: 'JSON', tags: 'json, data' },
      { content: 'border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);', contentType: 'code', sourceUrl: 'https://tailwindcss.com', isFavorite: false, category: 'CSS', tags: 'css, style' },
      { content: 'API Key: sk-proj-abc123...xyz789', contentType: 'text', sourceUrl: '', isFavorite: true, category: 'Credentials', tags: 'api, key' },
      { content: 'ssh -i ~/.ssh/id_rsa user@192.168.1.100', contentType: 'code', sourceUrl: '', isFavorite: false, category: 'DevOps', tags: 'ssh, command' },
    ]);
    console.log('Clipboard Entries seeded.');

    // Seed Blocked Sites (15 items)
    await BlockedSite.bulkCreate([
      { siteName: 'Twitter/X', url: 'https://x.com', reason: 'Distraction', schedule: 'Weekdays 9-5', isActive: true, blockedCount: 145, category: 'Social Media' },
      { siteName: 'Reddit', url: 'https://reddit.com', reason: 'Time Waster', schedule: 'Weekdays 9-5', isActive: true, blockedCount: 230, category: 'Social Media' },
      { siteName: 'YouTube', url: 'https://youtube.com', reason: 'Distraction', schedule: 'Weekdays 9-12', isActive: true, blockedCount: 89, category: 'Video' },
      { siteName: 'Instagram', url: 'https://instagram.com', reason: 'Distraction', schedule: 'Weekdays 9-5', isActive: true, blockedCount: 167, category: 'Social Media' },
      { siteName: 'TikTok', url: 'https://tiktok.com', reason: 'Time Waster', schedule: 'Always', isActive: true, blockedCount: 312, category: 'Social Media' },
      { siteName: 'Facebook', url: 'https://facebook.com', reason: 'Distraction', schedule: 'Weekdays 9-5', isActive: true, blockedCount: 78, category: 'Social Media' },
      { siteName: 'Netflix', url: 'https://netflix.com', reason: 'Productivity', schedule: 'Weekdays 9-6', isActive: false, blockedCount: 23, category: 'Entertainment' },
      { siteName: 'Twitch', url: 'https://twitch.tv', reason: 'Distraction', schedule: 'Weekdays 9-5', isActive: true, blockedCount: 56, category: 'Entertainment' },
      { siteName: 'Amazon', url: 'https://amazon.com', reason: 'Focus Mode', schedule: 'Weekdays 9-12', isActive: false, blockedCount: 34, category: 'Shopping' },
      { siteName: 'Hacker News', url: 'https://news.ycombinator.com', reason: 'Time Waster', schedule: 'Weekdays 9-11', isActive: true, blockedCount: 67, category: 'News' },
      { siteName: 'ESPN', url: 'https://espn.com', reason: 'Distraction', schedule: 'Weekdays 9-5', isActive: false, blockedCount: 12, category: 'Entertainment' },
      { siteName: 'Discord', url: 'https://discord.com', reason: 'Distraction', schedule: 'Weekdays 9-12', isActive: true, blockedCount: 91, category: 'Social Media' },
      { siteName: 'Pinterest', url: 'https://pinterest.com', reason: 'Time Waster', schedule: 'Weekdays 9-5', isActive: false, blockedCount: 19, category: 'Social Media' },
      { siteName: 'LinkedIn Feed', url: 'https://linkedin.com/feed', reason: 'Distraction', schedule: 'Weekdays 9-12', isActive: true, blockedCount: 43, category: 'Social Media' },
      { siteName: 'BuzzFeed', url: 'https://buzzfeed.com', reason: 'Time Waster', schedule: 'Always', isActive: true, blockedCount: 8, category: 'News' },
    ]);
    console.log('Blocked Sites seeded.');

    // Seed Quick Links (15 items)
    await QuickLink.bulkCreate([
      { title: 'GitHub Dashboard', url: 'https://github.com', description: 'My GitHub repositories and PRs', icon: '🐙', folder: 'Dev Tools', clickCount: 342, isPinned: true, category: 'Development' },
      { title: 'Google Calendar', url: 'https://calendar.google.com', description: 'Schedule and meetings', icon: '📅', folder: 'Work', clickCount: 256, isPinned: true, category: 'Productivity' },
      { title: 'Slack Workspace', url: 'https://app.slack.com', description: 'Team communication', icon: '💬', folder: 'Work', clickCount: 189, isPinned: true, category: 'Communication' },
      { title: 'Stack Overflow', url: 'https://stackoverflow.com', description: 'Programming Q&A', icon: '📚', folder: 'Dev Tools', clickCount: 145, isPinned: false, category: 'Development' },
      { title: 'Figma', url: 'https://figma.com', description: 'Design files and prototypes', icon: '🎨', folder: 'Dev Tools', clickCount: 98, isPinned: false, category: 'Design' },
      { title: 'Gmail', url: 'https://mail.google.com', description: 'Email inbox', icon: '📧', folder: 'Work', clickCount: 210, isPinned: true, category: 'Communication' },
      { title: 'Notion', url: 'https://notion.so', description: 'Notes and documentation', icon: '📝', folder: 'Work', clickCount: 167, isPinned: false, category: 'Productivity' },
      { title: 'AWS Console', url: 'https://console.aws.amazon.com', description: 'Cloud infrastructure', icon: '☁️', folder: 'Dev Tools', clickCount: 78, isPinned: false, category: 'DevOps' },
      { title: 'ChatGPT', url: 'https://chat.openai.com', description: 'AI assistant', icon: '🤖', folder: 'Dev Tools', clickCount: 134, isPinned: true, category: 'AI' },
      { title: 'YouTube Music', url: 'https://music.youtube.com', description: 'Music streaming', icon: '🎵', folder: 'Entertainment', clickCount: 89, isPinned: false, category: 'Entertainment' },
      { title: 'Jira Board', url: 'https://jira.atlassian.com', description: 'Project tracking', icon: '📋', folder: 'Work', clickCount: 156, isPinned: false, category: 'Project Management' },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Web documentation reference', icon: '📖', folder: 'Reference', clickCount: 67, isPinned: false, category: 'Development' },
      { title: 'Vercel Dashboard', url: 'https://vercel.com/dashboard', description: 'Deployment platform', icon: '▲', folder: 'Dev Tools', clickCount: 45, isPinned: false, category: 'DevOps' },
      { title: 'Google Drive', url: 'https://drive.google.com', description: 'Cloud file storage', icon: '📁', folder: 'Work', clickCount: 112, isPinned: false, category: 'Storage' },
      { title: 'LinkedIn', url: 'https://linkedin.com', description: 'Professional networking', icon: '💼', folder: 'Social', clickCount: 34, isPinned: false, category: 'Social' },
    ]);
    console.log('Quick Links seeded.');

    // Seed Saved Sessions (15 items)
    await SavedSession.bulkCreate([
      { name: 'Morning Work Setup', description: 'Typical morning work tabs', tabs: '[{"title":"Gmail","url":"https://mail.google.com"},{"title":"Slack","url":"https://app.slack.com"},{"title":"Jira","url":"https://jira.atlassian.com"},{"title":"GitHub","url":"https://github.com"}]', tabCount: 4, windowCount: 1, isAutoSaved: false, category: 'Work' },
      { name: 'Development Environment', description: 'Full dev setup with docs and tools', tabs: '[{"title":"GitHub","url":"https://github.com"},{"title":"Stack Overflow","url":"https://stackoverflow.com"},{"title":"MDN","url":"https://developer.mozilla.org"},{"title":"localhost:3000","url":"http://localhost:3000"}]', tabCount: 4, windowCount: 2, isAutoSaved: false, category: 'Development' },
      { name: 'Research Session', description: 'Academic research tabs', tabs: '[{"title":"Google Scholar","url":"https://scholar.google.com"},{"title":"ArXiv","url":"https://arxiv.org"},{"title":"Papers with Code","url":"https://paperswithcode.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: false, category: 'Research' },
      { name: 'Weekend Browsing', description: 'Casual weekend tabs', tabs: '[{"title":"YouTube","url":"https://youtube.com"},{"title":"Reddit","url":"https://reddit.com"},{"title":"News","url":"https://news.google.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: true, category: 'Personal' },
      { name: 'Design Review', description: 'Design tools and references', tabs: '[{"title":"Figma","url":"https://figma.com"},{"title":"Dribbble","url":"https://dribbble.com"},{"title":"Coolors","url":"https://coolors.co"}]', tabCount: 3, windowCount: 1, isAutoSaved: false, category: 'Design' },
      { name: 'Meeting Prep', description: 'Tabs for standup meeting', tabs: '[{"title":"Jira Board","url":"https://jira.atlassian.com"},{"title":"Confluence","url":"https://confluence.com"},{"title":"Google Meet","url":"https://meet.google.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: false, category: 'Meeting' },
      { name: 'Learning Session', description: 'Online courses and tutorials', tabs: '[{"title":"Udemy","url":"https://udemy.com"},{"title":"freeCodeCamp","url":"https://freecodecamp.org"},{"title":"YouTube Tutorials","url":"https://youtube.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: false, category: 'Development' },
      { name: 'DevOps Dashboard', description: 'Infrastructure monitoring', tabs: '[{"title":"AWS Console","url":"https://console.aws.amazon.com"},{"title":"Grafana","url":"https://grafana.com"},{"title":"DataDog","url":"https://datadoghq.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: false, category: 'Development' },
      { name: 'Shopping Session', description: 'Online shopping comparison', tabs: '[{"title":"Amazon","url":"https://amazon.com"},{"title":"Best Buy","url":"https://bestbuy.com"},{"title":"Newegg","url":"https://newegg.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: true, category: 'Personal' },
      { name: 'Finance Review', description: 'Banking and investment tabs', tabs: '[{"title":"Bank","url":"https://chase.com"},{"title":"Investments","url":"https://vanguard.com"},{"title":"Budget","url":"https://mint.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: false, category: 'Personal' },
      { name: 'API Testing', description: 'API development and testing tools', tabs: '[{"title":"Postman","url":"https://postman.co"},{"title":"Swagger","url":"https://swagger.io"},{"title":"API Docs","url":"http://localhost:3001/api"}]', tabCount: 3, windowCount: 1, isAutoSaved: false, category: 'Development' },
      { name: 'Social Media Management', description: 'All social platforms', tabs: '[{"title":"Twitter","url":"https://x.com"},{"title":"LinkedIn","url":"https://linkedin.com"},{"title":"Instagram","url":"https://instagram.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: false, category: 'Personal' },
      { name: 'Blog Writing', description: 'Writing and publishing tools', tabs: '[{"title":"Medium","url":"https://medium.com"},{"title":"Grammarly","url":"https://grammarly.com"},{"title":"Unsplash","url":"https://unsplash.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: false, category: 'Personal' },
      { name: 'Job Search', description: 'Job hunting session', tabs: '[{"title":"LinkedIn Jobs","url":"https://linkedin.com/jobs"},{"title":"Indeed","url":"https://indeed.com"},{"title":"Glassdoor","url":"https://glassdoor.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: false, category: 'Personal' },
      { name: 'Friday EOD Snapshot', description: 'Auto-saved end of week state', tabs: '[{"title":"Email","url":"https://mail.google.com"},{"title":"Calendar","url":"https://calendar.google.com"},{"title":"Docs","url":"https://docs.google.com"}]', tabCount: 3, windowCount: 1, isAutoSaved: true, category: 'Work' },
    ]);
    console.log('Saved Sessions seeded.');

    // Seed Countdowns (15 items)
    await Countdown.bulkCreate([
      { title: 'Product Launch v3.0', targetDate: '2026-06-15', description: 'Major product release with new AI features', color: '#6366f1', isActive: true, notifyBefore: '1 week', category: 'Launch' },
      { title: 'Summer Vacation', targetDate: '2026-07-20', description: 'Two week vacation to Japan', color: '#10b981', isActive: true, notifyBefore: '2 weeks', category: 'Travel' },
      { title: 'Conference Talk', targetDate: '2026-05-10', description: 'Presenting at ReactConf 2026', color: '#f59e0b', isActive: true, notifyBefore: '1 week', category: 'Event' },
      { title: 'Birthday', targetDate: '2026-08-14', description: 'My birthday celebration plans', color: '#ec4899', isActive: true, notifyBefore: '1 week', category: 'Birthday' },
      { title: 'Tax Deadline', targetDate: '2026-04-15', description: 'File annual tax returns', color: '#ef4444', isActive: true, notifyBefore: '2 weeks', category: 'Deadline' },
      { title: 'Sprint Deadline', targetDate: '2026-04-01', description: 'Current sprint ends', color: '#3b82f6', isActive: true, notifyBefore: '3 days', category: 'Deadline' },
      { title: 'New Year 2027', targetDate: '2027-01-01', description: 'Happy New Year countdown', color: '#8b5cf6', isActive: true, notifyBefore: '1 day', category: 'Holiday' },
      { title: 'Annual Review', targetDate: '2026-06-01', description: 'Performance review meeting with manager', color: '#14b8a6', isActive: true, notifyBefore: '1 week', category: 'Work' },
      { title: 'Wedding Anniversary', targetDate: '2026-09-22', description: 'Anniversary dinner reservation', color: '#d946ef', isActive: true, notifyBefore: '1 week', category: 'Personal' },
      { title: 'Certification Exam', targetDate: '2026-05-30', description: 'AWS Solutions Architect exam', color: '#f97316', isActive: true, notifyBefore: '2 weeks', category: 'Deadline' },
      { title: 'Lease Renewal', targetDate: '2026-08-01', description: 'Apartment lease renewal deadline', color: '#475569', isActive: true, notifyBefore: '1 month', category: 'Deadline' },
      { title: 'Hackathon', targetDate: '2026-04-20', description: 'Company internal hackathon weekend', color: '#22c55e', isActive: true, notifyBefore: '1 week', category: 'Event' },
      { title: 'Book Club Meeting', targetDate: '2026-04-05', description: 'Monthly book discussion group', color: '#0ea5e9', isActive: true, notifyBefore: '1 day', category: 'Meeting' },
      { title: 'Marathon Race Day', targetDate: '2026-10-12', description: 'City marathon - 26.2 miles', color: '#dc2626', isActive: true, notifyBefore: '1 week', category: 'Event' },
      { title: 'Black Friday', targetDate: '2026-11-27', description: 'Shopping deals day', color: '#1e293b', isActive: false, notifyBefore: '1 day', category: 'Holiday' },
    ]);
    console.log('Countdowns seeded.');

    // Seed Color Palettes (15 items)
    await ColorPalette.bulkCreate([
      { name: 'Ocean Breeze', colors: '#0077b6, #00b4d8, #90e0ef, #caf0f8, #03045e', description: 'Cool ocean-inspired palette', sourceUrl: '', isFavorite: true, tags: 'blue, ocean, cool', category: 'Nature' },
      { name: 'Sunset Glow', colors: '#ff6b6b, #feca57, #ff9ff3, #54a0ff, #5f27cd', description: 'Warm sunset colors', sourceUrl: '', isFavorite: true, tags: 'warm, sunset, vibrant', category: 'Vibrant' },
      { name: 'Forest Dark', colors: '#1b4332, #2d6a4f, #40916c, #52b788, #74c69d', description: 'Dark forest green palette', sourceUrl: '', isFavorite: false, tags: 'green, dark, forest', category: 'Dark' },
      { name: 'Minimal Grays', colors: '#f8f9fa, #e9ecef, #adb5bd, #495057, #212529', description: 'Clean grayscale for minimal design', sourceUrl: '', isFavorite: true, tags: 'gray, minimal, clean', category: 'Minimal' },
      { name: 'Neon Nights', colors: '#ff006e, #8338ec, #3a86ff, #06d6a0, #ffbe0b', description: 'Electric neon color scheme', sourceUrl: '', isFavorite: false, tags: 'neon, bright, electric', category: 'Vibrant' },
      { name: 'Pastel Dream', colors: '#ffc8dd, #ffafcc, #bde0fe, #a2d2ff, #cdb4db', description: 'Soft pastel tones', sourceUrl: '', isFavorite: true, tags: 'pastel, soft, light', category: 'Pastel' },
      { name: 'Material Dark', colors: '#121212, #1e1e1e, #2d2d2d, #bb86fc, #03dac6', description: 'Material Design dark theme', sourceUrl: '', isFavorite: false, tags: 'material, dark, ui', category: 'UI/UX' },
      { name: 'Brand Primary', colors: '#6366f1, #818cf8, #a5b4fc, #c7d2fe, #e0e7ff', description: 'Primary brand indigo palette', sourceUrl: '', isFavorite: true, tags: 'brand, indigo, primary', category: 'Branding' },
      { name: 'Autumn Harvest', colors: '#6b2737, #c44536, #e16f44, #f0c87e, #2c5530', description: 'Warm autumn seasonal colors', sourceUrl: '', isFavorite: false, tags: 'autumn, warm, harvest', category: 'Nature' },
      { name: 'Retro 80s', colors: '#ff1493, #00ffff, #ff69b4, #7b68ee, #ffd700', description: 'Retro 1980s inspired palette', sourceUrl: '', isFavorite: false, tags: 'retro, 80s, vintage', category: 'Retro' },
      { name: 'Earthy Tones', colors: '#d4a373, #ccd5ae, #e9edc9, #fefae0, #faedcd', description: 'Natural earthy color scheme', sourceUrl: '', isFavorite: false, tags: 'earth, natural, warm', category: 'Nature' },
      { name: 'Gradient Blues', colors: '#667eea, #764ba2, #63b3ed, #4fd1c5, #38b2ac', description: 'Blue to purple gradient set', sourceUrl: '', isFavorite: false, tags: 'gradient, blue, purple', category: 'Gradient' },
      { name: 'Dashboard Theme', colors: '#0f172a, #1e293b, #334155, #6366f1, #8b5cf6', description: 'Dark dashboard color scheme', sourceUrl: '', isFavorite: true, tags: 'dashboard, dark, ui', category: 'UI/UX' },
      { name: 'Coral Reef', colors: '#ff7f50, #ff6347, #ee6aa7, #da70d6, #ba55d3', description: 'Coral and pink warm palette', sourceUrl: '', isFavorite: false, tags: 'coral, pink, warm', category: 'Vibrant' },
      { name: 'Monochrome Blue', colors: '#011627, #1b2838, #2e4057, #4a6fa5, #6998ab', description: 'Single hue blue variations', sourceUrl: '', isFavorite: false, tags: 'blue, monochrome, single', category: 'Minimal' },
    ]);
    console.log('Color Palettes seeded.');

    // Seed Snippets (15 items)
    await Snippet.bulkCreate([
      { title: 'React useEffect Cleanup', code: 'useEffect(() => {\n  const controller = new AbortController();\n  fetchData(controller.signal);\n  return () => controller.abort();\n}, []);', language: 'javascript', description: 'Proper useEffect cleanup with AbortController', tags: 'react, hooks, cleanup', usageCount: 23, isFavorite: true, category: 'UI Component' },
      { title: 'Express Error Handler', code: 'app.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(err.status || 500).json({\n    error: err.message || "Internal Server Error"\n  });\n});', language: 'javascript', description: 'Global Express error handling middleware', tags: 'express, error, middleware', usageCount: 15, isFavorite: true, category: 'API' },
      { title: 'Python List Comprehension', code: 'filtered = [item for item in data if item["status"] == "active" and item["score"] > 80]', language: 'python', description: 'Filter list with multiple conditions', tags: 'python, list, filter', usageCount: 8, isFavorite: false, category: 'Utility' },
      { title: 'SQL Upsert (PostgreSQL)', code: 'INSERT INTO users (email, name, updated_at)\nVALUES ($1, $2, NOW())\nON CONFLICT (email)\nDO UPDATE SET name = EXCLUDED.name, updated_at = NOW();', language: 'sql', description: 'Insert or update on conflict', tags: 'sql, postgres, upsert', usageCount: 12, isFavorite: true, category: 'Database' },
      { title: 'CSS Flexbox Center', code: '.center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}', language: 'css', description: 'Center content vertically and horizontally', tags: 'css, flexbox, center', usageCount: 31, isFavorite: true, category: 'UI Component' },
      { title: 'Bash Find and Replace', code: 'find . -type f -name "*.js" -exec sed -i "" "s/oldText/newText/g" {} +', language: 'bash', description: 'Recursive find and replace in files', tags: 'bash, find, sed', usageCount: 6, isFavorite: false, category: 'DevOps' },
      { title: 'TypeScript Generic Fetch', code: 'async function fetchData<T>(url: string): Promise<T> {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(res.statusText);\n  return res.json() as Promise<T>;\n}', language: 'typescript', description: 'Type-safe fetch wrapper with generics', tags: 'typescript, fetch, generics', usageCount: 18, isFavorite: true, category: 'API' },
      { title: 'Docker Compose Template', code: 'version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n    depends_on:\n      - db\n  db:\n    image: postgres:15\n    volumes:\n      - pgdata:/var/lib/postgresql/data\nvolumes:\n  pgdata:', language: 'bash', description: 'Basic Docker Compose with app and database', tags: 'docker, compose, template', usageCount: 9, isFavorite: false, category: 'DevOps' },
      { title: 'Jest Mock Function', code: 'const mockFn = jest.fn().mockResolvedValue({ data: "test" });\njest.mock("../api", () => ({\n  fetchData: mockFn\n}));', language: 'javascript', description: 'Mock async function in Jest tests', tags: 'jest, mock, testing', usageCount: 14, isFavorite: false, category: 'Testing' },
      { title: 'Go HTTP Handler', code: 'func handleGetUsers(w http.ResponseWriter, r *http.Request) {\n  w.Header().Set("Content-Type", "application/json")\n  users := getUsers()\n  json.NewEncoder(w).Encode(users)\n}', language: 'go', description: 'Basic Go HTTP handler with JSON response', tags: 'go, http, handler', usageCount: 5, isFavorite: false, category: 'API' },
      { title: 'HTML Meta Tags Template', code: '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<meta name="description" content="Page description">\n<meta property="og:title" content="Title">\n<meta property="og:image" content="image.jpg">', language: 'html', description: 'Essential HTML meta tags for SEO', tags: 'html, meta, seo', usageCount: 11, isFavorite: false, category: 'Config' },
      { title: 'Python Decorator Pattern', code: 'def retry(max_attempts=3):\n  def decorator(func):\n    def wrapper(*args, **kwargs):\n      for i in range(max_attempts):\n        try:\n          return func(*args, **kwargs)\n        except Exception as e:\n          if i == max_attempts - 1:\n            raise e\n    return wrapper\n  return decorator', language: 'python', description: 'Retry decorator with configurable attempts', tags: 'python, decorator, retry', usageCount: 7, isFavorite: true, category: 'Utility' },
      { title: 'Rust Error Handling', code: 'fn read_file(path: &str) -> Result<String, Box<dyn std::error::Error>> {\n  let content = std::fs::read_to_string(path)?;\n  Ok(content)\n}', language: 'rust', description: 'Rust function with Result error handling', tags: 'rust, error, result', usageCount: 3, isFavorite: false, category: 'Utility' },
      { title: 'Tailwind Card Component', code: '<div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">\n  <h3 class="text-lg font-semibold text-gray-900">Title</h3>\n  <p class="mt-2 text-gray-600">Description</p>\n</div>', language: 'html', description: 'Tailwind CSS card component', tags: 'tailwind, card, component', usageCount: 19, isFavorite: true, category: 'UI Component' },
      { title: 'GitHub Actions CI', code: 'name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n      - run: npm ci\n      - run: npm test', language: 'bash', description: 'Basic GitHub Actions CI workflow', tags: 'github, actions, ci', usageCount: 8, isFavorite: false, category: 'DevOps' },
    ]);
    console.log('Snippets seeded.');

    // Seed RSS Feeds (15 items)
    await RSSFeed.bulkCreate([
      { title: 'Hacker News', feedUrl: 'https://news.ycombinator.com/rss', siteUrl: 'https://news.ycombinator.com', description: 'Tech news and discussion', lastFetched: '2026-03-21', itemCount: 30, isActive: true, category: 'Tech' },
      { title: 'TechCrunch', feedUrl: 'https://techcrunch.com/feed/', siteUrl: 'https://techcrunch.com', description: 'Startup and technology news', lastFetched: '2026-03-21', itemCount: 25, isActive: true, category: 'Tech' },
      { title: 'CSS-Tricks', feedUrl: 'https://css-tricks.com/feed/', siteUrl: 'https://css-tricks.com', description: 'Web design and development tips', lastFetched: '2026-03-20', itemCount: 15, isActive: true, category: 'Development' },
      { title: 'The Verge', feedUrl: 'https://www.theverge.com/rss/index.xml', siteUrl: 'https://theverge.com', description: 'Technology, science, and culture', lastFetched: '2026-03-21', itemCount: 40, isActive: true, category: 'News' },
      { title: 'Smashing Magazine', feedUrl: 'https://www.smashingmagazine.com/feed/', siteUrl: 'https://smashingmagazine.com', description: 'Web design and development articles', lastFetched: '2026-03-19', itemCount: 12, isActive: true, category: 'Design' },
      { title: 'Dev.to', feedUrl: 'https://dev.to/feed', siteUrl: 'https://dev.to', description: 'Community of software developers', lastFetched: '2026-03-21', itemCount: 50, isActive: true, category: 'Development' },
      { title: 'React Blog', feedUrl: 'https://react.dev/blog/rss.xml', siteUrl: 'https://react.dev', description: 'Official React.js blog', lastFetched: '2026-03-15', itemCount: 5, isActive: true, category: 'Development' },
      { title: 'BBC News', feedUrl: 'https://feeds.bbci.co.uk/news/rss.xml', siteUrl: 'https://bbc.com/news', description: 'World news from BBC', lastFetched: '2026-03-21', itemCount: 35, isActive: false, category: 'News' },
      { title: 'GitHub Blog', feedUrl: 'https://github.blog/feed/', siteUrl: 'https://github.blog', description: 'GitHub product updates and engineering', lastFetched: '2026-03-20', itemCount: 8, isActive: true, category: 'Development' },
      { title: 'A List Apart', feedUrl: 'https://alistapart.com/main/feed/', siteUrl: 'https://alistapart.com', description: 'Web standards and best practices', lastFetched: '2026-03-10', itemCount: 4, isActive: true, category: 'Design' },
      { title: 'InfoQ', feedUrl: 'https://feed.infoq.com/', siteUrl: 'https://infoq.com', description: 'Software development news', lastFetched: '2026-03-21', itemCount: 20, isActive: true, category: 'Development' },
      { title: 'Ars Technica', feedUrl: 'https://feeds.arstechnica.com/arstechnica/index', siteUrl: 'https://arstechnica.com', description: 'Technology and science news', lastFetched: '2026-03-21', itemCount: 28, isActive: true, category: 'Tech' },
      { title: 'The Morning Brew', feedUrl: 'https://morningbrew.com/feed', siteUrl: 'https://morningbrew.com', description: 'Daily business newsletter', lastFetched: '2026-03-21', itemCount: 10, isActive: true, category: 'Business' },
      { title: 'ESPN', feedUrl: 'https://www.espn.com/espn/rss/news', siteUrl: 'https://espn.com', description: 'Sports news and scores', lastFetched: '2026-03-21', itemCount: 22, isActive: false, category: 'Sports' },
      { title: 'Node.js Blog', feedUrl: 'https://nodejs.org/en/feed/blog.xml', siteUrl: 'https://nodejs.org', description: 'Node.js releases and updates', lastFetched: '2026-03-18', itemCount: 3, isActive: true, category: 'Development' },
    ]);
    console.log('RSS Feeds seeded.');

    // Seed Contacts (15 items)
    await Contact.bulkCreate([
      { name: 'Sarah Johnson', email: 'sarah.j@techcorp.com', phone: '+1-555-0101', company: 'TechCorp', role: 'Engineering Manager', notes: 'Met at ReactConf 2025, great connection for hiring', isFavorite: true, category: 'Work' },
      { name: 'Michael Chen', email: 'mchen@startup.io', phone: '+1-555-0102', company: 'StartupIO', role: 'CTO', notes: 'Potential partnership for API integration', isFavorite: true, category: 'Client' },
      { name: 'Emily Rodriguez', email: 'emily.r@design.co', phone: '+1-555-0103', company: 'DesignCo', role: 'Lead Designer', notes: 'Freelance design work, excellent UI/UX skills', isFavorite: false, category: 'Vendor' },
      { name: 'David Kim', email: 'dkim@cloudserv.com', phone: '+1-555-0104', company: 'CloudServ', role: 'Solutions Architect', notes: 'AWS expert, helped with infrastructure setup', isFavorite: false, category: 'Partner' },
      { name: 'Lisa Thompson', email: 'lisa.t@investgroup.com', phone: '+1-555-0105', company: 'InvestGroup', role: 'Investment Analyst', notes: 'Angel investor contact, interested in SaaS', isFavorite: true, category: 'Networking' },
      { name: 'James Wilson', email: 'jwilson@devteam.com', phone: '+1-555-0106', company: 'DevTeam Inc', role: 'Senior Developer', notes: 'Former colleague, Node.js expert', isFavorite: false, category: 'Work' },
      { name: 'Anna Martinez', email: 'anna.m@marketing.io', phone: '+1-555-0107', company: 'MarketingIO', role: 'Marketing Director', notes: 'Product launch marketing contact', isFavorite: false, category: 'Vendor' },
      { name: 'Robert Taylor', email: 'rtaylor@university.edu', phone: '+1-555-0108', company: 'State University', role: 'Professor', notes: 'Research collaboration on AI/ML', isFavorite: false, category: 'Networking' },
      { name: 'Jennifer Lee', email: 'jlee@legalteam.com', phone: '+1-555-0109', company: 'LegalTeam LLP', role: 'Corporate Lawyer', notes: 'Handles contracts and IP', isFavorite: false, category: 'Vendor' },
      { name: 'Mom', email: 'mom@email.com', phone: '+1-555-0110', company: '', role: '', notes: 'Call every Sunday', isFavorite: true, category: 'Family' },
      { name: 'Alex Morgan', email: 'alex.m@recruiter.com', phone: '+1-555-0111', company: 'TalentFind', role: 'Tech Recruiter', notes: 'Reached out about senior roles at FAANG', isFavorite: false, category: 'Networking' },
      { name: 'Chris Anderson', email: 'canderson@agency.com', phone: '+1-555-0112', company: 'Digital Agency', role: 'Project Manager', notes: 'Managing our website redesign project', isFavorite: false, category: 'Client' },
      { name: 'Dr. Smith', email: 'drsmith@medical.com', phone: '+1-555-0113', company: 'City Medical', role: 'Primary Care Doctor', notes: 'Annual checkup scheduled', isFavorite: false, category: 'Personal' },
      { name: 'Tom Baker', email: 'tbaker@gym.com', phone: '+1-555-0114', company: 'FitLife Gym', role: 'Personal Trainer', notes: 'Training sessions Mon/Wed/Fri', isFavorite: false, category: 'Personal' },
      { name: 'Sophie Park', email: 'sophie.p@cowork.com', phone: '+1-555-0115', company: 'CoWork Space', role: 'Community Manager', notes: 'Conference room bookings and events', isFavorite: false, category: 'Work' },
    ]);
    console.log('Contacts seeded.');

    // Seed Workouts (15 items)
    await Workout.bulkCreate([
      { name: 'Bench Press', exerciseType: 'Strength', duration: 30, sets: 4, reps: 10, weight: 185.00, calories: 180, notes: 'Increased weight by 5lbs', date: '2026-03-21', category: 'Upper Body' },
      { name: 'Morning Run', exerciseType: 'Running', duration: 35, sets: null, reps: null, weight: null, calories: 350, notes: '5K at 7:00/min pace', date: '2026-03-20', category: 'Cardio' },
      { name: 'Squats', exerciseType: 'Strength', duration: 25, sets: 4, reps: 8, weight: 225.00, calories: 200, notes: 'Good form, felt strong', date: '2026-03-19', category: 'Lower Body' },
      { name: 'Yoga Flow', exerciseType: 'Yoga', duration: 45, sets: null, reps: null, weight: null, calories: 150, notes: 'Focused on hip openers', date: '2026-03-18', category: 'Mobility' },
      { name: 'Deadlift', exerciseType: 'Strength', duration: 30, sets: 5, reps: 5, weight: 275.00, calories: 220, notes: 'New PR! Form check video saved', date: '2026-03-17', category: 'Full Body' },
      { name: 'HIIT Circuit', exerciseType: 'HIIT', duration: 20, sets: 4, reps: null, weight: null, calories: 300, notes: 'Burpees, box jumps, mountain climbers, kettlebell swings', date: '2026-03-16', category: 'Full Body' },
      { name: 'Swimming Laps', exerciseType: 'Swimming', duration: 40, sets: null, reps: null, weight: null, calories: 400, notes: '20 laps freestyle, 10 laps backstroke', date: '2026-03-15', category: 'Cardio' },
      { name: 'Pull-ups & Rows', exerciseType: 'Strength', duration: 25, sets: 4, reps: 12, weight: 45.00, calories: 160, notes: 'Superset with cable rows', date: '2026-03-14', category: 'Upper Body' },
      { name: 'Cycling', exerciseType: 'Cycling', duration: 50, sets: null, reps: null, weight: null, calories: 450, notes: '15 mile ride, hilly route', date: '2026-03-13', category: 'Cardio' },
      { name: 'Plank Variations', exerciseType: 'Strength', duration: 15, sets: 3, reps: null, weight: null, calories: 80, notes: 'Front plank 90s, side planks 60s each', date: '2026-03-12', category: 'Core' },
      { name: 'Shoulder Press', exerciseType: 'Strength', duration: 20, sets: 4, reps: 10, weight: 95.00, calories: 140, notes: 'Standing overhead press', date: '2026-03-11', category: 'Upper Body' },
      { name: 'Walking', exerciseType: 'Walking', duration: 60, sets: null, reps: null, weight: null, calories: 250, notes: 'Evening walk in the park, 4 miles', date: '2026-03-10', category: 'Cardio' },
      { name: 'Leg Press', exerciseType: 'Strength', duration: 20, sets: 4, reps: 12, weight: 360.00, calories: 170, notes: 'Wide stance for inner quads', date: '2026-03-09', category: 'Lower Body' },
      { name: 'Basketball', exerciseType: 'Sports', duration: 60, sets: null, reps: null, weight: null, calories: 500, notes: 'Pickup game at the rec center', date: '2026-03-08', category: 'Full Body' },
      { name: 'Stretching & Recovery', exerciseType: 'Flexibility', duration: 30, sets: null, reps: null, weight: null, calories: 60, notes: 'Foam rolling and static stretches', date: '2026-03-07', category: 'Recovery' },
    ]);
    console.log('Workouts seeded.');

    console.log('\n✅ All seed data inserted successfully! (30 features)');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
