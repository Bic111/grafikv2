"""
Schedule generator module.

This module provides backward compatibility by re-exporting the heuristic generator.
For new code, prefer importing directly from heuristic_generator or ortools_generator.

Legacy import support:
    from backend.core.generator import generate_monthly_schedule, GenerationError
"""

# Re-export heuristic generator for backward compatibility
from .heuristic_generator import (
    GenerationError,
    generate_monthly_schedule,
)

__all__ = ['GenerationError', 'generate_monthly_schedule']
