"""
Chat service using Gemini + RAG for Q&A about TCO data.
"""

import logging
import json
import os
from typing import List, Optional
from backend.models.schemas import ChatMessage, TcoPredictResponse
from backend.data_knowledge_layer.rag_engine import RAGEngine

logger = logging.getLogger(__name__)


class ChatService:
    """Service for interactive chat using Gemini + RAG."""
    
    def __init__(self, rag_engine: RAGEngine):
        self.rag_engine = rag_engine
        
        # Initialize Gemini with conditional import
        self.use_gemini = False
        self.client = None
        
        try:
            from google import genai
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                self.client = genai.Client(api_key=api_key)
                self.use_gemini = True
                logger.info("✅ Gemini enabled for chat")
            else:
                logger.warning("⚠️ GEMINI_API_KEY not set, using RAG-only for chat")
        except Exception as e:
            logger.warning(f"⚠️ Could not initialize Gemini: {str(e)}, using RAG-only for chat")
    
    async def answer_question(
        self,
        question: str,
        tco_context: Optional[TcoPredictResponse] = None,
        chat_history: List[ChatMessage] = None,
        language: str = "en"
    ) -> tuple[str, List[str]]:
        """
        Answer a user question using Gemini + RAG.
        
        Args:
            question: User's question
            tco_context: Current TCO calculation for context
            chat_history: Previous conversation messages
            language: Response language ('en', 'es', or 'cat')
            
        Returns:
            Tuple of (answer_text, sources_list)
        """
        chat_history = chat_history or []
        
        # Build search query with context
        search_query = self._build_search_query(question, tco_context, chat_history)
        
        # Retrieve relevant documents from RAG
        rag_context = await self.rag_engine.retrieve_context_from_query(search_query, top_k=3)
        
        # Try Gemini first, fallback to RAG-only
        if self.use_gemini:
            try:
                answer = await self._generate_with_gemini(
                    question=question,
                    rag_context=rag_context,
                    tco_context=tco_context,
                    chat_history=chat_history,
                    language=language
                )
                logger.info(f"✅ Gemini chat response generated in {language}")
            except Exception as e:
                logger.warning(f"⚠️ Gemini failed, using RAG fallback: {str(e)}")
                answer = self._generate_answer(
                    question=question,
                    rag_context=rag_context,
                    tco_context=tco_context,
                    chat_history=chat_history
                )
        else:
            # RAG-only fallback
            answer = self._generate_answer(
                question=question,
                rag_context=rag_context,
                tco_context=tco_context,
                chat_history=chat_history
            )
        
        # Extract sources
        sources = self._extract_sources(rag_context)
        
        logger.info(f"💬 Answered: '{question[:50]}...' using {len(sources)} sources")
        
        return answer, sources
    
    async def _generate_with_gemini(
        self,
        question: str,
        rag_context,
        tco_context: Optional[TcoPredictResponse],
        chat_history: List[ChatMessage],
        language: str = "en"
    ) -> str:
        """Generate answer using Gemini with RAG context."""
        
        # Language instructions
        language_instructions = {
            "en": "Answer in English.",
            "es": "Responde en español castellano.",
            "cat": "Respon en català."
        }
        
        lang_instruction = language_instructions.get(language, language_instructions["en"])
        
        # Build prompt with context
        prompt_parts = [
            f"You are a helpful assistant answering questions about semiconductor TCO calculations. {lang_instruction}",
            f"\nUser question: {question}",
        ]
        
        # Add TCO context if available
        if tco_context:
            prompt_parts.append(f"""
Current TCO Calculation:
- Material: {tco_context.material_name}
- Region: {tco_context.region_name}
- Total cost: €{tco_context.total_cost:,.0f} over {tco_context.years} years
- Volume: {tco_context.volume:,} chips
- Energy cost: €{tco_context.breakdown.energy_cost:,.0f} ({tco_context.breakdown.energy_cost/tco_context.breakdown.total_before_subsidy*100:.1f}%)
- Chip cost: €{tco_context.breakdown.chip_cost:,.0f}
- Carbon tax: €{tco_context.breakdown.carbon_tax:,.0f}
- Subsidies: €{tco_context.breakdown.subsidy_amount:,.0f}
""")
        
        # Add RAG context (relevant documents)
        if rag_context.documents and rag_context.relevance_scores[0] > 0.3:
            prompt_parts.append("\nRelevant information from knowledge base:")
            for doc, score in zip(rag_context.documents[:2], rag_context.relevance_scores[:2]):
                if score > 0.3:
                    snippet = doc.content[:400]
                    source = f"{doc.source} {doc.metadata.get('year', '')}" if doc.source else "Internal data"
                    prompt_parts.append(f"\n- {snippet}\n  (Source: {source})")
        
        # Add conversation history
        if chat_history:
            prompt_parts.append("\nPrevious conversation:")
            for msg in chat_history[-4:]:  # Last 4 messages
                role = "User" if msg.role == "user" else "Assistant"
                prompt_parts.append(f"{role}: {msg.content}")
        
        prompt_parts.append("""
Answer the user's question concisely (2-3 sentences). Use specific numbers from the TCO data when relevant.
Cite sources inline like (Source Name Year) when using external information.
Be conversational and helpful.""")
        
        prompt = "\n".join(prompt_parts)
        
        # Generate with Gemini using new API
        response = self.client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=prompt,
            config={
                'temperature': 0.7,
                'max_output_tokens': 300,
            }
        )
        
        # Extract text from response
        if not response or not response.text:
            raise ValueError("Gemini returned empty response")
        
        return response.text.strip()
    
    def _build_search_query(
        self,
        question: str,
        tco_context: Optional[TcoPredictResponse],
        chat_history: List[ChatMessage]
    ) -> str:
        """Build enriched search query with context."""
        # Start with the question itself
        query_parts = [question]
        
        # Extract key terms from question for better search
        key_terms = self._extract_key_terms(question)
        if key_terms:
            query_parts.extend(key_terms)
        
        # Add TCO context if available
        if tco_context:
            query_parts.append(f"{tco_context.material_name}")
            query_parts.append(f"{tco_context.region_name}")
        
        # Add recent conversation context (last user question only)
        if chat_history:
            for msg in reversed(chat_history[-2:]):
                if msg.role == "user":
                    query_parts.append(msg.content)
                    break
        
        return " ".join(query_parts)
    
    def _extract_key_terms(self, question: str) -> List[str]:
        """Extract key search terms from question."""
        q_lower = question.lower()
        terms = []
        
        # Map question words to search terms
        if 'subsidy' in q_lower or 'subsidies' in q_lower or 'funding' in q_lower:
            terms.extend(['EU Chips Act', 'subsidy', 'funding', 'grant'])
        
        if 'energy' in q_lower and 'cost' in q_lower:
            terms.extend(['energy price', 'electricity cost', 'kWh'])
        
        if 'carbon' in q_lower or 'tax' in q_lower:
            terms.extend(['carbon tax', 'CO2', 'emissions'])
        
        if 'compare' in q_lower or 'comparison' in q_lower or 'vs' in q_lower:
            terms.extend(['comparison', 'versus', 'alternative'])
        
        return terms
    
    def _generate_answer(
        self,
        question: str,
        rag_context,
        tco_context: Optional[TcoPredictResponse],
        chat_history: List[ChatMessage]
    ) -> str:
        """Generate conversational answer from RAG context."""
        
        # If no relevant context found
        if not rag_context.documents or all(score < 0.3 for score in rag_context.relevance_scores):
            return self._generate_fallback_answer(question, tco_context)
        
        # Build answer from context
        answer_parts = []
        
        # Start with TCO-specific data if relevant
        if tco_context and any(word in question.lower() for word in ['energy', 'cost', 'price', 'expensive', 'cheap', 'total', 'subsidy', 'carbon', 'chip']):
            direct_answer = self._get_direct_tco_answer(question, tco_context)
            if direct_answer:
                answer_parts.append(direct_answer)
        
        # Add supporting context from RAG (brief)
        top_doc = rag_context.documents[0]
        top_score = rag_context.relevance_scores[0]
        
        if top_score > 0.4:
            # Extract key info - find complete meaningful content
            content = top_doc.content.strip()
            
            # Try to get a complete sentence or phrase
            if len(content) > 300:
                # Look for sentence boundaries within first 300 chars
                snippet = content[:300]
                last_period = snippet.rfind('.')
                last_semicolon = snippet.rfind(';')
                cut_point = max(last_period, last_semicolon)
                
                if cut_point > 50:  # Valid sentence found
                    content_snippet = snippet[:cut_point + 1]
                else:
                    # No good sentence boundary, cut at space
                    last_space = snippet.rfind(' ', 150, 300)
                    content_snippet = snippet[:last_space] + '...'
            else:
                content_snippet = content
            
            source_ref = f"({top_doc.source} {top_doc.metadata.get('year', '')})" if top_doc.source else ""
            
            if not answer_parts:
                # No direct TCO answer, use RAG context
                answer_parts.append(f"{content_snippet} {source_ref}")
            else:
                # Add as supporting evidence only if it adds value
                if len(content_snippet) > 20:
                    answer_parts.append(f"\n\n**Additional context:** {content_snippet} {source_ref}")
        
        return "\n".join(answer_parts) if answer_parts else self._generate_fallback_answer(question, tco_context)
    
    def _get_direct_tco_answer(self, question: str, tco_context: TcoPredictResponse) -> Optional[str]:
        """Get direct answer from TCO data."""
        q_lower = question.lower()
        
        if 'energy' in q_lower and 'cost' in q_lower:
            return f"For your current calculation, the **energy cost is €{tco_context.breakdown.energy_cost:,.0f}** over {tco_context.years} years ({tco_context.breakdown.energy_cost/tco_context.breakdown.total_before_subsidy*100:.1f}% of total cost)."
        
        elif 'subsidy' in q_lower or 'funding' in q_lower:
            return f"The **subsidy amount is €{tco_context.breakdown.subsidy_amount:,.0f}**, reducing the total cost from €{tco_context.breakdown.total_before_subsidy:,.0f} to €{tco_context.total_cost:,.0f}."
        
        elif 'carbon' in q_lower or 'tax' in q_lower:
            return f"The **carbon tax is €{tco_context.breakdown.carbon_tax:,.0f}** ({tco_context.breakdown.carbon_tax/tco_context.breakdown.total_before_subsidy*100:.1f}% of total cost) for {tco_context.region_name}."
        
        elif 'chip' in q_lower and 'cost' in q_lower:
            return f"The **chip costs are €{tco_context.breakdown.chip_cost:,.0f}** for {tco_context.volume:,} {tco_context.material_name} chips (€{tco_context.breakdown.chip_cost/tco_context.volume:.2f} per chip)."
        
        elif 'total' in q_lower:
            return f"The **total cost of ownership is €{tco_context.total_cost:,.0f}** for {tco_context.volume:,} {tco_context.material_name} chips over {tco_context.years} years in {tco_context.region_name}."
        
        return None
    
    def _generate_fallback_answer(self, question: str, tco_context: Optional[TcoPredictResponse]) -> str:
        """Generate answer when no RAG context available."""
        
        if tco_context:
            # Answer based on TCO data
            if 'energy' in question.lower():
                return f"The energy cost for {tco_context.material_name} in {tco_context.region_name} is €{tco_context.breakdown.energy_cost:,.0f}, which represents {tco_context.breakdown.energy_cost/tco_context.breakdown.total_before_subsidy*100:.1f}% of the total cost before subsidies."
            
            elif 'subsidy' in question.lower() or 'funding' in question.lower():
                return f"The subsidy amount for this configuration is €{tco_context.breakdown.subsidy_amount:,.0f}, reducing the total cost from €{tco_context.breakdown.total_before_subsidy:,.0f} to €{tco_context.total_cost:,.0f}."
            
            elif 'total' in question.lower() or 'cost' in question.lower():
                return f"The total cost of ownership is €{tco_context.total_cost:,.0f} for {tco_context.volume:,} {tco_context.material_name} chips over {tco_context.years} years in {tco_context.region_name}."
        
        return "I don't have specific information about that in my knowledge base. Could you rephrase your question or ask about energy costs, subsidies, or material comparisons?"
    
    def _extract_sources(self, rag_context) -> List[str]:
        """Extract unique sources from RAG context with detailed information."""
        sources = []
        seen = set()
        
        # Add primary data sources
        sources.append("📊 Precios de Energía: ENTSO-E Transparency Platform (EU) - Datos en tiempo real de 14 países europeos")
        sources.append("📊 Precios Industriales EU 2024-2025: European Wholesale Electricity Prices (12-month avg Oct 2024-Sep 2025)")
        sources.append("🏭 Semiconductores: JRC Reports 2023-2025 (JRC141323, JRC133850, JRC133892)")
        
        # Add RAG document sources
        for doc, score in zip(rag_context.documents, rag_context.relevance_scores):
            if score > 0.3 and doc.source and doc.source not in seen:
                year = doc.metadata.get('year', '')
                data_quality = doc.metadata.get('data_quality', '')
                
                source_str = f"{doc.source}"
                if year:
                    source_str += f" ({year})"
                if data_quality:
                    source_str += f" - Quality: {data_quality}"
                    
                sources.append(source_str)
                seen.add(doc.source)
        
        return sources[:8]  # Limit to 8 sources to avoid clutter
