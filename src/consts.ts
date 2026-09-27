import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Liam Yang",
  NUM_POSTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Liam Yang, manufacturing engineer. Factory layouts, material flow, and notes on the work.",
};

export const WRITING: Metadata = {
  TITLE: "Writing",
  DESCRIPTION: "Plain-language notes on factory layout, material flow, and industrial engineering.",
};

export const RESUME: Metadata = {
  TITLE: "Resume",
  DESCRIPTION: "Experience and education of Liam Yang.",
};

export const SOCIALS: Socials = [
  {
    NAME: "中文博客",
    HREF: "https://landisland.blog",
  },
  {
    NAME: "github",
    HREF: "https://github.com/landisland",
  },
];
