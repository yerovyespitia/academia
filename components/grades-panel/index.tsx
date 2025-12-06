import { SemesterGrades, SubjectGrade } from '@/types'
import {
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react'

import { Badge } from '../ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card'
import { Progress } from '../ui/progress'

type Status = 'excellent' | 'good' | 'warning'

const statusConfig: Record<
  Status,
  {
    badgeClass: string
    requiredGradeClass: string
    icon: LucideIcon
    iconClass: string
    message: string
  }
> = {
  excellent: {
    badgeClass: 'bg-green-500/20 text-green-500 border-green-500/30',
    requiredGradeClass: 'text-green-500',
    icon: TrendingUp,
    iconClass: 'text-green-500',
    message: 'Excelente desempeño',
  },
  good: {
    badgeClass: 'bg-accent text-accent-foreground border-accent-foreground/30',
    requiredGradeClass: 'text-accent-foreground',
    icon: CheckCircle2,
    iconClass: 'text-green-500',
    message: 'En buen camino',
  },
  warning: {
    badgeClass: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    requiredGradeClass: 'text-yellow-500',
    icon: AlertCircle,
    iconClass: 'text-yellow-500',
    message: 'Requiere atención',
  },
}

function computeMetricsForSubject(subject: SubjectGrade) {
  const completedGrades = subject.grades.filter(
    (g) => g.max_score > 0 && g.score !== null && g.score !== undefined,
  )
  const completedWeight = completedGrades.reduce(
    (acc, g) => acc + (g.weight || 0),
    0,
  )
  const completedWeightedSum = completedGrades.reduce((acc, g) => {
    const weightFraction = (g.weight || 0) / 100
    const performanceFraction = Math.max(0, Math.min(1, g.score / g.max_score))
    return acc + weightFraction * performanceFraction
  }, 0)

  const progress = Math.round(Math.max(0, Math.min(100, completedWeight)))

  // Grade carried so far over total (0..5), treating remaining as 0
  const currentGrade = Number((5 * completedWeightedSum).toFixed(1))

  // Remaining fraction is based on full 100% minus what is already completed
  const remainingFraction = Math.max(0, (100 - completedWeight) / 100)
  const passThreshold = 3
  let neededScore: number
  if (remainingFraction > 0) {
    const completedContribution = 5 * completedWeightedSum
    const xNeeded =
      (passThreshold - completedContribution) / (5 * remainingFraction)
    neededScore = Number((xNeeded * 5).toFixed(1))
  } else {
    const completedContribution = 5 * completedWeightedSum
    // If there is no remaining fraction, either already passed (need 0) or impossible
    neededScore = completedContribution >= passThreshold ? 0 : Infinity
  }

  const status: Status =
    currentGrade < 3 ? 'warning' : currentGrade < 4 ? 'good' : 'excellent'

  return { currentGrade, progress, neededScore, status }
}

async function getSemesterGrades(): Promise<SemesterGrades | null> {
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/grades/semester/1`,
  )
  if (data.ok) {
    const semesterGrades = (await data.json()) as SemesterGrades
    return semesterGrades
  }
  return null
}

export default async function GradesPanel() {
  const semesterGrades = await getSemesterGrades()

  return (
    <div>
      <header className='flex justify-between items-center mb-4'>
        <div>
          <h2 className='text-xl font-bold'>Panel de notas</h2>
          <p className='text-muted-foreground'>
            Sigue dinamicamente el progreso académico
          </p>
        </div>
      </header>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {(semesterGrades?.subjects ?? []).map((subject) => {
          const { currentGrade, progress, status } =
            computeMetricsForSubject(subject)
          const config = statusConfig[status]
          const StatusIcon = config.icon

          return (
            <Card
              key={subject.id}
              className='bg-card border-border hover:border-primary/50 transition-colors'
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-lg'>{subject.name}</CardTitle>
                    <CardDescription>{subject.code}</CardDescription>
                  </div>
                  <Badge className={config.badgeClass}>
                    {currentGrade.toFixed(1)}/5.0
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div>
                    <div className='flex justify-between text-sm mb-1'>
                      <span className='text-muted-foreground'>Progreso</span>
                      <span className='text-foreground font-medium'>
                        {progress}%
                      </span>
                    </div>
                    <Progress value={progress} className='h-2' />
                  </div>
                  <div className='flex items-center gap-2 text-xs'>
                    <StatusIcon className={`w-4 h-4 ${config.iconClass}`} />
                    <span className='text-muted-foreground'>
                      {config.message}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
