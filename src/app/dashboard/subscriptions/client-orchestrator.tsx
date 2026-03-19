'use client'

import React, { useState } from 'react'
import { SubscriptionsFilterBar } from '@/components/dashboard/SubscriptionsFilterBar'
import { SubscriptionsTable } from '@/components/dashboard/SubscriptionsTable'
import { SubscriptionFormModal } from '@/components/dashboard/SubscriptionFormModal'
import type { SubscriptionRow, SubscriptionsFilter } from '@/app/dashboard/subscriptions/data'

interface CategoryItem {
  id: string
  name: string
}

interface SubscriptionsClientOrchestratorProps {
  subscriptions: SubscriptionRow[]
  totalCount: number
  page: number
  pageSize: number
  filter: SubscriptionsFilter
  categories: CategoryItem[]
}

export function SubscriptionsClientOrchestrator({
  subscriptions,
  totalCount,
  page,
  pageSize,
  filter,
  categories
}: SubscriptionsClientOrchestratorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState<SubscriptionRow | null>(null)

  const handleAddClick = () => {
    setEditingSub(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (sub: SubscriptionRow) => {
    setEditingSub(sub)
    setIsModalOpen(true)
  }

  return (
    <>
      <SubscriptionsFilterBar 
        initialStatus={filter.status} 
        initialSearch={filter.searchQuery || ''}
        onAddSubClick={handleAddClick} 
      />

      <div className="bg-[var(--bg-base)] border border-[var(--border-light)] rounded-2xl overflow-hidden shadow-sm">
        <SubscriptionsTable 
          subscriptions={subscriptions}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          onEdit={handleEditClick}
        />
      </div>

      <SubscriptionFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingSub}
        categories={categories}
      />
    </>
  )
}
