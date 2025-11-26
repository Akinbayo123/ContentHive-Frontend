"use client"

import { useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatHeader } from "./ChatHeader"
import { MessagesList } from "./MessageList"

interface ChatWindowProps {
    selectedChat: any
    messages: any[]
    messageInput: string
    onMessageInputChange: (text: string) => void
    onSendMessage: () => void
    onBack: () => void
    otherUser: any
    isOnline: boolean
    isTyping: boolean
    userId: string | null
}

export function ChatWindow({
    selectedChat,
    messages,
    messageInput,
    onMessageInputChange,
    onSendMessage,
    onBack,
    otherUser,
    isOnline,
    isTyping,
    userId
}: ChatWindowProps) {
    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <Card className={cn(
            "border border-border flex flex-col lg:col-span-2 h-[600px]",
            !selectedChat && "hidden lg:flex"
        )}>
            {selectedChat ? (
                <>
                    <ChatHeader
                        selectedChat={selectedChat}
                        otherUser={otherUser}
                        isOnline={isOnline}
                        isTyping={isTyping}
                        onBack={onBack}
                    />

                    <div className="flex-1 min-h-0">
                        <ScrollArea className="h-full">
                            <div className="space-y-4 p-4">
                                <MessagesList messages={messages} userId={userId} />
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="p-4 border-t border-border shrink-0">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => onMessageInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
                            />
                            <Button size="icon" onClick={onSendMessage}>
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
    )
}