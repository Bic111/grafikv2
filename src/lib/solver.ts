import { invoke } from '@tauri-apps/api/core';
import type { SolverResult } from './types';

/**
 * Run local solver (Python + OR-Tools)
 */
export async function runLocalSolver(
  startDate: string,
  endDate: string
): Promise<SolverResult> {
  try {
    const result = await invoke<SolverResult>('run_local_solver', {
      startDate,
      endDate,
    });
    return result;
  } catch (error) {
    // If command fails, return error result
    return {
      status: 'ERROR',
      assignments: [],
      warnings: [],
      errors: [String(error)],
    };
  }
}

/**
 * Run Gemini AI solver (cloud-based)
 */
export async function runGeminiSolver(
  startDate: string,
  endDate: string
): Promise<SolverResult> {
  try {
    const result = await invoke<SolverResult>('run_gemini_solver', {
      startDate,
      endDate,
    });
    return result;
  } catch (error) {
    // If command fails, return error result
    return {
      status: 'ERROR',
      assignments: [],
      warnings: [],
      errors: [String(error)],
    };
  }
}
