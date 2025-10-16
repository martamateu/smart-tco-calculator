"""
Retriever - Generates embeddings and performs semantic search.
Uses Vertex AI Embeddings API or falls back to simple keyword search.
"""

import os
import logging
from typing import List, Dict, Optional
import numpy as np

logger = logging.getLogger(__name__)


class Retriever:
    """
    Semantic retrieval using embeddings.
    
    Supports:
    - Vertex AI Text Embeddings API
    - Local FAISS index for fast similarity search
    - Fallback to keyword search when embeddings unavailable
    """
    
    def __init__(self, data_loader):
        self.data_loader = data_loader
        self.logger = logger
        
        # Embedding configuration
        self.use_embeddings = os.getenv("USE_EMBEDDINGS", "true").lower() == "true"
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "textembedding-gecko@003")
        
        # Storage
        self.embeddings: Optional[np.ndarray] = None
        self.documents: List[Dict] = []
        
        self.initialized = False
    
    async def initialize(self):
        """Initialize retriever with documents and embeddings"""
        if self.initialized:
            return
        
        # Set documents from data loader
        if not self.documents and self.data_loader:
            self.documents = self.data_loader.documents
        
        if not self.documents:
            raise ValueError("No documents to index")
        
        self.initialized = True
        
        # Try to initialize embeddings
        try:
            await self._initialize_embeddings()
        except Exception as e:
            # Continue without embeddings - will use keyword search
            self.logger.warning(f"⚠️ Continuing without embeddings: {e}")
    
    async def _initialize_embeddings(self):
        """Initialize embedding model and generate embeddings"""
        
        # Try Vertex AI first
        try:
            from google.cloud import aiplatform
            from vertexai.language_models import TextEmbeddingModel
            
            # Initialize Vertex AI
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
            location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
            
            if project_id:
                aiplatform.init(project=project_id, location=location)
                self.embedding_client = TextEmbeddingModel.from_pretrained(self.embedding_model)
                
                # Generate embeddings for all documents
                await self._generate_all_embeddings()
                
                self.logger.info(f"✅ Using Vertex AI embeddings ({self.embedding_model})")
                return
        
        except Exception as e:
            self.logger.warning(f"⚠️ Vertex AI embeddings failed: {e}")
        
        # Try sentence-transformers as fallback
        try:
            from sentence_transformers import SentenceTransformer
            
            self.embedding_client = SentenceTransformer('all-MiniLM-L6-v2')
            await self._generate_all_embeddings_local()
            
            self.logger.info("✅ Using local sentence-transformers embeddings")
            return
        
        except Exception as e:
            self.logger.warning(f"⚠️ Local embeddings failed: {e}")
        
        # If both fail, raise
        raise RuntimeError("No embedding backend available")
    
    async def _generate_all_embeddings(self):
        """Generate embeddings using Vertex AI"""
        texts = [doc["content"] for doc in self.documents]
        
        # Batch generate embeddings
        batch_size = 5
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            embeddings = self.embedding_client.get_embeddings(batch)
            all_embeddings.extend([emb.values for emb in embeddings])
        
        self.embeddings = np.array(all_embeddings)
        self.logger.info(f"📊 Generated {len(all_embeddings)} embeddings")
    
    async def _generate_all_embeddings_local(self):
        """Generate embeddings using local model"""
        texts = [doc["content"] for doc in self.documents]
        self.embeddings = self.embedding_client.encode(texts)
        self.logger.info(f"📊 Generated {len(self.embeddings)} local embeddings")
    
    async def retrieve(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Retrieve most relevant documents for query.
        
        Args:
            query: Search query
            top_k: Number of documents to return
        
        Returns:
            List of documents with relevance scores
        """
        if not self.initialized:
            await self.initialize()
        
        # Use embeddings if available
        if self.embeddings is not None:
            return await self._retrieve_with_embeddings(query, top_k)
        
        # Fallback to keyword search
        return self._retrieve_with_keywords(query, top_k)
    
    async def _retrieve_with_embeddings(self, query: str, top_k: int) -> List[Dict]:
        """Retrieve using semantic similarity"""
        
        # Generate query embedding
        try:
            if hasattr(self.embedding_client, 'get_embeddings'):
                # Vertex AI
                query_emb = self.embedding_client.get_embeddings([query])[0].values
            else:
                # sentence-transformers
                query_emb = self.embedding_client.encode([query])[0]
            
            # Compute cosine similarity
            similarities = np.dot(self.embeddings, query_emb) / (
                np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_emb)
            )
            
            # Get top-k indices
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            
            # Return documents with scores
            results = []
            for idx in top_indices:
                doc = self.documents[idx].copy()
                doc["relevance_score"] = float(similarities[idx])
                results.append(doc)
            
            return results
        
        except Exception as e:
            self.logger.error(f"❌ Embedding retrieval failed: {e}")
            return self._retrieve_with_keywords(query, top_k)
    
    def _retrieve_with_keywords(self, query: str, top_k: int) -> List[Dict]:
        """Simple keyword-based retrieval"""
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        scored_docs = []
        for doc in self.documents:
            content_lower = doc["content"].lower()
            content_words = set(content_lower.split())
            
            # Calculate overlap score
            overlap = len(query_words.intersection(content_words))
            
            if overlap > 0:
                doc_copy = doc.copy()
                doc_copy["relevance_score"] = overlap / len(query_words)
                scored_docs.append(doc_copy)
        
        # Sort and return top-k
        scored_docs.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_docs[:top_k]
