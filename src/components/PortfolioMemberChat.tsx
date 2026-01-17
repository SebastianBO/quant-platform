"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase-browser"
import { Send, Users, MessageCircle } from "lucide-react"

interface Message {
  id: string
  content: string
  user_id: string
  created_at: string
  profile?: {
    name?: string
    username?: string
    avatar_url?: string
  }
}

interface Member {
  user_id: string
  status: string
  profiles?: {
    name?: string
    username?: string
    avatar_url?: string
  }
}

interface PortfolioMemberChatProps {
  portfolioId: string
  portfolioName: string
}

// Types for Supabase responses
interface ChatMessageRecord {
  id: string
  content: string
  user_id: string
  created_at: string
  portfolio_id: string
}

interface ProfileRecord {
  id: string
  name?: string
  username?: string
  avatar_url?: string
}

interface MemberRecord {
  user_id: string
  status: string
  profiles?: ProfileRecord
}

interface AuthUser {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

interface RealtimePayload {
  new: ChatMessageRecord
}

export default function PortfolioMemberChat({ portfolioId, portfolioName }: PortfolioMemberChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    getUser()
  }, [supabase])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_chat_messages')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) {
        console.error('[MemberChat] Error fetching messages:', error)
        return
      }

      // Fetch profiles for message senders
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((msg: ChatMessageRecord) => msg.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', userIds)

        if (profiles) {
          const profileMap: Record<string, ProfileRecord> = {}
          profiles.forEach((profile: ProfileRecord) => {
            profileMap[profile.id] = profile
          })

          data.forEach((msg: ChatMessageRecord & { profile?: ProfileRecord }) => {
            msg.profile = profileMap[msg.user_id] || undefined
          })
        }
      }

      setMessages(data || [])
    } catch (err) {
      console.error('[MemberChat] Error:', err)
    }
    setLoading(false)
  }, [portfolioId, supabase])

  // Fetch members
  const fetchMembers = useCallback(async () => {
    try {
      const { data: memberData } = await supabase
        .from('portfolio_members')
        .select('user_id, status')
        .eq('portfolio_id', portfolioId)
        .eq('status', 'accepted')

      if (memberData && memberData.length > 0) {
        const memberIds = memberData.map((m: MemberRecord) => m.user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', memberIds)

        if (profiles) {
          const profileMap: Record<string, ProfileRecord> = {}
          profiles.forEach((profile: ProfileRecord) => {
            profileMap[profile.id] = profile
          })

          memberData.forEach((member: MemberRecord) => {
            member.profiles = profileMap[member.user_id] || undefined
          })
        }

        setMembers(memberData as Member[])
      }
    } catch (err) {
      console.error('[MemberChat] Error fetching members:', err)
    }
  }, [portfolioId, supabase])

  // Subscribe to new messages
  useEffect(() => {
    fetchMessages()
    fetchMembers()

    const channel = supabase
      .channel(`portfolio-chat-${portfolioId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'portfolio_chat_messages',
          filter: `portfolio_id=eq.${portfolioId}`
        },
        async (payload: RealtimePayload) => {
          // Don't add if it's our own message (we already added it optimistically)
          if (payload.new.user_id === currentUser?.id) return

          // Fetch profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url')
            .eq('id', payload.new.user_id)
            .single()

          const enrichedMessage = {
            ...payload.new,
            profile
          } as Message

          setMessages(prev => [...prev, enrichedMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [portfolioId, supabase, fetchMessages, fetchMembers, currentUser?.id])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    // Optimistically add the message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      user_id: currentUser.id,
      created_at: new Date().toISOString(),
      profile: {
        name: currentUser.user_metadata?.full_name,
        username: currentUser.email?.split('@')[0]
      }
    }
    setMessages(prev => [...prev, optimisticMessage])

    try {
      const { data, error } = await supabase
        .from('portfolio_chat_messages')
        .insert({
          portfolio_id: portfolioId,
          user_id: currentUser.id,
          content: messageContent
        })
        .select()
        .single()

      if (error) {
        console.error('[MemberChat] Error sending message:', error)
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
      } else if (data) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(m =>
          m.id === optimisticMessage.id ? { ...data, profile: optimisticMessage.profile } : m
        ))
      }
    } catch (err) {
      console.error('[MemberChat] Error:', err)
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id))
    }

    setSending(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getInitial = (profile?: Message['profile']) => {
    if (profile?.name) return profile.name[0].toUpperCase()
    if (profile?.username) return profile.username[0].toUpperCase()
    return '?'
  }

  const getName = (profile?: Message['profile']) => {
    return profile?.name || profile?.username || 'Unknown'
  }

  if (!currentUser) {
    return (
      <Card className="bg-[#1a1a1a] border-white/[0.08]">
        <CardContent className="py-8 text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-[#868f97]" />
          <p className="text-[#868f97]">Sign in to join the conversation</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1a1a1a] border-white/[0.08] flex flex-col h-[500px]">
      <CardHeader className="border-b border-white/[0.08] pb-4">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span>Team Chat</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMembers(!showMembers)}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            <span className="text-sm">{members.length + 1}</span>
          </Button>
        </CardTitle>

        {/* Members Panel */}
        {showMembers && (
          <div className="mt-4 p-3 bg-white/[0.05]/50 rounded-lg">
            <p className="text-xs text-[#868f97] mb-2">Members</p>
            <div className="flex flex-wrap gap-2">
              {members.map(member => (
                <div
                  key={member.user_id}
                  className="flex items-center gap-2 px-2 py-1 bg-background rounded-full text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-[#4ebe96] flex items-center justify-center text-white text-[10px]">
                    {member.profiles?.name?.[0] || member.profiles?.username?.[0] || '?'}
                  </div>
                  <span>{member.profiles?.name || member.profiles?.username || 'Member'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto py-4 space-y-4">
        {loading ? (
          <div className="text-center text-[#868f97] py-8">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[#868f97] py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.user_id === currentUser?.id
            const showDateSeparator = index === 0 ||
              formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1 bg-white/[0.05]/50 rounded-full text-xs text-[#868f97]">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isOwn ? 'bg-[#4ebe96] text-white' : 'bg-white/[0.05] text-white'
                    }`}
                  >
                    {getInitial(message.profile)}
                  </div>
                  <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!isOwn && (
                        <span className="text-xs font-medium">{getName(message.profile)}</span>
                      )}
                      <span className="text-xs text-[#868f97]">{formatTime(message.created_at)}</span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-[#4ebe96] text-white rounded-br-sm'
                          : 'bg-white/[0.05] text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t border-white/[0.08] bg-background">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 bg-white/[0.05] text-white placeholder:text-[#868f97]"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-white transition-colors duration-100"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
