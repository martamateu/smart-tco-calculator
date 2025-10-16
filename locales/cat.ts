import { Translations } from './en';

export const cat: Translations = {
  // NavBar
  nav: {
    title: "Calculadora TCO Intel·ligent",
    home: "Inici",
    dashboards: "Gràfics",
    dashboardOutlook: "Perspectiva Regional a 5 Anys",
    dashboardEnergyComparison: "Comparació de Preus d'Energia (5 Anys)",
    dashboardEnergyPrices: "Preus Industrials d'Energia per Regió",
    dashboardMLModel: "Visualització del Model ML",
    dashboardRAGSystem: "Visualització del Sistema RAG",
    docs: "Documentació",
    citations: "Citacions",
    about: "Sobre"
  },

  // Home Page - Input Form
  home: {
    pageTitle: "Calculadora Intel·ligent de TCO per a Semiconductors",
    pageSubtitle: "Aprofita dades reals i IA generativa per pronosticar el cost total de propietat.",
    title: "Calculadora Intel·ligent de TCO per a Semiconductors",
    subtitle: "Optimitza la teva estratègia d'adquisició de xips amb anàlisi de Cost Total de Propietat impulsat per IA sota la Llei de Xips de la UE",
    selectMaterial: "Seleccionar Material",
    selectRegion: "Seleccionar Regió",
    volume: "Volum de Producció (xips)",
    years: "Horitzó Temporal (anys)",
    calculate: "Calcular TCO",
    calculating: "Calculant..."
  },

  // Results Card
  results: {
    title: "Resultats de l'Anàlisi TCO",
    totalCost: "Cost Total de Propietat",
    costPerChip: "Cost per Xip",
    annualCost: "Cost Anual",
    breakdown: "Desglossament de Costos",
    chipCost: "Cost del Xip",
    energyCost: "Cost Energètic",
    carbonTax: "Impost de Carboni",
    maintenance: "Manteniment",
    supplyChainRisk: "Risc de Cadena de Subministrament",
    totalBeforeSubsidy: "Total Abans d'Incentius",
    subsidyAmount: "Incentius Governamentals",
    totalAfterSubsidy: "Total Després d'Incentius",
    costComponents: "Components de Cost",
    costInEur: "Cost (EUR)",
    dataWarning: "Advertiment de Dades",
    dataInfo: "Informació de Dades",
    lastUpdate: "Última Actualització",
    noData: "No hi ha dades disponibles",
    energyPrices: "Preus d'Energia",
    dataAge: "Antiguitat de Dades",
    justUpdated: "Acabat d'Actualitzar",
    source: "Font",
    otherSources: "Altres Dades",
    subsidyUnknown: "⚠️ Taxa de subvenció estimada (5%) - no hi ha programa governamental verificat documentat",
    subsidyEstimate: "Estimat (dades en investigació)"
  },

  // Explanation Panel
  explanation: {
    title: "Insights Impulsats per IA",
    loading: "Generant explicació amb IA...",
    summary: "Resum Executiu",
    keyDrivers: "Principals Impulsors de Cost",
    recommendations: "Recomanacions Estratègiques",
    comparative: "Anàlisi Comparativa",
    citations: "Fonts de Dades i Referències",
    chatTitle: "Fes Preguntes de Seguiment",
    chatPlaceholder: "Pregunta sobre costs d'energia, subvencions, comparacions...",
    send: "Enviar",
    thinking: "Pensant...",
    tryAsking: "Prova preguntar:",
    copy: "Copiar",
    copied: "Copiat!",
    suggestedQuestions: [
      "Per què el cost d'energia és tan alt?",
      "Quines subvencions estan disponibles?",
      "Com es compara amb altres materials?",
      "Quin és l'impacte de l'impost al carboni?",
      "Com puc reduir els costs?"
    ]
  },

  // Scenario Chart
  chart: {
    title: "Perspectiva Regional a 5 Anys",
    subtitle: "Tendències projectades per al teu escenari",
    dataMethod: "📊 Dades: Preus d'energia reals + projeccions a 5 anys basades en fórmules",
    region: "Regió",
    material: "Material",
    year: "Any",
    energyCost: "Cost Energètic (k€)",
    subsidyRate: "Taxa de Subvenció (%)",
    formulaExplanation: "📐 Explicació de les Fórmules de Projecció",
    formulaDetails: "Les projeccions a 5 anys es calculen usant fórmules validades basades en dades de fabricació de semiconductors del JRC:",
    energyFormula: "• **Creixement del Cost Energètic**: Taxa de creixement anual del 3-5% basada en tendències del mercat energètic de la UE (dades històriques ENTSO-E)",
    subsidyFormula: "• **Evolució de la Taxa de Subvenció**: Taxes de subvenció de la EU Chips Act (25-30% per regions elegibles) amb factors d'estabilitat política",
    carbonFormula: "• **Impacte de l'Impost de Carboni**: Trajectòria de preus del carboni EU ETS (€90-120/tona) integrada en els costs energètics",
    whyNotAI: "🤖 Per què no usar IA/ML per projeccions?",
    whyNotAIDetails: "Tot i que tenim un model ML Random Forest (entrenat amb més de 10,000 escenaris) per càlculs TCO instantanis, **les projeccions a llarg termini usen fórmules deterministes** perquè:",
    reason1: "• **Certesa regulatòria**: Les polítiques de la EU Chips Act estan legalment definides per 2025-2030",
    reason2: "• **Transparència**: Les fórmules són auditables i explicables (requerit per presa de decisions industrials)",
    reason3: "• **Estabilitat**: Els models IA poden introduir incertesa en projeccions basades en polítiques",
    reason4: "• **Validació**: Els informes JRC proporcionen dades base validades que les fórmules poden referenciar directament",
    mlUsage: "💡 El model ML s'usa per: càlculs TCO instantanis, prediccions de propietats de materials i avaluació de risc de cadena de subministrament.",
    dataSources: "📚 Fonts de Dades",
    linkToCitations: "Veure citacions completes i metodologia"
  },

  // Enhanced Scenario Chart (Multi-region comparison)
  enhancedChart: {
    title: "Comparació de Preus d'Energia REALS (5 anys)",
    subtitle: "Dades en viu de EIA (USA), Eurostat (EU), Fonts governamentals (Àsia)",
    dataMethod: "📊 Dades: Preus en temps real ENTSO-E/EIA + projeccions de 5 anys basades en fórmules",
    year: "Any",
    energyCostLabel: "Cost Energètic (EUR/kWh)",
    loading: "Carregant gràfica comparativa...",
    error: "Error en carregar dades de comparació",
    selectRegions: "Selecciona almenys una regió per comparar",
    selectRegionsLabel: "Seleccionar Regions",
    selectMetricLabel: "Selecciona mètrica a mostrar:",
    metricEnergy: "Cost Energètic (€/kWh)",
    metricSubsidy: "Taxa d'Incentius (%)",
    metricTotal: "Cost Total (€)",
    disclaimerTitle: "⚠️ Avís de Qualitat de Dades",
    disclaimerUnknown: "Les següents regions tenen taxes de subsidi estimades (5%) degut a falta de programes governamentals verificats:",
    disclaimerAction: "Aquestes estimacions són conservadores i requereixen verificació amb fonts oficials.",
    formulaTitle: "📊 Com es calculen les projeccions a 5 anys?",
    formulaBaseline: "BASELINE (Més Probable): Costos energia creixen 2%/any, subsidis baixen 2%/any",
    formulaOptimistic: "OPTIMISTA (Millor Cas): Costos energia baixen 3%/any, subsidis pugen 5%/any (màx. 50%)",
    formulaPessimistic: "PESSIMISTA (Pitjor Cas): Costos energia creixen 5%/any, subsidis baixen 10%/any",
    dataSourcesTitle: "📡 Fonts de Dades",
    dataSourceEnergy: "Preus Energia: ENTSO-E (UE), EIA (USA), OECD (Àsia/Amèriques)",
    dataSourceSubsidy: "Subsidis: Llei de Xips UE, CHIPS Act USA, programes nacionals verificats (veure SUBSIDY_SOURCES.md)",
    dataSourceProjection: "Projeccions: Escenaris basats en fórmules (veure TCO_FORMULAS.md per detalls matemàtics)"
  },

  // Regional Price Comparison
  regionalComparison: {
    title: "⚡ Preus d'Energia Industrial REALS per Regió",
    subtitle: "Dades actualitzades de EIA (USA), Eurostat (EU) i fonts governamentals (Àsia) - Octubre 2025",
    priceLabel: "EUR/kWh",
    cheapest: "🏆 Més Barat",
    mostExpensive: "⚠️ Més Car",
    difference: "📊 Diferència",
    hugeVariation: "Enorme variació!",
    moderateVariation: "Variació moderada",
    loading: "Carregant preus regionals...",
    error: "Error en carregar dades de regions",
    sources: {
      title: "📡 Fonts de Dades REALS:",
      usa: "USA",
      usaSource: "EIA API (Juliol 2025)",
      europe: "Europa",
      europeSource: "Eurostat/OECD (2024)",
      asia: "Àsia",
      asiaSource: "Fonts governamentals (2024)"
    }
  },

  // Docs Page
  docs: {
    title: "Documentació",
    subtitle: "Guia completa de la Calculadora TCO Intel·ligent",
    
    whatIsTCO: {
      title: "Què és el TCO?",
      definition: "El Cost Total de Propietat (TCO) és una anàlisi financera integral que calcula el cost complet d'adquirir, utilitzar i mantenir xips semiconductors durant tot el seu cicle de vida. A diferència de les simples comparacions de preu de compra, el TCO inclou tots els costos directes i indirectes associats amb l'adquisició i operació de xips.",
      importance: "Per a la fabricació de semiconductors, l'anàlisi TCO és crítica perquè els costos operacionals (especialment el consum energètic) sovint superen el preu de compra inicial del xip entre 10-100 vegades durant un període de 5 anys. Comprendre el veritable TCO ajuda les organitzacions a optimitzar estratègies d'adquisició, seleccionar ubicacions de fabricació apropiades i aprofitar incentius polítics com l'EU Chips Act.",
      components: {
        chips: "Costos Directes de Xips",
        chipsDesc: "Preu de compra inicial per xip, que varia segons el tipus de material (Si, GaN, GaAs) i la complexitat de fabricació. Típicament el component més petit del TCO total (1-10%).",
        energy: "Consum Energètic",
        energyDesc: "Costos operacionals d'electricitat basats en preus energètics industrials reals de dades OECD i ENTSO-E. Normalment el component més gran del TCO (60-98%), fortament influenciat per mercats energètics regionals i eficiència del material.",
        carbon: "Impost de Carboni",
        carbonDesc: "Preu del carboni de la UE aplicat a emissions de fabricació, que varia per regió i material. Reflecteix el compromís de la UE amb la producció sostenible de semiconductors sota el Green Deal.",
        subsidies: "Subvencions EU Chips Act",
        subsidiesDesc: "Incentius financers proporcionats per la Unió Europea per reduir la dependència de semiconductors de proveïdors d'Àsia-Pacífic. Poden reduir el TCO total entre 30-50% en regions elegibles com Alemanya, França i Països Baixos."
      }
    },
    
    chatAssistant: {
      title: "Assistent de Xat amb IA",
      description: "El nostre assistent de xat intel·ligent està impulsat per Gemini AI de Google i un motor RAG (Generació Augmentada per Recuperació) especialitzat. Proporciona respostes en temps real a les teves preguntes sobre TCO de semiconductors, polítiques de la UE, incentius regionals i estratègies d'adquisició.",
      benefits: "El xat aprèn d'una base de coneixement integral que inclou documentació de l'EU Chips Act, dades energètiques d'OECD, recerca de semiconductors de JRC i informes industrials. Pot explicar càlculs complexos, comparar escenaris regionals i proporcionar insights personalitzats basats en el teu cas d'ús específic.",
      features: {
        aiPowered: "Impulsat per Gemini AI",
        aiPoweredDesc: "Utilitza l'últim model Gemini 2.0 Flash de Google per a comprensió i generació de llenguatge natural. Proporciona respostes conversacionals similars a les humanes amb coneixement tècnic profund.",
        multilingual: "Suport Multilingüe",
        multilingualDesc: "Xateja en català, anglès o espanyol. La IA tradueix automàticament les respostes preservant la precisió tècnica i el context.",
        contextual: "Base de Coneixement RAG",
        contextualDesc: "Recupera informació rellevant de documents de la UE indexats, articles de recerca i dades industrials usant cerca vectorial FAISS. Assegura que les respostes estiguin fonamentades en fonts factuals.",
        insights: "Insights Intel·ligents",
        insightsDesc: "Analitza els teus càlculs TCO i proporciona recomanacions estratègiques sobre optimització de costos, selecció regional i oportunitats de subvenció sota l'EU Chips Act."
      }
    },
    
    dataSources: {
      title: "Fonts de Dades i Dades del Món Real",
      description: "Els nostres càlculs TCO estan fonamentats en dades autoritzades i del món real d'institucions europees i internacionals de recerca líders. Integrem múltiples fonts de dades per garantir precisió, transparència i compliment amb els marcs de política de semiconductors de la UE.",
      sources: {
        jrc: "Centre Comú de Recerca de la UE (JRC)",
        jrcDesc: "Dades completes de fabricació de semiconductors incloent propietats de materials, costos de producció i mètriques d'eficiència del centre de recerca oficial de la UE. Actualitzat anualment amb els últims benchmarks de la indústria.",
        oecd: "Preus d'Energia OECD i ENTSO-E",
        oecdDesc: "Preus reals d'energia industrial per regió de bases de dades OECD i Xarxa Europea d'Operadors de Sistemes de Transmissió d'Electricitat (ENTSO-E). Reflecteix condicions reals del mercat i variacions regionals.",
        euChips: "Documents de Política de l'EU Chips Act",
        euChipsDesc: "Programes oficials de subvencions, incentius regionals i directrius de política de la iniciativa EU Chips Act de la Comissió Europea. Inclou oportunitats de finançament específiques per país i criteris d'elegibilitat.",
        industry: "Informes de Costos de la Indústria",
        industryDesc: "Dades de preus de xips, taxes d'impost de carboni i costos de fabricació obtinguts d'informes de la indústria de semiconductors, firmes de recerca de mercat i publicacions governamentals oficials."
      }
    },
    
    randomForest: {
      title: "Model de Predicció Random Forest",
      description: "Utilitzem un model d'aprenentatge automàtic Random Forest per predir el Cost Total de Propietat amb alta precisió. Aquest mètode d'aprenentatge ensemble combina múltiples arbres de decisió per capturar relacions complexes i no lineals entre variables com tipus de material, regió, volum i horitzó temporal.",
      benefits: "El model s'entrena amb dades històriques de costos de semiconductors i es valida contínuament contra resultats del món real. Maneja entrades multidimensionals i proporciona prediccions robustes fins i tot quan les dades contenen soroll o valors atípics, fent-lo ideal per al complex mercat de semiconductors.",
      features: {
        accuracy: "Alta Precisió de Predicció",
        accuracyDesc: "Aconsegueix >95% de precisió en dades de validació aprenent de milers d'escenaris TCO històrics en diferents materials, regions i condicions de mercat.",
        features: "Anàlisi Multi-Factor",
        featuresDesc: "Analitza simultàniament més de 8 variables d'entrada: tipus de material (Si/GaN/GaAs), regió, volum de producció, horitzó temporal, patrons de consum energètic, polítiques de carboni i elegibilitat de subvencions.",
        training: "Aprenentatge Continu",
        trainingDesc: "El model es reentrena trimestralment amb les últimes dades d'OECD, JRC i fonts de la indústria per adaptar-se a l'evolució de preus energètics, programes de subvencions i costos de fabricació."
      }
    },
    
    ragEngine: {
      title: "Motor RAG (Generació Augmentada per Recuperació)",
      description: "El nostre sistema RAG combina recuperació de documents amb generació d'IA per proporcionar respostes contextualment precises i recolzades per fonts. Indexa milers de pàgines de documents de polítiques de la UE, articles de recerca i informes industrials usant embeddings vectorials FAISS.",
      benefits: "A diferència dels chatbots genèrics, el nostre motor RAG recupera passatges específics i rellevants abans de generar respostes. Això assegura que les respostes estiguin fonamentades en dades factuals, citin fonts reals i proporcionin informació actualitzada sobre polítiques de semiconductors de la UE i millors pràctiques de TCO.",
      features: {
        vectorSearch: "Cerca Vectorial FAISS",
        vectorSearchDesc: "Utilitza Facebook AI Similarity Search (FAISS) per trobar contingut semànticament similar en mil·lisegons. Cerca en més de 10,000 fragments de documents amb embeddings de 384 dimensions per a recuperació de context precisa.",
        contextual: "Recuperació Conscient del Context",
        contextualDesc: "Recupera les 5-10 seccions de documents més rellevants basant-se en el significat semàntic de la teva pregunta, no només en coincidència de paraules clau. Comprèn sinònims, argot tècnic i conceptes específics del domini.",
        knowledge: "Base de Coneixement Curada",
        knowledgeDesc: "Els documents indexats inclouen PDFs de l'EU Chips Act, recerca de semiconductors de JRC, informes energètics d'OECD, legislació sobre impostos de carboni i directrius de programes de subvencions. Actualitzat mensualment amb els últims canvis de política.",
        realtime: "Processament de Consultes en Temps Real",
        realtimeDesc: "Recupera context rellevant i genera respostes d'IA en <2 segons. Emmagatzema en memòria cau consultes freqüents per a un rendiment encara més ràpid mantenint precisió i frescor."
      }
    },
    
    geminiAI: {
      title: "Gemini AI (Generació de Llenguatge Natural)",
      description: "Aprofitem el model Gemini 2.0 Flash Experimental de Google per a comprensió i generació de llenguatge natural. Gemini transforma dades tècniques i documents recuperats en explicacions clares i conversacionals adaptades a les teves preguntes.",
      benefits: "Gemini sobresurt en explicar economia complexa de semiconductors en llenguatge senzill, comparant escenaris regionals i proporcionant recomanacions estratègiques. Manté precisió tècnica mentre és accessible tant per a experts com per a no especialistes, amb suport multilingüe complet.",
      features: {
        advanced: "Model de Llenguatge Avançat",
        advancedDesc: "Gemini 2.0 Flash Experimental compta amb una finestra de context de 2 milions de tokens, comprensió multimodal i capacitats de raonament d'última generació. Processa documents llargs i consultes complexes eficientment.",
        conversational: "Conversacions Similars a Humanes",
        conversationalDesc: "Genera respostes naturals i coherents que se senten com parlar amb un expert en economia de semiconductors. Recorda el context de la conversa, fa preguntes aclaridores i adapta el to a les teves necessitats.",
        multilingual: "Suport Multilingüe Natiu",
        multilingualDesc: "Entrenat en més de 100 idiomes amb excel·lent rendiment en català, espanyol i anglès. Tradueix respostes preservant terminologia tècnica, nombres i precisió de format.",
        markdown: "Format Markdown Ric",
        markdownDesc: "Genera respostes en Markdown estructurat amb capçaleres, punts, taules i èmfasi. Fa que els desglossaments complexos de TCO siguin fàcils de llegir i copiar per a informes o presentacions."
      }
    },
    
    consumer: {
      title: "Per al Consumidor",
      targetTitle: "Públic Objectiu",
      targetContent: "Aquesta eina està dissenyada per a professionals de la indústria de semiconductors, gerents d'adquisicions, directors financers i estrategues de cadena de subministrament de tot el món que avaluen decisions d'abastiment de xips. Cobreix 32 països de la UE, EUA, Àsia-Pacífic i Amèrica Llatina amb dades en temps real de Mendeley, IEA i benchmarks industrials validats per BCG (2023).",
      purposeTitle: "Propòsit",
      purposeContent: "La Calculadora TCO Intel·ligent proporciona anàlisi de Cost Total de Propietat (TCO) basat en dades per a materials semiconductors en regions de la UE, integrant preus d'energia en temps real, polítiques d'impostos de carboni i subvencions de la Llei de Xips de la UE. Ajuda les organitzacions a prendre decisions informades sobre adquisició de xips, ubicació de producció i selecció de materials.",
      objectivesTitle: "Objectius Clau",
      objective1: "Model·lització Transparent de Costos: Desglossar tots els components de cost (cost del xip, energia, impost de carboni, manteniment, risc de cadena de subministrament)",
      objective2: "Insights Impulsats per IA: Aprofitar Google Gemini per generar recomanacions estratègiques basades en el teu escenari específic",
      objective3: "Integració de Polítiques: Factoritzar automàticament subvencions de la Llei de Xips de la UE i incentius regionals",
      objective4: "Projeccions Futures: Visualitzar tendències a 5 anys per a costos energètics i taxes de subvenció"
    },

    components: {
      title: "Components de l'Aplicació",
      subtitle: "Comprenent les 5 parts clau de la interfície",
      
      input: {
        title: "1. Formulari d'Entrada",
        content: "Selecciona el teu material semiconductor (Si, SiC, GaN, GaAs, Diamond, Graphene, CNT), regió de la UE objectiu, volum de producció i horitzó temporal. El sistema valida entrades i proporciona retroalimentació en temps real."
      },
      
      calculator: {
        title: "2. Calculadora TCO",
        content: "Motor de càlcul principal que processa les teves entrades contra conjunts de dades reals (dades de semiconductors JRC, preus d'energia OCDE, propietats de Materials Project) per calcular el cost total de propietat. Inclou càlculs automàtics de subvencions basats en criteris d'elegibilitat de la Llei de Xips de la UE."
      },
      
      ai: {
        title: "3. Panell d'Explicació IA",
        content: "Impulsat per Google Gemini 1.5 Flash, aquest component genera insights personalitzats incloent resum executiu, principals impulsors de cost, recomanacions estratègiques i anàlisi comparativa. Recorre a un sofisticat motor d'explicació dinàmic quan l'API de Gemini no està disponible."
      },
      
      scenarios: {
        title: "4. Perspectiva Regional a 5 Anys",
        content: "Gràfic interactiu (construït amb Recharts) que mostra costos energètics projectats i taxes de subvenció per a la teva regió seleccionada durant un període de 5 anys. Ajuda a identificar el moment òptim per a decisions d'adquisició."
      },
      
      breakdown: {
        title: "5. Vista de Desglossament de Costos",
        content: "Detall complet de tots els components TCO amb percentatges, mostrant l'impacte de cada factor (cost del xip, energia, impost de carboni, manteniment, risc de cadena de subministrament) tant abans com després de subvencions."
      }
    },

    technical: {
      title: "Arquitectura Tècnica",
      
      frontend: {
        title: "Stack Frontend",
        react: "React 19: Última versió amb renderització concurrent millorada",
        typescript: "TypeScript 5.x: Desenvolupament amb seguretat de tipus en mode estricte",
        vite: "Vite 6.3.6: HMR ultraràpid i compilacions de producció optimitzades",
        tailwind: "Tailwind CSS: Estils utility-first amb tema rosa personalitzat",
        recharts: "Recharts 3.2.1: Visualització de dades responsive"
      },
      
      backend: {
        title: "Arquitectura Backend",
        fastapi: "FastAPI 0.109.0: Framework web Python asíncron d'alt rendiment",
        uvicorn: "Uvicorn 0.27.0: Servidor ASGI amb suport WebSocket",
        pydantic: "Pydantic v2: Validació i serialització de dades",
        structure: "Estructura modular: Routers (tco, materials, regions, scenarios), Services (agent Gemini, motor ML, accés a dades), Models (entities, schemas)"
      },
      
      ai: {
        title: "Components IA/ML",
        gemini: "Google Gemini 1.5 Flash: Model IA principal per a explicacions",
        transformers: "Sentence Transformers (all-MiniLM-L6-v2): Generació d'embeddings locals",
        faiss: "FAISS: Cerca de similitud vectorial per a recuperació RAG",
        rag: "Pipeline RAG: Capa de Coneixement de Dades amb carregador, recuperador i motor"
      },
      
      data: {
        title: "Capa de Dades",
        jrc: "Dades de Semiconductors JRC: Base de dades de materials del Centre Comú d'Investigació de la UE",
        oecd: "Preus d'Energia OCDE: Costos d'energia industrial en temps real per país",
        materials: "Materials Project: Propietats físiques de compostos semiconductors",
        mock: "Nota: La implementació actual usa conjunts de dades mock curats per a propòsits de demostració"
      },
      
      api: {
        title: "Endpoints API",
        health: "GET /health - Verificació de salut del servei",
        materials: "GET /api/materials - Llistar materials semiconductors disponibles",
        regions: "GET /api/regions - Llistar regions de la UE amb dades de polítiques",
        scenarios: "GET /api/scenarios - Generar projeccions a 5 anys",
        predict: "POST /api/predict - Calcular TCO per a escenari específic",
        explain: "POST /api/explain - Generar explicació impulsada per IA",
        docs: "GET /docs - Documentació interactiva OpenAPI"
      },
      
      deployment: {
        title: "Objectiu de Desplegament",
        content: "Backend configurat per a desplegament a Google Cloud Run (regió europe-southwest1) amb contenidorització Docker. Frontend compila a assets estàtics per a distribució CDN."
      }
    },

    apiLink: "Prova l'API amb Postman"
  },

  // About Page
  about: {
    title: "Sobre Aquest Projecte",
    
    author: {
      title: "Autora",
      name: "Marta Mateu López",
      description: "Especialista en IA i Enginyeria de Dades apassionada per aprofitar tecnologia d'avantguarda per resoldre reptes del món real en la indústria de semiconductors. Amb experiència en desenvolupament full-stack, aprenentatge automàtic i infraestructura al núvol, dissenyo sistemes intel·ligents que conecten dades complexes amb insights accionables.",
      linkedin: "Veure Perfil de LinkedIn",
      globalAudience: {
        title: "Eina Global:",
        description: "Aquesta solució està dissenyada per a professionals de la indústria de semiconductors, gerents de compres, directors financers i estrategues de cadena de subministrament arreu del món que avaluen decisions d'abastament de xips. Cobreix 32 països a la UE, EUA, Àsia-Pacífic i Amèrica Llatina."
      }
    },
    
    motivation: {
      title: "Per Què Existeix Aquesta Eina",
      intro: "Aquest projecte va ser creat per abordar una bretxa crítica a la indústria de semiconductors:",
      problem: "la manca d'eines fiables i basades en dades per calcular el TCO",
      bcgReference: "Com es destaca a",
      bcgLinkText: "l'informe de BCG de 2023 sobre costos de fabricació de semiconductors",
      challenges: "la indústria s'enfronta a reptes significatius per predir amb precisió el Cost Total de Propietat a causa de:",
      challenge1: "Alta variabilitat en preus globals d'energia (diferència de 10x entre regions)",
      challenge2: "Programes de subsidis complexos (EU Chips Act, US CHIPS Act, etc.) que poden reduir el TCO en un 25-50%",
      challenge3: "Creixent importància d'impostos al carboni i intensitat de carboni de la xarxa en costos de fabricació",
      challenge4: "Manca de fonts de dades transparents i en temps real per prendre decisions informades",
      solution: "Aquesta eina combina conjunts de dades acadèmiques reals (Mendeley DOI: 10.17632/s54n4tyyz4.3, IEA Carbon Intensity Database), aprenentatge automàtic (Random Forest amb més de 20,000 escenaris) i explicacions impulsades per RAG per proporcionar als professionals de la indústria prediccions de TCO precises i transparents validades contra benchmarks de BCG."
    },
    
    program: {
      title: "Programa Top Rosies Talent",
      description: "Aquest projecte va ser desenvolupat com a part de la iniciativa Top Rosies Talent d'UPC School, un prestigiós programa dissenyat per cultivar la propera generació de líders tecnològics a Espanya. El programa combina formació intensiva en IA, computació al núvol i enginyeria de programari amb desenvolupament de projectes del món real.",
      link: "Saber Més",
      objectives: "Objectius del Programa:",
      objective1: "Dominar tècniques avançades d'IA/ML (LLMs, RAG, bases de dades vectorials)",
      objective2: "Construir aplicacions full-stack llestes per a producció",
      objective3: "Integrar plataformes cloud empresarials (Google Cloud, AWS)",
      objective4: "Desenvolupar pensament estratègic per a solucions empresarials impulsades per tecnologia",
      learnMore: "Saber Més",
      website: "Visita el lloc web oficial de Top Rosies Talent per explorar el currículum del programa, històries d'èxit i detalls d'aplicació."
    },
    
    acknowledgments: {
      title: "Agraïments",
      text: "Agraïments especials al professorat d'UPC School, mentors a Top Rosies Talent, i la comunitat de codi obert les eines i biblioteques de la qual van fer possible aquest projecte. Aquesta calculadora demostra el potencial de la IA per democratitzar l'accés a anàlisis industrials complexes.",
      mentor: "Mentora",
      organization: "Organització",
      content: "Agraïments especials al professorat d'UPC School, mentors a Top Rosies Talent, i la comunitat de codi obert les eines i biblioteques de la qual van fer possible aquest projecte. Aquesta calculadora demostra el potencial de la IA per democratitzar l'accés a anàlisis industrials complexes."
    },
    
    tech: {
      title: "Tecnologies Utilitzades",
      frontend: "Stack Frontend",
      backend: "Arquitectura Backend"
    },
    
    footer: {
      message: "Construït amb passió per la IA i els semiconductors",
      contact: "Oberta a col·laboració i consultes",
      copyright: "© 2024 Marta Mateu López. Tots els drets reservats.",
      project: "Construït amb ❤️ com a part del programa Top Rosies Talent."
    }
  },
  
  citations: {
    title: "Referències Bibliogràfiques",
    subtitle: "Citacions formals de tots els conjunts de dades i articles de recerca utilitzats a la Calculadora Intel·ligent de TCO. Totes les fonts de dades estan verificades, revisades per parells o provenen de fonts governamentals/institucionals oficials.",
    dataQuality: {
      title: "Garantia de Qualitat de Dades",
      authenticity: "Només fonts oficials (agències governamentals, institucions de recerca, publicacions revisades per parells)",
      timeliness: "Preus d'energia actualitzats cada 24 hores, altres dades revisades trimestralment",
      completeness: "Validació creuada entre múltiples fonts independents",
      accuracy: "Controls estadístics de valors atípics i anomalies"
    },
    categoryNames: {
      energyData: "Dades de Preus d'Energia",
      semiconductorData: "Dades de la Indústria de Semiconductors",
      carbonData: "Preus de Carboni i Dades Ambientals",
      policyData: "Informació de Polítiques i Subsidis"
    },
    updateSchedule: {
      title: "Calendari d'Actualització de Dades",
      energy: "Preus d'Energia - Actualitzats cada 24 hores des d'APIs d'ENTSO-E i EIA",
      materials: "Propietats de Materials - Dades estàtiques, validades trimestralment",
      carbon: "Preus de Carboni - Actualitzats mensualment des de resultats de subhastes EU ETS",
      subsidies: "Informació de Subsidis - Revisada trimestralment, actualitzada quan ocorren canvis de política"
    },
    footer: {
      format: "Citacions formatades segons APA 7a Edició",
      lastUpdated: "Última Actualització: 14 d'octubre de 2025"
    },
    datasets: {
      title: "Conjunts de Dades",
      subtitle: "Bases de dades científiques i repositoris de dades"
    },
    reports: {
      title: "Informes i Documentació Oficial",
      subtitle: "Publicacions governamentals, regulacions i anàlisis de la indústria"
    },
    copyBibtex: "Copiar BibTeX",
    copiedBibtex: "BibTeX copiat!",
    viewSource: "Veure font",
    categories: {
      energy: "Energia",
      semiconductor: "Semiconductors",
      carbon: "Carboni",
      policy: "Política",
      market: "Mercat"
    }
  },

  // ML Visualization
  mlViz: {
    title: "Visualització del Model ML Random Forest",
    subtitle: "Entenent com el nostre model de machine learning prediu el TCO",
    loading: "Carregant model Random Forest...",
    error: "Error en carregar el model Random Forest. Assegura't que el model està entrenat.",
    featureImportance: "Importància de Característiques",
    featureImportanceDesc: "Quins factors tenen més impacte en les prediccions del TCO?",
    modelMetrics: "Mètriques del Model",
    accuracy: "Puntuació R² (Precisió)",
    trainingSamples: "Mostres d'Entrenament",
    trees: "Arbres de Decisió",
    maxDepth: "Profunditat Màxima",
    howItWorks: "Com Funciona Random Forest",
    howItWorksDesc: "Random Forest combina múltiples arbres de decisió per fer prediccions precises. Cada arbre analitza diferents característiques i vota pel resultat final.",
    modelValidation: "Validació del Model",
    modelValidationDesc: "El nostre model aconsegueix alta precisió mitjançant validació creuada i proves amb dades no vistes."
  },

  // RAG Visualization
  ragViz: {
    title: "Visualització del Sistema RAG",
    subtitle: "Entenent com la nostra IA recupera i utilitza el coneixement",
    loading: "Carregant sistema RAG...",
    error: "Error en carregar la visualització del sistema RAG. Si us plau, verifica la connexió amb el backend.",
    embeddingSpace: "Espai d'Embeddings de Documents",
    embeddingSpaceDesc: "Projecció 2D d'embeddings de documents usant t-SNE. Els documents similars estan més a prop.",
    retrievalDemo: "Demostració de Recuperació de Documents",
    retrievalDemoDesc: "Prova com el sistema RAG troba documents rellevants per a diferents consultes.",
    selectQuery: "Selecciona una consulta:",
    topDocuments: "Documents Principals Recuperats",
    score: "Puntuació de Similitud",
    ragStats: "Estadístiques del Sistema RAG",
    totalDocuments: "Total de Documents",
    totalChunks: "Total de Fragments",
    embeddingDimension: "Dimensió d'Embedding",
    modelName: "Model d'Embedding",
    indexType: "Tipus d'Índex",
    knowledgeBase: "Fonts de la Base de Coneixement",
    category: "Categoria",
    chunks: "Fragments",
    energyPrices: "Preus d'Energia",
    subsidies: "Subsidis",
    materials: "Materials",
    regulations: "Regulacions",
    carbon: "Carboni"
  }
};
