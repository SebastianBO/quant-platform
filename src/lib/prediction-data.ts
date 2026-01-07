/**
 * Historical Prediction Data
 * This module contains mock historical predictions for demonstrating prediction accuracy.
 * In production, this would be fetched from a database.
 */

export interface HistoricalPrediction {
  ticker: string
  companyName: string
  predictionDate: string // When we made the prediction
  evaluationDate: string // When we evaluated the result
  priceAtPrediction: number
  predictedPrice: number
  actualPrice: number
  predictedChange: number // Percentage change predicted
  actualChange: number // Actual percentage change
  prediction: 'bullish' | 'bearish' | 'neutral'
  outcome: 'correct' | 'incorrect' | 'partially_correct'
  wallStreetTarget?: number // What Wall Street predicted
  wallStreetAccuracy?: number // How accurate Wall Street was
}

export interface PredictionStats {
  totalPredictions: number
  correctPredictions: number
  partiallyCorrect: number
  accuracyRate: number
  averageError: number // Average difference between predicted and actual
  wallStreetAccuracyRate: number // For comparison
  directionAccuracyRate: number // Whether we got the direction right
  beatWallStreet: boolean // Did we outperform Wall Street?
}

// Sample historical predictions (would come from database in production)
// These show predictions made in January 2025 for year-end results
export const HISTORICAL_PREDICTIONS: HistoricalPrediction[] = [
  {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    predictionDate: '2025-01-15',
    evaluationDate: '2025-12-31',
    priceAtPrediction: 185.50,
    predictedPrice: 215.00,
    actualPrice: 198.75,
    predictedChange: 15.9,
    actualChange: 7.1,
    prediction: 'bullish',
    outcome: 'partially_correct',
    wallStreetTarget: 205.00,
    wallStreetAccuracy: 96.9,
  },
  {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    predictionDate: '2025-01-15',
    evaluationDate: '2025-12-31',
    priceAtPrediction: 142.50,
    predictedPrice: 180.00,
    actualPrice: 175.25,
    predictedChange: 26.3,
    actualChange: 23.0,
    prediction: 'bullish',
    outcome: 'correct',
    wallStreetTarget: 160.00,
    wallStreetAccuracy: 91.3,
  },
  {
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    predictionDate: '2025-01-15',
    evaluationDate: '2025-12-31',
    priceAtPrediction: 410.25,
    predictedPrice: 475.00,
    actualPrice: 458.50,
    predictedChange: 15.8,
    actualChange: 11.8,
    prediction: 'bullish',
    outcome: 'correct',
    wallStreetTarget: 450.00,
    wallStreetAccuracy: 98.1,
  },
  {
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    predictionDate: '2025-01-15',
    evaluationDate: '2025-12-31',
    priceAtPrediction: 175.00,
    predictedPrice: 195.00,
    actualPrice: 188.30,
    predictedChange: 11.4,
    actualChange: 7.6,
    prediction: 'bullish',
    outcome: 'correct',
    wallStreetTarget: 190.00,
    wallStreetAccuracy: 99.1,
  },
  {
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    predictionDate: '2025-01-15',
    evaluationDate: '2025-12-31',
    priceAtPrediction: 248.50,
    predictedPrice: 320.00,
    actualPrice: 275.80,
    predictedChange: 28.8,
    actualChange: 11.0,
    prediction: 'bullish',
    outcome: 'partially_correct',
    wallStreetTarget: 270.00,
    wallStreetAccuracy: 97.9,
  },
  {
    ticker: 'META',
    companyName: 'Meta Platforms, Inc.',
    predictionDate: '2025-01-15',
    evaluationDate: '2025-12-31',
    priceAtPrediction: 485.00,
    predictedPrice: 550.00,
    actualPrice: 565.25,
    predictedChange: 13.4,
    actualChange: 16.5,
    prediction: 'bullish',
    outcome: 'correct',
    wallStreetTarget: 520.00,
    wallStreetAccuracy: 92.0,
  },
  {
    ticker: 'AMZN',
    companyName: 'Amazon.com, Inc.',
    predictionDate: '2025-01-15',
    evaluationDate: '2025-12-31',
    priceAtPrediction: 195.50,
    predictedPrice: 230.00,
    actualPrice: 218.40,
    predictedChange: 17.6,
    actualChange: 11.7,
    prediction: 'bullish',
    outcome: 'correct',
    wallStreetTarget: 215.00,
    wallStreetAccuracy: 98.4,
  },
  {
    ticker: 'AMD',
    companyName: 'Advanced Micro Devices',
    predictionDate: '2025-01-15',
    evaluationDate: '2025-12-31',
    priceAtPrediction: 138.75,
    predictedPrice: 175.00,
    actualPrice: 152.30,
    predictedChange: 26.1,
    actualChange: 9.8,
    prediction: 'bullish',
    outcome: 'partially_correct',
    wallStreetTarget: 165.00,
    wallStreetAccuracy: 92.3,
  },
]

/**
 * Calculate prediction statistics from historical data
 */
export function calculatePredictionStats(predictions: HistoricalPrediction[]): PredictionStats {
  if (predictions.length === 0) {
    return {
      totalPredictions: 0,
      correctPredictions: 0,
      partiallyCorrect: 0,
      accuracyRate: 0,
      averageError: 0,
      wallStreetAccuracyRate: 0,
      directionAccuracyRate: 0,
      beatWallStreet: false,
    }
  }

  const correctPredictions = predictions.filter(p => p.outcome === 'correct').length
  const partiallyCorrect = predictions.filter(p => p.outcome === 'partially_correct').length

  // Direction accuracy: did we predict the correct direction (up/down)?
  const directionCorrect = predictions.filter(p => {
    const predictedDirection = p.predictedChange > 0 ? 'up' : p.predictedChange < 0 ? 'down' : 'flat'
    const actualDirection = p.actualChange > 0 ? 'up' : p.actualChange < 0 ? 'down' : 'flat'
    return predictedDirection === actualDirection
  }).length

  // Calculate average error (absolute difference between predicted and actual change)
  const totalError = predictions.reduce((sum, p) => {
    return sum + Math.abs(p.predictedChange - p.actualChange)
  }, 0)
  const averageError = totalError / predictions.length

  // Calculate Wall Street average accuracy
  const wallStreetTotalAccuracy = predictions.reduce((sum, p) => {
    return sum + (p.wallStreetAccuracy || 0)
  }, 0)
  const wallStreetAccuracyRate = wallStreetTotalAccuracy / predictions.filter(p => p.wallStreetAccuracy).length

  // Our accuracy: how close we were on average
  const ourAccuracy = predictions.reduce((sum, p) => {
    const accuracy = 100 - Math.abs(((p.predictedPrice - p.actualPrice) / p.actualPrice) * 100)
    return sum + accuracy
  }, 0) / predictions.length

  return {
    totalPredictions: predictions.length,
    correctPredictions,
    partiallyCorrect,
    accuracyRate: ourAccuracy,
    averageError,
    wallStreetAccuracyRate,
    directionAccuracyRate: (directionCorrect / predictions.length) * 100,
    beatWallStreet: ourAccuracy > wallStreetAccuracyRate,
  }
}

/**
 * Get prediction for a specific ticker
 */
export function getPredictionForTicker(ticker: string): HistoricalPrediction | null {
  return HISTORICAL_PREDICTIONS.find(p => p.ticker.toUpperCase() === ticker.toUpperCase()) || null
}

/**
 * Check if we have historical data for a ticker
 */
export function hasHistoricalPrediction(ticker: string): boolean {
  return HISTORICAL_PREDICTIONS.some(p => p.ticker.toUpperCase() === ticker.toUpperCase())
}

/**
 * Get the tracking start date message for tickers without history
 */
export function getTrackingMessage(): string {
  return 'Tracking begins January 2026'
}

/**
 * Get top performing predictions
 */
export function getTopPredictions(limit: number = 5): HistoricalPrediction[] {
  return [...HISTORICAL_PREDICTIONS]
    .filter(p => p.outcome === 'correct')
    .sort((a, b) => {
      // Sort by how close we were to actual price (higher accuracy first)
      const accuracyA = 100 - Math.abs(((a.predictedPrice - a.actualPrice) / a.actualPrice) * 100)
      const accuracyB = 100 - Math.abs(((b.predictedPrice - b.actualPrice) / b.actualPrice) * 100)
      return accuracyB - accuracyA
    })
    .slice(0, limit)
}

/**
 * Generate a prediction comparison for display
 */
export interface PredictionComparison {
  ticker: string
  companyName: string
  ourPrediction: string
  actualResult: string
  ourAccuracy: number
  wallStreetAccuracy: number
  weBeatWallStreet: boolean
}

export function getPredictionComparisons(): PredictionComparison[] {
  return HISTORICAL_PREDICTIONS.map(p => {
    const ourAccuracy = 100 - Math.abs(((p.predictedPrice - p.actualPrice) / p.actualPrice) * 100)
    return {
      ticker: p.ticker,
      companyName: p.companyName,
      ourPrediction: `$${p.predictedPrice.toFixed(2)} (${p.predictedChange > 0 ? '+' : ''}${p.predictedChange.toFixed(1)}%)`,
      actualResult: `$${p.actualPrice.toFixed(2)} (${p.actualChange > 0 ? '+' : ''}${p.actualChange.toFixed(1)}%)`,
      ourAccuracy,
      wallStreetAccuracy: p.wallStreetAccuracy || 0,
      weBeatWallStreet: ourAccuracy > (p.wallStreetAccuracy || 0),
    }
  })
}
