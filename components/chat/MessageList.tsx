"use client"

import { MessageItem } from "./MessageItem"

interface MessagesListProps {
    messages: any[]
    userId: string | null
}

export function MessagesList({ messages, userId }: MessagesListProps) {
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

    const sorted = [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
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

        const isMine = msg.sender._id === userId
        nodes.push(<MessageItem key={msg._id} message={msg} isMine={isMine} userId={userId} />)
    })

    return <>{nodes}</>
}