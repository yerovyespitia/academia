export const DEFAULT_CLASS_SEEDS = [
  {
    code: 'MAT-01',
    name: 'Matemáticas',
    description: 'Números, operaciones, álgebra y resolución de problemas.',
    topics: ['Aritmética', 'Álgebra', 'Geometría', 'Estadística'],
    order: 0,
  },
  {
    code: 'ESP-01',
    name: 'Español',
    description: 'Lectura, escritura, ortografía y comprensión lectora.',
    topics: [
      'Comprensión lectora',
      'Gramática',
      'Ortografía',
      'Producción escrita',
    ],
    order: 1,
  },
  {
    code: 'ING-01',
    name: 'Inglés',
    description: 'Vocabulario, gramática y comunicación básica en inglés.',
    topics: ['Vocabulary', 'Grammar', 'Reading', 'Speaking'],
    order: 2,
  },
  {
    code: 'NAT-01',
    name: 'Ciencias Naturales',
    description: 'Explora seres vivos, materia, energía y medio ambiente.',
    topics: ['Biología', 'Química', 'Energía', 'Medio ambiente'],
    order: 3,
  },
  {
    code: 'SOC-01',
    name: 'Ciencias Sociales',
    description: 'Historia, geografía, ciudadanía y cultura.',
    topics: ['Historia', 'Geografía', 'Ciudadanía', 'Cultura'],
    order: 4,
  },
  {
    code: 'FIS-01',
    name: 'Física',
    description: 'Movimiento, fuerza, energía y fenómenos del mundo físico.',
    topics: ['Movimiento', 'Fuerza', 'Energía', 'Materia'],
    order: 5,
  },
] as const
