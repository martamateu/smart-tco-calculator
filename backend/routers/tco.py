"""
TCO router - main prediction and explanation endpoints.
"""

from fastapi import APIRouter, HTTPException, Request
from typing import Optional
import logging

from backend.models.schemas import (
    TcoPredictRequest,
    TcoPredictResponse,
    ExplainRequest,
    ExplainResponse,
    ChatRequest,
    ChatResponse
)
from backend.services.ml_engine import TcoEngine
from backend.services.chat_service import ChatService
from backend.data_knowledge_layer.rag_engine import RAGEngine
from backend.utils.translation import translate_with_gemini
from backend.utils.mock_explanation import generate_mock_explanation

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize TcoEngine (stateless)
tco_engine = TcoEngine()

# RAGEngine and ChatService will be initialized from app.state in endpoints
# This avoids creating duplicate instances and ensures proper initialization


@router.post("/predict", response_model=TcoPredictResponse)
async def predict_tco(request: TcoPredictRequest):
    """
    Calculate Total Cost of Ownership for a semiconductor material.
    
    Args:
        request: TCO prediction parameters
    
    Returns:
        Detailed TCO breakdown and analysis
    """
    try:
        logger.info(f"🔮 Predicting TCO for {request.material} in {request.region}")
        logger.info(f"   Volume: {request.volume}, Years: {request.years}")
        
        # Calculate TCO
        result = tco_engine.calculate_tco(request)
        
        logger.info(f"✅ TCO calculated: €{result.total_cost:,.0f}")
        logger.info(f"   Cost per chip: €{result.cost_per_chip:.2f}")
        
        return result
    
    except ValueError as e:
        logger.error(f"❌ Invalid input: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"❌ TCO calculation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain", response_model=ExplainResponse)
async def explain_tco(request: ExplainRequest, fastapi_request: Request):
    """
    Generate AI explanation of TCO results using Gemini + RAG.
    
    Args:
        request: Input parameters and TCO result to explain
        fastapi_request: FastAPI request object to access app state
    
    Returns:
        Natural language explanation with citations
    """
    try:
        logger.info(f"🤖 Generating explanation for {request.input.material}")
        
        # Get RAG engine from global state
        rag_engine = getattr(fastapi_request.app.state, 'rag_engine', None)
        
        # Use RAG if available, otherwise use mock
        if rag_engine and hasattr(rag_engine, 'is_initialized') and rag_engine.is_initialized:
            logger.info(f"   Using RAG engine for explanation (language: {request.language})")
            try:
                explanation = await rag_engine.generate_explanation(
                    request.input,
                    request.result,
                    language=request.language or "en"
                )
                logger.info(f"✅ RAG explanation generated in {request.language}")
                return explanation
            except Exception as rag_error:
                logger.warning(f"⚠️ RAG failed, falling back to mock: {rag_error}")
        
        # Fallback to mock (with Gemini translation if needed)
        logger.info("   Using dynamic mock explanation")
        explanation = await _generate_mock_explanation(request)
        logger.info(f"✅ Mock explanation generated ({len(explanation.explanation)} chars)")
        
        return explanation
    
    except Exception as e:
        logger.error(f"❌ Explanation generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def _generate_mock_explanation(request: ExplainRequest) -> ExplainResponse:
    """
    Generate mock explanation with optional translation.
    
    Uses the mock_explanation utility to generate English text,
    then translates if needed using the translation utility.
    """
    language = request.language or "en"
    
    # Generate explanation in English
    explanation_text = generate_mock_explanation(request)
    
    # Translate if needed
    if language != "en":
        translated = await translate_with_gemini(explanation_text, language)
        if translated:
            explanation_text = translated
    
    return ExplainResponse(explanation=explanation_text)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, fastapi_request: Request):
    """
    Interactive chat using RAG to answer questions about TCO data.
    
    Args:
        request: Chat request with message, optional TCO context, and chat history
        fastapi_request: FastAPI request to access app state
        
    Returns:
        ChatResponse with answer and sources
    """
    try:
        logger.info(f"💬 POST /api/chat: '{request.message[:50]}...'")
        
        # Get RAG engine and chat service from app state
        rag_engine = fastapi_request.app.state.rag_engine
        if not rag_engine:
            raise HTTPException(status_code=503, detail="RAG engine not initialized yet")
        
        # Create chat service with the initialized RAG engine
        chat_service = ChatService(rag_engine)
        
        # Get answer from chat service
        answer, sources = await chat_service.answer_question(
            question=request.message,
            tco_context=request.tco_context,
            chat_history=request.chat_history,
            language=request.language or "en"
        )
        
        logger.info(f"✅ Chat response generated with {len(sources)} sources")
        
        return ChatResponse(
            message=answer,
            sources=sources
        )
        
    except Exception as e:
        logger.error(f"❌ Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

