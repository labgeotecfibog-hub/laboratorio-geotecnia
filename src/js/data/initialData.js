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
      email: 'dafrodriguezram@unal.edu.co',
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
      name: 'Cesar Leonardo Gomez Torres',
      role: 'Investigador / Estudiante de Posgrado',
      email: 'clgt@unal.edu.co',
      category: 'Investigador / Posgrado',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-008',
      initials: 'EABB',
      name: 'Esteban Alexis Benitez Blanco',
      role: 'Auxiliar de Laboratorio de Ensayos Especiales',
      email: 'eabb@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-009',
      initials: 'GEAMD',
      name: 'Gabriel Enrique Antonio Moreno Diaz',
      role: 'Auxiliar de Laboratorio de Mecánica de Suelos',
      email: 'geamd@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-010',
      initials: 'JANG',
      name: 'Julian Andres Navas Garzon',
      role: 'Auxiliar de Laboratorio y Mantenimiento de Equipos',
      email: 'jang@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-011',
      initials: 'ACSL',
      name: 'Angie Carolina Salazar Lara',
      role: 'Auxiliar de Laboratorio y Gestión Web',
      email: 'acsl@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-012',
      initials: 'MKMM',
      name: 'Michael Kaleth Mora Mejia',
      role: 'Auxiliar de Laboratorio e Investigación',
      email: 'mkmm@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-013',
      initials: 'KDRP',
      name: 'Karen Dayana Rincon Presiga',
      role: 'Auxiliar de Laboratorio y Caracterización de Materiales',
      email: 'kdrp@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-014',
      initials: 'JDGP',
      name: 'Julian David Gonzales Pineda',
      role: 'Auxiliar de Laboratorio de Geotecnia',
      email: 'jdgp@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-015',
      initials: 'SPMG',
      name: 'Salma Paz Montenegro Gonzales',
      role: 'Auxiliar de Laboratorio de Geotecnia',
      email: 'spmg@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    },
    {
      id: 'MEM-016',
      initials: 'JEMP',
      name: 'Juan Esteban Millan Perilla',
      role: 'Auxiliar de Laboratorio y Modelado Virtual',
      email: 'jemp@unal.edu.co',
      category: 'Pregrado / Auxiliar',
      active: true,
      avatar: null
    }
  ],

  INITIAL_PROJECTS: [
    {
      id: 'PRJ-INV-2026-06',
      code: 'INV-06',
      name: 'Laboratorios Virtuales',
      type: 'Investigación',
      client: 'Laboratorio',
      directorId: 'MEM-001',
      startDate: '2026-10-23',
      deadline: '2026-12-31',
      status: 'En Ejecución',
      description: 'Desarrollo de practicas de laboratorio en realidad mixta',
      driveFolderId: '6F7G_LabVirtuales',
      driveFolderName: 'INV-06_Laboratorios_Virtuales',
      activities: [
        {
          id: 'ACT-NEW-1792791398634-1',
          name: 'Desarrollo de laboratorio de corte directo',
          weight: 15,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-014', 'MEM-016'],
          deadline: '2026-12-31',
          deliverables: 'Fichas de muestreo'
        },
        {
          id: 'ACT-NEW-1792791398634-2',
          name: 'Desarrollo de laboratorio de corte anular',
          weight: 15,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-014', 'MEM-016'],
          deadline: '2026-12-31',
          deliverables: 'Curvas y lecturas de ensayos'
        },
        {
          id: 'ACT-NEW-1792791398634-3',
          name: 'Desarrollo de laboratorio de bender element',
          weight: 15,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-014', 'MEM-016'],
          deadline: '2026-12-31',
          deliverables: 'Memorias de cálculo'
        },
        {
          id: 'ACT-NEW-1792791398634-4',
          name: 'Desarrollo de laboratorio de columna resonante',
          weight: 15,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-014', 'MEM-016'],
          deadline: '2026-12-31',
          deliverables: 'Informe final firmado'
        },
        {
          id: 'ACT-NEW-1792791398634-5',
          name: 'Desarrollo de laboratorio de hollow cilynder',
          weight: 25,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-014', 'MEM-016'],
          deadline: '2026-12-31',
          deliverables: 'Entregable'
        },
        {
          id: 'ACT-NEW-1792791398634-6',
          name: 'Desarrollo de laboratorio de triaxial dinamico',
          weight: 15,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-014', 'MEM-016'],
          deadline: '2026-12-31',
          deliverables: 'Entregable'
        }
      ]
    },
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
          weight: 5,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-005'],
          deadline: '2026-10-23',
          deliverables: 'Montaje de ensayo triaxial de enrocados con grava sílice'
        },
        {
          id: 'ACT-INV01-02',
          name: 'Actualizar el plan de ensayos',
          weight: 20,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-005', 'MEM-013'],
          deadline: '2026-09-18',
          deliverables: 'Documento técnico con plan de ensayos actualizado y cronograma'
        },
        {
          id: 'ACT-INV01-03',
          name: 'Realizar presentación',
          weight: 10,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-011', 'MEM-012'],
          deadline: '2026-09-22',
          deliverables: 'Presentación de diapositivas con avances del proyecto de enrocados'
        },
        {
          id: 'ACT-INV01-04',
          name: 'Proponer materiales, cotizar (indicar especificaciones del material)',
          weight: 10,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-002'],
          deadline: '2026-09-25',
          deliverables: 'Fichas técnicas y cotizaciones de materiales rocosos'
        },
        {
          id: 'ACT-INV01-05',
          name: 'Empezar los ensayos de caracterización',
          weight: 10,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-002'],
          deadline: '2026-09-29',
          deliverables: 'Protocolos y primeros registros de caracterización de materiales'
        },
        {
          id: 'ACT-INV-01-1792789100117-6',
          name: 'Procesar los datos de la grava silice y verificar con literatura',
          weight: 10,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-005'],
          deadline: '2026-10-23',
          deliverables: 'Hoja de calculo y literatura revisada'
        },
        {
          id: 'ACT-INV-01-1792789196396-7',
          name: 'Montar ensayo de grava triturada',
          weight: 10,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-005'],
          deadline: '2026-10-31',
          deliverables: 'Foto'
        },
        {
          id: 'ACT-INV-01-1792789269667-8',
          name: 'Terminar ensayos de caracterizacion fisica',
          weight: 5,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-005', 'MEM-013'],
          deadline: '2026-10-31',
          deliverables: ''
        },
        {
          id: 'ACT-INV-01-1792789306598-9',
          name: 'Presentar ponencia y presentacion',
          weight: 10,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-005'],
          deadline: '2026-10-31',
          deliverables: 'Certificado'
        },
        {
          id: 'ACT-INV-01-1792789525768-10',
          name: 'Comprar mas grava silice',
          weight: 5,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-005'],
          deadline: '2026-10-31',
          deliverables: 'Foto'
        },
        {
          id: 'ACT-INV-01-1792789661362-11',
          name: 'Fabricar membrana',
          weight: 5,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-005'],
          deadline: '2026-10-31',
          deliverables: 'Foto'
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
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-008', 'MEM-002'],
          deadline: '2026-09-18',
          deliverables: 'Reconstitución completada, desmonte y verificación de probetas'
        },
        {
          id: 'ACT-INV02-02',
          name: 'Montar las consolidaciones: unidimensional y C.R.S.',
          weight: 25,
          progress: 50,
          status: 'En Ejecución',
          assignedTo: ['MEM-003'],
          deadline: '2026-09-22',
          deliverables: 'Montaje de ensayos de consolidación unidimensional y Constant Rate of Strain (CRS)'
        },
        {
          id: 'ACT-INV02-03',
          name: 'Cotizar las galgas extensiométricas',
          weight: 5,
          progress: 50,
          status: 'En Ejecución',
          assignedTo: ['MEM-003'],
          deadline: '2026-09-25',
          deliverables: 'Cotizaciones comerciales de galgas extensométricas y sensores tensiométricos'
        },
        {
          id: 'ACT-INV02-04',
          name: 'Montar dos ensayos triaxiales UU, con temperatura y sin temperatura',
          weight: 5,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-008', 'MEM-002', 'MEM-014', 'MEM-015', 'MEM-016'],
          deadline: '2026-09-29',
          deliverables: 'Montaje y ejecución de 2 ensayos triaxiales UU (ambiente y con temperatura)'
        },
        {
          id: 'ACT-INV-02-1792789977281-5',
          name: 'Procesar resultados de ensayos',
          weight: 5,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-008', 'MEM-015'],
          deadline: '2026-11-30',
          deliverables: ''
        },
        {
          id: 'ACT-INV-02-1792790071176-6',
          name: 'Montar y desmontar la tercera muestra de reconstitucion',
          weight: 5,
          progress: 50,
          status: 'En Ejecución',
          assignedTo: ['MEM-010', 'MEM-002'],
          deadline: '2026-11-30',
          deliverables: ''
        },
        {
          id: 'ACT-INV-02-1792790143950-7',
          name: 'Compactar 13 muestras',
          weight: 5,
          progress: 50,
          status: 'En Ejecución',
          assignedTo: ['MEM-009', 'MEM-008', 'MEM-010', 'MEM-011'],
          deadline: '2026-11-30',
          deliverables: ''
        },
        {
          id: 'ACT-INV-02-1792790297089-8',
          name: 'Preparar el informe con los resultados',
          weight: 25,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-011', 'MEM-012'],
          deadline: '2026-11-02',
          deliverables: ''
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
          id: 'ACT-INV03-02',
          name: 'Revisión estado de conocimiento',
          weight: 50,
          progress: 70,
          status: 'En Ejecución',
          assignedTo: ['MEM-009'],
          deadline: '2026-10-22',
          deliverables: 'Estado del arte bibliográfico en succión matricial y suelos no saturados'
        },
        {
          id: 'ACT-INV-03-1792790611608-2',
          name: 'Enviar correo con diseños',
          weight: 50,
          progress: 0,
          status: 'En Ejecución',
          assignedTo: ['MEM-001', 'MEM-002'],
          deadline: '2026-10-30',
          deliverables: ''
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
      status: 'Finalizado',
      description: 'Servicios de extensión y consultoría: ensayos de laboratorio (Límites, CMO, VAM, granulometría), cálculos de correlaciones PANDA, GPR, Wn, compresores y CBR, y consolidación de parámetros.',
      driveFolderId: '4D5E_AnilloVial',
      driveFolderName: 'EXT-01_Anillo_Vial',
      activities: [
        {
          id: 'ACT-EXT01-01',
          name: 'Ensayos de anillo vial: Límites (8 c/u), CMO (8), VAM (8; 2 días) y granulometría (8 c/u)',
          weight: 55,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-008', 'MEM-009'],
          deadline: '2026-09-18',
          deliverables: 'Fichas de laboratorio con 8 límites, 8 CMO, 8 VAM y 8 granulometrías completas'
        },
        {
          id: 'ACT-EXT01-02',
          name: 'Cálculos: PANDA y GPR; Wn; compresores (1 del AP2); CBR',
          weight: 45,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-003', 'MEM-002'],
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
          id: 'ACT-LAB01-02',
          name: 'Aseo y orden del laboratorio',
          weight: 15,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-008', 'MEM-005'],
          deadline: '2026-11-06',
          deliverables: 'Jornada de orden y aseo 5S en áreas de trabajo del laboratorio'
        },
        {
          id: 'ACT-LAB01-03',
          name: 'Página Web - Laboratorio',
          weight: 20,
          progress: 30,
          status: 'En Ejecución',
          assignedTo: ['MEM-011'],
          deadline: '2026-10-30',
          deliverables: 'Actualización de contenidos y recursos de la página web del laboratorio'
        },
        {
          id: 'ACT-LAB01-04',
          name: 'Seguimiento semanal de actividades - Completar X3',
          weight: 20,
          progress: 75,
          status: 'En Ejecución',
          assignedTo: ['MEM-005'],
          deadline: '2026-09-18',
          deliverables: 'Matriz de seguimiento semanal de compromisos y tareas consolidada'
        },
        {
          id: 'ACT-LAB01-05',
          name: 'Informe del semillero',
          weight: 15,
          progress: 100,
          status: 'Completada',
          assignedTo: ['MEM-002'],
          deadline: '2026-09-25',
          deliverables: 'Informe consolidado de avances y actividades del semillero de investigación'
        },
        {
          id: 'ACT-LAB01-06',
          name: 'Presentar horario',
          weight: 10,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-002'],
          deadline: '2026-09-18',
          deliverables: 'Horario consolidado de turnos y disponibilidad de auxiliares'
        },
        {
          id: 'ACT-LAB-01-1792791007646-6',
          name: 'Pagina Web UPADI',
          weight: 20,
          progress: 0,
          status: 'Pendiente',
          assignedTo: ['MEM-011'],
          deadline: '2026-11-01',
          deliverables: ''
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
      memberName: 'Cesar Leonardo Gomez Torres',
      date: '2026-09-04',
      hoursWorked: 4.0,
      progressReported: 75,
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
    },
    {
      id: 'LOG-2026-002',
      projectId: 'PRJ-INV-2026-01',
      activityId: 'ACT-INV01-01',
      memberId: 'MEM-005',
      memberName: 'Cesar Leonardo Gomez Torres',
      date: '2026-10-21',
      hoursWorked: 5.0,
      progressReported: 35,
      notes: 'Procesamiento de los registros de deformación axial y cambio volumétrico de la grava sílice. Verificación comparativa con parámetros de resistencia de la literatura técnica.',
      attachments: [
        {
          name: 'Curvas_Triaxial_Grava_Silice_Literatura.xlsx',
          size: '320 KB',
          type: 'excel',
          url: '#',
          drivePath: 'Laboratorio_Geotecnia/2026/Investigacion/INV-01/Curvas_Triaxial_Grava_Silice_Literatura.xlsx'
        }
      ],
      status: 'Aprobado',
      reviewedBy: 'MEM-001',
      reviewDate: '2026-10-22',
      reviewComments: 'Envolvente de falla coherente con las especificaciones del material.'
    },
    {
      id: 'LOG-2026-003',
      projectId: 'PRJ-INV-2026-02',
      activityId: 'ACT-INV02-02',
      memberId: 'MEM-008',
      memberName: 'Esteban Alexis Benitez Blanco',
      date: '2026-10-21',
      hoursWorked: 6.0,
      progressReported: 20,
      notes: 'Montaje de la consolidación C.R.S. (Constant Rate of Strain), saturación por contrapresión y verificación de estanqueidad de la celda.',
      attachments: [
        {
          name: 'Registro_Montaje_CRS_Temperatura.pdf',
          size: '1.2 MB',
          type: 'pdf',
          url: '#',
          drivePath: 'Laboratorio_Geotecnia/2026/Investigacion/INV-02/Registro_Montaje_CRS_Temperatura.pdf'
        }
      ],
      status: 'Aprobado',
      reviewedBy: 'MEM-002',
      reviewDate: '2026-10-22',
      reviewComments: 'Montaje verificado conforme al protocolo.'
    },
    {
      id: 'LOG-2026-004',
      projectId: 'PRJ-EXT-2026-01',
      activityId: 'ACT-EXT01-01',
      memberId: 'MEM-008',
      memberName: 'Esteban Alexis Benitez Blanco',
      date: '2026-10-22',
      hoursWorked: 8.0,
      progressReported: 60,
      notes: 'Ejecución de 4 ensayos de granulometría y Gravedad Específica (GS) para el proyecto de Anillo Vial (cumplimiento de 4 turnos de laboratorio registrados en tablero).',
      attachments: [
        {
          name: 'Granulometrias_4_muestras_GS_AnilloVial.xlsx',
          size: '410 KB',
          type: 'excel',
          url: '#',
          drivePath: 'Laboratorio_Geotecnia/2026/Extension/EXT-01/Granulometrias_4_muestras_GS_AnilloVial.xlsx'
        }
      ],
      status: 'Aprobado',
      reviewedBy: 'MEM-003',
      reviewDate: '2026-10-22',
      reviewComments: 'Curvas granulométricas y gravedades específicas validadas.'
    },
    {
      id: 'LOG-2026-005',
      projectId: 'PRJ-LAB-2026-01',
      activityId: 'ACT-LAB01-01',
      memberId: 'MEM-009',
      memberName: 'Gabriel Enrique Antonio Moreno Diaz',
      date: '2026-10-22',
      hoursWorked: 3.5,
      progressReported: 80,
      notes: 'Supervisión de la jornada 5S de aseo del laboratorio con SPMG y MKMM en sectores Suelos (S), Triaxiales (T) y Operaciones (O). Verificación de orden y registro de turnos.',
      attachments: [],
      status: 'Aprobado',
      reviewedBy: 'MEM-002',
      reviewDate: '2026-10-23',
      reviewComments: 'Aseo completado satisfactoriamente.'
    }
  ],

  INITIAL_RECURRING_TASKS: [
    {
      id: 'REC-001',
      title: 'Aseo general de mesas de trabajo y pisos del laboratorio (Protocolo 5S)',
      area: 'Mesas de Granito, Aula Central y Pasillos (Ed. 407)',
      category: 'Aseo y Orden',
      frequency: 'Semanal (Viernes al cierre)',
      priority: 'Alta',
      description: 'Limpieza de mesas de trabajo con paño húmedo y desinfectante neutro, barrido de partículas de suelo, trapeado de pisos con agua y jabón, y vaciado de canecas de residuos ordinarios y reciclables.',
      assignedTo: ['MEM-015', 'MEM-012', 'MEM-009'], // SPMG, MKMM, GEAMD (del tablero 5S)
      status: 'Cumplida',
      lastCompletedDate: '2026-10-23',
      lastCompletedBy: 'MEM-009',
      lastCompletedByName: 'Gabriel Enrique Antonio Moreno Diaz',
      lastNotes: 'Jornada 5S completada en sectores Suelos (S), Triaxiales (T) y Operaciones (O). Mesas desinfectadas y pisos trapeados.',
      history: [
        {
          date: '2026-10-23',
          completedBy: 'MEM-009',
          completedByName: 'Gabriel Enrique Antonio Moreno Diaz',
          week: 43,
          notes: 'Mesas desinfectadas y pisos trapeados al cierre de semana.'
        },
        {
          date: '2026-10-16',
          completedBy: 'MEM-015',
          completedByName: 'Salma Paz Montenegro Gonzales',
          week: 42,
          notes: 'Limpieza profunda de mesones y canecas vaciadas.'
        }
      ]
    },
    {
      id: 'REC-002',
      title: 'Lavado, secado con aire y verificación de integridad de mallas de tamices ASTM',
      area: 'Zona de Tamizado y Tamizadoras Ro-Tap',
      category: 'Mantenimiento y Equipos',
      frequency: 'Semanal (Jueves tarde)',
      priority: 'Alta',
      description: 'Limpieza cuidadosa con brocha de cerdas de pelo de camello (mallas finas #100, #200) y cepillo de cerdas de bronce (mallas gruesas > #40). Inspección a contraluz de roturas o deformaciones y secado en estufa suave.',
      assignedTo: ['MEM-010', 'MEM-014'], // JANG, JDGP
      status: 'Cumplida',
      lastCompletedDate: '2026-10-22',
      lastCompletedBy: 'MEM-010',
      lastCompletedByName: 'Julian Andres Navas Garzon',
      lastNotes: 'Tamices de 3" hasta No. 200 limpios e inspeccionados. Sin roturas en mallas finas.',
      history: [
        {
          date: '2026-10-22',
          completedBy: 'MEM-010',
          completedByName: 'Julian Andres Navas Garzon',
          week: 43,
          notes: 'Tamices de 3" hasta No. 200 limpios e inspeccionados. Sin roturas en mallas finas.'
        }
      ]
    },
    {
      id: 'REC-003',
      title: 'Verificación de nivel de burbuja, limpieza y chequeo de balanzas con masas patrón',
      area: 'Mesa Antivibratoria de Balanzas Analíticas',
      category: 'Calibración y Verificación',
      frequency: 'Semanal (Lunes apertura)',
      priority: 'Alta',
      description: 'Limpieza del platillo y cámara de vidrio con brocha antiestática, nivelación precisa de la burbuja en las balanzas de 0.001g, 0.01g y 0.1g, y comprobación con juego de pesas patrón certificadas.',
      assignedTo: ['MEM-013'], // KDRP
      status: 'Cumplida',
      lastCompletedDate: '2026-10-19',
      lastCompletedBy: 'MEM-013',
      lastCompletedByName: 'Karen Dayana Rincon Presiga',
      lastNotes: '4 balanzas niveladas y chequeadas a 100g y 500g. Desviación inferior a 0.02g dentro de tolerancia.',
      history: [
        {
          date: '2026-10-19',
          completedBy: 'MEM-013',
          completedByName: 'Karen Dayana Rincon Presiga',
          week: 43,
          notes: '4 balanzas niveladas y chequeadas a 100g y 500g.'
        }
      ]
    },
    {
      id: 'REC-004',
      title: 'Mantenimiento, descalcificación y reposición de agua destilada / desaireada',
      area: 'Cuarto Húmedo de Curado y Sistema de Desaireación Nold',
      category: 'Mantenimiento y Equipos',
      frequency: 'Semanal (Miércoles mañana)',
      priority: 'Media',
      description: 'Verificar el flujo del destilador eléctrico de agua, rellenar los tanques de almacenamiento para celdas triaxiales y consolidómetros, y chequear que los difusores del cuarto húmedo mantengan >95% de humedad relativa.',
      assignedTo: ['MEM-012', 'MEM-015'], // MKMM, SPMG
      status: 'Pendiente',
      lastCompletedDate: '2026-10-14',
      lastCompletedBy: 'MEM-012',
      lastCompletedByName: 'Michael Kaleth Mora Mejia',
      lastNotes: 'Tanques de reserva llenos al 80% con agua desaireada.',
      history: [
        {
          date: '2026-10-14',
          completedBy: 'MEM-012',
          completedByName: 'Michael Kaleth Mora Mejia',
          week: 42,
          notes: 'Tanques de reserva llenos al 80% con agua desaireada.'
        }
      ]
    },
    {
      id: 'REC-005',
      title: 'Limpieza de moldes Proctor, anillos de consolidación y lubricación antioxidante',
      area: 'Estantería de Moldes Metálicos y Accesorios',
      category: 'Aseo y Orden',
      frequency: 'Semanal (Viernes)',
      priority: 'Media',
      description: 'Retiro exhaustivo de costras de suelo adheridas en moldes Proctor estándar y modificado, limpieza de anillos cortadores de consolidación con alcohol isopropílico y aplicación de fina película de lubricante anticorrosivo WD-40.',
      assignedTo: ['MEM-016'], // JEMP
      status: 'En Proceso',
      lastCompletedDate: '2026-10-16',
      lastCompletedBy: 'MEM-016',
      lastCompletedByName: 'Juan Esteban Millan Perilla',
      lastNotes: 'Collares y bases de Proctor aceitados y guardados en estante B-3.',
      history: [
        {
          date: '2026-10-16',
          completedBy: 'MEM-016',
          completedByName: 'Juan Esteban Millan Perilla',
          week: 42,
          notes: 'Collares y bases de Proctor aceitados y guardados en estante B-3.'
        }
      ]
    },
    {
      id: 'REC-006',
      title: 'Disposición de suelos ensayados y rotulación de muestras en bodega',
      area: 'Bodega de Muestras y Patio de Almacenamiento',
      category: 'Gestión de Muestras y Residuos',
      frequency: 'Quincenal (Viernes)',
      priority: 'Normal',
      description: 'Verificar con los directores de proyectos qué muestras ensayadas ya cuentan con informe final aprobado para proceder a su disposición controlada, y re-etiquetar bolsas de sondeos en investigación.',
      assignedTo: ['MEM-008', 'MEM-010'], // EABB, JANG
      status: 'Pendiente',
      lastCompletedDate: '2026-10-09',
      lastCompletedBy: 'MEM-008',
      lastCompletedByName: 'Esteban Alexis Benitez Blanco',
      lastNotes: 'Se descartaron 12 muestras de arenas ensayadas del proyecto anterior.',
      history: [
        {
          date: '2026-10-09',
          completedBy: 'MEM-008',
          completedByName: 'Esteban Alexis Benitez Blanco',
          week: 41,
          notes: 'Descarte de muestras aprobadas y reorden de estantes.'
        }
      ]
    },
    {
      id: 'REC-007',
      title: 'Inspección de seguridad: purga de lavaojos, verificación de extintores y botiquín',
      area: 'Punto de Emergencia y Acceso al Laboratorio',
      category: 'Seguridad y Bioseguridad',
      frequency: 'Semanal (Lunes apertura)',
      priority: 'Alta',
      description: 'Purga hidráulica de la estación de lavaojos durante 20 segundos para asegurar agua fresca y limpia, inspección de la aguja en rango verde del manómetro de extintores de polvo químico ABC y CO2, y revisión de insumos en botiquín.',
      assignedTo: ['MEM-011'], // ACSL
      status: 'Cumplida',
      lastCompletedDate: '2026-10-19',
      lastCompletedBy: 'MEM-011',
      lastCompletedByName: 'Angie Carolina Salazar Lara',
      lastNotes: 'Lavaojos purgado, extintores con presión óptima y botiquín abastecido.',
      history: [
        {
          date: '2026-10-19',
          completedBy: 'MEM-011',
          completedByName: 'Angie Carolina Salazar Lara',
          week: 43,
          notes: 'Lavaojos purgado y extintores con presión óptima.'
        }
      ]
    }
  ],

  INITIAL_LAB_PRACTICES: [
    {
      id: 'PRAC-2026-001',
      subject: 'Mecánica de Suelos Básica',
      code: '2015945 - Grupo 01',
      professor: 'Prof. Carlos Alberto Vega P.',
      professorEmail: 'cvegap@unal.edu.co',
      dayOfWeek: 'Miércoles',
      timeSlot: '08:00 - 11:00 AM',
      date: '2026-10-28',
      location: 'Mesas 1, 2 y 3 - Aula Principal Ed. 407',
      studentCount: 24,
      status: 'En Preparación de Material',
      tests: [
        'Granulometría por Tamizado (ASTM D422 / I.N.V. E-123)',
        'Límites de Atterberg: Límite Líquido y Plástico (ASTM D4318 / I.N.V. E-125 / E-126)',
        'Determinación de Humedad Natural por Horno (ASTM D2216)'
      ],
      assignedStaff: ['MEM-008', 'MEM-009', 'MEM-014'], // EABB, GEAMD, JDGP
      preparationChecklist: [
        { item: 'Cuarteo y secado de 5 kg de suelo fino y granular en horno a 110°C', done: true },
        { item: 'Alistamiento de 4 juegos de tamices (3", #4, #10, #40, #200 y fondo)', done: true },
        { item: 'Calibración de copas Casagrande con ranuradores planos y curvos', done: true },
        { item: 'Alistamiento de cápsulas de humedad taradas, balanzas 0.01g y espátulas', done: false }
      ],
      notes: 'Exigir obligatoriamente bata blanca cerrada, guantes de nitrilo y cuaderno de laboratorio a todos los estudiantes.'
    },
    {
      id: 'PRAC-2026-002',
      subject: 'Geotecnia Aplicada y Cimentaciones',
      code: '2015950 - Grupo 02',
      professor: 'Prof. Hernán Camilo Cortés M.',
      professorEmail: 'hccortes@unal.edu.co',
      dayOfWeek: 'Jueves',
      timeSlot: '14:00 - 17:00 PM',
      date: '2026-10-29',
      location: 'Cuarto de Resistencia de Suelos - Ed. 407',
      studentCount: 18,
      status: 'Programada',
      tests: [
        'Ensayo de Corte Directo Consolidado Drenado CD (ASTM D3080 / I.N.V. E-154)',
        'Compresión Inconfinada en Suelos Cohesivos (ASTM D2166 / I.N.V. E-152)'
      ],
      assignedStaff: ['MEM-010', 'MEM-013'], // JANG, KDRP
      preparationChecklist: [
        { item: 'Labrado y tallado de probetas inalteradas de arcilla de Bogotá', done: false },
        { item: 'Verificación de deformímetros LVDT, caja de corte y anillo de carga', done: false },
        { item: 'Saturación previa de piedras porosas en agua desaireada', done: false }
      ],
      notes: 'La práctica incluye registro digital de datos con software de adquisición automatizado.'
    },
    {
      id: 'PRAC-2026-003',
      subject: 'Pavimentos y Materiales Viales',
      code: '2015962 - Grupo 01',
      professor: 'Prof. Luis Fernando Osorio L.',
      professorEmail: 'lfosorio@unal.edu.co',
      dayOfWeek: 'Viernes',
      timeSlot: '09:00 - 12:00 PM',
      date: '2026-10-30',
      location: 'Zona de Compactación y Pistas de Ensayo',
      studentCount: 22,
      status: 'Programada',
      tests: [
        'Compactación Proctor Modificado (ASTM D1557 / I.N.V. E-142)',
        'Relación de Soporte de California - CBR en Laboratorio (ASTM D1883 / I.N.V. E-148)'
      ],
      assignedStaff: ['MEM-012', 'MEM-016'], // MKMM, JEMP
      preparationChecklist: [
        { item: 'Fraccionamiento de 5 bultos de material granular subbase de 6 kg c/u', done: true },
        { item: 'Adición escalonada de agua para curvas de humedad óptima (4%, 6%, 8%, 10%)', done: false },
        { item: 'Alistamiento de martillo mecánico, moldes CBR, trípodes y diales de expansión', done: false }
      ],
      notes: 'Práctica de alta exigencia física. Proveer protectores auditivos de copa para el uso del martillo mecánico.'
    },
    {
      id: 'PRAC-2026-004',
      subject: 'Mecánica de Rocas',
      code: '2015970 - Grupo 01',
      professor: 'Prof. Mario Germán Trujillo R.',
      professorEmail: 'mgtrujillo@unal.edu.co',
      dayOfWeek: 'Martes',
      timeSlot: '10:00 - 13:00 PM',
      date: '2026-11-03',
      location: 'Laboratorio de Geomecánica y Caracterización de Rocas',
      studentCount: 16,
      status: 'Programada',
      tests: [
        'Ensayo de Carga Puntual - Point Load Test (ASTM D5731 / ISRM)',
        'Esclerometría con Martillo Schmidt Tipo L en Núcleos de Roca (ASTM D5873)',
        'Determinación de Densidad y Porosidad Aparente en Núcleos Cilíndricos'
      ],
      assignedStaff: ['MEM-011', 'MEM-015'], // ACSL, SPMG
      preparationChecklist: [
        { item: 'Selección de núcleos sanos de arenisca y caliza (diámetro NX 54 mm)', done: false },
        { item: 'Inspección de las puntas cónicas del aparato de carga puntual Franklin', done: false },
        { item: 'Calibración con yunque de acero del martillo Schmidt tipo L', done: false }
      ],
      notes: 'Uso obligatorio de gafas de seguridad envolventes durante el ensayo de fragmentación de núcleos rocosos.'
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
