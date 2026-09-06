import { prisma } from '@/lib/prisma'
import { BalanceTransactionType } from '@/lib/types/domain'

export async function getBalance(memberId: string): Promise<number> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { balance: true },
  })
  return member?.balance || 0
}

export async function addTokens(
  memberId: string,
  amount: number,
  type: BalanceTransactionType,
  description: string
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const member = await tx.member.findUnique({
      where: { id: memberId },
      select: { balance: true },
    })

    if (!member) {
      throw new Error('Member not found')
    }

    const balanceBefore = member.balance
    const balanceAfter = balanceBefore + amount

    await tx.member.update({
      where: { id: memberId },
      data: { balance: balanceAfter },
    })

    await tx.balanceTransaction.create({
      data: {
        memberId,
        amount,
        type,
        description,
        balanceBefore,
        balanceAfter,
      },
    })

    return balanceAfter
  })
}

export async function deductTokens(
  memberId: string,
  amount: number,
  type: BalanceTransactionType,
  description: string
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const member = await tx.member.findUnique({
      where: { id: memberId },
      select: { balance: true },
    })

    if (!member) {
      throw new Error('Member not found')
    }

    const balanceBefore = member.balance

    if (balanceBefore < amount) {
      throw new Error('Insufficient balance')
    }

    const balanceAfter = balanceBefore - amount

    await tx.member.update({
      where: { id: memberId },
      data: { balance: balanceAfter },
    })

    await tx.balanceTransaction.create({
      data: {
        memberId,
        amount: -amount,
        type,
        description,
        balanceBefore,
        balanceAfter,
      },
    })

    return balanceAfter
  })
}

export async function getBalanceHistory(memberId: string, limit: number = 50) {
  return prisma.balanceTransaction.findMany({
    where: { memberId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function hasInsufficientBalance(
  memberId: string,
  requiredAmount: number
): Promise<boolean> {
  const balance = await getBalance(memberId)
  return balance < requiredAmount
}
