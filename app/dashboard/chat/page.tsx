"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api"
import { io, Socket } from "socket.io-client"
import { getAuthUser } from "@/utils/auth"

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [socket, setSocket] = useState<Socket | null>(null)

  // Store all messages for each conversation to calculate unread counts
  const [allConversationMessages, setAllConversationMessages] = useState<Record<string, any[]>>({})
  // Force re-render counter for unread counts
  const [updateTrigger, setUpdateTrigger] = useState(0)

  const typingTimeout = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const authUser = getAuthUser()
  const token = authUser?.token || null
  const userId = authUser?.userId || null

  // Initialize socket connection
  useEffect(() => {
    if (!token || !userId) return

    const baseSocketURL = API_BASE_URL.replace(/\/api.*/, "")
    console.log("Connecting to socket at:", baseSocketURL, "with userId:", userId)
    const newSocket = io(baseSocketURL, { auth: { token } })

    newSocket.on("connect", () => {
      console.log("Socket connected successfully! Socket ID:", newSocket.id)
    })

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message)
    })

    setSocket(newSocket)

    return () => {
      console.log("Disconnecting socket...")
      newSocket.disconnect()
    }
  }, [token, userId])

  // Setup socket event listeners
  useEffect(() => {
    if (!socket || !userId) return

    const handleNewMessage = (msg: any) => {
      console.log("New message received:", msg)

      // 1. Update allConversationMessages with new message
      setAllConversationMessages((prev) => {
        const prevMsgs = prev[msg.chatId] || []
        // Avoid duplicates
        if (prevMsgs.some((m: any) => m._id === msg._id)) {
          console.log("Duplicate message detected, skipping")
          return prev
        }

        const updated = {
          ...prev,
          [msg.chatId]: [...prevMsgs, msg],
        }

        return updated
      })

      // 2. Move conversation to top of list
      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c._id === msg.chatId)
        if (convIndex === -1) return prev

        const updatedConv = { ...prev[convIndex], updatedAt: new Date().toISOString() }
        const newConvs = [updatedConv, ...prev.filter((c) => c._id !== msg.chatId)]

        console.log("Moved conversation to top:", updatedConv.participants?.find((p: any) => p._id !== userId)?.name)
        return newConvs
      })

      // 3. If this chat is currently open, also update the messages in view
      if (selectedChat && msg.chatId === selectedChat._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }

      // 4. Force re-render to update unread counts
      setUpdateTrigger(t => t + 1)
    }

    const handleTyping = ({ userId: typingUserId }: any) => {
      setTypingUsers((prev) => new Set(prev).add(typingUserId))
    }

    const handleStopTyping = ({ userId: typingUserId }: any) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(typingUserId)
        return newSet
      })
    }

    const handleUserOnline = ({ userId: onlineUserId }: any) => {
      console.log(" User online event received:", onlineUserId, "Current user:", userId)
      setOnlineUsers((prev) => {
        const newSet = new Set(prev).add(onlineUserId)
        console.log("Updated online users:", Array.from(newSet))
        return newSet
      })
    }

    const handleUserOffline = ({ userId: offlineUserId }: any) => {
      console.log("User offline event received:", offlineUserId)
      setOnlineUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(offlineUserId)
        console.log("Updated online users after removal:", Array.from(newSet))
        return newSet
      })
    }

    const handleMessageRead = ({ messageId, userId: readerId, readAt }: any) => {
      console.log("Message read:", messageId, "by:", readerId)

      // Update the current chat messages
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== messageId) return m

          const readBy = Array.isArray(m.readBy) ? [...m.readBy] : []
          if (!readBy.includes(readerId)) {
            readBy.push(readerId)
          }

          const readReceipts = Array.isArray(m.readReceipts) ? [...m.readReceipts] : []
          if (!readReceipts.some((r: any) => r.userId === readerId)) {
            readReceipts.push({ userId: readerId, readAt })
          }

          return { ...m, readBy, readReceipts }
        })
      )

      // Also update allConversationMessages
      setAllConversationMessages((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((chatId) => {
          updated[chatId] = updated[chatId].map((m) => {
            if (m._id !== messageId) return m

            const readBy = Array.isArray(m.readBy) ? [...m.readBy] : []
            if (!readBy.includes(readerId)) {
              readBy.push(readerId)
            }

            const readReceipts = Array.isArray(m.readReceipts) ? [...m.readReceipts] : []
            if (!readReceipts.some((r: any) => r.userId === readerId)) {
              readReceipts.push({ userId: readerId, readAt })
            }

            return { ...m, readBy, readReceipts }
          })
        })
        return updated
      })

      // Force re-render
      setUpdateTrigger(t => t + 1)
    }

    socket.on("newMessage", handleNewMessage)
    socket.on("typing", handleTyping)
    socket.on("stopTyping", handleStopTyping)
    socket.on("userOnline", handleUserOnline)
    socket.on("userOffline", handleUserOffline)
    socket.on("messageRead", handleMessageRead)

    return () => {
      socket.off("newMessage", handleNewMessage)
      socket.off("typing", handleTyping)
      socket.off("stopTyping", handleStopTyping)
      socket.off("userOnline", handleUserOnline)
      socket.off("userOffline", handleUserOffline)
      socket.off("messageRead", handleMessageRead)
    }
  }, [socket, selectedChat, userId])

  // Join/leave chat room
  useEffect(() => {
    if (!selectedChat || !socket) return

    socket.emit("joinChat", selectedChat._id)
    return () => {
      socket.emit("leaveChat", selectedChat._id)
    }
  }, [selectedChat, socket])

  // Load conversations
  useEffect(() => {
    if (!token) return

    axios
      .get(`${API_BASE_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        console.log("Loaded conversations:", res.data.length)
        setConversations(res.data)
      })
      .catch(console.error)
  }, [token])

  // Load ALL messages for each conversation (for unread count & last message)
  useEffect(() => {
    if (!conversations.length || !token) return

    const fetchAllMessages = async () => {
      const allMessages: Record<string, any[]> = {}

      await Promise.all(
        conversations.map(async (conv) => {
          try {
            const res = await axios.get(`${API_BASE_URL}/chats/${conv._id}/messages`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            allMessages[conv._id] = res.data
          } catch (e) {
            allMessages[conv._id] = []
          }
        })
      )

      console.log("Loaded all messages for conversations")
      setAllConversationMessages(allMessages)
    }

    fetchAllMessages()
  }, [conversations.length, token])

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat || !token) return

    console.log("Loading messages for chat:", selectedChat._id)
    axios
      .get(`${API_BASE_URL}/chats/${selectedChat._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        console.log("Loaded messages:", res.data.length)
        setMessages(res.data)
      })
      .catch(console.error)
  }, [selectedChat, token])

  // Mark messages as read when opening chat
  useEffect(() => {
    if (!selectedChat || !messages.length || !token || !userId) return

    const unreadIds = messages
      .filter((m) => {
        const readBy = Array.isArray(m.readBy) ? m.readBy : []
        return m.sender._id !== userId && !readBy.includes(userId)
      })
      .map((m) => m._id)

    if (unreadIds.length > 0) {
      console.log("Marking messages as read:", unreadIds.length)

      // Update allConversationMessages immediately (optimistic update)
      setAllConversationMessages((prev) => ({
        ...prev,
        [selectedChat._id]: (prev[selectedChat._id] || []).map((m) =>
          unreadIds.includes(m._id)
            ? {
              ...m,
              readBy: [...(Array.isArray(m.readBy) ? m.readBy : []), userId],
              readReceipts: [
                ...(Array.isArray(m.readReceipts) ? m.readReceipts : []),
                { userId, readAt: new Date().toISOString() }
              ]
            }
            : m
        ),
      }))

      // Update messages state
      setMessages((prev) =>
        prev.map((m) =>
          unreadIds.includes(m._id)
            ? {
              ...m,
              readBy: [...(Array.isArray(m.readBy) ? m.readBy : []), userId],
              readReceipts: [
                ...(Array.isArray(m.readReceipts) ? m.readReceipts : []),
                { userId, readAt: new Date().toISOString() }
              ]
            }
            : m
        )
      )

      // Force re-render to update unread count immediately
      setUpdateTrigger(t => t + 1)

      // Update server
      axios
        .post(
          `${API_BASE_URL}/chats/mark-read`,
          { chatId: selectedChat._id, messageIds: unreadIds },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          console.log("Server confirmed messages marked as read")
          // Emit socket event to notify other users
          if (socket) {
            unreadIds.forEach(msgId => {
              socket.emit('messageRead', {
                chatId: selectedChat._id,
                messageId: msgId
              })
            })
          }
        })
        .catch(console.error)
    }
  }, [messages.length, selectedChat?._id, userId, token, socket])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleTyping = (text: string) => {
    setMessageInput(text)
    if (!socket || !selectedChat) return

    socket.emit("typing", { chatId: selectedChat._id })

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
    }
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { chatId: selectedChat._id })
    }, 1000)
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !token) return

    try {
      await axios.post(
        `${API_BASE_URL}/chats/message`,
        { chatId: selectedChat._id, text: messageInput },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessageInput("")
      console.log("Message sent successfully")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  // Helper: Get other participant in a conversation
  const getOtherParticipant = (chat: any) => {
    return chat.participants?.find((p: any) => p._id !== userId) || {}
  }

  // Helper: Check if user is online
  const isUserOnline = (checkUserId: string) => {
    return onlineUsers.has(checkUserId)
  }

  // Helper: Get last message text for a conversation
  const getLastMessageText = (chatId: string) => {
    const msgs = allConversationMessages[chatId] || []
    if (msgs.length === 0) return "No messages yet"

    const lastMsg = msgs[msgs.length - 1]
    const text = lastMsg.text || ""

    const maxLength = 30
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text
  }

  // Helper: Get unread count for a conversation
  const getUnreadCount = (chatId: string) => {
    const msgs = allConversationMessages[chatId] || []
    const unread = msgs.filter((m: any) => {
      const readBy = Array.isArray(m.readBy) ? m.readBy : []
      return m.sender._id !== userId && !readBy.includes(userId)
    }).length

    return unread
  }

  const filteredConversations = conversations.filter((conv) =>
    getOtherParticipant(conv).name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Date grouping helpers
  const isSameDay = (a?: string | Date, b?: string | Date) => {
    if (!a || !b) return false
    const da = new Date(a)
    const db = new Date(b)
    return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate()
  }

  const getDateLabel = (iso?: string) => {
    if (!iso) return ""
    const d = new Date(iso)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (isSameDay(d, today)) return "Today"
    if (isSameDay(d, yesterday)) return "Yesterday"

    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const renderMessagesList = (msgs: any[]) => {
    const sorted = [...msgs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    const nodes: any[] = []
    sorted.forEach((msg, idx) => {
      const prev = idx > 0 ? sorted[idx - 1] : null
      const showDate = idx === 0 || !isSameDay(prev?.createdAt, msg.createdAt)
      if (showDate) {
        nodes.push(
          <div key={`date-${msg._id || idx}`} className="text-center text-xs text-muted-foreground my-2">
            {getDateLabel(msg.createdAt)}
          </div>
        )
      }
      nodes.push(renderMessage(msg))
    })
    return nodes
  }

  const renderMessage = (msg: any) => {
    const isMine = msg.sender._id === userId
    const readReceipts = Array.isArray(msg.readReceipts) ? msg.readReceipts : []
    const otherReads = readReceipts
      .filter((r: any) => r.userId !== userId)
      .sort((a: any, b: any) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())
    const latestRead = otherReads[0]
    const isRead = latestRead || (Array.isArray(msg.readBy) && msg.readBy.some((id: any) => id !== userId))

    return (
      <div key={msg._id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "max-w-xs px-4 py-2 rounded-lg",
            isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          )}
        >
          <p className="text-sm">{msg.text}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs opacity-70">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
            {isMine && (
              <div className="flex items-center gap-1">
                <svg
                  width="16"
                  height="12"
                  viewBox="0 0 16 12"
                  fill="none"
                  className={cn("inline-block", isRead ? "text-blue-500" : "text-muted-foreground")}
                >
                  <path
                    d="M1 7.5L4 10.5L7.5 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 7.5L9 10.5L14 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {isRead && <span className="text-xs text-blue-500">Seen</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderChatHeader = () => {
    if (!selectedChat) return null

    const otherUser = getOtherParticipant(selectedChat)
    const isOnline = otherUser._id && isUserOnline(otherUser._id)
    const isTyping = typingUsers.size > 0

    return (
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedChat(null)}
          className="lg:hidden"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold text-sm">
          {otherUser.name?.[0] || "?"}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{otherUser.name || "Unknown"}</p>
          <p className="text-xs text-muted-foreground">
            {selectedChat.file?.title || "Purchase"}
          </p>
          {isOnline && <p className="text-xs text-green-500">Online</p>}
          {isTyping && <p className="text-xs text-blue-500">Typing...</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Messages</h1>
        <p className="text-muted-foreground">Chat with creators</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className={cn(
          "border border-border flex flex-col lg:col-span-1 h-[600px]",
          selectedChat && "hidden lg:flex"
        )}>
          <div className="p-4 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* ScrollArea for conversations list */}
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-4">
              {filteredConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No conversations found
                </p>
              ) : (
                filteredConversations.map((conv) => {
                  const otherUser = getOtherParticipant(conv)
                  const isOnline = otherUser._id && isUserOnline(otherUser._id)
                  const lastMessageText = getLastMessageText(conv._id)
                  const unreadCount = getUnreadCount(conv._id)

                  return (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedChat(conv)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors",
                        selectedChat?._id === conv._id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-semibold">
                          {otherUser.name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{otherUser.name || "Unknown"}</p>
                          <p className="text-xs opacity-75 truncate">{lastMessageText}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {isOnline && <span className="text-green-500 text-xs">●</span>}
                          {unreadCount > 0 && selectedChat?._id !== conv._id && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className={cn(
          "border border-border flex flex-col lg:col-span-2 h-[600px]",
          !selectedChat && "hidden lg:flex"
        )}>
          {selectedChat ? (
            <>
              {renderChatHeader()}

              {/* Messages area with fixed height and scroll */}
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="space-y-4 p-4">
                    {renderMessagesList(messages)}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input area - fixed at bottom */}
              <div className="p-4 border-t border-border shrink-0">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button size="icon" onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}