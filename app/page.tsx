'use client';

import About from "@/components/about";
import Contact from "@/components/contact";
import Experience from "@/components/experience";
import Intro from "@/components/intro";
import Projects from "@/components/projects";
import Skills from "@/components/skills";
import Achievements from "@/components/achievements";
import Mentorship from "@/components/mentorship";
import Ventures from "@/components/ventures";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-4">
      <Intro />
      <About />
      <Ventures />
      <Projects />
      <Skills />
      <Achievements />
      <Mentorship />
      <Experience />
      <Contact />
    </main>
  );
}
