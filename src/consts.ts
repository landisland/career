import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Liam Yang",
  NUM_POSTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Liam Yang, an engineer who designs systems. Writing, projects, and a short resume.",
};

export const WRITING: Metadata = {
  TITLE: "Writing",
  DESCRIPTION: "Plain-language notes on layout design, industrial engineering, and the work along the way.",
};

export const RESUME: Metadata = {
  TITLE: "Resume",
  DESCRIPTION: "Experience and education of Liam Yang.",
};

// Links in the "Elsewhere" section on the home page. Entries with an empty HREF are hidden.
export const SOCIALS: Socials = [
  {
    NAME: "LinkedIn",
    HREF: "https://www.linkedin.com/in/chunliangyang/",
  },
];
