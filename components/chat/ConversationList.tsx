"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConversationListProps {
    conversations: any[]
    selectedChat: any
    searchQuery: string
    onSearchChange: (query: string) => void
    onSelectChat: (chat: any) => void
    getOtherParticipant: (chat: any) => any
    isUserOnline: (userId: string) => boolean
    getLastMessageText: (chatId: string) => string
    getUnreadCount: (chatId: string) => number
    userId: string | null
}

export function ConversationList({
    conversations,
    selectedChat,
    searchQuery,
    onSearchChange,
    onSelectChat,
    getOtherParticipant,
    isUserOnline,
    getLastMessageText,
    getUnreadCount,
    userId
}: ConversationListProps) {
    const filteredConversations = conversations.filter((conv) =>
        getOtherParticipant(conv).name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
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
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

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
                                    onClick={() => onSelectChat(conv)}
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
    )
}