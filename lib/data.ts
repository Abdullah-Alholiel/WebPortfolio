import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact, FaCloud, FaDatabase, FaCode, FaBrain, FaLightbulb, FaBalanceScale, FaPaperPlane, FaSitemap, FaTruck } from "react-icons/fa";
import cloudOfThingsImg from "@/public/cloud-of-things.png";
import digitalMigrationImg from "@/public/digital-migration.png";
import azureHybridImg from "@/public/azure-hybrid.jpeg";
import ecommerceImg from "@/public/ecommerce.png"; // Ensure correct path
import electricaircraftImg from "@/public/electric-aircraft-img.png";


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
    title: "Digital Strategist",
    location: "EndUp, Manchester, UK",
    description:
      "Developed digital strategies that enhanced customer engagement by 25%, drove revenue growth by 30% through e-commerce, partnerships, and subscriptions. Led migration to a hybrid operational model, reducing infrastructure costs by 40%.",
    icon: React.createElement(CgWorkAlt ),
    date: "01/2023 - 01/2024",
  },
  {
    title: "Digital Consultant",
    location: "CLO, Riyadh, Saudi Arabia",
    description:
      "Executed digital strategies that increased business outcomes for tourism and F&B sectors. Provided data-driven recommendations and conducted comprehensive market research.",
    icon: React.createElement(CgWorkAlt),
    date: "08/2022 - 01/2023",
  },
  {
    title: "Junior System Engineer",
    location: "Novintiq, Cairo, Egypt",
    description:
      "Enhanced IT infrastructure, led a developer training program improving team productivity by 30%. Designed and implemented cloud solutions that reduced costs by 20% and improved system uptime by 15%.",
    icon: React.createElement(FaCloud),
    date: "06/2021 - 06/2022",
  },
  {
    title: "Freelance E-commerce Specialist",
    location: "Self-employed, Liverpool, UK",
    description:
      "Operated an online store, leveraging digital marketing skills to drive sales, leading to a successful qualification for an E-commerce internship at Gao Tek.",
    icon: React.createElement(FaTruck),
      date: "01/2019 - 03/2019",
  },
  // Additional experience based on earlier roles
  {
    title: "Event Organizer",
    location: "City International Schools, Cairo",
    description:
      "Spearheaded school events, generating significant profits and enhancing collaboration across schools.",
    icon: React.createElement(FaSitemap),
    date: "05/2016 - 05/2018",
  },
] as const;
export const projectsData = [
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
      "Created an optimized ERD schema for digital transformation, enhancing data storage, retrieval, and analysis capabilities.",
    tags: [ "SQL", "Data Modelling", "ERD", "Big Data", "ETL", "Database Design", "Scalability", "Business Intelligence"],
    imageUrl: digitalMigrationImg,
  },
  {
    title: "Cloud-Based Hybrid Migration Software Development using Azure",
    description:
      "Developed a Django-based web app integrated with Azure services, achieving efficient deployment and governance compliance.",
    tags: ["Python", "Django", "Azure", "Microservices", "DevOps", "Cloud", "Hybrid Migration", "Software Development", "Cloud Security", "Cloud Computing"],
    imageUrl: azureHybridImg,
  },
  {
    title: "E-commerce Store Development",
    description:
      "Built and managed an online store, applying web development and digital marketing techniques to effectively sell health products.",
tags: ["HTML", "CSS", "Digital Marketing", "Shopify", "E-commerce", "SEO", "Social Media", "Google Analytics"],
    imageUrl: ecommerceImg,
  },
  // Bachelor degree projects
  {
    title: "Design and Simulation of a Fully Electric Aircraft",
    description:
      "Designed and simulated a sustainable, electric aircraft adhering to industry standards, focusing on zero carbon emissions.",
    tags: ["MATLAB", "Aerospace Engineering", "Hybrid Solutions", "Simulation", "Zero Carbon", "Electric Aircraft", ],
    imageUrl: electricaircraftImg, // Placeholder path
  },
] as const;

export const skillsData = [
  "C#", ".NET", "Java", "JavaScript", "Python", "TypeScript",
  "MongoDB", "MySQL", "SQL", "Node.js", "Express", "React",
  "Vue", "Redux", "jQuery", "NoSQL", "Git", "OOP", "Django",
  "Flask", "PHP", "HTML/CSS", "RESTful API", "Azure",
  "Cloud Computing", "AWS", "GCP", "Microservices",
  "CI/CD Pipelines", "DevOps", "Edge Computing", "GitHub Actions",
  "Serverless Functions", "Unit Testing", "Hybrid Solutions",
  "NumPy", "Pandas", "Scikit-learn", "MATLAB", "R",
  "Power BI", "Tableau", "Google Big Query", "Agile", "Six Sigma",
  "Jira", "Trello", "Microsoft 365", "Notion", "CFD", "Creo CAD",
  "Matplotlib"
] as const;

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
  // Additional achievements and certifications
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
