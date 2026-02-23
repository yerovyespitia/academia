import type {
  Semester,
  SemesterGrades,
  UserGlossaries,
  Quizzes,
} from '@/types'

export const semesters: Semester[] = [
  {
    id: 1,
    period: '2026-1',
    year: 2026,
    user_id: 1,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
]

export const semesterGrades: SemesterGrades = {
  semesterId: 1,
  subjects: [
    {
      id: '1',
      semester_id: 1,
      name: 'Cálculo Diferencial',
      code: 'MAT-101',
      credits: 4,
      created_at: '2026-01-15T00:00:00Z',
      passed: false,
      grades: [
        {
          id: 1,
          subject_id: 1,
          name: 'Parcial 1',
          weight: 30,
          score: 4.2,
          max_score: 5,
          created_at: '2026-02-10T00:00:00Z',
        },
        {
          id: 2,
          subject_id: 1,
          name: 'Parcial 2',
          weight: 30,
          score: 3.8,
          max_score: 5,
          created_at: '2026-03-15T00:00:00Z',
        },
      ],
    },
    {
      id: '2',
      semester_id: 1,
      name: 'Programación Orientada a Objetos',
      code: 'INF-201',
      credits: 3,
      created_at: '2026-01-15T00:00:00Z',
      passed: false,
      grades: [
        {
          id: 3,
          subject_id: 2,
          name: 'Proyecto 1',
          weight: 25,
          score: 4.5,
          max_score: 5,
          created_at: '2026-02-20T00:00:00Z',
        },
        {
          id: 4,
          subject_id: 2,
          name: 'Parcial 1',
          weight: 25,
          score: 4.0,
          max_score: 5,
          created_at: '2026-03-01T00:00:00Z',
        },
      ],
    },
    {
      id: '3',
      semester_id: 1,
      name: 'Bases de Datos',
      code: 'INF-301',
      credits: 3,
      created_at: '2026-01-15T00:00:00Z',
      passed: false,
      grades: [
        {
          id: 5,
          subject_id: 3,
          name: 'Quiz 1',
          weight: 20,
          score: 3.5,
          max_score: 5,
          created_at: '2026-02-05T00:00:00Z',
        },
        {
          id: 6,
          subject_id: 3,
          name: 'Parcial 1',
          weight: 30,
          score: 2.8,
          max_score: 5,
          created_at: '2026-03-10T00:00:00Z',
        },
      ],
    },
  ],
}

export const userGlossaries: UserGlossaries = {
  userId: 1,
  totalSubjects: 2,
  totalGlossaryTerms: 4,
  subjects: [
    {
      id: 1,
      semester_id: 1,
      name: 'Cálculo Diferencial',
      code: 'MAT-101',
      credits: 4,
      created_at: '2026-01-15T00:00:00Z',
      glossary: [
        {
          id: 1,
          subject_id: 1,
          term: 'Derivada',
          definition:
            'Medida de la tasa de cambio instantánea de una función respecto a su variable independiente.',
          source: 'Stewart, Cálculo',
          created_at: '2026-02-01T00:00:00Z',
          topic: 'Derivadas',
          example: 'f(x) = x² → f\'(x) = 2x',
        },
        {
          id: 2,
          subject_id: 1,
          term: 'Límite',
          definition:
            'Valor al que se aproxima una función cuando la variable independiente se acerca a un punto determinado.',
          source: 'Stewart, Cálculo',
          created_at: '2026-02-01T00:00:00Z',
          topic: 'Límites',
        },
      ],
    },
    {
      id: 2,
      semester_id: 1,
      name: 'Bases de Datos',
      code: 'INF-301',
      credits: 3,
      created_at: '2026-01-15T00:00:00Z',
      glossary: [
        {
          id: 3,
          subject_id: 3,
          term: 'Normalización',
          definition:
            'Proceso de organizar datos en una base de datos para reducir la redundancia y mejorar la integridad.',
          source: 'Silberschatz, Fund. de BD',
          created_at: '2026-02-10T00:00:00Z',
          topic: 'Diseño',
        },
        {
          id: 4,
          subject_id: 3,
          term: 'Clave primaria',
          definition:
            'Atributo o conjunto de atributos que identifica de forma única cada fila de una tabla.',
          source: 'Silberschatz, Fund. de BD',
          created_at: '2026-02-10T00:00:00Z',
          topic: 'Diseño',
        },
      ],
    },
  ],
}

export const userQuizzes: Quizzes = {
  user_id: 1,
  total_quizzes: 0,
  quizzes: [],
}
