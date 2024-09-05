"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import { sendEmail } from "@/actions/sendEmail";
import SubmitBtn from "./submit-btn";
import toast from "react-hot-toast";
import { useTheme } from '@/context/theme-context'; // Import useTheme to access the current theme

export default function Contact() {
  const { ref } = useSectionInView("Contact");
  const { theme } = useTheme(); // Use the theme context

  return (
    <motion.section
      id="contact"
      ref={ref}
      className={`mb-20 sm:mb-28 w-[min(100%,38rem)] text-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-transparent'} ${theme === 'dark' ? 'text-white' : 'text-black'}`}
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      transition={{
        duration: 1,
      }}
      viewport={{
        once: true,
      }}
    >
      <SectionHeading>Contact me</SectionHeading>

      <p className={`-mt-6`}>
        Please contact me directly at{" "}
        <a className="underline" href="mailto:a.alholaiel@gmail.com">
          a.alholaiel@gmail.com
        </a>{" "}
        or through this form.
      </p>

      <form
        className={`mt-10 flex flex-col`}
        action={async (formData) => {
          const { data, error } = await sendEmail(formData);

          if (error) {
            toast.error(error);
            return;
          }

          toast.success("Email sent successfully!");
        }}
      >
        <input
          className={`h-14 px-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800' : 'bg-transparent'} dark:bg-opacity-80 dark:focus:bg-opacity-100 transition-all dark:outline-none`}
          name="senderEmail"
          type="email"
          required
          maxLength={500}
          placeholder="Your email"
        />
        <textarea
          className={`h-52 my-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800' : 'bg-transparent'} dark:bg-opacity-80 dark:focus:bg-opacity-100 transition-all dark:outline-none`}
          name="message"
          placeholder=" Your message"
          required
          maxLength={5000}
          style={{padding: '1rem'}} // Added padding to the placeholder
        />
        <SubmitBtn />
      </form>
    </motion.section>
  );
}

