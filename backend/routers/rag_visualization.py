"""
RAG Visualization Router
Provides endpoints for RAG system introspection and explainability
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import numpy as np
from sklearn.manifold import TSNE
import os
import json

router = APIRouter(prefix="/api/rag", tags=["rag-visualization"])

class EmbeddingPoint(BaseModel):
    x: float
    y: float
    z: float
    document: str
    category: str
    snippet: str

class RetrievalDocument(BaseModel):
    document: str
    score: float
    snippet: str

class RetrievalExample(BaseModel):
    query: str
    top_documents: List[RetrievalDocument]

class RAGStats(BaseModel):
    model_config = {"protected_namespaces": ()}  # Allow model_name field
    
    total_documents: int
    total_chunks: int
    embedding_dimension: int
    model_name: str
    index_type: str

class EmbeddingsVizResponse(BaseModel):
    embeddings: List[EmbeddingPoint]

# Category mapping for documents
DOCUMENT_CATEGORIES = {
    'ENTSO': 'Energy Prices',
    'oecd': 'Energy Prices',
    'bp-energy': 'Energy Prices',
    'GlobalEnergyReview': 'Energy Prices',
    'carbon': 'Carbon',
    'EU_Chips_Act': 'Subsidies',
    'CHIP': 'Subsidies',
    'SUBSIDY': 'Subsidies',
    'JRC': 'Materials',
    'material': 'Materials',
    'semiconductor': 'Materials',
    'CELEX': 'Regulations',
    'Regulation': 'Regulations',
}

def categorize_document(filename: str) -> str:
    """Categorize a document based on its filename"""
    for key, category in DOCUMENT_CATEGORIES.items():
        if key in filename:
            return category
    return 'Other'


@router.get("/embeddings-viz", response_model=EmbeddingsVizResponse)
async def get_embeddings_visualization():
    """
    Get t-SNE projection of document embeddings for visualization
    Returns 2D coordinates of documents in semantic space
    """
    try:
        # Import RAG engine from main
        from backend.main import rag_engine
        
        if not rag_engine or not rag_engine.is_initialized or not rag_engine.retriever.documents:
            raise HTTPException(
                status_code=503,
                detail="RAG system not initialized. Please wait for initialization."
            )
        
        # Get all embeddings and documents from retriever
        embeddings = []
        documents = []
        categories = []
        snippets = []
        
        for doc in rag_engine.retriever.documents:
            # Get document text
            doc_text = doc.get('content', doc.get('text', ''))[:200]  # First 200 chars
            
            # Generate embedding for this text (if needed)
            if rag_engine.retriever.embeddings is not None and len(embeddings) < len(rag_engine.retriever.documents):
                # Use pre-computed embedding if available
                if len(embeddings) < len(rag_engine.retriever.embeddings):
                    embeddings.append(rag_engine.retriever.embeddings[len(embeddings)])
            
            source = doc.get('source', doc.get('metadata', {}).get('source', 'Unknown'))
            documents.append(source)
            categories.append(categorize_document(source))
            snippets.append(doc_text)
        
        # If we don't have pre-computed embeddings, generate them on the fly
        if len(embeddings) == 0:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer('all-MiniLM-L6-v2')
            texts = [doc.get('content', doc.get('text', ''))[:500] for doc in rag_engine.retriever.documents]
            embeddings = model.encode(texts)
        
        if len(embeddings) < 2:
            raise HTTPException(
                status_code=400,
                detail="Not enough documents for visualization (need at least 2)"
            )
        
        # Convert to numpy array
        embeddings_array = np.array(embeddings)
        
        # Apply t-SNE for dimensionality reduction to 2D
        tsne = TSNE(n_components=2, random_state=42, perplexity=min(30, len(embeddings) - 1))
        embeddings_2d = tsne.fit_transform(embeddings_array)
        
        # Create visualization points
        viz_points = []
        for i in range(len(embeddings_2d)):
            viz_points.append(EmbeddingPoint(
                x=float(embeddings_2d[i, 0]),
                y=float(embeddings_2d[i, 1]),
                z=float(len(snippets[i])),  # Use snippet length for bubble size
                document=documents[i],
                category=categories[i],
                snippet=snippets[i][:100]  # Limit snippet to 100 chars
            ))
        
        return EmbeddingsVizResponse(embeddings=viz_points)
    
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="RAG engine not available"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating embeddings visualization: {str(e)}"
        )


@router.get("/retrieval-demo", response_model=RetrievalExample)
async def get_retrieval_demo(
    query: str = Query(..., description="Query to test document retrieval"),
    top_k: int = Query(5, description="Number of top documents to retrieve", ge=1, le=10)
):
    """
    Demonstrate how RAG retrieves documents for a given query
    Shows the top-k most relevant documents with similarity scores
    """
    try:
        from backend.main import rag_engine
        
        if not rag_engine or not rag_engine.is_initialized:
            raise HTTPException(
                status_code=503,
                detail="RAG system not initialized"
            )
        
        # Retrieve documents using RAG retriever
        retrieved_docs = await rag_engine.retriever.retrieve(query, top_k=top_k)
        
        # Format response
        top_documents = []
        for doc in retrieved_docs:
            content = doc.get('content', doc.get('text', ''))
            # Try multiple score fields: relevance_score, score, or default to 0.0
            score = doc.get('relevance_score', doc.get('score', 0.0))
            top_documents.append(RetrievalDocument(
                document=doc.get('source', doc.get('metadata', {}).get('source', 'Unknown')),
                score=score,
                snippet=content[:150]  # First 150 chars
            ))
        
        return RetrievalExample(
            query=query,
            top_documents=top_documents
        )
    
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="RAG engine not available"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving documents: {str(e)}"
        )


@router.get("/stats", response_model=RAGStats)
async def get_rag_stats():
    """
    Get statistics about the RAG system
    """
    try:
        from backend.main import rag_engine
        
        if not rag_engine or not rag_engine.is_initialized or not rag_engine.retriever.documents:
            return RAGStats(
                total_documents=0,
                total_chunks=0,
                embedding_dimension=384,
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                index_type="FAISS"
            )
        
        # Count unique documents
        unique_sources = set()
        for doc in rag_engine.retriever.documents:
            source = doc.get('source', doc.get('metadata', {}).get('source', 'Unknown'))
            unique_sources.add(source)
        
        total_docs = len(unique_sources)
        total_chunks = len(rag_engine.retriever.documents)
        
        # Get embedding dimension
        embedding_dim = 384  # Default for all-MiniLM-L6-v2
        if rag_engine.retriever.embeddings is not None and len(rag_engine.retriever.embeddings) > 0:
            embedding_dim = rag_engine.retriever.embeddings.shape[1]
        
        return RAGStats(
            total_documents=total_docs,
            total_chunks=total_chunks,
            embedding_dimension=embedding_dim,
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            index_type="FAISS"
        )
    
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="RAG engine not available"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting RAG stats: {str(e)}"
        )


@router.get("/knowledge-base")
async def get_knowledge_base_info():
    """
    Get information about the documents in the knowledge base
    """
    try:
        from backend.main import rag_engine
        
        if not rag_engine or not rag_engine.is_initialized or not rag_engine.retriever.documents:
            return {
                'initialized': False,
                'message': 'Knowledge base not initialized'
            }
        
        # Count documents by category
        category_counts: Dict[str, int] = {}
        source_list = []
        
        unique_sources = set()
        for doc in rag_engine.retriever.documents:
            source = doc.get('source', doc.get('metadata', {}).get('source', 'Unknown'))
            if source not in unique_sources:
                unique_sources.add(source)
                category = categorize_document(source)
                category_counts[category] = category_counts.get(category, 0) + 1
                chunks = sum(1 for d in rag_engine.retriever.documents 
                           if d.get('source', d.get('metadata', {}).get('source')) == source)
                source_list.append({
                    'filename': source,
                    'category': category,
                    'chunks': chunks
                })
        
        return {
            'initialized': True,
            'total_documents': len(unique_sources),
            'total_chunks': len(rag_engine.retriever.documents),
            'categories': category_counts,
            'documents': sorted(source_list, key=lambda x: x['category'])
        }
    
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="RAG engine not available"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting knowledge base info: {str(e)}"
        )
