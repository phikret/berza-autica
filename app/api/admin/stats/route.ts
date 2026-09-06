import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [
      totalMembers,
      activeMembers,
      totalProducts,
      activeProducts,
      promotedProducts,
      totalCategories,
      totalRatings,
      totalSubscriptions,
      totalMessages,
      totalConversations,
      totalBalanceTransactions,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { isActive: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isPromoted: true } }),
      prisma.category.count(),
      prisma.rating.count(),
      prisma.subscription.count(),
      prisma.message.count(),
      prisma.conversation.count(),
      prisma.balanceTransaction.count(),
    ])

    // Calculate total tokens in circulation
    const members = await prisma.member.findMany({
      select: { balance: true },
    })
    const totalTokens = members.reduce((sum: number, m: { balance: number }) => sum + m.balance, 0)

    // Get recent activity
    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { name: true },
        },
        category: true,
      },
    })

    const recentMembers = await prisma.member.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      stats: {
        members: {
          total: totalMembers,
          active: activeMembers,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          promoted: promotedProducts,
        },
        categories: totalCategories,
        ratings: totalRatings,
        subscriptions: totalSubscriptions,
        messages: totalMessages,
        conversations: totalConversations,
        tokens: {
          total: totalTokens,
          transactions: totalBalanceTransactions,
        },
      },
      recentActivity: {
        products: recentProducts,
        members: recentMembers,
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

