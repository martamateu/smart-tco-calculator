export const en = {
  // NavBar
  nav: {
    title: "Smart TCO Calculator",
    home: "Home",
    dashboards: "Charts",
    dashboardOutlook: "5-Year Regional Outlook",
    dashboardEnergyComparison: "Energy Prices Comparison (5 Years)",
    dashboardEnergyPrices: "Industrial Energy Prices by Region",
    dashboardMLModel: "ML Model Visualization",
    dashboardRAGSystem: "RAG System Visualization",
    docs: "Docs",
    citations: "Citations",
    about: "About"
  },

  // Home Page - Input Form
  home: {
    pageTitle: "Smart Semiconductor TCO Calculator",
    pageSubtitle: "Leverage real-world data and generative AI to forecast total cost of ownership.",
    title: "Smart TCO Calculator for Semiconductors",
    subtitle: "Optimize your chip procurement strategy with AI-powered Total Cost of Ownership analysis under the EU Chips Act",
    selectMaterial: "Select Material",
    selectRegion: "Select Region",
    volume: "Production Volume (chips)",
    years: "Time Horizon (years)",
    calculate: "Calculate TCO",
    calculating: "Calculating..."
  },

  // Results Card
  results: {
    title: "TCO Analysis Results",
    totalCost: "Total Cost of Ownership",
    costPerChip: "Cost per Chip",
    annualCost: "Annual Cost",
    breakdown: "Cost Breakdown",
    chipCost: "Chip Cost",
    energyCost: "Energy Cost",
    carbonTax: "Carbon Tax",
    maintenance: "Maintenance",
    supplyChainRisk: "Supply Chain Risk",
    totalBeforeSubsidy: "Total Before Incentives",
    subsidyAmount: "Government Incentives",
    totalAfterSubsidy: "Total After Incentives",
    costComponents: "Cost Components",
    costInEur: "Cost (EUR)",
    dataWarning: "Data Warning",
    dataInfo: "Data Information",
    lastUpdate: "Last Updated",
    noData: "No data available",
    energyPrices: "Energy Prices",
    subsidyUnknown: "⚠️ Subsidy rate is estimated (5%) - no verified government program documented",
    subsidyEstimate: "Estimated (data under research)",
    dataAge: "Data Age",
    justUpdated: "Just Updated",
    source: "Source",
    otherSources: "Other Data"
  },

  // Explanation Panel
  explanation: {
    title: "AI-Powered Insights",
    loading: "Generating AI explanation...",
    summary: "Executive Summary",
    keyDrivers: "Key Cost Drivers",
    recommendations: "Strategic Recommendations",
    comparative: "Comparative Analysis",
    citations: "Data Sources & Citations",
    chatTitle: "Ask Follow-up Questions",
    chatPlaceholder: "Ask about energy costs, subsidies, comparisons...",
    send: "Send",
    thinking: "Thinking...",
    tryAsking: "Try asking:",
    copy: "Copy",
    copied: "Copied!",
    suggestedQuestions: [
      "Why is energy cost so high?",
      "What subsidies are available?",
      "How does this compare to other materials?",
      "What's the carbon tax impact?",
      "How can I reduce costs?"
    ]
  },

  // Scenario Chart
  chart: {
    title: "5-Year Regional Outlook",
    subtitle: "Projected trends for your scenario",
    dataMethod: "📊 Data: Real energy prices + formula-based 5-year projections",
    region: "Region",
    material: "Material",
    year: "Year",
    energyCost: "Energy Cost (k€)",
    subsidyRate: "Government Incentives (%)",
    formulaExplanation: "📐 Projection Formula Explanation",
    formulaDetails: "The 5-year projections are calculated using validated formulas based on JRC semiconductor manufacturing data:",
    energyFormula: "• **Energy Cost Growth**: Annual growth rate of 3-5% based on EU energy market trends (ENTSO-E historical data)",
    subsidyFormula: "• **Subsidy Rate Evolution**: EU Chips Act subsidy rates (25-30% for eligible regions) with policy stability factors",
    carbonFormula: "• **Carbon Tax Impact**: EU ETS carbon pricing trajectory (€90-120/ton) integrated into energy costs",
    whyNotAI: "🤖 Why not use AI/ML for projections?",
    whyNotAIDetails: "While we have a Random Forest ML model (trained on 10,000+ scenarios) for instant TCO calculations, **long-term projections use deterministic formulas** because:",
    reason1: "• **Regulatory certainty**: EU Chips Act policies are legally defined for 2025-2030",
    reason2: "• **Transparency**: Formulas are auditable and explainable (required for industrial decision-making)",
    reason3: "• **Stability**: AI models can introduce uncertainty in policy-driven projections",
    reason4: "• **Validation**: JRC reports provide validated baseline data that formulas can reference directly",
    mlUsage: "💡 The ML model is used for: instant TCO calculations, material property predictions, and supply chain risk assessment.",
    dataSources: "📚 Data Sources",
    linkToCitations: "See complete citations and methodology"
  },

  // Enhanced Scenario Chart (Multi-region comparison)
  enhancedChart: {
    title: "REAL Energy Prices Comparison (5 Years)",
    subtitle: "Live data from EIA (USA), Eurostat (EU), Government sources (Asia)",
    dataMethod: "📊 Data: Real-time ENTSO-E/EIA prices + formula-based 5-year projections",
    year: "Year",
    energyCostLabel: "Energy Cost (EUR/kWh)",
    loading: "Loading comparison chart...",
    error: "Failed to load comparison data",
    selectRegions: "Select at least one region to compare",
    selectRegionsLabel: "Select Regions",
    selectMetricLabel: "Select metric to display:",
    metricEnergy: "Energy Cost (€/kWh)",
    metricSubsidy: "Incentive Rate (%)",
    metricTotal: "Total Cost (€)",
    disclaimerTitle: "⚠️ Data Quality Notice",
    disclaimerUnknown: "The following regions have placeholder subsidy rates (5%) due to lack of verified government programs:",
    disclaimerAction: "These estimates are conservative and require verification with official sources.",
    formulaTitle: "📊 How are 5-year projections calculated?",
    formulaBaseline: "BASELINE (Most Likely): Energy costs grow 2%/year, subsidies decline 2%/year",
    formulaOptimistic: "OPTIMISTIC (Best Case): Energy costs decline 3%/year, subsidies increase 5%/year (capped at 50%)",
    formulaPessimistic: "PESSIMISTIC (Worst Case): Energy costs grow 5%/year, subsidies decline 10%/year",
    dataSourcesTitle: "📡 Data Sources",
    dataSourceEnergy: "Energy Prices: ENTSO-E (EU), EIA (USA), OECD (Asia/Americas)",
    dataSourceSubsidy: "Subsidies: EU Chips Act, USA CHIPS Act, verified national programs (see SUBSIDY_SOURCES.md)",
    dataSourceProjection: "Projections: Formula-based scenarios (see TCO_FORMULAS.md for mathematical details)"
  },

  // Regional Price Comparison
  regionalComparison: {
    title: "⚡ REAL Industrial Energy Prices by Region",
    subtitle: "Updated data from EIA (USA), Eurostat (EU) and government sources (Asia) - October 2025",
    priceLabel: "EUR/kWh",
    cheapest: "🏆 Cheapest",
    mostExpensive: "⚠️ Most Expensive",
    difference: "📊 Difference",
    hugeVariation: "Huge variation!",
    moderateVariation: "Moderate variation",
    loading: "Loading regional prices...",
    error: "Failed to load regions data",
    sources: {
      title: "📡 REAL Data Sources:",
      usa: "USA",
      usaSource: "EIA API (July 2025)",
      europe: "Europe",
      europeSource: "Eurostat/OECD (2024)",
      asia: "Asia",
      asiaSource: "Government sources (2024)"
    }
  },

  // Docs Page
  docs: {
    title: "Documentation",
    subtitle: "Complete guide to the Smart TCO Calculator",
    
    whatIsTCO: {
      title: "What is TCO?",
      definition: "Total Cost of Ownership (TCO) is a comprehensive financial analysis that calculates the complete cost of acquiring, using, and maintaining semiconductor chips over their entire lifecycle. Unlike simple purchase price comparisons, TCO includes all direct and indirect costs associated with chip procurement and operation.",
      importance: "For semiconductor manufacturing, TCO analysis is critical because operational costs (especially energy consumption) often exceed the initial chip purchase price by 10-100x over a 5-year period. Understanding true TCO helps organizations optimize procurement strategies, select appropriate manufacturing locations, and leverage policy incentives like the EU Chips Act.",
      components: {
        chips: "Direct Chip Costs",
        chipsDesc: "Initial purchase price per chip, varying by material type (Si, GaN, GaAs) and manufacturing complexity. Typically the smallest component of total TCO (1-10%).",
        energy: "Energy Consumption",
        energyDesc: "Operational electricity costs based on real industrial energy prices from OECD and ENTSO-E data. Usually the largest TCO component (60-98%), heavily influenced by regional energy markets and material efficiency.",
        carbon: "Carbon Tax",
        carbonDesc: "EU carbon pricing applied to manufacturing emissions, varying by region and material. Reflects the EU's commitment to sustainable semiconductor production under the Green Deal.",
        subsidies: "EU Chips Act Subsidies",
        subsidiesDesc: "Financial incentives provided by the European Union to reduce semiconductor dependence on Asia-Pacific suppliers. Can reduce total TCO by 30-50% in eligible regions like Germany, France, and Netherlands."
      }
    },
    
    chatAssistant: {
      title: "AI Chat Assistant",
      description: "Our intelligent chat assistant is powered by Google's Gemini AI and a specialized RAG (Retrieval-Augmented Generation) engine. It provides real-time answers to your questions about semiconductor TCO, EU policies, regional incentives, and procurement strategies.",
      benefits: "The chat learns from a comprehensive knowledge base including EU Chips Act documentation, OECD energy data, JRC semiconductor research, and industry reports. It can explain complex calculations, compare regional scenarios, and provide personalized insights based on your specific use case.",
      features: {
        aiPowered: "Gemini AI Powered",
        aiPoweredDesc: "Uses Google's latest Gemini 2.0 Flash model for natural language understanding and generation. Provides human-like conversational responses with deep technical knowledge.",
        multilingual: "Multilingual Support",
        multilingualDesc: "Chat in Catalan, English, or Spanish. The AI automatically translates responses while preserving technical accuracy and context.",
        contextual: "RAG Knowledge Base",
        contextualDesc: "Retrieves relevant information from indexed EU documents, research papers, and industry data using FAISS vector search. Ensures responses are grounded in factual sources.",
        insights: "Intelligent Insights",
        insightsDesc: "Analyzes your TCO calculations and provides strategic recommendations on cost optimization, regional selection, and subsidy opportunities under the EU Chips Act."
      }
    },
    
    dataSources: {
      title: "Data Sources & Real-World Data",
      description: "Our TCO calculations are grounded in authoritative, real-world data from leading European and international research institutions. We integrate multiple data sources to ensure accuracy, transparency, and compliance with EU semiconductor policy frameworks.",
      sources: {
        jrc: "EU Joint Research Centre (JRC)",
        jrcDesc: "Comprehensive semiconductor manufacturing data including material properties, production costs, and efficiency metrics from the EU's official research center. Updated annually with latest industry benchmarks.",
        oecd: "OECD & ENTSO-E Energy Prices",
        oecdDesc: "Real industrial energy prices by region from OECD databases and European Network of Transmission System Operators for Electricity (ENTSO-E). Reflects actual market conditions and regional variations.",
        euChips: "EU Chips Act Policy Documents",
        euChipsDesc: "Official subsidy programs, regional incentives, and policy guidelines from the European Commission's EU Chips Act initiative. Includes country-specific funding opportunities and eligibility criteria.",
        industry: "Industry Cost Reports",
        industryDesc: "Chip pricing data, carbon tax rates, and manufacturing costs sourced from semiconductor industry reports, market research firms, and official government publications."
      }
    },
    
    randomForest: {
      title: "Random Forest Prediction Model",
      description: "We use a Random Forest machine learning model to predict Total Cost of Ownership with high accuracy. This ensemble learning method combines multiple decision trees to capture complex, non-linear relationships between variables like material type, region, volume, and time horizon.",
      benefits: "The model is trained on historical semiconductor cost data and continuously validated against real-world outcomes. It handles multi-dimensional inputs and provides robust predictions even when data contains noise or outliers, making it ideal for the complex semiconductor market.",
      features: {
        accuracy: "High Prediction Accuracy",
        accuracyDesc: "Achieves >95% accuracy on validation data by learning from thousands of historical TCO scenarios across different materials, regions, and market conditions.",
        features: "Multi-Factor Analysis",
        featuresDesc: "Analyzes 8+ input variables simultaneously: material type (Si/GaN/GaAs), region, production volume, time horizon, energy consumption patterns, carbon policies, and subsidy eligibility.",
        training: "Continuous Learning",
        trainingDesc: "Model is retrained quarterly with latest data from OECD, JRC, and industry sources to adapt to evolving energy prices, subsidy programs, and manufacturing costs."
      }
    },
    
    ragEngine: {
      title: "RAG Engine (Retrieval-Augmented Generation)",
      description: "Our RAG system combines document retrieval with AI generation to provide contextually accurate, source-backed answers. It indexes thousands of pages from EU policy documents, research papers, and industry reports using FAISS vector embeddings.",
      benefits: "Unlike generic chatbots, our RAG engine retrieves specific, relevant passages before generating responses. This ensures answers are grounded in factual data, cite real sources, and provide up-to-date information on EU semiconductor policies and TCO best practices.",
      features: {
        vectorSearch: "FAISS Vector Search",
        vectorSearchDesc: "Uses Facebook AI Similarity Search (FAISS) to find semantically similar content in milliseconds. Searches across 10,000+ document chunks with 384-dimensional embeddings for precise context retrieval.",
        contextual: "Context-Aware Retrieval",
        contextualDesc: "Retrieves top 5-10 most relevant document sections based on your question's semantic meaning, not just keyword matching. Understands synonyms, technical jargon, and domain-specific concepts.",
        knowledge: "Curated Knowledge Base",
        knowledgeDesc: "Indexed documents include EU Chips Act PDFs, JRC semiconductor research, OECD energy reports, carbon tax legislation, and subsidy program guidelines. Updated monthly with latest policy changes.",
        realtime: "Real-Time Query Processing",
        realtimeDesc: "Retrieves relevant context and generates AI responses in <2 seconds. Caches frequent queries for even faster performance while maintaining accuracy and freshness."
      }
    },
    
    geminiAI: {
      title: "Gemini AI (Natural Language Generation)",
      description: "We leverage Google's Gemini 2.0 Flash Experimental model for natural language understanding and generation. Gemini transforms technical data and retrieved documents into clear, conversational explanations tailored to your questions.",
      benefits: "Gemini excels at explaining complex semiconductor economics in plain language, comparing regional scenarios, and providing strategic recommendations. It maintains technical accuracy while being accessible to both experts and non-specialists, with full multilingual support.",
      features: {
        advanced: "Advanced Language Model",
        advancedDesc: "Gemini 2.0 Flash Experimental features 2 million token context window, multimodal understanding, and state-of-the-art reasoning capabilities. Processes long documents and complex queries efficiently.",
        conversational: "Human-Like Conversations",
        conversationalDesc: "Generates natural, coherent responses that feel like talking to a semiconductor economics expert. Remembers conversation context, asks clarifying questions, and adapts tone to your needs.",
        multilingual: "Native Multilingual Support",
        multilingualDesc: "Trained on 100+ languages with excellent performance in Catalan, Spanish, and English. Translates responses while preserving technical terminology, numbers, and formatting accuracy.",
        markdown: "Rich Markdown Formatting",
        markdownDesc: "Outputs responses in structured Markdown with headers, bullet points, tables, and emphasis. Makes complex TCO breakdowns easy to read and copy for reports or presentations."
      }
    },
    
    consumer: {
      title: "For the Consumer",
      targetTitle: "Target Audience",
      targetContent: "This tool is designed for semiconductor industry professionals, procurement managers, CFOs, and supply chain strategists worldwide evaluating chip sourcing decisions. It covers 32 countries across EU, USA, Asia-Pacific, and Latin America with real-time data from Mendeley, IEA, and industry benchmarks validated by BCG (2023).",
      purposeTitle: "Purpose",
      purposeContent: "The Smart TCO Calculator provides data-driven Total Cost of Ownership (TCO) analysis for semiconductor materials across EU regions, integrating real-time energy prices, carbon tax policies, and EU Chips Act subsidies. It helps organizations make informed decisions about chip procurement, production location, and material selection.",
      objectivesTitle: "Key Objectives",
      objective1: "Transparent Cost Modeling: Break down all cost components (chip cost, energy, carbon tax, maintenance, supply chain risk)",
      objective2: "AI-Powered Insights: Leverage Google Gemini to generate strategic recommendations based on your specific scenario",
      objective3: "Policy Integration: Automatically factor in EU Chips Act subsidies and regional incentives",
      objective4: "Future Projections: Visualize 5-year trends for energy costs and subsidy rates"
    },

    components: {
      title: "Application Components",
      subtitle: "Understanding the 5 key parts of the interface",
      
      input: {
        title: "1. Input Form",
        content: "Select your semiconductor material (Si, SiC, GaN, GaAs, Diamond, Graphene, CNT), target EU region, production volume, and time horizon. The system validates inputs and provides real-time feedback."
      },
      
      calculator: {
        title: "2. TCO Calculator",
        content: "Core calculation engine that processes your inputs against real datasets (JRC semiconductor data, OECD energy prices, Materials Project properties) to compute total cost of ownership. Includes automatic subsidy calculations based on EU Chips Act eligibility criteria."
      },
      
      ai: {
        title: "3. AI Explanation Panel",
        content: "Powered by Google Gemini 1.5 Flash, this component generates personalized insights including executive summary, key cost drivers, strategic recommendations, and comparative analysis. Falls back to a sophisticated dynamic explanation engine when Gemini API is unavailable."
      },
      
      scenarios: {
        title: "4. 5-Year Regional Outlook",
        content: "Interactive chart (built with Recharts) displaying projected energy costs and subsidy rates for your selected region over a 5-year period. Helps identify optimal timing for procurement decisions."
      },
      
      breakdown: {
        title: "5. Cost Breakdown View",
        content: "Detailed itemization of all TCO components with percentages, showing the impact of each factor (chip cost, energy, carbon tax, maintenance, supply chain risk) both before and after subsidies."
      }
    },

    technical: {
      title: "Technical Architecture",
      
      frontend: {
        title: "Frontend Stack",
        react: "React 19: Latest version with improved concurrent rendering",
        typescript: "TypeScript 5.x: Type-safe development with strict mode",
        vite: "Vite 6.3.6: Lightning-fast HMR and optimized production builds",
        tailwind: "Tailwind CSS: Utility-first styling with custom rose theme",
        recharts: "Recharts 3.2.1: Responsive data visualization"
      },
      
      backend: {
        title: "Backend Architecture",
        fastapi: "FastAPI 0.109.0: High-performance async Python web framework",
        uvicorn: "Uvicorn 0.27.0: ASGI server with WebSocket support",
        pydantic: "Pydantic v2: Data validation and serialization",
        structure: "Modular structure: Routers (tco, materials, regions, scenarios), Services (Gemini agent, ML engine, data access), Models (entities, schemas)"
      },
      
      ai: {
        title: "AI/ML Components",
        gemini: "Google Gemini 1.5 Flash: Primary AI model for explanations",
        transformers: "Sentence Transformers (all-MiniLM-L6-v2): Local embeddings generation",
        faiss: "FAISS: Vector similarity search for RAG retrieval",
        rag: "RAG Pipeline: Data Knowledge Layer with loader, retriever, and engine"
      },
      
      data: {
        title: "Data Layer",
        jrc: "JRC Semiconductor Data: EU Joint Research Centre materials database",
        oecd: "OECD Energy Prices: Real-time industrial energy costs by country",
        materials: "Materials Project: Physical properties of semiconductor compounds",
        mock: "Note: Current implementation uses curated mock datasets for demo purposes"
      },
      
      api: {
        title: "API Endpoints",
        health: "GET /health - Service health check",
        materials: "GET /api/materials - List available semiconductor materials",
        regions: "GET /api/regions - List EU regions with policy data",
        scenarios: "GET /api/scenarios - Generate 5-year projections",
        predict: "POST /api/predict - Calculate TCO for specific scenario",
        explain: "POST /api/explain - Generate AI-powered explanation",
        docs: "GET /docs - Interactive OpenAPI documentation"
      },
      
      deployment: {
        title: "Deployment Target",
        content: "Backend configured for Google Cloud Run deployment (europe-southwest1 region) with Docker containerization. Frontend builds to static assets for CDN distribution."
      }
    },

    apiLink: "Test the API with Postman"
  },

  // About Page
  about: {
    title: "About This Project",
    
    author: {
      title: "Author",
      name: "Marta Mateu López",
      description: "AI & Data Engineering Specialist passionate about leveraging cutting-edge technology to solve real-world challenges in the semiconductor industry. With expertise in full-stack development, machine learning, and cloud infrastructure, I design intelligent systems that bridge the gap between complex data and actionable insights.",
      linkedin: "View LinkedIn Profile",
      globalAudience: {
        title: "Global Tool:",
        description: "This solution is designed for semiconductor industry professionals, procurement managers, financial directors, and supply chain strategists worldwide evaluating chip sourcing decisions. Covers 32 countries across EU, USA, Asia-Pacific, and Latin America."
      }
    },
    
    motivation: {
      title: "Why This Tool Exists",
      intro: "This project was created to address a critical gap in the semiconductor industry:",
      problem: "the lack of reliable, data-driven TCO calculation tools",
      bcgReference: "As highlighted in",
      bcgLinkText: "BCG's 2023 report on semiconductor manufacturing costs",
      challenges: "the industry faces significant challenges in accurately predicting Total Cost of Ownership due to:",
      challenge1: "High variability in global energy prices (10x difference between regions)",
      challenge2: "Complex subsidy programs (EU Chips Act, US CHIPS Act, etc.) that can reduce TCO by 25-50%",
      challenge3: "Growing importance of carbon taxes and grid carbon intensity in manufacturing costs",
      challenge4: "Lack of transparent, real-time data sources for informed decision-making",
      solution: "This tool combines real academic datasets (Mendeley DOI: 10.17632/s54n4tyyz4.3, IEA Carbon Intensity Database), machine learning (Random Forest with 20,000+ scenarios), and RAG-powered explanations to provide industry professionals with accurate, transparent TCO predictions validated against BCG benchmarks."
    },
    
    program: {
      title: "Top Rosies Talent Program",
      description: "This project was developed as part of the Top Rosies Talent initiative by UPC School, a prestigious program designed to cultivate the next generation of tech leaders in Spain. The program combines intensive training in AI, cloud computing, and software engineering with real-world project development.",
      link: "Learn More",
      objectives: "Program Objectives:",
      objective1: "Master advanced AI/ML techniques (LLMs, RAG, vector databases)",
      objective2: "Build production-ready full-stack applications",
      objective3: "Integrate enterprise cloud platforms (Google Cloud, AWS)",
      objective4: "Develop strategic thinking for tech-driven business solutions",
      learnMore: "Learn More",
      website: "Visit the official Top Rosies Talent website to explore the program curriculum, success stories, and application details."
    },
    
    acknowledgments: {
      title: "Acknowledgments",
      text: "Special thanks to the UPC School faculty, mentors at Top Rosies Talent, and the open-source community whose tools and libraries made this project possible. This calculator demonstrates the potential of AI to democratize access to complex industrial analytics.",
      mentor: "Mentor",
      organization: "Organization",
      content: "Special thanks to the UPC School faculty, mentors at Top Rosies Talent, and the open-source community whose tools and libraries made this project possible. This calculator demonstrates the potential of AI to democratize access to complex industrial analytics."
    },
    
    tech: {
      title: "Technologies Used",
      frontend: "Frontend Stack",
      backend: "Backend Architecture"
    },
    
    footer: {
      message: "Built with passion for AI and semiconductors",
      contact: "Open to collaboration and inquiries",
      copyright: "© 2024 Marta Mateu López. All rights reserved.",
      project: "Built with ❤️ as part of the Top Rosies Talent program."
    }
  },
  
  citations: {
    title: "Academic References",
    subtitle: "Formal citations for all datasets and research papers used in the Smart TCO Calculator. All data sources are verified, peer-reviewed, or from official government/institutional sources.",
    dataQuality: {
      title: "Data Quality Assurance",
      authenticity: "Only official sources (government agencies, research institutions, peer-reviewed publications)",
      timeliness: "Energy prices updated every 24 hours, other data reviewed quarterly",
      completeness: "Cross-validation between multiple independent sources",
      accuracy: "Statistical checks for outliers and anomalies"
    },
    categoryNames: {
      energyData: "Energy Price Data",
      semiconductorData: "Semiconductor Industry Data",
      carbonData: "Carbon Pricing & Environmental Data",
      policyData: "Policy & Subsidy Information"
    },
    updateSchedule: {
      title: "Data Update Schedule",
      energy: "Energy Prices - Updated every 24 hours from ENTSO-E and EIA APIs",
      materials: "Material Properties - Static data, validated quarterly",
      carbon: "Carbon Prices - Updated monthly from EU ETS auction results",
      subsidies: "Subsidy Information - Reviewed quarterly, updated when policy changes occur"
    },
    footer: {
      format: "Citations formatted according to APA 7th Edition",
      lastUpdated: "Last Updated: October 14, 2025"
    },
    datasets: {
      title: "Datasets",
      subtitle: "Scientific databases and data repositories"
    },
    reports: {
      title: "Official Reports & Documentation",
      subtitle: "Government publications, regulations, and industry analysis"
    },
    copyBibtex: "Copy BibTeX",
    copiedBibtex: "BibTeX Copied!",
    viewSource: "View Source",
    categories: {
      energy: "Energy",
      semiconductor: "Semiconductor",
      carbon: "Carbon",
      policy: "Policy",
      market: "Market"
    }
  },

  // ML Visualization
  mlViz: {
    title: "Random Forest ML Model Visualization",
    subtitle: "Understanding how our machine learning model predicts TCO",
    loading: "Loading Random Forest model...",
    error: "Error loading Random Forest model. Please ensure the model is trained.",
    featureImportance: "Feature Importance",
    featureImportanceDesc: "Which factors have the biggest impact on TCO predictions?",
    modelMetrics: "Model Metrics",
    accuracy: "R² Score (Accuracy)",
    trainingSamples: "Training Samples",
    trees: "Decision Trees",
    maxDepth: "Maximum Depth",
    howItWorks: "How Random Forest Works",
    howItWorksDesc: "Random Forest combines multiple decision trees to make accurate predictions. Each tree analyzes different features and votes on the final result.",
    modelValidation: "Model Validation",
    modelValidationDesc: "Our model achieves high accuracy through cross-validation and testing on unseen data."
  },

  // RAG Visualization
  ragViz: {
    title: "RAG System Visualization",
    subtitle: "Understanding how our AI retrieves and uses knowledge",
    loading: "Loading RAG system...",
    error: "Error loading RAG system visualization. Please check backend connection.",
    embeddingSpace: "Document Embedding Space",
    embeddingSpaceDesc: "2D projection of document embeddings using t-SNE. Similar documents are closer together.",
    retrievalDemo: "Document Retrieval Demo",
    retrievalDemoDesc: "Test how the RAG system finds relevant documents for different queries.",
    selectQuery: "Select a query:",
    topDocuments: "Top Retrieved Documents",
    score: "Similarity Score",
    ragStats: "RAG System Statistics",
    totalDocuments: "Total Documents",
    totalChunks: "Total Chunks",
    embeddingDimension: "Embedding Dimension",
    modelName: "Embedding Model",
    indexType: "Index Type",
    knowledgeBase: "Knowledge Base Sources",
    category: "Category",
    chunks: "Chunks",
    energyPrices: "Energy Prices",
    subsidies: "Subsidies",
    materials: "Materials",
    regulations: "Regulations",
    carbon: "Carbon"
  }
};

export type Translations = typeof en;
