// Edit this file to update the timeline on the home page and the resume page.
// Newest first. Set `current: true` on the role that should get the green dot.
// `focus` is the headline (what the work was); `org` and `title` sit underneath.

import type { TimelineEntry, EducationEntry } from "@types";

export const TIMELINE: TimelineEntry[] = [
  {
    focus: "Factory Layout Design",
    org: "Tesla",
    title: "Manufacturing Engineer",
    period: "Late 2025 – Present",
    location: "Reno, NV",
    summary:
      "Plan layouts for manufacturing sites across North America: where equipment goes, how material flows between processes, and where automated vehicles run. Work with process, automation, and construction teams to take a layout from concept to design sign-off.",
    current: true,
  },
  {
    focus: "Layout Design for Collision, Service & Used Car Hubs",
    org: "Tesla",
    title: "Industrial Engineer",
    period: "Feb 2024 – Late 2025",
    location: "Houston, TX → Reno, NV",
    summary:
      "Designed layouts for collision centers, service centers, and used car hubs, and turned the ones that worked into standards that new sites can start from.",
    highlights: [
      "Built prototype layouts for used car hubs in several sizes, each with defined bay counts, staffing, and capacity assumptions.",
      "Created a small / medium / large block library of standard facility modules in CAD and Revit, used across 20+ sites.",
      "Used simulation and ROI models to size equipment and compare layout options before capital was committed.",
      "Turned field feedback from site teams into lessons learned and design standards.",
    ],
  },
  {
    focus: "Factory Layout & Material Flow",
    org: "Tesla",
    title: "Powertrain",
    period: "May 2023 – Dec 2023",
    location: "Austin, TX",
    summary:
      "Developed layouts and material flow paths for powertrain production shops and their support spaces.",
    highlights: [
      "Ran material flow analysis to set the shop and dock configuration, cutting raw material travel distance.",
      "Built parametric Revit models for support spaces to speed up layout iterations.",
    ],
  },
  {
    focus: "Continuous Improvement",
    org: "Volvo Group · Mack Trucks",
    period: "Aug 2022 – Dec 2022",
    location: "Macungie, PA",
    summary:
      "Applied lean methods on truck subassembly stations to remove non-value-added work.",
    highlights: [
      "Used 5S, 5 Whys, spaghetti charts, A3, and FMEA on subassembly stations.",
      "Led kaizen events focused on workplace organization and standard work.",
    ],
  },
];

export const EDUCATION: EducationEntry[] = [
  {
    school: "Texas A&M University",
    degree: "M.S. Industrial Engineering",
    period: "2023",
  },
];
