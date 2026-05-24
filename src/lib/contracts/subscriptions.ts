import { z } from 'zod'

export const SUBSCRIPTION_INTERVALS = ['weekly', 'monthly', 'yearly', 'custom'] as const
export const SUBSCRIPTION_STATUSES = ['active', 'paused', 'cancelled'] as const

export type SubscriptionInterval = (typeof SUBSCRIPTION_INTERVALS)[number]
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const DEFAULT_SUBSCRIPTION_INTERVAL: SubscriptionInterval = 'monthly'
export const subscriptionIntervalSchema = z.enum(SUBSCRIPTION_INTERVALS)
export const subscriptionStatusSchema = z.enum(SUBSCRIPTION_STATUSES)
