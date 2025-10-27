export type Locale = "en" | "fr" | "ru";

type NavigationKeys =
  | "summary"
  | "education"
  | "skills"
  | "projects"
  | "resume"
  | "contact";

type SectionKey =
  | "heroTitle"
  | "heroSubtitle"
  | "heroTagline"
  | "summaryTitle"
  | "summaryBody"
  | "summaryHighlightsTitle"
  | "educationTitle"
  | "skillsTitle"
  | "projectsTitle"
  | "resumeTitle"
  | "resumeDescription"
  | "resumeCta"
  | "contactTitle"
  | "contactEmailLabel"
  | "contactLocationLabel"
  | "footerNote"
  | "projectLinkLabel";

type Messages = {
  nav: Record<NavigationKeys, string>;
  sections: Record<SectionKey, string>;
  summaryHighlights: string[];
  education: Array<{
    faculty: string;
    school: string;
    period: string;
    details: string;
    logo: string;
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    link: string;
    tags: string[];
  }>;
  resume: {
    url: string;
  };
  contact: {
    email: string;
    location: string;
  };
  themeToggle: {
    label: string;
    light: string;
    dark: string;
    system: string;
  };
  languageToggle: {
    label: string;
    english: string;
    french: string;
    russian: string;
  };
};

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

const withBasePath = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return basePath ? `${basePath}${normalized}` : normalized;
};

export const messages: Record<Locale, Messages> = {
  en: {
    nav: {
      summary: "Summary",
      education: "Education",
      skills: "Skills",
      projects: "Featured Work",
      resume: "Resume",
      contact: "Contact"
    },
    sections: {
      heroTitle: "Anton Filippov",
      heroSubtitle: "Full-Stack Engineer & Technical Lead",
      heroTagline:
        "I design and ship production-ready, data-driven platforms—combining event-driven backends with polished, fast UIs.",
      summaryTitle: "Professional Summary",
      summaryBody:
        "Full-stack engineer delivering reliable web platforms end-to-end—from shaping requirements and architecture to CI/CD and launch. I specialize in Node/NestJS, Next.js, and event-driven microservices, with a strong focus on code quality, observability, and developer experience. Recent engagements in e-commerce, fintech, and mental-health SaaS produced measurable wins in performance, reliability, and time-to-market.",
      summaryHighlightsTitle: "Highlights",
      educationTitle: "Education",
      skillsTitle: "Skills",
      projectsTitle: "Featured Work",
      projectLinkLabel: "Explore case study",
      resumeTitle: "Resume",
      resumeDescription:
        "Download a current PDF covering experience, key projects, and technical competencies.",
      resumeCta: "Download CV",
      contactTitle: "Get in touch",
      contactEmailLabel: "Email",
      contactLocationLabel: "Location",
      footerNote:
        "Based in Montreal; open to remote or hybrid collaboration across North America and Europe."
    },
    summaryHighlights: [
      "Delivered a confidential commerce MVP in 8 weeks with Next.js 15, Stripe, and Prisma; cut perceived load times by ~35% using Suspense-driven navigation and optimistic updates.",
      "Led FORAPAY’s distributed fintech platform with Kafka-backed microservices and CI/CD; reduced deployment time by >90% and frontend latency by ~40% via WebSocket updates.",
      "Built automation and engagement flows for Together Made Simple—Next.js 15 + NestJS + Telegram—boosting client inquiries by ~30% and user engagement by ~45%."
    ],
    education: [
      {
        faculty: "Diploma in Computer Science — Software Development",
        school: "Mohawk College, Hamilton",
        period: "2021 – 2024",
        details:
          "Intensive program focused on software development, cloud-native systems, and applied computer science.",
        logo: withBasePath("/mohawk.svg")
      },
      {
        faculty: "Bachelor of Computer Science (incomplete)",
        school: "MIREA – Russian Technological University, Moscow",
        period: "2020 – 2021",
        details:
          "Coursework in computer science fundamentals prior to relocating to Canada.",
        logo: withBasePath("/mirea.svg")
      }
    ],
    skills: [
      {
        category: "Backend & Architecture",
        items: [
          "Node.js",
          "NestJS",
          "Express.js",
          "Prisma ORM",
          "PostgreSQL",
          "MySQL",
          "Redis",
          "Kafka",
          "RabbitMQ",
          "DDD",
          "CQRS/Saga",
          "WebSocket APIs"
        ]
      },
      {
        category: "Frontend & Product Engineering",
        items: [
          "React",
          "Next.js (App Router, SSR/SSG/PWA)",
          "TypeScript",
          "Redux Toolkit",
          "Tailwind CSS",
          "Material UI"
        ]
      },
      {
        category: "Cloud & DevOps",
        items: [
          "Docker",
          "AWS (EC2/ECR/Lambda/RDS/API Gateway)",
          "Azure (AKS/Functions/Cosmos DB/SQL Database)",
          "GitHub Actions",
          "CI/CD Automation",
          "Infrastructure as Code",
          "Observability",
          "Performance Optimization"
        ]
      },
      {
        category: "Leadership & Collaboration",
        items: [
          "System Design",
          "API Contract Design (OpenAPI/Swagger)",
          "Security (JWT/OAuth2/OWASP)",
          "Documentation",
          "Mentorship",
          "Agile Delivery",
          "Cross-team Communication"
        ]
      }
    ],
    projects: [
      {
        title: "XERCES Commerce Platform",
        description:
          "Confidential retail MVP delivered in 8 weeks with Next.js 15, Prisma, and Stripe; ~35% faster perceived loads via Suspense-driven navigation and optimistic updates.",
        link: "https://xerces.co",
        tags: ["Next.js 15", "Stripe", "Prisma", "Technical Leadership"]
      },
      {
        title: "FORAPAY Fintech Infrastructure",
        description:
          "Kafka-driven microservice platform for wallets and crypto trading with WebSocket updates and hardened security across Next.js 14 and Spring Boot services; >90% faster deployments.",
        link: "https://www.forapay.io",
        tags: ["Microservices", "Kafka", "Spring Boot", "Next.js 14"]
      },
      {
        title: "Together Made Simple Platform",
        description:
          "Mental-health SaaS with NestJS services, Next.js 15 app, and Telegram automation powering booking, clinical tools, and engagement—raising inquiries by ~30%.",
        link: "https://www.trypsiora.com",
        tags: ["NestJS", "Next.js 15", "Prisma", "Automation"]
      }
    ],
    resume: {
      url: withBasePath("/documents/anton-filippov-cv.pdf")
    },
    contact: {
      email: "anton.filippov.ca@gmail.com",
      location: "Montreal, QC, Canada · Open to remote/hybrid"
    },
    themeToggle: {
      label: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System"
    },
    languageToggle: {
      label: "Language",
      english: "English",
      french: "Français",
      russian: "Русский"
    }
  },
  fr: {
    nav: {
      summary: "Synthèse",
      education: "Formation",
      skills: "Compétences",
      projects: "Réalisations",
      resume: "CV",
      contact: "Contact"
    },
    sections: {
      heroTitle: "Anton Filippov",
      heroSubtitle: "Ingénieur Full-Stack & Responsable Technique",
      heroTagline:
        "Ingénieur full-stack qui livre des plateformes résilientes et pilotées par les données, alliant architecture réfléchie et expérience utilisateur soignée.",
      summaryTitle: "Profil professionnel",
      summaryBody:
        "Je conçois et déploie des plateformes web de bout en bout, capables de passer du MVP à la production. Mes missions récentes dans le commerce, la fintech et la santé mentale associent développement opérationnel et leadership technique pour livrer des gains de performance mesurables, des intégrations sécurisées et une documentation complète.",
      summaryHighlightsTitle: "Points forts",
      educationTitle: "Formation",
      skillsTitle: "Compétences",
      projectsTitle: "Réalisations phares",
      projectLinkLabel: "Voir l'étude de cas",
      resumeTitle: "CV",
      resumeDescription:
        "Téléchargez un PDF à jour détaillant l'expérience, les missions récentes et les compétences techniques.",
      resumeCta: "Télécharger le CV",
      contactTitle: "Contact",
      contactEmailLabel: "Email",
      contactLocationLabel: "Localisation",
      footerNote:
        "Basé à Montréal et ouvert aux collaborations à distance ou hybrides en Amérique du Nord et en Europe."
    },
    summaryHighlights: [
      "A livré un MVP e-commerce sécurisé en moins de huit semaines chez XERCES, combinant Next.js 15, Stripe et Prisma tout en améliorant les temps de chargement perçus d'environ 35 %.",
      "A dirigé l'infrastructure fintech distribuée de FORAPAY, orchestrant des microservices Kafka et un CI/CD qui a réduit le temps de déploiement de plus de 90 %.",
      "A automatisé les parcours d'accueil et d'engagement pour Together Made Simple, augmentant les demandes clients d'environ 30 % grâce à des chatbots et à la planification intégrée."
    ],
    education: [
      {
        faculty: "Diplôme en informatique — Développement logiciel",
        school: "Mohawk College, Hamilton",
        period: "2021 – 2024",
        details:
          "Programme intensif axé sur le développement logiciel, les systèmes cloud-native et l'informatique appliquée.",
        logo: withBasePath("/mohawk.svg")
      },
      {
        faculty: "Licence en informatique (inachevée)",
        school: "Université technologique russe MIREA, Moscou",
        period: "2020 – 2021",
        details:
          "Cursus en sciences informatiques fondamentales avant la relocalisation au Canada.",
        logo: withBasePath("/mirea.svg")
      }
    ],
    skills: [
      {
        category: "Back-end & Architecture",
        items: [
          "Node.js",
          "NestJS",
          "Express.js",
          "Prisma ORM",
          "PostgreSQL",
          "Redis",
          "Kafka",
          "RabbitMQ",
          "DDD",
          "CQRS/Saga"
        ]
      },
      {
        category: "Ingénierie front-end & produit",
        items: [
          "React",
          "Next.js (App Router)",
          "TypeScript",
          "Redux Toolkit",
          "Tailwind CSS",
          "Material UI",
          "WebSockets",
          "PWA"
        ]
      },
      {
        category: "Cloud & DevOps",
        items: [
          "Docker",
          "AWS (EC2/ECR)",
          "Azure (AKS/Functions)",
          "GitHub Actions",
          "Automatisation CI/CD",
          "Infrastructure as Code",
          "Observabilité",
          "Optimisation des performances"
        ]
      },
      {
        category: "Leadership & Collaboration",
        items: [
          "Feuilles de route techniques",
          "Domain-Driven Design",
          "Conception de contrats API",
          "Mentorat",
          "Documentation",
          "Livraison Agile",
          "Communication inter-équipes"
        ]
      }
    ],
    projects: [
      {
        title: "Plateforme e-commerce XERCES",
        description:
          "MVP retail confidentiel livré en moins de huit semaines avec Next.js 15, Prisma et Stripe ; amélioration d'environ 35 % des temps de chargement perçus grâce à la navigation Suspense et aux mises à jour optimistes.",
        link: "mailto:anton.filippov.ca@gmail.com?subject=XERCES%20Case%20Study",
        tags: ["Next.js 15", "Stripe", "Prisma", "Leadership technique"]
      },
      {
        title: "Infrastructure fintech FORAPAY",
        description:
          "Plateforme distribuée pour portefeuilles et trading crypto, pilotée par Kafka avec mises à jour WebSocket et sécurité renforcée entre les services Next.js 14 et Spring Boot.",
        link: "https://www.linkedin.com/in/anton-filippov-2a640022b",
        tags: ["Microservices", "Kafka", "Spring Boot", "Next.js 14"]
      },
      {
        title: "Plateforme Together Made Simple",
        description:
          "Solution SaaS santé mentale combinant services NestJS, Next.js 15 et automatisation Telegram pour offrir réservation, outils cliniques et parcours d'engagement ayant augmenté les demandes d'environ 30 %.",
        link: "mailto:anton.filippov.ca@gmail.com?subject=Together%20Made%20Simple%20Overview",
        tags: ["NestJS", "Next.js 15", "Prisma", "Automatisation"]
      }
    ],
    resume: {
      url: withBasePath("/documents/anton-filippov-cv.pdf")
    },
    contact: {
      email: "anton.filippov.ca@gmail.com",
      location: "Montréal, QC, Canada · Ouvert au télétravail/hybride"
    },
    themeToggle: {
      label: "Thème",
      light: "Clair",
      dark: "Sombre",
      system: "Système"
    },
    languageToggle: {
      label: "Langue",
      english: "Anglais",
      french: "Français",
      russian: "Russe"
    }
  },
  ru: {
    nav: {
      summary: "Резюме",
      education: "Образование",
      skills: "Навыки",
      projects: "Проекты",
      resume: "CV",
      contact: "Контакты"
    },
    sections: {
      heroTitle: "Антон Филиппов",
      heroSubtitle: "Фулстек-инженер и технический лидер",
      heroTagline:
        "Фулстек-инженер, создающий устойчивые, ориентированные на данные платформы с продуманной архитектурой и удобным интерфейсом.",
      summaryTitle: "Профессиональный профиль",
      summaryBody:
        "Проектирую и развиваю веб-платформы полного цикла, которые масштабируются от MVP до production. Последние проекты в e-commerce, финтехе и сфере ментального здоровья объединяют hands-on разработку и архитектурное лидерство, обеспечивая измеримые улучшения производительности, безопасные интеграции и качественную документацию.",
      summaryHighlightsTitle: "Ключевые достижения",
      educationTitle: "Образование",
      skillsTitle: "Навыки",
      projectsTitle: "Ключевые проекты",
      projectLinkLabel: "Открыть кейс",
      resumeTitle: "Резюме",
      resumeDescription:
        "Скачайте актуальное PDF с подробным опытом, текущими проектами и ключевыми компетенциями.",
      resumeCta: "Скачать резюме",
      contactTitle: "Контакты",
      contactEmailLabel: "Email",
      contactLocationLabel: "Локация",
      footerNote:
        "Базируюсь в Монреале, открыт к удаленному или гибридному сотрудничеству в Северной Америке и Европе."
    },
    summaryHighlights: [
      "За восемь недель собрал и запустил защищенный e-commerce MVP для XERCES на базе Next.js 15, Stripe и Prisma, улучшив воспринимаемое время загрузки примерно на 35 %.",
      "Руководил распределенной финтех-платформой FORAPAY: микросервисная архитектура на Kafka и CI/CD сократили время деплоя более чем на 90 %.",
      "Автоматизировал онбординг и удержание пользователей Together Made Simple с помощью чат-ботов и планирования, увеличив входящие заявки примерно на 30 %."
    ],
    education: [
      {
        faculty: "Диплом по информатике — Software Development",
        school: "Колледж Mohawk, Гамильтон",
        period: "2021 – 2024",
        details:
          "Интенсивная программа по разработке ПО, cloud-native системам и прикладной информатике.",
        logo: withBasePath("/mohawk.svg")
      },
      {
        faculty: "Бакалавриат по информатике (не завершен)",
        school: "Российский технологический университет МИРЭА, Москва",
        period: "2020 – 2021",
        details:
          "Изучение фундаментальных дисциплин информатики до переезда в Канаду.",
        logo: withBasePath("/mirea.svg")
      }
    ],
    skills: [
      {
        category: "Бэкенд и архитектура",
        items: [
          "Node.js",
          "NestJS",
          "Express.js",
          "Prisma ORM",
          "PostgreSQL",
          "Redis",
          "Kafka",
          "RabbitMQ",
          "DDD",
          "CQRS/Saga"
        ]
      },
      {
        category: "Фронтенд и продуктовая разработка",
        items: [
          "React",
          "Next.js (App Router)",
          "TypeScript",
          "Redux Toolkit",
          "Tailwind CSS",
          "Material UI",
          "WebSockets",
          "PWA"
        ]
      },
      {
        category: "Cloud и DevOps",
        items: [
          "Docker",
          "AWS (EC2/ECR)",
          "Azure (AKS/Functions)",
          "GitHub Actions",
          "CI/CD Automation",
          "Infrastructure as Code",
          "Observability",
          "Оптимизация производительности"
        ]
      },
      {
        category: "Лидерство и взаимодействие",
        items: [
          "Техническое роадмапирование",
          "Domain-Driven Design",
          "Проектирование API-контрактов",
          "Менторство",
          "Документация",
          "Agile-практики",
          "Межкомандная коммуникация"
        ]
      }
    ],
    projects: [
      {
        title: "Платформа XERCES Commerce",
        description:
          "Конфиденциальный retail MVP, собранный менее чем за восемь недель на Next.js 15, Prisma и Stripe; прирост воспринимаемой скорости на ~35 % за счет Suspense и оптимистичных обновлений.",
        link: "mailto:anton.filippov.ca@gmail.com?subject=XERCES%20Case%20Study",
        tags: ["Next.js 15", "Stripe", "Prisma", "Technical Leadership"]
      },
      {
        title: "Финтех-платформа FORAPAY",
        description:
          "Распределенная система для кошельков и криптотрейдинга: микросервисы на Kafka, WebSocket-обновления и усиленная безопасность в связке Next.js 14 и Spring Boot.",
        link: "https://www.linkedin.com/in/anton-filippov-2a640022b",
        tags: ["Microservices", "Kafka", "Spring Boot", "Next.js 14"]
      },
      {
        title: "Платформа Together Made Simple",
        description:
          "SaaS для сферы ментального здоровья на базе NestJS, Next.js 15 и Telegram-автоматизации: бронь, клинические инструменты и пользовательские сценарии, увеличившие обращения примерно на 30 %.",
        link: "mailto:anton.filippov.ca@gmail.com?subject=Together%20Made%20Simple%20Overview",
        tags: ["NestJS", "Next.js 15", "Prisma", "Automation"]
      }
    ],
    resume: {
      url: withBasePath("/documents/anton-filippov-cv.pdf")
    },
    contact: {
      email: "anton.filippov.ca@gmail.com",
      location: "Монреаль, Канада · Открыт к удаленной/гибридной работе"
    },
    themeToggle: {
      label: "Тема",
      light: "Светлая",
      dark: "Темная",
      system: "Системная"
    },
    languageToggle: {
      label: "Язык",
      english: "Английский",
      french: "Французский",
      russian: "Русский"
    }
  }
};

export const supportedLocales: Locale[] = ["en", "fr", "ru"];

export type MessagesKey = keyof typeof messages;

export const defaultLocale: Locale = "en";
