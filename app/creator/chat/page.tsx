"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api"
import { getAuthUser } from "@/utils/auth"
import { useSocket } from "@/hooks/useSocket"
import { useConversations } from "@/hooks/useConversations"
import { useChatMessages } from "@/hooks/useChatMessages"
import { useSocketEvents } from "@/hooks/useSocketEvents"

import { useMarkAsRead } from "@/hooks/useMarkAsRead"
import { ConversationList } from "@/components/chat/ConversationList"
import { ChatWindow } from "@/components/chat/ChatWindow"

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [updateTrigger, setUpdateTrigger] = useState(0)

  const typingTimeout = useRef<any>(null)

  const authUser = getAuthUser()
  const token = authUser?.token || null
  const userId = authUser?.userId || null

  // Custom hooks
  const socket = useSocket(token, userId)

  const {
    conversations,
    setConversations,
    allConversationMessages,
    setAllConversationMessages
  } = useConversations(token)

  const { messages, setMessages } = useChatMessages(selectedChat, token)

  useSocketEvents({
    socket,
    userId,
    selectedChat,
    setMessages,
    setAllConversationMessages,
    setConversations,
    setTypingUsers,
    setOnlineUsers,
    setUpdateTrigger
  })

  useMarkAsRead(
    selectedChat,
    messages,
    token,
    userId,
    socket,
    setAllConversationMessages,
    setMessages,
    setUpdateTrigger
  )

  // Join/leave chat room
  useEffect(() => {
    if (!selectedChat || !socket) return

    socket.emit("joinChat", selectedChat._id)
    return () => {
      socket.emit("leaveChat", selectedChat._id)
    }
  }, [selectedChat, socket])

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

  // Helper functions
  const getOtherParticipant = (chat: any) => {
    return chat.participants?.find((p: any) => p._id !== userId) || {}
  }

  const isUserOnline = (checkUserId: string) => {
    return onlineUsers.has(checkUserId)
  }

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

  const getUnreadCount = (chatId: string) => {
    const msgs = allConversationMessages[chatId] || []
    return msgs.filter((m: any) => {
      const readBy = Array.isArray(m.readBy) ? m.readBy : []
      return m.sender._id !== userId && !readBy.includes(userId)
    }).length
  }

  const otherUser = selectedChat ? getOtherParticipant(selectedChat) : {}
  const isOnline = otherUser._id && isUserOnline(otherUser._id)
  const isTyping = typingUsers.size > 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Messages</h1>
        <p className="text-muted-foreground">Chat with creators</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        <ConversationList
          conversations={conversations}
          selectedChat={selectedChat}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectChat={setSelectedChat}
          getOtherParticipant={getOtherParticipant}
          isUserOnline={isUserOnline}
          getLastMessageText={getLastMessageText}
          getUnreadCount={getUnreadCount}
          userId={userId}
        />

        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          messageInput={messageInput}
          onMessageInputChange={handleTyping}
          onSendMessage={sendMessage}
          onBack={() => setSelectedChat(null)}
          otherUser={otherUser}
          isOnline={isOnline}
          isTyping={isTyping}
          userId={userId}
        />
      </div>
    </div>
  )
}