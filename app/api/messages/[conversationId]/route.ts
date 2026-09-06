import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { conversationId } = await params
    const memberId = (session.user as any).id

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Konverzacija nije pronađena' },
        { status: 404 }
      )
    }

    const participants = [conversation.participantAId, conversation.participantBId]
    if (!participants.includes(memberId)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })

    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: memberId,
        isRead: false,
      },
      data: { isRead: true },
    })

    const otherParticipantId = participants.find((id) => id !== memberId)

    const otherParticipant = await prisma.member.findUnique({
      where: { id: otherParticipantId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json({
      conversation: {
        ...conversation,
        _id: conversation.id,
        participants,
      },
      messages: messages.map((msg: typeof messages[0]) => ({ ...msg, _id: msg.id })),
      otherParticipant,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
