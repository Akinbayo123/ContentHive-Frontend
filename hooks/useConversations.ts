import { useEffect, useState } from "react"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api"

export function useConversations(token: string | null) {
  const [conversations, setConversations] = useState<any[]>([])
  const [allConversationMessages, setAllConversationMessages] = useState<Record<string, any[]>>({})

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

  // Load all messages for each conversation
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

  return {
    conversations,
    setConversations,
    allConversationMessages,
    setAllConversationMessages
  }
}