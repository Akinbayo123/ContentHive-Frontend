import { useEffect } from "react"
import axios from "axios"
import { Socket } from "socket.io-client"
import { API_BASE_URL } from "@/lib/api"

export function useMarkAsRead(
  selectedChat: any,
  messages: any[],
  token: string | null,
  userId: string | null,
  socket: Socket | null,
  setAllConversationMessages: React.Dispatch<React.SetStateAction<Record<string, any[]>>>,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  setUpdateTrigger: React.Dispatch<React.SetStateAction<number>>
) {
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

      // Optimistic update
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
  }, [messages.length, selectedChat?._id, userId, token, socket, setAllConversationMessages, setMessages, setUpdateTrigger])
}