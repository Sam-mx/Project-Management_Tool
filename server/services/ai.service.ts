import { NlpManager } from 'node-nlp';
import Card from '../models/card.model';
import { io } from "../app"; 

// ==========================================
// 1. NLP CATEGORY CLASSIFICATION
// ==========================================
let nlpManager: InstanceType<typeof NlpManager> | null = null;

// Initial training data
const categoryTrainingExamples = [
  { text: 'Draft and send a newsletter', category: 'Marketing' },
  { text: 'Fix critical bug', category: 'Development' },
  { text: 'Client meeting', category: 'Sales' },
  { text: 'Prepare financial report', category: 'Finance' },
  { text: 'Interview new candidate', category: 'HR' },
  { text: 'Design new logo', category: 'Design' },
  { text: 'Server maintenance', category: 'Operations' },
  { text: 'Update privacy policy', category: 'Legal' },
  { text: 'Test new feature', category: 'QA' },
  { text: 'Analyze user data', category: 'Analytics' },
  { text: 'Draft and send a newsletter to subscribers', category: 'Marketing' },
  { text: 'Conduct a quarterly business review with key clients', category: 'Sales' },
  { text: 'Develop a new training module for sales representatives', category: 'Training & Development' },
  { text: 'Schedule and prepare for annual performance reviews', category: 'HR' },
  { text: 'Analyze website traffic and user behavior data', category: 'Analytics' },
  { text: 'Create and manage online advertising campaigns', category: 'Marketing' },
  { text: 'Write specifications for a new software feature', category: 'Product Management' },
  { text: 'Perform quality assurance testing on the new app version', category: 'QA' },
  { text: 'Organize and lead a team-building workshop', category: 'Team Management' },
  { text: 'Research and propose new technology for the IT department', category: 'IT Strategy' },
  { text: 'Prepare a presentation on the company\'s financial health', category: 'Finance' },
  { text: 'Negotiate terms with a new B2B partner', category: 'Partnerships' },
  { text: 'Develop a new safety protocol for the manufacturing plant', category: 'Safety' },
  { text: 'Coordinate a logistics plan for international shipping', category: 'Supply Chain' },
  { text: 'Host a webinar on industry trends', category: 'Content' },
  { text: 'Update the company\'s cybersecurity policy', category: 'Cyber Security' },
  { text: 'Plan and budget for next year\'s operational expenses', category: 'Operations' },
  { text: 'Create a new employee benefits package proposal', category: 'HR' },
  { text: 'Conduct a competitive landscape analysis', category: 'Market Research' },
  { text: 'Design a new mobile application wireframe', category: 'UX/UI Design' },
  { text: 'Develop a strategy to increase customer retention', category: 'Customer Success' },
  { text: 'Monitor and report on project progress to stakeholders', category: 'Project Management' },
  { text: 'Run payroll for the month', category: 'Accounting' },
  { text: 'Perform routine maintenance on office equipment', category: 'Facilities Management' },
  { text: 'Organize the company holiday party', category: 'Events' },
  { text: 'Review and update the data privacy policy to ensure compliance', category: 'Legal' },
  { text: 'Generate a report on Q3 sales performance', category: 'Sales' },
  { text: 'Train new hires on company software and procedures', category: 'Onboarding' },
  { text: 'Create A/B tests for a new landing page', category: 'Marketing' },
  { text: 'Troubleshoot a technical issue for a remote employee', category: 'IT Support' },
  { text: 'Research and write an article for an industry publication', category: 'Content' },
  { text: 'Manage and update the company\'s asset inventory', category: 'Asset Management' },
  { text: 'Analyze new regulations for business impact', category: 'Compliance' },
  { text: 'Develop a prototype for a new hardware product', category: 'R&D' },
  { text: 'Develop a strategic plan for market expansion', category: 'Business Strategy' },
  { text: 'Analyze customer feedback from the last quarter', category: 'Customer Experience' },
  { text: 'Refine the brand voice and messaging guidelines', category: 'Branding' },
  { text: 'Design and print new product packaging', category: 'Product Design' },
  { text: 'Run a series of focus groups for a new app feature', category: 'User Research' },
  { text: 'Create a comprehensive content calendar for the blog', category: 'Content Marketing' },
  { text: 'Negotiate a new lease for the company office space', category: 'Facilities Management' },
  { text: 'Draft a privacy impact assessment for data handling', category: 'Compliance' },
  { text: 'Integrate new API endpoints for third-party services', category: 'Software Development' },
  { text: 'Conduct a company-wide risk assessment', category: 'Risk Management' },
  { text: 'Host a training session on new software tools', category: 'Training & Development' },
  { text: 'Prepare the annual financial audit documentation', category: 'Accounting' },
  { text: 'Set up A/B tests for email subject lines', category: 'Marketing' },
  { text: 'Develop an emergency response plan for the workplace', category: 'Safety' },
  { text: 'Coordinate a major company event with external vendors', category: 'Event Planning' },
  { text: 'Optimize the cloud server infrastructure for efficiency', category: 'IT Operations' },
  { text: 'Review and update employee contracts', category: 'Legal' },
  { text: 'Analyze sales data to identify new growth opportunities', category: 'Business Development' },
  { text: 'Create a script for the new customer support chatbot', category: 'Customer Service' },
  { text: 'Design a new presentation template for the sales team', category: 'Branding' },
  { text: 'Perform a bug triage for the development backlog', category: 'Project Management' },
  { text: 'Develop a new performance review system', category: 'HR' },
  { text: 'Forecast and manage quarterly inventory levels', category: 'Supply Chain' },
  { text: 'Write a new article for the company\'s internal wiki', category: 'Knowledge Management' },
  { text: 'Research and evaluate new competitor products', category: 'Market Research' },
  { text: 'Design user flows for a new mobile application', category: 'UX/UI Design' },
  { text: 'Prepare a quarterly investor relations update', category: 'Finance' },
  { text: 'Conduct an internal vulnerability scan of the network', category: 'Cyber Security' },
  { text: 'Review and approve vendor invoices', category: 'Accounting' },
  { text: 'Plan and execute a virtual conference', category: 'Events' },
  { text: 'Create new marketing collateral for an upcoming trade show', category: 'Marketing' },
  { text: 'Onboard a new vendor into the procurement system', category: 'Procurement' },
  { text: 'Facilitate a workshop on conflict resolution', category: 'Team Management' },
  { text: 'Draft a business continuity plan', category: 'Operations' },
  { text: 'Develop a new recruitment strategy for technical roles', category: 'HR' },
  { text: 'Refactor legacy code to improve performance', category: 'Software Development' },
  { text: 'Perform an SEO audit of the company website', category: 'SEO' },
  { text: 'Manage relationships with key media contacts', category: 'Public Relations' },
  { text: 'Prepare a proposal for a major client project', category: 'Sales' },
  { text: 'Conduct a usability study on the current website', category: 'User Research' },
  { text: 'Create a budget for next year\'s R&D initiatives', category: 'Finance' },
  { text: 'Install and configure new software on employee workstations', category: 'IT Support' },
  { text: 'Write new product documentation for a release', category: 'Technical Writing' },
  { text: 'Monitor and report on campaign performance metrics', category: 'Analytics' },
  { text: 'Design a new customer loyalty program', category: 'Customer Success' },
  { text: 'Lead a brainstorming session for new product ideas', category: 'Product Management' },
  { text: 'Audit the company\'s compliance with GDPR', category: 'Compliance' },
  { text: 'Set up an automated testing pipeline for the codebase', category: 'DevOps' },
  { text: 'Prepare a monthly report on employee performance', category: 'HR' },
  { text: 'Develop a content strategy for social media video posts', category: 'Social Media' },
  { text: 'Develop and execute a full-scale SEO audit', category: 'SEO' },
  { text: 'Create wireframes for a new e-commerce checkout process', category: 'UX/UI Design' },
  { text: 'Conduct market research for a potential new product line', category: 'Market Research' },
  { text: 'Analyze website analytics to improve user engagement', category: 'Analytics' },
  { text: 'Write new copy for the company website\'s "About Us" page', category: 'Content' },
  { text: 'Design and implement a new company-wide wellness program', category: 'HR' },
  { text: 'Plan and execute a major software version update', category: 'Project Management' },
  { text: 'Create a new employee performance tracking system', category: 'HR' },
  { text: 'Manage relationships with key suppliers and vendors', category: 'Procurement' },
  { text: 'Develop a crisis communication strategy', category: 'Public Relations' },
  { text: 'Audit legal documents for compliance with new regulations', category: 'Legal' },
  { text: 'Create and manage a company referral program', category: 'Recruitment' },
  { text: 'Facilitate a sprint planning and backlog grooming meeting', category: 'Agile' },
  { text: 'Set up automated email sequences for customer onboarding', category: 'Customer Success' },
  { text: 'Design new sales pitches and presentations', category: 'Sales' },
  { text: 'Perform a detailed cost-benefit analysis for a new project', category: 'Finance' },
  { text: 'Install and configure new networking hardware', category: 'IT Operations' },
  { text: 'Lead a brainstorming session for new marketing campaigns', category: 'Marketing' },
  { text: 'Review and approve all incoming purchase orders', category: 'Accounting' },
  { text: 'Create a new training module on workplace safety', category: 'Training & Development' },
  { text: 'Update the company\'s mobile app for new OS features', category: 'Mobile Development' },
  { text: 'Develop a business continuity and disaster recovery plan', category: 'Operations' },
  { text: 'Perform regular penetration testing on the company\'s web applications', category: 'Cyber Security' },
  { text: 'Manage social media advertising budgets and performance', category: 'Marketing' },
  { text: 'Coordinate with international distributors for product delivery', category: 'Logistics' },
  { text: 'Write a whitepaper on industry trends', category: 'Content' },
  { text: 'Develop a new user interface for the administrative dashboard', category: 'UX/UI Design' },
  { text: 'Run payroll and manage employee benefits', category: 'HR' },
  { text: 'Prepare and file quarterly tax reports', category: 'Finance' },
  { text: 'Organize a company-wide volunteer event', category: 'Corporate Social Responsibility' },
  { text: 'Implement an inventory management system', category: 'Supply Chain' },
  { text: 'Create new email templates for customer service responses', category: 'Customer Service' },
  { text: 'Design and build a new landing page for a product launch', category: 'Web Development' },
  { text: 'Conduct an audit of all company software licenses', category: 'IT Management' },
  { text: 'Draft and review legal contracts for new partnerships', category: 'Legal' },
  { text: 'Coordinate a company-wide a/b testing initiative', category: 'Product Management' },
  { text: 'Develop a prototype for a new IoT device', category: 'R&D' },
  { text: 'Create a new onboarding checklist for new hires', category: 'HR' },
  { text: 'Analyze customer data to predict churn rates', category: 'Analytics' },
  { text: 'Produce a company-wide quarterly business report', category: 'Business Reporting' },
  { text: 'Lead a team stand-up meeting', category: 'Project Management' },
  { text: 'Write and publish a blog post about a new company milestone', category: 'Content' },
  { text: 'Manage the company\'s social media accounts and content', category: 'Social Media' },
  { text: 'Conduct a competitive analysis of pricing strategies', category: 'Sales Strategy' },
  { text: 'Facilitate a customer feedback session for a new product', category: 'User Research' },
  { text: 'Develop a new rewards program for loyal customers', category: 'Customer Success' },
  { text: 'Update the company\'s privacy policy for GDPR compliance', category: 'Legal' },
  { text: 'Prepare a sales forecast for the next financial year', category: 'Sales' },
  { text: 'Optimize the company website for search engine ranking', category: 'SEO' },
  { text: 'Review and update the employee handbook', category: 'HR' },
  { text: 'Create a detailed project plan with timelines and milestones', category: 'Project Management' },
  { text: 'Perform a security audit of all third-party software', category: 'Cyber Security' },
  { text: 'Design and create promotional banners and ads', category: 'Graphic Design' },
  { text: 'Plan and book travel for the executive team', category: 'Admin' },
  { text: 'Troubleshoot a technical issue with the company\'s server', category: 'IT Support' },
  { text: 'Develop a new system for employee performance reviews', category: 'HR' },
  { text: 'Analyze and report on market share data', category: 'Market Research' },
  { text: 'Create a new brand style guide', category: 'Branding' },
  { text: 'Plan and coordinate a team off-site retreat', category: 'Events' },
  { text: 'Develop new product features based on user feedback', category: 'Product Management' },
  { text: 'Manage the company\'s bug tracking system', category: 'QA' },
  { text: 'Draft a press release for a company announcement', category: 'Public Relations' },
  { text: 'Organize a knowledge-sharing session for the team', category: 'Knowledge Management' },
  { text: 'Develop a new dashboard for marketing KPIs', category: 'Analytics' },
  { text: 'Review and approve vendor invoices and payments', category: 'Finance' },
  { text: 'Coordinate a major system migration', category: 'IT Operations' },
  { text: 'Perform a quality control check on manufactured products', category: 'Operations' },
  { text: 'Update all company social media profiles', category: 'Social Media' },
  { text: 'Create a sales presentation for a new client pitch', category: 'Sales' },
  { text: 'Train the customer support team on a new product feature', category: 'Training & Development' },
  { text: 'Develop a script for a new animated explainer video', category: 'Content Creation' },
  { text: 'Analyze and optimize website loading speeds', category: 'Web Performance' },
  { text: 'Draft and review a new employee code of conduct', category: 'HR' },
  { text: 'Conduct a competitive analysis of digital marketing strategies', category: 'Marketing' },
  { text: 'Prepare the annual company budget and financial forecast', category: 'Finance' },
  { text: 'Set up a new server for application deployment', category: 'DevOps' },
  { text: 'Lead a product discovery workshop with key stakeholders', category: 'Product Management' },
  { text: 'Implement a new automated testing framework', category: 'QA' },
  { text: 'Organize a quarterly town hall meeting', category: 'Internal Communications' },
  { text: 'Review and update the data backup and recovery plan', category: 'IT Operations' },
  { text: 'Create a detailed user guide for a new software product', category: 'Technical Writing' },
  { text: 'Design a new brand logo and style guide', category: 'Graphic Design' },
  { text: 'Manage the company\'s social media accounts', category: 'Social Media' },
  { text: 'Review customer feedback to identify product improvements', category: 'Customer Experience' },
  { text: 'Write and publish a case study on a successful client project', category: 'Marketing' },
  { text: 'Develop a talent acquisition strategy for the next year', category: 'HR' },
  { text: 'Plan and execute a new sales incentive program', category: 'Sales' },
  { text: 'Perform a security audit of the company\'s physical assets', category: 'Cyber Security' },
  { text: 'Create financial models for potential investment opportunities', category: 'Finance' },
  { text: 'Negotiate contracts with new international clients', category: 'Legal' },
  { text: 'Facilitate a workshop on emotional intelligence for managers', category: 'Leadership' },
  { text: 'Design the user interface for a new mobile app feature', category: 'UX/UI Design' },
  { text: 'Develop a new marketing campaign for a product launch', category: 'Marketing' },
  { text: 'Manage employee payroll and benefits administration', category: 'HR' },
  { text: 'Conduct an audit of the company\'s IT hardware inventory', category: 'IT Management' },
  { text: 'Prepare quarterly tax filings and reports', category: 'Accounting' },
  { text: 'Plan and coordinate a virtual team-building event', category: 'Events' },
  { text: 'Draft a new business proposal for a key client', category: 'Business Development' },
  { text: 'Implement new security protocols for remote access', category: 'Cyber Security' },
  { text: 'Analyze market trends and competitor activity', category: 'Market Research' },
  { text: 'Create a new employee onboarding welcome kit', category: 'HR' },
  { text: 'Develop a prototype for a new wearable device', category: 'R&D' },
  { text: 'Review and approve all incoming invoices', category: 'Finance' },
  { text: 'Design and build a new customer feedback dashboard', category: 'Analytics' },
  { text: 'Create a content strategy for a new YouTube channel', category: 'Content Marketing' },
  { text: 'Manage and update the company\'s CRM system', category: 'IT Operations' },
  { text: 'Conduct a job analysis for a new role opening', category: 'HR' },
  { text: 'Develop a new system for tracking customer success metrics', category: 'Customer Success' },
  { text: 'Lead a weekly team stand-up meeting', category: 'Project Management' },
  { text: 'Write and edit blog posts for the company blog', category: 'Content' },
  { text: 'Perform routine server maintenance and updates', category: 'IT Support' },
  { text: 'Develop and manage a new affiliate marketing program', category: 'Marketing' },
  { text: 'Draft and review legal contracts for new employees', category: 'Legal' },
  { text: 'Prepare a sales forecast for the next financial quarter', category: 'Sales' },
  { text: 'Optimize web pages for better SEO performance', category: 'SEO' },
  { text: 'Create a new training module on data privacy', category: 'Training & Development' },
  { text: 'Conduct a usability study on a new product feature', category: 'User Research' },
  { text: 'Develop a new mobile app for iOS and Android', category: 'Software Development' },
  { text: 'Plan and execute a new email marketing campaign', category: 'Email Marketing' },
  { text: 'Manage the company\'s vendor and supplier relationships', category: 'Procurement' },
  { text: 'Create a new internal communication plan', category: 'Communications' },
  { text: 'Analyze supply chain logistics for cost reduction opportunities', category: 'Supply Chain' },
  { text: 'Review and approve all marketing content for brand consistency', category: 'Branding' },
  { text: 'Develop a new system for employee time tracking', category: 'HR' },
  { text: 'Conduct an audit of the company\'s financial statements', category: 'Accounting' },
  { text: 'Troubleshoot a technical issue with the company website', category: 'Web Development' },
  { text: 'Create a new internal wiki for knowledge sharing', category: 'Knowledge Management' },
  { text: 'Prepare and deliver a presentation to potential investors', category: 'Business Development' },
  { text: 'Design and create a new print advertisement', category: 'Graphic Design' },
  { text: 'Lead a team workshop on agile methodologies', category: 'Agile' },
  { text: 'Develop a new customer support ticketing system', category: 'Customer Service' },
  { text: 'Manage the company\'s relationships with key media outlets', category: 'Public Relations' },
  { text: 'Create and update a project management dashboard', category: 'Project Management' },
  { text: 'Conduct a security vulnerability assessment', category: 'Cyber Security' },
  { text: 'Plan and organize a company-wide charity event', category: 'Corporate Social Responsibility' },
  { text: 'Develop a new performance management process', category: 'HR' },
  { text: 'Review all product documentation for accuracy', category: 'Technical Writing' },
  { text: 'Create a new sales enablement toolkit', category: 'Sales' },
  { text: 'Analyze user behavior data to inform product decisions', category: 'Product Management' },
  { text: 'Conduct a comprehensive review of employee compensation plans', category: 'Compensation & Benefits' },
  { text: 'Develop a new strategy for improving customer satisfaction scores', category: 'Customer Success' },
  { text: 'Write new code to fix a bug in the main application', category: 'Software Development' },
  { text: 'Prepare a report on quarterly project portfolio performance', category: 'Project Management' },
  { text: 'Manage the company\'s expense reporting system', category: 'Accounting' },
  { text: 'Create a new employee engagement survey', category: 'HR' },
  { text: 'Organize and manage the company\'s internal file sharing system', category: 'IT Operations' },
  { text: 'Draft a press release for a new product launch', category: 'Public Relations' },
  { text: 'Develop a new plan for social media content creation', category: 'Social Media' },
  { text: 'Plan and execute a new lead generation campaign', category: 'Marketing' }
];

const initializeNlpManager = async () => {
  if (nlpManager) return nlpManager; // Singleton

  const manager = new NlpManager({ languages: ['en'], nlu: { useNoneFeature: true } });
  
  categoryTrainingExamples.forEach(ex => {
    manager.addDocument('en', ex.text, ex.category);
  });

  await manager.train();
  nlpManager = manager;
  return nlpManager;
};

export const getTaskCategory = async (text: string): Promise<string> => {
  if (!text || text.trim().length === 0) return "General";
  
  try {
    const manager = await initializeNlpManager();
    const result = await manager.process('en', text);

    if (result.intent && result.score > 0.5) {
      return result.intent;
    }
    return 'General';
  } catch (e) {
    console.error("NLP Error", e);
    return "General";
  }
};

// 👇 This is the function you need for the "Learning" feature
export const learnNewCategory = async (text: string, correctCategory: string) => {
  const manager = await initializeNlpManager();
  
  // Add the new example
  manager.addDocument('en', text, correctCategory);
  
  // Retrain immediately
  await manager.train();
  
  console.log(`🧠 AI Learned: "${text}" -> "${correctCategory}"`);
  return true;
};

// ==========================================
// 2. PRIORITY LOGIC (1 = Highest, 5 = Lowest)
// ==========================================
export const getTaskPriority = (dueDate?: Date): number => {
  if (!dueDate) return 4; // No date = Low Priority (4)

  const today = new Date();
  const due = new Date(dueDate);
  today.setHours(0,0,0,0);
  due.setHours(0,0,0,0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 1;    // Overdue -> Critical
  if (diffDays === 0) return 1;  // Due Today -> Critical
  if (diffDays <= 2) return 2;   // Due in 2 days -> High
  if (diffDays <= 7) return 3;   // Due in a week -> Medium
  if (diffDays <= 14) return 4;  // Due in 2 weeks -> Low
  
  return 5; // > 2 weeks -> Very Low
};

// ==========================================
// 3. RANKING/IMPACT LOGIC (1 = High, 3 = Low)
// ==========================================
export const getTaskRankingScore = (name: string, description: string): number => {
  const text = (name + " " + description).toLowerCase();
  
  const highImpactKeywords = [
    'urgent', 'critical', 'asap', 'immediately', 'blocker', 'error', 'fail', 
    'broken', 'crash', 'production', 'deadline', 'bug', 'severe', 'important'
  ];
  
  const mediumImpactKeywords = [
    'feature', 'update', 'review', 'plan', 'schedule', 'verify', 'test', 
    'check', 'improve', 'enhancement', 'adjust', 'client', 'meeting'
  ];

  if (highImpactKeywords.some(k => text.includes(k))) return 1;
  if (mediumImpactKeywords.some(k => text.includes(k))) return 2;
  return 3; 
};

// ==========================================
// 4. MAIN ANALYZE FUNCTIONS
// ==========================================

// Process Single Card
export const analyzeAndUpdateCard = async (cardId: string) => {
  try {
    const card = await Card.findById(cardId);
    if (!card) return;

    // 1. Calculate Values
    const priority = getTaskPriority(card.dueDate); 
    const rankingScore = getTaskRankingScore(card.name, card.description || ''); 
    const category = await getTaskCategory(`${card.name} ${card.description || ''}`);

    // 2. Update Database
    card.priority = priority;
    card.rankingScore = rankingScore;
    card.category = category;

    await card.save();
    console.log(`✅ AI Analysis: ${card.name} -> Prio:${priority} Rank:${rankingScore} Cat:${category}`);

    // 3. Notify Frontend
    if (io) {
      io.emit("card_updated", {
        cardId: card._id,
        listId: card.listId,
        priority: priority,
        rankingScore: rankingScore,
        category: category
      });
    }

    return { priority, rankingScore, category };
  } catch (err) {
    console.error("AI Analysis Failed:", err);
    throw err;
  }
};

// 👇 THIS IS THE FUNCTION THAT WAS MISSING
// Process All Uncategorized Cards (Batch)
export const trainAndCategorizeCards = async () => {
  try {
    const manager = await initializeNlpManager();
    
    // Find cards that have no category or are "Uncategorized"
    const uncategorizedCards = await Card.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' },
        { category: 'Uncategorized' }
      ]
    });

    console.log(`🤖 AI Batch: Processing ${uncategorizedCards.length} cards...`);

    let count = 0;
    for (const card of uncategorizedCards) {
      const text = `${card.name} ${card.description || ''}`;
      const result = await manager.process('en', text);
      
      const category = (result.intent && result.score > 0.5) ? result.intent : 'General';
      
      // Update DB
      card.category = category;
      // Also update priority/ranking while we are at it
      card.priority = getTaskPriority(card.dueDate);
      card.rankingScore = getTaskRankingScore(card.name, card.description || '');
      
      await card.save();
      count++;
    }
    
    console.log(`✅ AI Batch: Finished processing ${count} cards.`);
    return { processed: count };
  } catch (err) {
    console.error("Batch Processing Error:", err);
    throw err;
  }
};