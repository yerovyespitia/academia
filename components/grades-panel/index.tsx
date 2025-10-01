import {
  CheckCircle2,
  Radical,
  TrendingUp,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card'

type Subject = {
  id: string
  name: string
  code: string
  grade: number
  progress: number
  requiredGrade: number
  status: 'excellent' | 'good' | 'warning'
}

const subjects: Subject[] = [
  {
    id: '1',
    name: 'Cálculo Diferencial',
    code: 'MAT-101',
    grade: 4.2,
    progress: 84,
    requiredGrade: 3.5,
    status: 'good',
  },
  {
    id: '2',
    name: 'Física Mecánica',
    code: 'FIS-201',
    grade: 3.8,
    progress: 76,
    requiredGrade: 4.2,
    status: 'warning',
  },
  {
    id: '3',
    name: 'Programación I',
    code: 'CS-101',
    grade: 4.7,
    progress: 94,
    requiredGrade: 2.8,
    status: 'excellent',
  },
]

const statusConfig: Record<
  Subject['status'],
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
    requiredGradeClass: 'text-accent',
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

export default function GradesPanel() {
  return (
    <div>
      <header className='flex justify-between items-center mb-4'>
        <div>
          <h2 className='text-xl font-bold'>Panel de notas</h2>
          <p className='text-muted-foreground'>
            Sigue dinamicamente el progreso académico
          </p>
        </div>
        <Button
          variant='brand'
          size='brand'
        >
          <Radical className='w-4 h-4' />
          Calcular notas
        </Button>
      </header>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {subjects.map((subject) => {
          const config = statusConfig[subject.status]
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
                    {subject.grade.toFixed(1)}/5.0
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div>
                    <div className='flex justify-between text-sm mb-1'>
                      <span className='text-muted-foreground'>Progreso</span>
                      <span className='text-foreground font-medium'>
                        {subject.progress}%
                      </span>
                    </div>
                    <Progress
                      value={subject.progress}
                      className='h-2'
                    />
                  </div>
                  <div className='bg-secondary/50 rounded-lg p-3 border border-border'>
                    <p className='text-xs text-muted-foreground mb-1'>
                      Nota necesaria para aprobar:
                    </p>
                    <p
                      className={`text-2xl font-bold ${config.requiredGradeClass}`}
                    >
                      {subject.requiredGrade.toFixed(1)}
                    </p>
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
