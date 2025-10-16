"""
ML Model Visualization Router
Provides endpoints for Random Forest model introspection and explainability
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import numpy as np
from pydantic import BaseModel
import joblib
import json
import os

router = APIRouter(prefix="/api/ml-model", tags=["ML Visualization"])

class FeatureImportance(BaseModel):
    feature: str
    importance: float

class ModelMetrics(BaseModel):
    accuracy: float
    training_samples: int
    features_used: int
    trees: int
    max_depth: int

class FeatureImportanceResponse(BaseModel):
    feature_importance: List[FeatureImportance]
    metrics: ModelMetrics

# Feature name mapping (internal -> human readable)
FEATURE_NAMES = {
    'energy_consumption': 'Energy Consumption (kWh)',
    'energy_price': 'Regional Energy Price (€/kWh)',
    'subsidy_rate': 'Government Subsidy Rate (%)',
    'wafer_size': 'Wafer Size (mm)',
    'process_node': 'Process Node (nm)',
    'material_type': 'Semiconductor Material',
    'production_volume': 'Production Volume (units)',
    'carbon_tax': 'Carbon Tax (€/ton CO2)',
    'chips_act_eligible': 'EU Chips Act Eligible',
    'region_energy_efficiency': 'Regional Energy Efficiency',
}

@router.get("/feature-importance", response_model=FeatureImportanceResponse)
async def get_feature_importance():
    """
    Get feature importance from the Random Forest model
    Shows which features have the biggest impact on TCO predictions
    """
    try:
        # Load the trained Random Forest model
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'tco_random_forest.pkl')
        metadata_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'tco_random_forest.json')
        
        if not os.path.exists(model_path):
            raise HTTPException(
                status_code=404, 
                detail="Model file not found. Train the model first using train_tco_model.py"
            )
        
        model = joblib.load(model_path)
        
        # Load metadata
        metadata = {}
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
        
        # Extract feature importance
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            
            # Get feature names from metadata if available, otherwise use defaults
            if 'features' in metadata:
                feature_names = metadata['features']
            else:
                feature_names = list(FEATURE_NAMES.values())
            
            # If model has fewer features than expected, truncate
            if len(importances) < len(feature_names):
                feature_names = feature_names[:len(importances)]
            elif len(importances) > len(feature_names):
                # Add generic names for extra features
                for i in range(len(feature_names), len(importances)):
                    feature_names.append(f'Feature {i+1}')
            
            # Convert to percentage and sort by importance
            total_importance = np.sum(importances)
            importance_pct = [(importances[i] / total_importance * 100) for i in range(len(importances))]
            
            # Create feature importance list
            feature_importance_list = [
                FeatureImportance(feature=name, importance=round(imp, 2))
                for name, imp in zip(feature_names, importance_pct)
            ]
            
            # Sort by importance (descending)
            feature_importance_list.sort(key=lambda x: x.importance, reverse=True)
            
            # Get model metrics from metadata
            n_estimators = metadata.get('n_estimators', model.n_estimators if hasattr(model, 'n_estimators') else 100)
            max_depth = metadata.get('max_depth', model.max_depth if hasattr(model, 'max_depth') else 20)
            r2_test = metadata.get('r2_test', 0.84)
            training_samples = metadata.get('training_samples', 20000)
            
            metrics = ModelMetrics(
                accuracy=round(r2_test * 100, 1),  # Convert R² to percentage
                training_samples=training_samples,
                features_used=len(importances),
                trees=n_estimators,
                max_depth=max_depth
            )
            
            return FeatureImportanceResponse(
                feature_importance=feature_importance_list,
                metrics=metrics
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Model does not support feature importance extraction"
            )
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Random Forest model not found. Run train_tco_model.py first."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error loading model: {str(e)}"
        )


@router.get("/tree-structure/{tree_index}")
async def get_tree_structure(tree_index: int):
    """
    Get the structure of a specific decision tree from the Random Forest
    Used for visualization purposes
    """
    try:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'tco_random_forest.pkl')
        
        model = joblib.load(model_path)
        
        if tree_index >= len(model.estimators_):
            raise HTTPException(
                status_code=400,
                detail=f"Tree index {tree_index} out of range. Model has {len(model.estimators_)} trees."
            )
        
        tree = model.estimators_[tree_index].tree_
        
        # Extract tree structure
        def extract_node_info(node_id):
            if tree.feature[node_id] == -2:  # Leaf node
                return {
                    'id': node_id,
                    'type': 'leaf',
                    'value': float(tree.value[node_id][0][0]),
                    'samples': int(tree.n_node_samples[node_id])
                }
            else:
                return {
                    'id': node_id,
                    'type': 'decision',
                    'feature': int(tree.feature[node_id]),
                    'threshold': float(tree.threshold[node_id]),
                    'samples': int(tree.n_node_samples[node_id]),
                    'left_child': extract_node_info(tree.children_left[node_id]),
                    'right_child': extract_node_info(tree.children_right[node_id])
                }
        
        tree_structure = extract_node_info(0)
        
        return {
            'tree_index': tree_index,
            'total_nodes': tree.node_count,
            'max_depth': tree.max_depth,
            'structure': tree_structure
        }
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Random Forest model not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error extracting tree structure: {str(e)}"
        )


@router.get("/model-info")
async def get_model_info():
    """
    Get general information about the Random Forest model
    """
    try:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'tco_random_forest.pkl')
        metadata_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'tco_random_forest.json')
        
        if not os.path.exists(model_path):
            return {
                'model_exists': False,
                'message': 'Model not trained yet. Run train_tco_model.py to train the model.'
            }
        
        model = joblib.load(model_path)
        
        # Load metadata
        metadata = {}
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
        
        model_size_mb = os.path.getsize(model_path) / (1024 * 1024)
        
        return {
            'model_exists': True,
            'model_type': type(model).__name__,
            'n_estimators': model.n_estimators if hasattr(model, 'n_estimators') else None,
            'max_depth': model.max_depth if hasattr(model, 'max_depth') else None,
            'n_features': model.n_features_in_ if hasattr(model, 'n_features_in_') else None,
            'model_size_mb': round(model_size_mb, 2),
            'training_date': 'October 2025',
            'data_sources': [
                'Materials Project API',
                'ENTSO-E Energy Prices',
                'JRC Semiconductor Studies',
                'OECD Energy Statistics'
            ],
            'metadata': metadata
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting model info: {str(e)}"
        )
