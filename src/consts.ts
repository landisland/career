import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Liam Yang",
  NUM_POSTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Liam Yang, manufacturing engineer working on layout design. Writing, projects, and a short resume.",
};

export const WRITING: Metadata = {
  TITLE: "Writing",
  DESCRIPTION: "Plain-language notes on layout design, industrial engineering, and the work along the way.",
};

export const RESUME: Metadata = {
  TITLE: "Resume",
  DESCRIPTION: "Experience and education of Liam Yang.",
};

// Paste your LinkedIn profile URL here. The "Elsewhere" section stays hidden while it's empty.
export const SOCIALS: Socials = [
  {
    NAME: "LinkedIn",
    HREF: "",
  },
];
