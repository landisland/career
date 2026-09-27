export type Site = {
  NAME: string;
  NUM_POSTS_ON_HOMEPAGE: number;
};

export type Metadata = {
  TITLE: string;
  DESCRIPTION: string;
};

export type Socials = {
  NAME: string;
  HREF: string;
}[];

export type TimelineEntry = {
  focus: string;
  org: string;
  title?: string;
  period: string;
  location: string;
  summary: string;
  highlights?: string[];
  current?: boolean;
};

export type EducationEntry = {
  school: string;
  degree: string;
  period: string;
};

export type ProjectEntry = {
  title: string;
  description: string;
  href?: string;
};
