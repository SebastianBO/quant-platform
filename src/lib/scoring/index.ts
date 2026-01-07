/**
 * Lician Scoring System
 *
 * Export all scoring functions and types for the Lician Score system.
 * This module provides comprehensive stock rating based on:
 * - Value
 * - Growth
 * - Quality
 * - Momentum
 * - Safety
 */

export {
  // Main calculation function
  calculateLicianScore,

  // Individual dimension calculators
  calculateValueScore,
  calculateGrowthScore,
  calculateQualityScore,
  calculateMomentumScore,
  calculateSafetyScore,

  // Utility functions
  getSectorMedians,

  // Types
  type LicianScore,
  type DimensionScore,
  type ScoreFactor,
  type SectorMedians,
  type IncomeStatement,
  type BalanceSheet,
  type CashFlowStatement,
  type FinancialMetrics,
  type PriceData,
  type AnalystRating
} from './lician-score'
