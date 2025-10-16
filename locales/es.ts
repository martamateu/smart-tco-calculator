import { Translations } from './en';

export const es: Translations = {
  // NavBar
  nav: {
    title: "Calculadora TCO Inteligente",
    home: "Inicio",
    dashboards: "Gráficos",
    dashboardOutlook: "Perspectiva Regional a 5 Años",
    dashboardEnergyComparison: "Comparación de Precios de Energía (5 Años)",
    dashboardEnergyPrices: "Precios Industriales de Energía por Región",
    dashboardMLModel: "Visualización del Modelo ML",
    dashboardRAGSystem: "Visualización del Sistema RAG",
    docs: "Documentación",
    citations: "Citaciones",
    about: "Sobre"
  },

  // Home Page - Input Form
  home: {
    pageTitle: "Calculadora Inteligente de TCO para Semiconductores",
    pageSubtitle: "Aprovecha datos reales e IA generativa para pronosticar el coste total de propiedad.",
    title: "Calculadora Inteligente de TCO para Semiconductores",
    subtitle: "Optimiza tu estrategia de adquisición de chips con análisis de Coste Total de Propiedad impulsado por IA bajo la Ley de Chips de la UE",
    selectMaterial: "Seleccionar Material",
    selectRegion: "Seleccionar Región",
    volume: "Volumen de Producción (chips)",
    years: "Horizonte Temporal (años)",
    calculate: "Calcular TCO",
    calculating: "Calculando..."
  },

  // Results Card
  results: {
    title: "Resultados del Análisis TCO",
    totalCost: "Coste Total de Propiedad",
    costPerChip: "Coste por Chip",
    annualCost: "Coste Anual",
    breakdown: "Desglose de Costes",
    chipCost: "Coste del Chip",
    energyCost: "Coste Energético",
    carbonTax: "Impuesto de Carbono",
    maintenance: "Mantenimiento",
    supplyChainRisk: "Riesgo de Cadena de Suministro",
    totalBeforeSubsidy: "Total Antes de Incentivos",
    subsidyAmount: "Incentivos Gubernamentales",
    totalAfterSubsidy: "Total Después de Incentivos",
    costComponents: "Componentes de Coste",
    costInEur: "Coste (EUR)",
    dataWarning: "Advertencia de Datos",
    dataInfo: "Información de Datos",
    lastUpdate: "Última Actualización",
    noData: "No hay datos disponibles",
    energyPrices: "Precios de Energía",
    dataAge: "Antigüedad de Datos",
    justUpdated: "Recién Actualizado",
    source: "Fuente",
    otherSources: "Otros Datos",
    subsidyUnknown: "⚠️ Tasa de subsidio estimada (5%) - no hay programa gubernamental verificado documentado",
    subsidyEstimate: "Estimado (datos en investigación)"
  },

  // Explanation Panel
  explanation: {
    title: "Insights Impulsados por IA",
    loading: "Generando explicación con IA...",
    summary: "Resumen Ejecutivo",
    keyDrivers: "Principales Impulsores de Coste",
    recommendations: "Recomendaciones Estratégicas",
    comparative: "Análisis Comparativo",
    citations: "Fuentes de Datos y Referencias",
    chatTitle: "Haz Preguntas de Seguimiento",
    chatPlaceholder: "Pregunta sobre costes de energía, subsidios, comparaciones...",
    send: "Enviar",
    thinking: "Pensando...",
    tryAsking: "Prueba preguntar:",
    copy: "Copiar",
    copied: "¡Copiado!",
    suggestedQuestions: [
      "¿Por qué el coste de energía es tan alto?",
      "¿Qué subsidios están disponibles?",
      "¿Cómo se compara con otros materiales?",
      "¿Cuál es el impacto del impuesto al carbono?",
      "¿Cómo puedo reducir los costes?"
    ]
  },

  // Scenario Chart
  chart: {
    title: "Perspectiva Regional a 5 Años",
    subtitle: "Tendencias proyectadas para tu escenario",
    dataMethod: "📊 Datos: Precios de energía reales + proyecciones a 5 años basadas en fórmulas",
    region: "Región",
    material: "Material",
    year: "Año",
    energyCost: "Coste Energético (k€)",
    subsidyRate: "Tasa de Subvención (%)",
    formulaExplanation: "📐 Explicación de las Fórmulas de Proyección",
    formulaDetails: "Las proyecciones a 5 años se calculan usando fórmulas validadas basadas en datos de fabricación de semiconductores del JRC:",
    energyFormula: "• **Crecimiento del Coste Energético**: Tasa de crecimiento anual del 3-5% basada en tendencias del mercado energético de la UE (datos históricos ENTSO-E)",
    subsidyFormula: "• **Evolución de la Tasa de Subvención**: Tasas de subvención de la EU Chips Act (25-30% para regiones elegibles) con factores de estabilidad política",
    carbonFormula: "• **Impacto del Impuesto de Carbono**: Trayectoria de precios del carbono EU ETS (€90-120/tonelada) integrada en los costes energéticos",
    whyNotAI: "🤖 ¿Por qué no usar IA/ML para proyecciones?",
    whyNotAIDetails: "Aunque tenemos un modelo ML Random Forest (entrenado con más de 10,000 escenarios) para cálculos TCO instantáneos, **las proyecciones a largo plazo usan fórmulas deterministas** porque:",
    reason1: "• **Certeza regulatoria**: Las políticas de la EU Chips Act están legalmente definidas para 2025-2030",
    reason2: "• **Transparencia**: Las fórmulas son auditables y explicables (requerido para toma de decisiones industriales)",
    reason3: "• **Estabilidad**: Los modelos IA pueden introducir incertidumbre en proyecciones basadas en políticas",
    reason4: "• **Validación**: Los informes JRC proporcionan datos base validados que las fórmulas pueden referenciar directamente",
    mlUsage: "💡 El modelo ML se usa para: cálculos TCO instantáneos, predicciones de propiedades de materiales y evaluación de riesgo de cadena de suministro.",
    dataSources: "📚 Fuentes de Datos",
    linkToCitations: "Ver citaciones completas y metodología"
  },

  // Enhanced Scenario Chart (Multi-region comparison)
  enhancedChart: {
    title: "Comparación de Precios de Energía REALES (5 años)",
    subtitle: "Datos en vivo de EIA (USA), Eurostat (EU), Fuentes gubernamentales (Asia)",
    dataMethod: "📊 Datos: Precios en tiempo real ENTSO-E/EIA + proyecciones de 5 años basadas en fórmulas",
    year: "Año",
    energyCostLabel: "Coste Energético (EUR/kWh)",
    loading: "Cargando gráfica comparativa...",
    error: "Error al cargar datos de comparación",
    selectRegions: "Selecciona al menos una región para comparar",
    selectRegionsLabel: "Seleccionar Regiones",
    selectMetricLabel: "Selecciona métrica a mostrar:",
    metricEnergy: "Coste Energético (€/kWh)",
    metricSubsidy: "Tasa de Incentivos (%)",
    metricTotal: "Coste Total (€)",
    disclaimerTitle: "⚠️ Aviso de Calidad de Datos",
    disclaimerUnknown: "Las siguientes regiones tienen tasas de subsidio estimadas (5%) debido a falta de programas gubernamentales verificados:",
    disclaimerAction: "Estas estimaciones son conservadoras y requieren verificación con fuentes oficiales.",
    formulaTitle: "📊 ¿Cómo se calculan las proyecciones a 5 años?",
    formulaBaseline: "BASELINE (Más Probable): Costes energía crecen 2%/año, subsidios bajan 2%/año",
    formulaOptimistic: "OPTIMISTA (Mejor Caso): Costes energía bajan 3%/año, subsidios suben 5%/año (máx. 50%)",
    formulaPessimistic: "PESIMISTA (Peor Caso): Costes energía crecen 5%/año, subsidios bajan 10%/año",
    dataSourcesTitle: "📡 Fuentes de Datos",
    dataSourceEnergy: "Precios Energía: ENTSO-E (UE), EIA (USA), OECD (Asia/Américas)",
    dataSourceSubsidy: "Subsidios: Ley de Chips UE, CHIPS Act USA, programas nacionales verificados (ver SUBSIDY_SOURCES.md)",
    dataSourceProjection: "Proyecciones: Escenarios basados en fórmulas (ver TCO_FORMULAS.md para detalles matemáticos)"
  },

  // Regional Price Comparison
  regionalComparison: {
    title: "⚡ Precios de Energía Industrial REALES por Región",
    subtitle: "Datos actualizados de EIA (USA), Eurostat (EU) y fuentes gubernamentales (Asia) - Octubre 2025",
    priceLabel: "EUR/kWh",
    cheapest: "🏆 Más Barato",
    mostExpensive: "⚠️ Más Caro",
    difference: "📊 Diferencia",
    hugeVariation: "¡Enorme variación!",
    moderateVariation: "Variación moderada",
    loading: "Cargando precios regionales...",
    error: "Error al cargar datos de regiones",
    sources: {
      title: "📡 Fuentes de Datos REALES:",
      usa: "USA",
      usaSource: "EIA API (Julio 2025)",
      europe: "Europa",
      europeSource: "Eurostat/OECD (2024)",
      asia: "Asia",
      asiaSource: "Fuentes gubernamentales (2024)"
    }
  },

  // Docs Page
  docs: {
    title: "Documentación",
    subtitle: "Guía completa de la Calculadora TCO Inteligente",
    
    whatIsTCO: {
      title: "¿Qué es el TCO?",
      definition: "El Coste Total de Propiedad (TCO) es un análisis financiero integral que calcula el coste completo de adquirir, usar y mantener chips semiconductores durante todo su ciclo de vida. A diferencia de las simples comparaciones de precio de compra, el TCO incluye todos los costes directos e indirectos asociados con la adquisición y operación de chips.",
      importance: "Para la fabricación de semiconductores, el análisis TCO es crítico porque los costes operacionales (especialmente el consumo energético) suelen superar el precio de compra inicial del chip entre 10-100 veces durante un período de 5 años. Comprender el verdadero TCO ayuda a las organizaciones a optimizar estrategias de adquisición, seleccionar ubicaciones de fabricación apropiadas y aprovechar incentivos políticos como el EU Chips Act.",
      components: {
        chips: "Costes Directos de Chips",
        chipsDesc: "Precio de compra inicial por chip, que varía según el tipo de material (Si, GaN, GaAs) y la complejidad de fabricación. Típicamente el componente más pequeño del TCO total (1-10%).",
        energy: "Consumo Energético",
        energyDesc: "Costes operacionales de electricidad basados en precios energéticos industriales reales de datos OECD y ENTSO-E. Normalmente el componente más grande del TCO (60-98%), fuertemente influenciado por mercados energéticos regionales y eficiencia del material.",
        carbon: "Impuesto de Carbono",
        carbonDesc: "Precio del carbono de la UE aplicado a emisiones de fabricación, que varía por región y material. Refleja el compromiso de la UE con la producción sostenible de semiconductores bajo el Green Deal.",
        subsidies: "Subvenciones EU Chips Act",
        subsidiesDesc: "Incentivos financieros proporcionados por la Unión Europea para reducir la dependencia de semiconductores de proveedores de Asia-Pacífico. Pueden reducir el TCO total entre 30-50% en regiones elegibles como Alemania, Francia y Países Bajos."
      }
    },
    
    chatAssistant: {
      title: "Asistente de Chat con IA",
      description: "Nuestro asistente de chat inteligente está impulsado por Gemini AI de Google y un motor RAG (Generación Aumentada por Recuperación) especializado. Proporciona respuestas en tiempo real a tus preguntas sobre TCO de semiconductores, políticas de la UE, incentivos regionales y estrategias de adquisición.",
      benefits: "El chat aprende de una base de conocimiento integral que incluye documentación del EU Chips Act, datos energéticos de OECD, investigación de semiconductores de JRC e informes industriales. Puede explicar cálculos complejos, comparar escenarios regionales y proporcionar insights personalizados basados en tu caso de uso específico.",
      features: {
        aiPowered: "Impulsado por Gemini AI",
        aiPoweredDesc: "Utiliza el último modelo Gemini 2.0 Flash de Google para comprensión y generación de lenguaje natural. Proporciona respuestas conversacionales similares a las humanas con conocimiento técnico profundo.",
        multilingual: "Soporte Multilingüe",
        multilingualDesc: "Chatea en catalán, inglés o español. La IA traduce automáticamente las respuestas preservando la precisión técnica y el contexto.",
        contextual: "Base de Conocimiento RAG",
        contextualDesc: "Recupera información relevante de documentos de la UE indexados, artículos de investigación y datos industriales usando búsqueda vectorial FAISS. Asegura que las respuestas estén fundamentadas en fuentes factuales.",
        insights: "Insights Inteligentes",
        insightsDesc: "Analiza tus cálculos TCO y proporciona recomendaciones estratégicas sobre optimización de costos, selección regional y oportunidades de subvención bajo el EU Chips Act."
      }
    },
    
    dataSources: {
      title: "Fuentes de Datos y Datos del Mundo Real",
      description: "Nuestros cálculos TCO están fundamentados en datos autorizados y del mundo real de instituciones europeas e internacionales de investigación líderes. Integramos múltiples fuentes de datos para garantizar precisión, transparencia y cumplimiento con los marcos de política de semiconductores de la UE.",
      sources: {
        jrc: "Centro Común de Investigación de la UE (JRC)",
        jrcDesc: "Datos completos de fabricación de semiconductores incluyendo propiedades de materiales, costos de producción y métricas de eficiencia del centro de investigación oficial de la UE. Actualizado anualmente con los últimos benchmarks de la industria.",
        oecd: "Precios de Energía OECD y ENTSO-E",
        oecdDesc: "Precios reales de energía industrial por región de bases de datos OECD y Red Europea de Operadores de Sistemas de Transmisión de Electricidad (ENTSO-E). Refleja condiciones reales del mercado y variaciones regionales.",
        euChips: "Documentos de Política del EU Chips Act",
        euChipsDesc: "Programas oficiales de subvenciones, incentivos regionales y directrices de política de la iniciativa EU Chips Act de la Comisión Europea. Incluye oportunidades de financiación específicas por país y criterios de elegibilidad.",
        industry: "Informes de Costos de la Industria",
        industryDesc: "Datos de precios de chips, tasas de impuesto de carbono y costos de fabricación obtenidos de informes de la industria de semiconductores, firmas de investigación de mercado y publicaciones gubernamentales oficiales."
      }
    },
    
    randomForest: {
      title: "Modelo de Predicción Random Forest",
      description: "Utilizamos un modelo de aprendizaje automático Random Forest para predecir el Coste Total de Propiedad con alta precisión. Este método de aprendizaje ensemble combina múltiples árboles de decisión para capturar relaciones complejas y no lineales entre variables como tipo de material, región, volumen y horizonte temporal.",
      benefits: "El modelo se entrena con datos históricos de costos de semiconductores y se valida continuamente contra resultados del mundo real. Maneja entradas multidimensionales y proporciona predicciones robustas incluso cuando los datos contienen ruido o valores atípicos, haciéndolo ideal para el complejo mercado de semiconductores.",
      features: {
        accuracy: "Alta Precisión de Predicción",
        accuracyDesc: "Logra >95% de precisión en datos de validación aprendiendo de miles de escenarios TCO históricos en diferentes materiales, regiones y condiciones de mercado.",
        features: "Análisis Multi-Factor",
        featuresDesc: "Analiza simultáneamente más de 8 variables de entrada: tipo de material (Si/GaN/GaAs), región, volumen de producción, horizonte temporal, patrones de consumo energético, políticas de carbono y elegibilidad de subvenciones.",
        training: "Aprendizaje Continuo",
        trainingDesc: "El modelo se reentrena trimestralmente con los últimos datos de OECD, JRC y fuentes de la industria para adaptarse a la evolución de precios energéticos, programas de subvenciones y costos de fabricación."
      }
    },
    
    ragEngine: {
      title: "Motor RAG (Generación Aumentada por Recuperación)",
      description: "Nuestro sistema RAG combina recuperación de documentos con generación de IA para proporcionar respuestas contextualmente precisas y respaldadas por fuentes. Indexa miles de páginas de documentos de políticas de la UE, artículos de investigación e informes industriales usando embeddings vectoriales FAISS.",
      benefits: "A diferencia de los chatbots genéricos, nuestro motor RAG recupera pasajes específicos y relevantes antes de generar respuestas. Esto asegura que las respuestas estén fundamentadas en datos factuales, citen fuentes reales y proporcionen información actualizada sobre políticas de semiconductores de la UE y mejores prácticas de TCO.",
      features: {
        vectorSearch: "Búsqueda Vectorial FAISS",
        vectorSearchDesc: "Utiliza Facebook AI Similarity Search (FAISS) para encontrar contenido semánticamente similar en milisegundos. Busca en más de 10,000 fragmentos de documentos con embeddings de 384 dimensiones para recuperación de contexto precisa.",
        contextual: "Recuperación Consciente del Contexto",
        contextualDesc: "Recupera las 5-10 secciones de documentos más relevantes basándose en el significado semántico de tu pregunta, no solo en coincidencia de palabras clave. Comprende sinónimos, jerga técnica y conceptos específicos del dominio.",
        knowledge: "Base de Conocimiento Curada",
        knowledgeDesc: "Los documentos indexados incluyen PDFs del EU Chips Act, investigación de semiconductores de JRC, informes energéticos de OECD, legislación sobre impuestos de carbono y directrices de programas de subvenciones. Actualizado mensualmente con los últimos cambios de política.",
        realtime: "Procesamiento de Consultas en Tiempo Real",
        realtimeDesc: "Recupera contexto relevante y genera respuestas de IA en <2 segundos. Almacena en caché consultas frecuentes para un rendimiento aún más rápido manteniendo precisión y frescura."
      }
    },
    
    geminiAI: {
      title: "Gemini AI (Generación de Lenguaje Natural)",
      description: "Aprovechamos el modelo Gemini 2.0 Flash Experimental de Google para comprensión y generación de lenguaje natural. Gemini transforma datos técnicos y documentos recuperados en explicaciones claras y conversacionales adaptadas a tus preguntas.",
      benefits: "Gemini sobresale en explicar economía compleja de semiconductores en lenguaje sencillo, comparando escenarios regionales y proporcionando recomendaciones estratégicas. Mantiene precisión técnica mientras es accesible tanto para expertos como para no especialistas, con soporte multilingüe completo.",
      features: {
        advanced: "Modelo de Lenguaje Avanzado",
        advancedDesc: "Gemini 2.0 Flash Experimental cuenta con una ventana de contexto de 2 millones de tokens, comprensión multimodal y capacidades de razonamiento de última generación. Procesa documentos largos y consultas complejas eficientemente.",
        conversational: "Conversaciones Similares a Humanas",
        conversationalDesc: "Genera respuestas naturales y coherentes que se sienten como hablar con un experto en economía de semiconductores. Recuerda el contexto de la conversación, hace preguntas aclaratorias y adapta el tono a tus necesidades.",
        multilingual: "Soporte Multilingüe Nativo",
        multilingualDesc: "Entrenado en más de 100 idiomas con excelente rendimiento en catalán, español e inglés. Traduce respuestas preservando terminología técnica, números y precisión de formato.",
        markdown: "Formato Markdown Rico",
        markdownDesc: "Genera respuestas en Markdown estructurado con encabezados, viñetas, tablas y énfasis. Hace que los desgloses complejos de TCO sean fáciles de leer y copiar para informes o presentaciones."
      }
    },
    
    consumer: {
      title: "Para el Consumidor",
      targetTitle: "Público Objetivo",
      targetContent: "Esta herramienta está diseñada para profesionales de la industria de semiconductores, gerentes de adquisiciones, directores financieros y estrategas de cadena de suministro de todo el mundo que evalúan decisiones de abastecimiento de chips. Cubre 32 países de UE, EE.UU., Asia-Pacífico y América Latina con datos en tiempo real de Mendeley, IEA y benchmarks industriales validados por BCG (2023).",
      purposeTitle: "Propósito",
      purposeContent: "La Calculadora TCO Inteligente proporciona análisis de Coste Total de Propiedad (TCO) basado en datos para materiales semiconductores en regiones de la UE, integrando precios de energía en tiempo real, políticas de impuestos de carbono y subvenciones de la Ley de Chips de la UE. Ayuda a las organizaciones a tomar decisiones informadas sobre adquisición de chips, ubicación de producción y selección de materiales.",
      objectivesTitle: "Objetivos Clave",
      objective1: "Modelado Transparente de Costes: Desglosar todos los componentes de coste (coste del chip, energía, impuesto de carbono, mantenimiento, riesgo de cadena de suministro)",
      objective2: "Insights Impulsados por IA: Aprovechar Google Gemini para generar recomendaciones estratégicas basadas en tu escenario específico",
      objective3: "Integración de Políticas: Factorizar automáticamente subvenciones de la Ley de Chips de la UE e incentivos regionales",
      objective4: "Proyecciones Futuras: Visualizar tendencias a 5 años para costes energéticos y tasas de subvención"
    },

    components: {
      title: "Componentes de la Aplicación",
      subtitle: "Comprendiendo las 5 partes clave de la interfaz",
      
      input: {
        title: "1. Formulario de Entrada",
        content: "Selecciona tu material semiconductor (Si, SiC, GaN, GaAs, Diamond, Graphene, CNT), región de la UE objetivo, volumen de producción y horizonte temporal. El sistema valida entradas y proporciona retroalimentación en tiempo real."
      },
      
      calculator: {
        title: "2. Calculadora TCO",
        content: "Motor de cálculo principal que procesa tus entradas contra conjuntos de datos reales (datos de semiconductores JRC, precios de energía OCDE, propiedades de Materials Project) para calcular el coste total de propiedad. Incluye cálculos automáticos de subvenciones basados en criterios de elegibilidad de la Ley de Chips de la UE."
      },
      
      ai: {
        title: "3. Panel de Explicación IA",
        content: "Impulsado por Google Gemini 1.5 Flash, este componente genera insights personalizados incluyendo resumen ejecutivo, principales impulsores de coste, recomendaciones estratégicas y análisis comparativo. Recurre a un sofisticado motor de explicación dinámico cuando la API de Gemini no está disponible."
      },
      
      scenarios: {
        title: "4. Perspectiva Regional a 5 Años",
        content: "Gráfico interactivo (construido con Recharts) que muestra costes energéticos proyectados y tasas de subvención para tu región seleccionada durante un período de 5 años. Ayuda a identificar el momento óptimo para decisiones de adquisición."
      },
      
      breakdown: {
        title: "5. Vista de Desglose de Costes",
        content: "Detalle completo de todos los componentes TCO con porcentajes, mostrando el impacto de cada factor (coste del chip, energía, impuesto de carbono, mantenimiento, riesgo de cadena de suministro) tanto antes como después de subvenciones."
      }
    },

    technical: {
      title: "Arquitectura Técnica",
      
      frontend: {
        title: "Stack Frontend",
        react: "React 19: Última versión con renderizado concurrente mejorado",
        typescript: "TypeScript 5.x: Desarrollo con seguridad de tipos en modo estricto",
        vite: "Vite 6.3.6: HMR ultrarrápido y compilaciones de producción optimizadas",
        tailwind: "Tailwind CSS: Estilos utility-first con tema rosa personalizado",
        recharts: "Recharts 3.2.1: Visualización de datos responsive"
      },
      
      backend: {
        title: "Arquitectura Backend",
        fastapi: "FastAPI 0.109.0: Framework web Python asíncrono de alto rendimiento",
        uvicorn: "Uvicorn 0.27.0: Servidor ASGI con soporte WebSocket",
        pydantic: "Pydantic v2: Validación y serialización de datos",
        structure: "Estructura modular: Routers (tco, materials, regions, scenarios), Services (agente Gemini, motor ML, acceso a datos), Models (entities, schemas)"
      },
      
      ai: {
        title: "Componentes IA/ML",
        gemini: "Google Gemini 1.5 Flash: Modelo IA principal para explicaciones",
        transformers: "Sentence Transformers (all-MiniLM-L6-v2): Generación de embeddings locales",
        faiss: "FAISS: Búsqueda de similitud vectorial para recuperación RAG",
        rag: "Pipeline RAG: Capa de Conocimiento de Datos con cargador, recuperador y motor"
      },
      
      data: {
        title: "Capa de Datos",
        jrc: "Datos de Semiconductores JRC: Base de datos de materiales del Centro Común de Investigación de la UE",
        oecd: "Precios de Energía OCDE: Costes de energía industrial en tiempo real por país",
        materials: "Materials Project: Propiedades físicas de compuestos semiconductores",
        mock: "Nota: La implementación actual usa conjuntos de datos mock curados para propósitos de demostración"
      },
      
      api: {
        title: "Endpoints API",
        health: "GET /health - Verificación de salud del servicio",
        materials: "GET /api/materials - Listar materiales semiconductores disponibles",
        regions: "GET /api/regions - Listar regiones de la UE con datos de políticas",
        scenarios: "GET /api/scenarios - Generar proyecciones a 5 años",
        predict: "POST /api/predict - Calcular TCO para escenario específico",
        explain: "POST /api/explain - Generar explicación impulsada por IA",
        docs: "GET /docs - Documentación interactiva OpenAPI"
      },
      
      deployment: {
        title: "Objetivo de Despliegue",
        content: "Backend configurado para despliegue en Google Cloud Run (región europe-southwest1) con contenedorización Docker. Frontend compila a assets estáticos para distribución CDN."
      }
    },

    apiLink: "Prueba la API con Postman"
  },

  // About Page
  about: {
    title: "Acerca de Este Proyecto",
    
    author: {
      title: "Autora",
      name: "Marta Mateu López",
      description: "Especialista en IA e Ingeniería de Datos apasionada por aprovechar tecnología de vanguardia para resolver desafíos del mundo real en la industria de semiconductores. Con experiencia en desarrollo full-stack, aprendizaje automático e infraestructura en la nube, diseño sistemas inteligentes que conectan datos complejos con insights accionables.",
      linkedin: "Ver Perfil de LinkedIn"
    },
    
    program: {
      title: "Programa Top Rosies Talent",
      description: "Este proyecto fue desarrollado como parte de la iniciativa Top Rosies Talent de UPC School, un prestigioso programa diseñado para cultivar la próxima generación de líderes tecnológicos en España. El programa combina formación intensiva en IA, computación en la nube e ingeniería de software con desarrollo de proyectos del mundo real.",
      link: "Saber Más",
      objectives: "Objetivos del Programa:",
      objective1: "Dominar técnicas avanzadas de IA/ML (LLMs, RAG, bases de datos vectoriales)",
      objective2: "Construir aplicaciones full-stack listas para producción",
      objective3: "Integrar plataformas cloud empresariales (Google Cloud, AWS)",
      objective4: "Desarrollar pensamiento estratégico para soluciones empresariales impulsadas por tecnología",
      learnMore: "Saber Más",
      website: "Visita el sitio web oficial de Top Rosies Talent para explorar el currículo del programa, historias de éxito y detalles de aplicación."
    },
    
    acknowledgments: {
      title: "Agradecimientos",
      text: "Agradecimientos especiales al profesorado de UPC School, mentores en Top Rosies Talent, y la comunidad de código abierto cuyas herramientas y bibliotecas hicieron posible este proyecto. Esta calculadora demuestra el potencial de la IA para democratizar el acceso a análisis industriales complejos.",
      mentor: "Mentora",
      organization: "Organización",
      content: "Agradecimientos especiales al profesorado de UPC School, mentores en Top Rosies Talent, y la comunidad de código abierto cuyas herramientas y bibliotecas hicieron posible este proyecto. Esta calculadora demuestra el potencial de la IA para democratizar el acceso a análisis industriales complejos."
    },
    
    tech: {
      title: "Tecnologías Utilizadas",
      frontend: "Stack Frontend",
      backend: "Arquitectura Backend"
    },
    
    footer: {
      message: "Construido con pasión por la IA y los semiconductores",
      contact: "Abierta a colaboración y consultas",
      copyright: "© 2024 Marta Mateu López. Todos los derechos reservados.",
      project: "Construido con ❤️ como parte del programa Top Rosies Talent."
    }
  },
  
  citations: {
    title: "Referencias Bibliográficas",
    subtitle: "Citaciones formales de todos los conjuntos de datos y artículos de investigación utilizados en la Calculadora Inteligente de TCO. Todas las fuentes de datos están verificadas, revisadas por pares o provienen de fuentes gubernamentales/institucionales oficiales.",
    dataQuality: {
      title: "Garantía de Calidad de Datos",
      authenticity: "Solo fuentes oficiales (agencias gubernamentales, instituciones de investigación, publicaciones revisadas por pares)",
      timeliness: "Precios de energía actualizados cada 24 horas, otros datos revisados trimestralmente",
      completeness: "Validación cruzada entre múltiples fuentes independientes",
      accuracy: "Controles estadísticos de valores atípicos y anomalías"
    },
    categoryNames: {
      energyData: "Datos de Precios de Energía",
      semiconductorData: "Datos de la Industria de Semiconductores",
      carbonData: "Precios de Carbono y Datos Ambientales",
      policyData: "Información de Políticas y Subsidios"
    },
    updateSchedule: {
      title: "Calendario de Actualización de Datos",
      energy: "Precios de Energía - Actualizados cada 24 horas desde APIs de ENTSO-E y EIA",
      materials: "Propiedades de Materiales - Datos estáticos, validados trimestralmente",
      carbon: "Precios de Carbono - Actualizados mensualmente desde resultados de subastas EU ETS",
      subsidies: "Información de Subsidios - Revisada trimestralmente, actualizada cuando ocurren cambios de política"
    },
    footer: {
      format: "Citaciones formateadas según APA 7ª Edición",
      lastUpdated: "Última Actualización: 14 de octubre de 2025"
    },
    datasets: {
      title: "Conjuntos de Datos",
      subtitle: "Bases de datos científicas y repositorios de datos"
    },
    reports: {
      title: "Informes y Documentación Oficial",
      subtitle: "Publicaciones gubernamentales, regulaciones y análisis de la industria"
    },
    copyBibtex: "Copiar BibTeX",
    copiedBibtex: "¡BibTeX copiado!",
    viewSource: "Ver fuente",
    categories: {
      energy: "Energía",
      semiconductor: "Semiconductores",
      carbon: "Carbono",
      policy: "Política",
      market: "Mercado"
    }
  },

  // ML Visualization
  mlViz: {
    title: "Visualización del Modelo ML Random Forest",
    subtitle: "Comprendiendo cómo nuestro modelo de machine learning predice el TCO",
    loading: "Cargando modelo Random Forest...",
    error: "Error al cargar el modelo Random Forest. Asegúrese de que el modelo está entrenado.",
    featureImportance: "Importancia de Características",
    featureImportanceDesc: "¿Qué factores tienen mayor impacto en las predicciones del TCO?",
    modelMetrics: "Métricas del Modelo",
    accuracy: "Puntuación R² (Precisión)",
    trainingSamples: "Muestras de Entrenamiento",
    trees: "Árboles de Decisión",
    maxDepth: "Profundidad Máxima",
    howItWorks: "Cómo Funciona Random Forest",
    howItWorksDesc: "Random Forest combina múltiples árboles de decisión para hacer predicciones precisas. Cada árbol analiza diferentes características y vota por el resultado final.",
    modelValidation: "Validación del Modelo",
    modelValidationDesc: "Nuestro modelo logra alta precisión mediante validación cruzada y pruebas con datos no vistos."
  },

  // RAG Visualization
  ragViz: {
    title: "Visualización del Sistema RAG",
    subtitle: "Comprendiendo cómo nuestra IA recupera y utiliza el conocimiento",
    loading: "Cargando sistema RAG...",
    error: "Error al cargar la visualización del sistema RAG. Por favor, verifica la conexión con el backend.",
    embeddingSpace: "Espacio de Embeddings de Documentos",
    embeddingSpaceDesc: "Proyección 2D de embeddings de documentos usando t-SNE. Los documentos similares están más cerca.",
    retrievalDemo: "Demostración de Recuperación de Documentos",
    retrievalDemoDesc: "Prueba cómo el sistema RAG encuentra documentos relevantes para diferentes consultas.",
    selectQuery: "Selecciona una consulta:",
    topDocuments: "Documentos Principales Recuperados",
    score: "Puntuación de Similitud",
    ragStats: "Estadísticas del Sistema RAG",
    totalDocuments: "Total de Documentos",
    totalChunks: "Total de Fragmentos",
    embeddingDimension: "Dimensión de Embedding",
    modelName: "Modelo de Embedding",
    indexType: "Tipo de Índice",
    knowledgeBase: "Fuentes de la Base de Conocimiento",
    category: "Categoría",
    chunks: "Fragmentos",
    energyPrices: "Precios de Energía",
    subsidies: "Subsidios",
    materials: "Materiales",
    regulations: "Regulaciones",
    carbon: "Carbono"
  }
};
