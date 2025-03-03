import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact, FaCloud, FaDatabase, FaCode, FaBrain, FaLightbulb, FaBalanceScale, FaPaperPlane, FaSitemap, FaTruck, FaChalkboardTeacher, FaGamepad, FaRobot, FaMapMarkedAlt } from "react-icons/fa";
import cloudOfThingsImg from "@/public/cloud-of-things.png";
import digitalMigrationImg from "@/public/digital-migration.png";
import azureHybridImg from "@/public/azure-hybrid.jpeg";
import ecommerceImg from "@/public/ecommerce.png";
import electricaircraftImg from "@/public/electric-aircraft-img.png";
import aiTriviaGameImg from "@/public/ai-trivia-game.png";
import aiAgencyImg from "@/public/ai-agency.png";
import rideHailingImg from "@/public/ride-hailing-app.png";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [
  {
    title: "AI Feedback Evaluator",
    location: "Remote, Freelance, UK",
    description:
      "Reviewing AI-generated responses for Outlier AI and DataAnnotation to enhance LLM performance. Delivering feedback on accuracy, relevance, and coherence, contributing to the refinement of conversational AI models and improved user experience.",
    icon: React.createElement(FaBrain),
    date: "01/2024 - Present",
  },
  {
    title: "Digital Strategist",
    location: "EndUp, Manchester, UK",
    description:
      "Developed comprehensive digital strategies that enhanced customer engagement by 25%, drove revenue growth by 30% through optimized e-commerce operations, strategic partnerships, and subscription models. Led migration to a hybrid operational model, reducing infrastructure costs by 40%.",
    icon: React.createElement(CgWorkAlt),
    date: "01/2023 - 01/2024",
  },
  {
    title: "Digital Consultant",
    location: "CLO, Riyadh, Saudi Arabia",
    description:
      "Executed data-driven digital strategies that increased business outcomes for tourism and F&B sectors. Conducted comprehensive market research and provided actionable recommendations based on analytical insights.",
    icon: React.createElement(CgWorkAlt),
    date: "08/2022 - 01/2023",
  },
  {
    title: "Junior System Engineer",
    location: "Novintiq, Cairo, Egypt",
    description:
      "Enhanced IT infrastructure reliability, led developer training programs that improved team productivity by 30%. Designed and implemented cloud solutions reducing operational costs by 20% while improving system uptime by 15%.",
    icon: React.createElement(FaCloud),
    date: "06/2021 - 06/2022",
  },
  {
    title: "Freelance E-commerce Specialist",
    location: "Self-employed, Liverpool, UK",
    description:
      "Operated an online store with comprehensive digital marketing strategy, analytics-driven decision making, and conversion optimization, leading to a successful qualification for an E-commerce internship at Gao Tek.",
    icon: React.createElement(FaTruck),
    date: "01/2019 - 03/2019",
  },
  {
    title: "Event Organizer",
    location: "City International Schools, Cairo",
    description:
      "Spearheaded school events, generating significant profits and enhancing collaboration across school departments through effective project management and stakeholder coordination.",
    icon: React.createElement(FaSitemap),
    date: "05/2016 - 05/2018",
  },
] as const;

export const projectsData = [
  {
    title: "AI-Powered Trivia Web Game",
    description:
      "Developing an engaging trivia game with AI-generated questions, dynamic difficulty adjustment, for a personalized learning paths. Implementing real-time multiplayer features and adaptive content generation.",
    tags: ["React - Next.js", "Node.js", "LangChain", "OpenAI API", "TypeScript", "CrewAI", "Pydantic", "WebSockets", "Vector DB" ,"Relational DB", "FastAPI", "Cross Data Modelling"],
    imageUrl: aiTriviaGameImg,
  },
  {
    title: "Multi-Agent AI Agency Platform",
    description:
      "Building a platform that orchestrates specialized AI agents for business applications. Creating a system that enables autonomous task execution with human oversight and interagent communication protocols.",
    tags: ["Python", "CrewAI", "Pydantic", "Vector Databases", "LangChain", "React - Next.js", "TypeScript", "FastAPI", "Docker", "RAG", "LLM", "Embeddings"],
    imageUrl: aiAgencyImg,
  },
  {
    title: "Ride Hailing Application",
    description:
      "Leading the development of mapping and routing algorithms for a ride-hailing service, optimizing driver-passenger matching and implementing efficient path-finding solutions for urban environments.",
    tags: ["Geospatial Algorithms", "Python", "GraphQL", "Nest.js", "MongoDB", "Docker", "React Native", "AWS", "MapBox API", "Redis", "Microservices"],
    imageUrl: rideHailingImg,
  },
  {
    title: "Cloud of Things Solution for Smart Parking Management",
    description:
      "Developed a scalable CoT solution using the MERN stack, enhancing smart parking operations with real-time data processing and serverless architecture on Azure.",
    tags: ["React", "Node.js", "Express", "MongoDB", "Mongoose", "Chakra UI", "Azure", "IoT", "Serverless", "Full Stack", "RESTful API", "Real-time Data", "Cloud Computing"],
    imageUrl: cloudOfThingsImg,
  },
  {
    title: "Database and Big Data Modelling for Digital Migration Company",
    description:
      "Created an optimized ERD schema for digital transformation, enhancing data storage, retrieval, and analysis capabilities for enterprise-scale operations.",
    tags: ["SQL", "Data Modelling", "ERD", "Big Data", "ETL", "Database Design", "Scalability", "Business Intelligence"],
    imageUrl: digitalMigrationImg,
  },
  {
    title: "Cloud-Based Hybrid Migration Software Development using Azure",
    description:
      "Developed a Django-based web application integrated with Azure services, achieving efficient deployment and compliance with governance requirements for enterprise clients.",
    tags: ["Python", "Django", "Azure", "Microservices", "DevOps", "Cloud", "Hybrid Migration", "Software Development", "Cloud Security", "Cloud Computing"],
    imageUrl: azureHybridImg,
  },
  {
    title: "E-commerce Store Development",
    description:
      "Built and managed an online store, applying web development and digital marketing techniques to effectively market health products with data-driven optimization strategies.",
    tags: ["HTML", "CSS", "Digital Marketing", "Shopify", "E-commerce", "SEO", "Social Media", "Google Analytics"],
    imageUrl: ecommerceImg,
  },
  {
    title: "Design and Simulation of a Fully Electric Aircraft",
    description:
      "Designed and simulated a sustainable, electric aircraft adhering to industry standards, focusing on zero carbon emissions and innovative propulsion systems.",
    tags: ["MATLAB", "Aerospace Engineering", "Hybrid Solutions", "Simulation", "Zero Carbon", "Electric Aircraft"],
    imageUrl: electricaircraftImg,
  },
] as const;

export const skillsData = {
  "Programming Languages & Frameworks": [
    "C#", ".NET (Core, MVC, Entity Framework)", "Java", "JavaScript", "Python", "TypeScript",
    "MongoDB", "MySQL (SQL)", "Node.js", "Express", "React", "Vue", "Redux", "jQuery", 
    "NoSQL", "GraphQL", "Graph Databases", "Git", "OOP", "Design Patterns", "FatsAPI", "Nest.js" ,  "Uvicorn" , "Django", 
    "Flask", "PHP", "HTML5/CSS3", "RESTful API", "GRPC", "SOAP", "ERD - Cross Data Modelling", "Chakra UI", "Material UI", "Tailwind CSS", "Bootstrap", "SASS", "PASS"
  ],
  "AI & Advanced Technologies": [
    "LangChain","CrewAI", "PhiData", "OpenRouter API", "Langserve", "Pydantic", "OpenAI API", "Vector Databases", "RAG (Retrieval Augmented Generation)",
    "Embeddings", "Prompt Engineering", "AI Voice Assitants and Chatbots" ,"LLM Fine-tuning", "Multi-agent Systems", "AI Orchestration",
    , "System Mapping", "Algorithm Optimization", "WebSockets", "Real-time Systems"
  ],
  "Cloud Computing & Services": [
    "Azure (Functions, Cosmos DB, Logic Apps)", "AWS (S3, EC2, Lambda)", 
    "GCP (Cloud Functions, Firestore)", "Microservices", 
    "CI/CD Pipelines (GitHub Actions, Jenkins, Docker)", "DevOps", "Kubernetes", 
    "Terraform", "Edge Computing", "Serverless Functions", 
    "Unit Testing", "Integration Testing", "Hybrid Solutions", 
    "Monitoring & Logging"
  ],
  "Machine Learning, Project Management, Data Analysis & Visualization": [
    "NumPy", "Pandas", "Scikit-learn", "MATLAB", "R", "Power BI", 
    "Tableau", "Google Big Query", "Agile", "Scrum", "Kanban", 
    "Six Sigma", "Lean", "Jira", "Trello", "Asana", 
    "Microsoft 365 (Excel, PowerPoint, Word)", "Data Analysis", 
    "Data Modeling", "Data Visualization", "Dashboard Design", 
    "Machine Learning Algorithms (Regression, Classification, Clustering)", 
    "Deep Learning (TensorFlow, Keras, PyTorch)", 
    "Natural Language Processing (NLP)", "Retrieval Augmented Generation (RAG)"
  ]
} as const;

export const achievementsData = [
  {
    title: "Microsoft Azure Certifications – AZ-900/104/204",
    description: "Mastered Azure cloud services, enhancing cloud solution design and implementation capabilities.",
    Icon: FaCloud,
    certificateUrl: "/azure-certifications.png",
  },
  {
    title: "Google Data Analytics Professional Certificate",
    description: "Developed expertise in data collection, analysis, and visualization to inform strategic decision-making.",
    Icon: FaCode,
    certificateUrl: "/google-data-analytics-certificate2.png",
  },
  {
    title: "EY Technology Consulting Project",
    description: "Delivered a technology consulting project for EY, focusing on data-driven strategies and solutions.",
    Icon: FaDatabase,
    certificateUrl: "/ey-technology-consulting-project.png",
  },
  {
    title: "Ethics and Law in Data Analytics Certificate",
    description: "Completed course focusing on the ethical and legal aspects of data analytics.",
    Icon: FaBalanceScale,
    certificateUrl: "/ethics-law-data-analytics-certificate1.png",
  },
  {
    title: "AI Foundations: Machine Learning Certificate",
    description: "Gained foundational knowledge in AI and machine learning techniques.",
    Icon: FaBrain,
    certificateUrl: "/ai-foundations-machine-learning-certificate.png",
  },
  {
    title: "Google Digital Marketing Garage Certificate",
    description: "Acquired skills in digital marketing strategies and applications.",
    Icon: FaLightbulb,
    certificateUrl: "/google-digital-marketing-garage-certificate1.png",
  },
] as const;

export const mentorshipData = [
  {
    title: "Accenture Job Simulation Experience",
    description: "Participated in data analytics and developer technology simulations, enhancing decision-making and problem-solving skills.",
    icon: "🧠",
    imageUrl: "/accenture.png",
    certificateUrl: "/accenturecert1 copy.png",
  },
  {
    title: "PepsiCo Advanced Software Engineering Job Simulation",
    description: "Developed engineering solutions using CI/CD and Azure, improving system visualization and development skills.",
    icon: "🔧",
    imageUrl: "/pepsico.png",
    certificateUrl: "/pepsicocert1.png",
  },
  {
    title: "British Airways Data Science Job Simulation",
    description: "Conducted data-driven simulation and machine learning projects to optimize operational strategies.",
    icon: "✈️",
    imageUrl: "/britishairways.png",
    certificateUrl: "/britishairways-certificate1.png",
  },
  {
    title: "GE Aerospace Digital Technology Exploration",
    description: "Implemented Vue.js UI features, enhancing user experience and system efficiency.",
    icon: "💻",
    imageUrl: "/geaerospace.png",
    certificateUrl: "/ge2.png",
  },
  {
    title: "Bright Network Internship Experiences",
    description: "Engaged with industry leaders in technology consulting, gaining insights into IoT and digital operations.",
    icon: "💻",
    imageUrl: "/brightnetwork.jpeg",
    certificateUrl: "/brightnetwork-certificate.png",
  },
] as const;
