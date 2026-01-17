"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Share2, Twitter, RefreshCw, Trophy, Zap, TrendingUp, TrendingDown } from 'lucide-react'

// Top stocks for battles
const BATTLE_STOCKS = [
  { ticker: 'AAPL', name: 'Apple', sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft', sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Google', sector: 'Technology' },
  { ticker: 'AMZN', name: 'Amazon', sector: 'Consumer' },
  { ticker: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
  { ticker: 'TSLA', name: 'Tesla', sector: 'Automotive' },
  { ticker: 'META', name: 'Meta', sector: 'Technology' },
  { ticker: 'JPM', name: 'JPMorgan', sector: 'Finance' },
  { ticker: 'V', name: 'Visa', sector: 'Finance' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { ticker: 'WMT', name: 'Walmart', sector: 'Retail' },
  { ticker: 'MA', name: 'Mastercard', sector: 'Finance' },
  { ticker: 'HD', name: 'Home Depot', sector: 'Retail' },
  { ticker: 'PG', name: 'Procter & Gamble', sector: 'Consumer' },
  { ticker: 'DIS', name: 'Disney', sector: 'Entertainment' },
  { ticker: 'NFLX', name: 'Netflix', sector: 'Entertainment' },
  { ticker: 'AMD', name: 'AMD', sector: 'Technology' },
  { ticker: 'CRM', name: 'Salesforce', sector: 'Technology' },
  { ticker: 'COST', name: 'Costco', sector: 'Retail' },
  { ticker: 'PEP', name: 'PepsiCo', sector: 'Consumer' },
  { ticker: 'KO', name: 'Coca-Cola', sector: 'Consumer' },
  { ticker: 'MRK', name: 'Merck', sector: 'Healthcare' },
  { ticker: 'ABBV', name: 'AbbVie', sector: 'Healthcare' },
  { ticker: 'XOM', name: 'Exxon', sector: 'Energy' },
  { ticker: 'CVX', name: 'Chevron', sector: 'Energy' },
  { ticker: 'BA', name: 'Boeing', sector: 'Industrial' },
  { ticker: 'CAT', name: 'Caterpillar', sector: 'Industrial' },
  { ticker: 'GS', name: 'Goldman Sachs', sector: 'Finance' },
  { ticker: 'INTC', name: 'Intel', sector: 'Technology' },
  { ticker: 'UBER', name: 'Uber', sector: 'Technology' },
]

interface Stock {
  ticker: string
  name: string
  sector: string
}

interface BattleResult {
  stock1: Stock
  stock2: Stock
  winner: Stock
  stock1Votes: number
  stock2Votes: number
}

export default function StockBattleClient() {
  const [stock1, setStock1] = useState<Stock | null>(null)
  const [stock2, setStock2] = useState<Stock | null>(null)
  const [voted, setVoted] = useState(false)
  const [result, setResult] = useState<BattleResult | null>(null)
  const [streak, setStreak] = useState(0)
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showShare, setShowShare] = useState(false)

  // Get random pair of stocks
  const getNewBattle = useCallback(() => {
    const shuffled = [...BATTLE_STOCKS].sort(() => Math.random() - 0.5)
    setStock1(shuffled[0])
    setStock2(shuffled[1])
    setVoted(false)
    setResult(null)
    setShowShare(false)
  }, [])

  useEffect(() => {
    getNewBattle()
    // Load streak from localStorage
    const savedStreak = localStorage.getItem('stockBattleStreak')
    if (savedStreak) setStreak(parseInt(savedStreak))
  }, [getNewBattle])

  // Simulate voting (in production, this would hit an API)
  const handleVote = async (winner: Stock) => {
    if (voted || !stock1 || !stock2) return
    setLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Generate realistic vote distribution (biased slightly toward popular stocks)
    const popularStocks = ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'TSLA', 'AMZN']
    const isWinnerPopular = popularStocks.includes(winner.ticker)
    const baseVotes = Math.floor(Math.random() * 5000) + 1000

    let winnerVotes: number, loserVotes: number
    if (isWinnerPopular) {
      winnerVotes = baseVotes + Math.floor(Math.random() * 2000)
      loserVotes = Math.floor(baseVotes * (0.4 + Math.random() * 0.3))
    } else {
      winnerVotes = baseVotes
      loserVotes = baseVotes + Math.floor(Math.random() * 1500)
    }

    const newResult: BattleResult = {
      stock1,
      stock2,
      winner,
      stock1Votes: winner.ticker === stock1.ticker ? winnerVotes : loserVotes,
      stock2Votes: winner.ticker === stock2.ticker ? winnerVotes : loserVotes,
    }

    setResult(newResult)
    setVoted(true)
    setShowShare(true)
    setTotalVotes(prev => prev + 1)

    // Update streak
    const newStreak = streak + 1
    setStreak(newStreak)
    localStorage.setItem('stockBattleStreak', newStreak.toString())

    setLoading(false)
  }

  const getVotePercentage = (votes: number, total: number) => {
    return Math.round((votes / total) * 100)
  }

  const shareOnTwitter = () => {
    if (!result) return
    const text = `I voted ${result.winner.ticker} over ${result.winner.ticker === result.stock1.ticker ? result.stock2.ticker : result.stock1.ticker} in Stock Battle! 🏆\n\nWhich stock would YOU buy?\n\nhttps://lician.com/battle`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const copyLink = () => {
    navigator.clipboard.writeText('https://lician.com/battle')
    alert('Link copied!')
  }

  if (!stock1 || !stock2) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4ebe96]"></div>
      </div>
    )
  }

  const totalVotesInBattle = result ? result.stock1Votes + result.stock2Votes : 0

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-white/[0.08]">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>Streak: <strong className="text-[#4ebe96]">{streak}</strong></span>
        </div>
        <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-white/[0.08]">
          <Zap className="w-4 h-4 text-[#479ffa]" />
          <span>Votes: <strong>{totalVotes}</strong></span>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {/* Stock 1 */}
        <button
          onClick={() => handleVote(stock1)}
          disabled={voted || loading}
          className={`relative group bg-[#1a1a1a] p-8 rounded-2xl border-2 transition-all duration-300 ${
            voted
              ? result?.winner.ticker === stock1.ticker
                ? 'border-[#4ebe96] bg-[#4ebe96]/10'
                : 'border-white/[0.08] opacity-70'
              : 'border-white/[0.08] hover:border-[#4ebe96] hover:scale-[1.02] cursor-pointer'
          }`}
        >
          {voted && result?.winner.ticker === stock1.ticker && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4ebe96] text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" /> YOUR PICK
            </div>
          )}

          <div className="text-center">
            <p className="text-4xl font-bold mb-2">{stock1.ticker}</p>
            <p className="text-lg text-[#868f97] mb-1">{stock1.name}</p>
            <p className="text-sm text-[#868f97]/70">{stock1.sector}</p>
          </div>

          {voted && result && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>{result.stock1Votes.toLocaleString()} votes</span>
                <span className="font-bold">{getVotePercentage(result.stock1Votes, totalVotesInBattle)}%</span>
              </div>
              <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    result.winner.ticker === stock1.ticker ? 'bg-[#4ebe96]' : 'bg-gray-500'
                  }`}
                  style={{ width: `${getVotePercentage(result.stock1Votes, totalVotesInBattle)}%` }}
                />
              </div>
            </div>
          )}

          {!voted && (
            <div className="mt-6 flex justify-center">
              <span className="text-sm text-[#868f97] group-hover:text-[#4ebe96] transition-colors duration-100">
                Click to vote
              </span>
            </div>
          )}
        </button>

        {/* VS Divider */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-16 h-16 bg-background border-2 border-white/[0.08] rounded-full flex items-center justify-center font-bold text-xl">
            VS
          </div>
        </div>
        <div className="md:hidden flex justify-center -my-2">
          <div className="w-12 h-12 bg-background border-2 border-white/[0.08] rounded-full flex items-center justify-center font-bold">
            VS
          </div>
        </div>

        {/* Stock 2 */}
        <button
          onClick={() => handleVote(stock2)}
          disabled={voted || loading}
          className={`relative group bg-[#1a1a1a] p-8 rounded-2xl border-2 transition-all duration-300 ${
            voted
              ? result?.winner.ticker === stock2.ticker
                ? 'border-[#4ebe96] bg-[#4ebe96]/10'
                : 'border-white/[0.08] opacity-70'
              : 'border-white/[0.08] hover:border-[#479ffa] hover:scale-[1.02] cursor-pointer'
          }`}
        >
          {voted && result?.winner.ticker === stock2.ticker && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4ebe96] text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" /> YOUR PICK
            </div>
          )}

          <div className="text-center">
            <p className="text-4xl font-bold mb-2">{stock2.ticker}</p>
            <p className="text-lg text-[#868f97] mb-1">{stock2.name}</p>
            <p className="text-sm text-[#868f97]/70">{stock2.sector}</p>
          </div>

          {voted && result && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>{result.stock2Votes.toLocaleString()} votes</span>
                <span className="font-bold">{getVotePercentage(result.stock2Votes, totalVotesInBattle)}%</span>
              </div>
              <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    result.winner.ticker === stock2.ticker ? 'bg-[#4ebe96]' : 'bg-gray-500'
                  }`}
                  style={{ width: `${getVotePercentage(result.stock2Votes, totalVotesInBattle)}%` }}
                />
              </div>
            </div>
          )}

          {!voted && (
            <div className="mt-6 flex justify-center">
              <span className="text-sm text-[#868f97] group-hover:text-[#479ffa] transition-colors duration-100">
                Click to vote
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Actions */}
      {voted && (
        <div className="flex flex-col items-center gap-4">
          {/* Share buttons */}
          {showShare && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={shareOnTwitter}
                className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg hover:bg-[#1DA1F2]/30 transition-colors duration-100"
              >
                <Twitter className="w-4 h-4" />
                Share on X
              </button>
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100"
              >
                <Share2 className="w-4 h-4" />
                Copy Link
              </button>
            </div>
          )}

          {/* Next battle */}
          <button
            onClick={getNewBattle}
            className="flex items-center gap-2 px-6 py-3 bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black rounded-lg font-medium transition-colors duration-100"
          >
            <RefreshCw className="w-4 h-4" />
            Next Battle
          </button>

          {/* Deep links */}
          <div className="flex gap-4 text-sm">
            <Link
              href={`/compare/${stock1.ticker.toLowerCase()}-vs-${stock2.ticker.toLowerCase()}`}
              className="text-[#868f97] hover:text-[#4ebe96] transition-colors duration-100"
            >
              Compare {stock1.ticker} vs {stock2.ticker} →
            </Link>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ebe96]"></div>
        </div>
      )}
    </div>
  )
}
