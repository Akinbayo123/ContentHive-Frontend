import { useEffect, useState } from "react"
import axios from "axios"
import { API_BASE_URL } from "@/lib/api"

export function useChatMessages(
  selectedChat: any,
  token: string | null
) {
  const [messages, setMessages] = useState<any[]>([])

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

  return { messages, setMessages }
}