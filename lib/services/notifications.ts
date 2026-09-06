import { prisma } from '@/lib/prisma'
import { NotificationType } from '@/lib/types/domain'

export async function sendNotification(
  memberId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: unknown
) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      emailNotifications: true,
      smsNotifications: true,
      viberNotifications: true,
      whatsappNotifications: true,
    },
  })

  if (!member) {
    throw new Error('Member not found')
  }

  if (data) {
    return prisma.notification.create({
      data: {
        memberId,
        type,
        title,
        message,
        data: data as any,
        channels: {
          email: member.emailNotifications,
          sms: member.smsNotifications,
          viber: member.viberNotifications,
          whatsapp: member.whatsappNotifications,
        },
        isRead: false,
      },
    })
  }

  return prisma.notification.create({
    data: {
      memberId,
      type,
      title,
      message,
      channels: {
        email: member.emailNotifications,
        sms: member.smsNotifications,
        viber: member.viberNotifications,
        whatsapp: member.whatsappNotifications,
      },
      isRead: false,
    },
  })
}

export async function notifySubscribers(sellerId: string, productId: string, productName: string) {
  const subscriptions = await prisma.subscription.findMany({
    where: { sellerId },
    include: {
      subscriber: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return Promise.all(
    subscriptions.map((sub) =>
      sendNotification(
        sub.subscriberId,
        'new_product',
        'Novi proizvod',
        `${productName} je upravo objavljen`,
        { productId, sellerId }
      )
    )
  )
}

export async function getUnreadNotifications(memberId: string) {
  return prisma.notification.findMany({
    where: { memberId, isRead: false },
    orderBy: { createdAt: 'desc' },
  })
}

export async function markNotificationAsRead(notificationId: string) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })
}
