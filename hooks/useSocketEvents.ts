import { useEffect } from "react"
import { Socket } from "socket.io-client"

interface UseSocketEventsProps {
  socket: Socket | null
  userId: string | null
  selectedChat: any
  setMessages: React.Dispatch<React.SetStateAction<any[]>>
  setAllConversationMessages: React.Dispatch<React.SetStateAction<Record<string, any[]>>>
  setConversations: React.Dispatch<React.SetStateAction<any[]>>
  setTypingUsers: React.Dispatch<React.SetStateAction<Set<string>>>
  setOnlineUsers: React.Dispatch<React.SetStateAction<Set<string>>>
  setUpdateTrigger: React.Dispatch<React.SetStateAction<number>>
}

export function useSocketEvents({
  socket,
  userId,
  selectedChat,
  setMessages,
  setAllConversationMessages,
  setConversations,
  setTypingUsers,
  setOnlineUsers,
  setUpdateTrigger
}: UseSocketEventsProps) {
  useEffect(() => {
    if (!socket || !userId) return

    const handleNewMessage = (msg: any) => {
      console.log("New message received:", msg)

      setAllConversationMessages((prev) => {
        const prevMsgs = prev[msg.chatId] || []
        if (prevMsgs.some((m: any) => m._id === msg._id)) {
          console.log("Duplicate message detected, skipping")
          return prev
        }

        return {
          ...prev,
          [msg.chatId]: [...prevMsgs, msg],
        }
      })

      setConversations((prev) => {
        const convIndex = prev.findIndex((c) => c._id === msg.chatId)
        if (convIndex === -1) return prev

        const updatedConv = { ...prev[convIndex], updatedAt: new Date().toISOString() }
        return [updatedConv, ...prev.filter((c) => c._id !== msg.chatId)]
      })

      if (selectedChat && msg.chatId === selectedChat._id) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev
          return [...prev, msg]
        })
      }

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
      console.log("User online event received:", onlineUserId)
      setOnlineUsers((prev) => new Set(prev).add(onlineUserId))
    }

    const handleUserOffline = ({ userId: offlineUserId }: any) => {
      console.log("User offline event received:", offlineUserId)
      setOnlineUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(offlineUserId)
        return newSet
      })
    }

    const handleMessageRead = ({ messageId, userId: readerId, readAt }: any) => {
      console.log("Message read:", messageId, "by:", readerId)

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
  }, [socket, selectedChat, userId, setMessages, setAllConversationMessages, setConversations, setTypingUsers, setOnlineUsers, setUpdateTrigger])
}