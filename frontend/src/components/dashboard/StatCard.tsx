import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  description: string
  icon: LucideIcon
  tone: 'cyan' | 'red' | 'blue' | 'amber'
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>

        <div className="stat-card-icon">
          <Icon size={17} />
        </div>
      </div>

      <div className="stat-card-value">{value}</div>

      <div className="stat-card-description">
        {description}
      </div>
    </div>
  )
}

export default StatCard