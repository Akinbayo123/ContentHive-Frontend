"use client"

import { cn } from "@/lib/utils"

interface MessageItemProps {
    message: any
    isMine: boolean
    userId: string | null
}

export function MessageItem({ message, isMine, userId }: MessageItemProps) {
    const readReceipts = Array.isArray(message.readReceipts) ? message.readReceipts : []
    const otherReads = readReceipts
        .filter((r: any) => r.userId !== userId)
        .sort((a: any, b: any) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())
    const latestRead = otherReads[0]
    const isRead = latestRead || (Array.isArray(message.readBy) && message.readBy.some((id: any) => id !== userId))

    return (
        <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-xs px-4 py-2 rounded-lg",
                    isMine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}
            >
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString([], {
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