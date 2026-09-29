/**
 * Datos Iniciales Oficiales del Laboratorio de Geotecnia
 * Universidad Nacional de Colombia • Sede Bogotá
 * Fuente: Seguimiento Semanal de Tareas y Compromisos de Laboratorio
 * Director: Prof. Julio Esteban Colmenares Montañez, Ph.D.
 * Coordinadores: Ing. Daniel Felipe Rodríguez Ramírez e Ing. Edwin Alexander Prieto Saavedra
 */

window.GeoData = {
  INITIAL_MEMBERS: [
    {
      id: 'MEM-001',
      initials: 'JECM',
      name: 'Prof. Julio Esteban Colmenares Montañez, Ph.D.',
      role: 'Director del Laboratorio de Geotecnia',
      email: 'jecolmenaresm@unal.edu.co',
      category: 'Docente / Director',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-002',
      initials: 'DFRR',
      name: 'Ing. Daniel Felipe Rodríguez Ramírez',
      role: 'Coordinador de Laboratorio e Investigación',
      email: 'dfrodriguezr@unal.edu.co',
      category: 'Investigador / Coordinador',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-003',
      initials: 'EAPS',
      name: 'Ing. Edwin Alexander Prieto Saavedra',
      role: 'Coordinador de Laboratorio y Operaciones',
      email: 'eaprietos@unal.edu.co',
      category: 'Investigador / Coordinador',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-005',
      initials: 'CLGT',
      name: 'CLGT',
      role: 'Investigador / Estudiante de Posgrado',
      email: 'clgt@unal.edu.co',
      category: 'Investigador / Posgrado',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-006',
      initials: 'AJNG',
      name: 'AJNG',
      role: 'Investigador / Estudiante de Posgrado',
      email: 'ajng@unal.edu.co',
      category: 'Investigador / Posgrado',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-007',
      initials: 'CEAMD',
      name: 'CEAMD',
      role: 'Investigador / Tesista en Suelos No Saturados',
      email: 'ceamd@unal.edu.co',
      category: 'Investigador / Tesista',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-008',
      initials: 'EABB',
      name: 'EABB',
      role: 'Auxiliar de Laboratorio de Ensayos Especiales',
      email: 'eabb@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-009',
      initials: 'GEAMD',
      name: 'GEAMD',
      role: 'Auxiliar de Laboratorio de Mecánica de Suelos',
      email: 'geamd@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-010',
      initials: 'JANG',
      name: 'JANG',
      role: 'Auxiliar de Laboratorio y Mantenimiento de Equipos',
      email: 'jang@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-011',
      initials: 'ACSL',
      name: 'ACSL',
      role: 'Investigador / Auxiliar de Laboratorio',
      email: 'acsl@unal.edu.co',
      category: 'Investigador / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-012',
      initials: 'MKMM',
      name: 'MKMM',
      role: 'Investigador / Auxiliar de Laboratorio',
      email: 'mkmm@unal.edu.co',
      category: 'Investigador / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-013',
      initials: 'KDRP',
      name: 'KDRP',
      role: 'Investigador / Estudiante de Posgrado',
      email: 'kdrp@unal.edu.co',
      category: 'Investigador / Posgrado',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-014',
      initials: 'JDGP',
      name: 'JDGP',
      role: 'Auxiliar de Laboratorio',
      email: 'jdgp@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-015',
      initials: 'SPMG',
      name: 'SPMG',
      role: 'Auxiliar de Laboratorio',
      email: 'spmg@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-016',
      initials: 'JEMP',
      name: 'JEMP',
      role: 'Investigador / Estudiante de Posgrado',
      email: 'jemp@unal.edu.co',
      category: 'Investigador / Posgrado',
      active: true,
      avatar: null
    }
  ],

  INITIAL_PROJECTS: [
    {
      id: 'PRJ-INV-2026-01',
      code: 'INV-01',
      name: 'Investigación – Triaxial de Gran Escala en Enrocados',
      type: 'Investigación',
      client: 'Universidad Nacional de Colombia • Facultad de Ingeniería',
      directorId: 'MEM-001',
      startDate: '2026-08-31',
      deadline: '2026-10-31',
      status: 'En Ejecución',
      description: 'Definición del programa experimental de ensayos triaxiales a gran escala, especificaciones de material rocoso y cotización para caracterización geomecánica.',
      driveFolderId: '1A2B_TriaxialEnrocados',
      driveFolderName: 'INV-01_Triaxial_Enrocados',
      activities: [
        {
          id: 'ACT-INV01-01',
          name: 'Montar otro ensayo con la grava sílice',
          weight: 20,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-005'], // CLGT
          deadline: '2026-09-18',
          deliverables: 'Montaje de ensayo triaxial de enrocados con grava sílice'
        },
        {
          id: 'ACT-INV01-02',
          name: 'Actualizar el plan de ensayos',
          weight: 20,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-005', 'MEM-006', 'MEM-013'], // CLGT, AJNG, KDRP
          deadline: '2026-09-18',
          deliverables: 'Documento técnico con plan de ensayos actualizado y cronograma'
        },
        {
          id: 'ACT-INV01-03',
          name: 'Realizar presentación',
          weight: 20,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-011', 'MEM-012'], // ACSL, MKMM
          deadline: '2026-09-22',
          deliverables: 'Presentación de diapositivas con avances del proyecto de enrocados'
        },
        {
          id: 'ACT-INV01-04',
          name: 'Proponer materiales, cotizar (indicar especificaciones del material)',
          weight: 20,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-006'], // AJNG
          deadline: '2026-09-25',
          deliverables: 'Fichas técnicas y cotizaciones de materiales rocosos'
        },
        {
          id: 'ACT-INV01-05',
          name: 'Empezar los ensayos de caracterización',
          weight: 20,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-006'], // AJNG
          deadline: '2026-09-29',
          deliverables: 'Protocolos y primeros registros de caracterización de materiales'
        }
      ]
    },
    {
      id: 'PRJ-INV-2026-02',
      code: 'INV-02',
      name: 'Investigación – Efecto de la Temperatura en Suelos',
      type: 'Investigación',
      client: 'Universidad Nacional de Colombia / MinCiencias',
      directorId: 'MEM-001',
      startDate: '2026-08-31',
      deadline: '2026-11-30',
      status: 'En Ejecución',
      description: 'Línea de investigación termo-hidro-mecánica: preparación de tortas de ensayo, consolidaciones, cotización de sensores y ensayos triaxiales térmicos.',
      driveFolderId: '2B3C_EfectoTemperatura',
      driveFolderName: 'INV-02_Temperatura_Suelos',
      activities: [
        {
          id: 'ACT-INV02-01',
          name: 'Completar y desmontar la reconstitución',
          weight: 25,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-008', 'MEM-006'], // EABB, AJNG
          deadline: '2026-09-18',
          deliverables: 'Reconstitución completada, desmonte y verificación de probetas'
        },
        {
          id: 'ACT-INV02-02',
          name: 'Montar las consolidaciones: unidimensional y C.R.S.',
          weight: 25,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-003'], // EAPS
          deadline: '2026-09-22',
          deliverables: 'Montaje de ensayos de consolidación unidimensional y Constant Rate of Strain (CRS)'
        },
        {
          id: 'ACT-INV02-03',
          name: 'Cotizar las galgas e tensiométricas',
          weight: 20,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-003'], // EAPS
          deadline: '2026-09-25',
          deliverables: 'Cotizaciones comerciales de galgas extensométricas y sensores tensiométricos'
        },
        {
          id: 'ACT-INV02-04',
          name: 'Montar dos ensayos triaxiales UU, con temperatura y sin temperatura',
          weight: 30,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-008', 'MEM-002', 'MEM-014', 'MEM-015', 'MEM-016'], // EABB, DFRR, JDGP, SPMG, JEMP
          deadline: '2026-09-29',
          deliverables: 'Montaje y ejecución de 2 ensayos triaxiales UU (ambiente y con temperatura)'
        }
      ]
    },
    {
      id: 'PRJ-INV-2026-03',
      code: 'INV-03',
      name: 'Investigación – Desarrollo de Cámara de Succión',
      type: 'Investigación',
      client: 'Universidad Nacional de Colombia • Laboratorio de Geotecnia',
      directorId: 'MEM-001',
      startDate: '2026-08-31',
      deadline: '2026-12-15',
      status: 'En Ejecución',
      description: 'Diseno y desarrollo conjunto de cámara de succión para suelos no saturados, estado del arte bibliográfico y ponencias en eventos académicos.',
      driveFolderId: '3C4D_CamaraSuccion',
      driveFolderName: 'INV-03_Camara_Succion',
      activities: [
        {
          id: 'ACT-INV03-01',
          name: 'Congreso Nariño (preparación y ponencia)',
          weight: 50,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-011', 'MEM-012', 'MEM-002'], // ACSL, MKMM, DFRR
          deadline: '2026-09-25',
          deliverables: 'Documento técnico / ponencia y presentación para Congreso Nariño'
        },
        {
          id: 'ACT-INV03-02',
          name: 'Revisión estado de conocimiento',
          weight: 50,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-007'], // CEAMD
          deadline: '2026-09-29',
          deliverables: 'Estado del arte bibliográfico en succión matricial y suelos no saturados'
        }
      ]
    },
    {
      id: 'PRJ-EXT-2026-01',
      code: 'EXT-01',
      name: 'Extensión – Ensayos Geotécnicos de Anillo Vial y Parámetros',
      type: 'Extensión',
      client: 'Consorcio Vial / Infraestructura',
      directorId: 'MEM-001',
      startDate: '2026-08-31',
      deadline: '2026-10-15',
      status: 'En Ejecución',
      description: 'Servicios de extensión y consultoría: ensayos de laboratorio (Límites, CMO, VAM, granulometría), cálculos de correlaciones PANDA, GPR, Wn, compresores y CBR, y consolidación de parámetros.',
      driveFolderId: '4D5E_AnilloVial',
      driveFolderName: 'EXT-01_Anillo_Vial',
      activities: [
        {
          id: 'ACT-EXT01-01',
          name: 'Ensayos de anillo vial: Límites (8 c/u), CMO (8), VAM (8; 2 días) y granulometría (8 c/u)',
          weight: 55,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-008', 'MEM-009'], // EABB, GEAMD
          deadline: '2026-09-18',
          deliverables: 'Fichas de laboratorio con 8 límites, 8 CMO, 8 VAM y 8 granulometrías completas'
        },
        {
          id: 'ACT-EXT01-02',
          name: 'Cálculos: PANDA y GPR; Wn; compresores (1 del AP2); CBR',
          weight: 45,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-003', 'MEM-002'], // EAPS, DFRR
          deadline: '2026-09-22',
          deliverables: 'Memorias de cálculo validadas de PANDA, GPR, humedad natural y CBR'
        }
      ]
    },
    {
      id: 'PRJ-LAB-2026-01',
      code: 'LAB-01',
      name: 'Coordinación, Operación y Mantenimiento del Laboratorio',
      type: 'Extensión',
      client: 'Universidad Nacional de Colombia • Departamento de Ingeniería Civil y Agrícola',
      directorId: 'MEM-001',
      startDate: '2026-08-31',
      deadline: '2026-12-31',
      status: 'En Ejecución',
      description: 'Gestión administrativa y técnica del laboratorio: laboratorio virtual, aseo y orden, seguimiento de compromisos, portal web y horarios.',
      driveFolderId: '5E6F_CoordinacionLab',
      driveFolderName: 'LAB-01_Coordinacion_Laboratorio',
      activities: [
        {
          id: 'ACT-LAB01-01',
          name: 'Laboratorio virtual',
          weight: 20,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-016'], // JEMP
          deadline: '2026-09-22',
          deliverables: 'Plataforma y modelos para el laboratorio virtual'
        },
        {
          id: 'ACT-LAB01-02',
          name: 'Aseo y orden del laboratorio',
          weight: 15,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-008'], // EABB
          deadline: '2026-09-18',
          deliverables: 'Jornada de orden y aseo 5S en áreas de trabajo del laboratorio'
        },
        {
          id: 'ACT-LAB01-03',
          name: 'Página Web',
          weight: 20,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-011'], // ACSL
          deadline: '2026-09-25',
          deliverables: 'Actualización de contenidos y recursos de la página web del laboratorio'
        },
        {
          id: 'ACT-LAB01-04',
          name: 'Seguimiento semanal de actividades - Completar X3',
          weight: 20,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-005'], // CLGT
          deadline: '2026-09-18',
          deliverables: 'Matriz de seguimiento semanal de compromisos y tareas consolidada'
        },
        {
          id: 'ACT-LAB01-05',
          name: 'Informe del semillero',
          weight: 15,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-002'], // DFRR
          deadline: '2026-09-25',
          deliverables: 'Informe consolidado de avances y actividades del semillero de investigación'
        },
        {
          id: 'ACT-LAB01-06',
          name: 'Presentar horario',
          weight: 10,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-002'], // DFRR
          deadline: '2026-09-18',
          deliverables: 'Horario consolidado de turnos y disponibilidad de auxiliares'
        }
      ]
    }
  ],

  INITIAL_LOGS: [
    {
      id: 'LOG-2026-001',
      projectId: 'PRJ-LAB-2026-01',
      activityId: 'ACT-LAB01-04',
      memberId: 'MEM-005',
      memberName: 'CLGT',
      date: '2026-09-04',
      hoursWorked: 4.0,
      progressReported: 0,
      notes: 'Consolidación de las tareas del tablero físico del laboratorio registradas para la semana del 31 de agosto al 4 de septiembre. Preparación de la matriz en Excel para seguimiento de la semana 7 a 11 de septiembre.',
      attachments: [
        {
          name: 'Seguimiento_tareas_laboratorio_7-11_sep_2026_actualizado.xlsx',
          size: '7.5 KB',
          type: 'excel',
          url: './Seguimiento_tareas_laboratorio_7-11_sep_2026_actualizado.xlsx',
          drivePath: 'Laboratorio_Geotecnia/2026/Coordinacion/LAB-01/Seguimiento_tareas_laboratorio_7-11_sep_2026_actualizado.xlsx'
        }
      ],
      status: 'Aprobado',
      reviewedBy: 'MEM-001',
      reviewDate: '2026-09-07',
      reviewComments: 'Información registrada y verificada con el tablero del laboratorio.'
    }
  ],

  DRIVE_CONFIG: {
    connected: true,
    accountEmail: 'labgeotec_fibog@unal.edu.co',
    rootFolderId: '1Z9Y8X7W6V5U4T3S2R1Q',
    rootFolderName: 'Laboratorio_Geotecnia_Drive',
    autoOrganizeByYear: true,
    autoOrganizeByProjectType: true,
    gasWebhookUrl: 'https://script.google.com/macros/s/AKfycbw0pTX2LaKQSv0UEdowMOsIliPszmSMU430kKuRNwFHmm6QXY61aGJwaN6LDY1k6sJV9w/exec'
  }
};
