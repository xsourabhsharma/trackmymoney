import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { Progress } from "@/components/ui/progress"

export async function GoalsProgressWidget() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const supabaseAdmin = createAdminClient()

  const { data: goals } = await supabaseAdmin
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('target_amount', { ascending: false })
    .limit(3)

  if (!goals || goals.length === 0) return null

  return (
    <div className="panel shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
      <div className="panel-header bg-[#ccff00]">
        <h3 className="panel-title">Goals</h3>
      </div>
      <div className="p-4 space-y-5">
        {goals.map((goal) => {
          const target = parseFloat(goal.target_amount)
          const current = parseFloat(goal.current_amount)
          const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
          
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{goal.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[80px]">{goal.name}</span>
                </div>
                <span className="text-[10px] font-black">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-1.5 bg-gray-100" indicatorColor="bg-[#141414]" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
