export type BalanceTransactionType =
  | 'topup'
  | 'listing_fee'
  | 'promotion_fee'
  | 'monthly_billing'
  | 'refund'

export type NotificationType =
  | 'new_product'
  | 'new_message'
  | 'rating_received'
  | 'billing_reminder'

export type DealStatus = 'initiated' | 'completed' | 'cancelled'
