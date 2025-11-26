import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { API_BASE_URL } from "@/lib/api"

export function useSocket(token: string | null, userId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null)

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

  return socket
}