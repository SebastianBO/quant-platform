"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-browser"
import type { User } from "@supabase/supabase-js"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, ThumbsUp, Send, TrendingUp, TrendingDown, Minus, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface Post {
  id: string
  content: string
  ticker_symbol: string
  sentiment: 'bullish' | 'bearish' | 'neutral' | null
  created_at: string
  user_id: string
  profile: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
  likes_count: number
  comments_count: number
  user_has_liked?: boolean
}

// Cute default avatars
const DEFAULT_AVATARS = [
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_0.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfMC5wbmciLCJpYXQiOjE3NTA4MDQ5MjEsImV4cCI6MTkwODQ4NDkyMX0.FZcCX6DusoAhUVU5saqUSB4JLet0IdGbXXfddR0N6DE",
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfMS5wbmciLCJpYXQiOjE3NTA4MDUzMTksImV4cCI6MTkwODQ4NTMxOX0.2ae0s7zzM0kfP0Dl_9BSbZJ_JRA3C5A5WAu8w340FoE",
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfMi5wbmciLCJpYXQiOjE3NTA4MDUzMzgsImV4cCI6MTkwODQ4NTMzOH0.FxeHxyPHV1tmTw_dxcKo2AdCrGFKvzzZz2bDeCj05LE",
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_3.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfMy5wbmciLCJpYXQiOjE3NTA4MDU0OTQsImV4cCI6MTg3Njk0OTQ5NH0.2fQJUYwHFjiR_Q-Xkg-2AvhUUyxWXB35cJgwemZfpFk",
]

function getDefaultAvatar(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash
  }
  return DEFAULT_AVATARS[Math.abs(hash) % DEFAULT_AVATARS.length]
}

function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return null

  const config = {
    bullish: { icon: TrendingUp, color: "text-[#4ebe96] bg-[#4ebe96]/10", label: "Bullish" },
    bearish: { icon: TrendingDown, color: "text-[#ff5c5c] bg-[#ff5c5c]/10", label: "Bearish" },
    neutral: { icon: Minus, color: "text-yellow-500 bg-yellow-500/10", label: "Neutral" },
  }[sentiment] || null

  if (!config) return null
  const Icon = config.icon

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

interface StockDiscussionsProps {
  ticker: string
}

interface PostQueryResult {
  id: string
  content: string
  ticker_symbol: string
  sentiment: 'bullish' | 'bearish' | 'neutral' | null
  created_at: string
  user_id: string
  profile: Post['profile']
  likes_count: Array<{ count: number }>
  comments_count: Array<{ count: number }>
}

export default function StockDiscussions({ ticker }: StockDiscussionsProps) {
  const supabase = createClient()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [newPost, setNewPost] = useState("")
  const [sentiment, setSentiment] = useState<'bullish' | 'bearish' | 'neutral' | null>(null)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchUser()
    fetchPosts()
  }, [ticker])

  const fetchUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    setUser(authUser)
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles (id, username, full_name, avatar_url),
          likes_count:likes(count),
          comments_count:comments(count)
        `)
        .eq('ticker_symbol', ticker.toUpperCase())
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setPosts(data.map((post: PostQueryResult) => ({
          ...post,
          likes_count: post.likes_count?.[0]?.count || 0,
          comments_count: post.comments_count?.[0]?.count || 0,
        })))
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
    setLoading(false)
  }

  const handlePost = async () => {
    if (!newPost.trim() || !user) return
    setPosting(true)

    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: newPost.trim(),
        ticker_symbol: ticker.toUpperCase(),
        sentiment: sentiment,
      })

      if (!error) {
        setNewPost("")
        setSentiment(null)
        fetchPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
    setPosting(false)
  }

  const handleLike = async (postId: string) => {
    if (!user) return

    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingLike) {
        await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id })
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
      }

      fetchPosts()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#479ffa]" />
          Community Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Post input */}
        {user ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={getDefaultAvatar(user.id)}
                alt="You"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={`What's your take on ${ticker}?`}
                  className="w-full p-3 bg-white/[0.03] backdrop-blur-[10px] rounded-2xl border border-white/[0.08] focus:border-[#4ebe96]/50 focus:outline-none resize-none text-sm"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#868f97]">Sentiment:</span>
                    {(['bullish', 'bearish', 'neutral'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSentiment(sentiment === s ? null : s)}
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium motion-safe:transition-colors motion-safe:duration-100",
                          sentiment === s
                            ? s === 'bullish' ? "bg-[#4ebe96]/20 text-[#4ebe96]"
                              : s === 'bearish' ? "bg-[#ff5c5c]/20 text-[#ff5c5c]"
                              : "bg-yellow-500/20 text-yellow-500"
                            : "bg-white/[0.03] backdrop-blur-[10px] text-[#868f97] hover:bg-white/[0.08]"
                        )}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={handlePost}
                    disabled={posting || !newPost.trim()}
                    className="bg-[#4ebe96] hover:bg-[#4ebe96]/90"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
            <p className="text-[#868f97] mb-3">Sign in to join the discussion</p>
            <a href="/login">
              <Button variant="outline" size="sm">Sign in</Button>
            </a>
          </div>
        )}

        {/* Posts list */}
        <div className="space-y-4 pt-4 border-t border-white/[0.08]">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/[0.03]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/[0.03] rounded-2xl w-1/4" />
                      <div className="h-16 bg-white/[0.03] rounded-2xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/[0.03] hover:backdrop-blur-[10px] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <img
                  src={post.profile?.avatar_url || getDefaultAvatar(post.user_id)}
                  alt={post.profile?.username || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {post.profile?.full_name || post.profile?.username || "Anonymous"}
                    </span>
                    {post.profile?.username && (
                      <span className="text-xs text-[#868f97]">@{post.profile.username}</span>
                    )}
                    <span className="text-xs text-[#868f97]">·</span>
                    <span className="text-xs text-[#868f97]">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                    <SentimentBadge sentiment={post.sentiment} />
                  </div>
                  <p className="text-sm text-white/90 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={cn(
                        "flex items-center gap-1 text-xs motion-safe:transition-colors motion-safe:duration-150 ease-out",
                        post.user_has_liked ? "text-[#4ebe96]" : "text-[#868f97] hover:text-[#4ebe96]"
                      )}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {post.likes_count > 0 && post.likes_count}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-[#868f97] hover:text-[#479ffa] motion-safe:transition-colors motion-safe:duration-150 ease-out">
                      <MessageSquare className="w-4 h-4" />
                      {post.comments_count > 0 && post.comments_count}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-[#868f97]/50" />
              <p className="text-[#868f97]">No discussions yet for {ticker}</p>
              <p className="text-sm text-[#868f97]/70 mt-1">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
