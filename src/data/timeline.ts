// Edit this file to update the timeline on the home page and the resume page.
// Newest first. Set `current: true` on the role that should get the green dot.

import type { TimelineEntry, EducationEntry } from "@types";

export const TIMELINE: TimelineEntry[] = [
  {
    company: "Tesla",
    team: "Factory Layout Design",
    period: "Late 2025 – Present",
    location: "Reno, NV",
    summary:
      "Factory layout and material flow for manufacturing sites across North America: where equipment goes, how parts move, and how people and robots share the floor.",
    current: true,
  },
  {
    company: "Tesla",
    team: "Layout Design · Collision, Service & Used Car Hubs",
    period: "Feb 2024 – 2025",
    location: "Houston, TX → Reno, NV",
    summary:
      "Designed layouts for collision centers, service centers, and used car hubs, and turned what worked into reusable standards.",
    highlights: [
      "Built a small / medium / large block library of standard facility modules so new sites start from proven designs.",
      "Used simulation and ROI models to size equipment and compare layout options before money was spent.",
      "Collected field feedback from site teams into lessons learned and design standards.",
    ],
  },
  {
    company: "Tesla",
    team: "Factory Layout Design · Powertrain",
    period: "May 2023 – Dec 2023",
    location: "Austin, TX",
    summary:
      "Layouts and material flow paths for powertrain production shops and their support spaces.",
    highlights: [
      "Ran material flow analysis to decide shop and dock configuration.",
      "Built parametric Revit models for support spaces to speed up layout iterations.",
    ],
  },
  {
    company: "Volvo Group · Mack Trucks",
    team: "Continuous Improvement",
    period: "Aug 2022 – Dec 2022",
    location: "Macungie, PA",
    summary:
      "Lean manufacturing on truck subassembly stations.",
    highlights: [
      "Applied 5S, 5 Whys, spaghetti charts, A3, and FMEA to cut non-value-added work.",
      "Led kaizen events focused on workplace organization and standard work.",
    ],
  },
];

export const EDUCATION: EducationEntry[] = [
  {
    school: "Texas A&M University",
    degree: "M.S. Industrial Engineering",
    period: "2021 – 2023",
  },
  {
    school: "Beijing Jiaotong University",
    degree: "B.E. Industrial Engineering",
    period: "2017 – 2021",
  },
];
