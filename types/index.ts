export type Semester = {
  id: number
  period: string
  updated_at: string
  created_at: string
  year: number
  user_id: number
}

export type Subject = {
  id: string
  semester_id: number
  name: string
  code: string
  credits: number
  created_at: string
}

export type SubjectGrade = {
  id: string
  semester_id: number
  name: string
  code: string
  credits: number
  created_at: string
  currentGrade?: number
  neededScore?: number
  passed: boolean
  grades: Grade[]
}

export interface Grade {
  id: number
  subject_id: number
  name: string
  weight: number
  score: number
  max_score: number
  created_at: string
}

export interface SemesterGrades {
  semesterId: number
  subjects: SubjectGrade[]
}

export interface Glossary {
  id: number
  subject_id: number
  term: string
  definition: string
  source: string
  created_at: string
  topic?: string
  example?: string
}

export interface SubjectGlossary {
  id: number
  semester_id: number
  name: string
  code: string
  credits: number
  created_at: string
  glossary: Glossary[]
}

export interface UserGlossaries {
  userId: number
  totalSubjects: number
  totalGlossaryTerms: number
  subjects: SubjectGlossary[]
}

export interface Quiz {
  quiz: Quiz2
  questions: Question[]
}

export interface Quiz2 {
  id: number
  name: string
  class: string
  source: string
  subject: Subject
}

export interface Subject2 {
  id: number
  name: string
}

export interface Question {
  id: number
  quiz_id: number
  type: string
  question_text: string
  options: string[]
  correct_answer: string
  user_answer: any
  feedback_ai: any
}

export interface Quizzes {
  user_id: number
  total_quizzes: number
  quizzes: Quiz[]
}