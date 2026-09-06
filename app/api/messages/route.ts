import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1, 'Poruka ne može biti prazna'),
  productIds: z.array(z.string()).optional(),
})

function pairParticipantIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a]
}

function serializeConversation(conversation: {
  id: string
  participantAId: string
  participantBId: string
  lastMessageAt: Date
  createdAt: Date
}) {
  return {
    ...conversation,
    _id: conversation.id,
    participants: [conversation.participantAId, conversation.participantBId],
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const memberId = (session.user as any).id

    const userConversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participantAId: memberId }, { participantBId: memberId }],
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

     const conversationsWithMessages = userConversations.map((conv: typeof userConversations[0]) => ({
      ...serializeConversation(conv),
      lastMessage: conv.messages[0]
        ? { ...conv.messages[0], _id: conv.messages[0].id }
        : null,
    }))

    return NextResponse.json({
      conversations: conversationsWithMessages,
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { receiverId, content, productIds } = sendMessageSchema.parse(body)

    const senderId = (session.user as any).id

    if (senderId === receiverId) {
      return NextResponse.json(
        { error: 'Ne možete poslati poruku sebi' },
        { status: 400 }
      )
    }

    const [participantAId, participantBId] = pairParticipantIds(senderId, receiverId)

    const conversation = await prisma.conversation.upsert({
      where: {
        participantAId_participantBId: {
          participantAId,
          participantBId,
        },
      },
      update: {
        lastMessageAt: new Date(),
      },
      create: {
        participantAId,
        participantBId,
        lastMessageAt: new Date(),
      },
    })

    let productLinks
    if (productIds && productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
      })

      productLinks = products.map((p: typeof products[0]) => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        image: p.images[0] || '',
      }))
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        content,
        productLinks: productLinks ?? undefined,
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: { ...message, _id: message.id },
      conversationId: conversation.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
