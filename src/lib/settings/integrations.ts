export type IntegrationType = 'csv_import' | 'bank' | 'card' | 'upi'
export type IntegrationStatus = 'available' | 'unsupported'

export interface Integration {
  id: string
  type: IntegrationType
  provider: string
  status: IntegrationStatus
  title: string
  description: string
  actionLabel: string
  href?: string
  metadata: Record<string, unknown>
}

export const SETTINGS_INTEGRATIONS = [
  {
    id: 'csv_import',
    type: 'csv_import',
    provider: 'TrackMyMoney import tools',
    status: 'available',
    title: 'CSV and receipt imports',
    description: 'Open the existing import workspace. This is not a live account connection.',
    actionLabel: 'Open import',
    href: '/dashboard/auto-parse',
    metadata: { connectionRequired: false },
  },
  {
    id: 'bank_sync',
    type: 'bank',
    provider: 'Not configured',
    status: 'unsupported',
    title: 'Bank sync',
    description: 'Live bank connectors are not implemented in this app yet.',
    actionLabel: 'Unavailable',
    metadata: { connectionRequired: true },
  },
  {
    id: 'card_sync',
    type: 'card',
    provider: 'Not configured',
    status: 'unsupported',
    title: 'Card sync',
    description: 'Credit card connectors are not implemented in this app yet.',
    actionLabel: 'Unavailable',
    metadata: { connectionRequired: true },
  },
  {
    id: 'upi_sync',
    type: 'upi',
    provider: 'Not configured',
    status: 'unsupported',
    title: 'UPI sync',
    description: 'UPI connectors are not implemented in this app yet.',
    actionLabel: 'Unavailable',
    metadata: { connectionRequired: true },
  },
] as const satisfies readonly Integration[]

export function getSettingsIntegrations(): Integration[] {
  return SETTINGS_INTEGRATIONS.map((integration) => ({ ...integration }))
}
