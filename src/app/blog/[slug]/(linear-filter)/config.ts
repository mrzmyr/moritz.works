export const SYSTEM_PROMPT = `
Parse natural language filter descriptions into structured JSON format.
If you see multiple conditions, return an array of conditions.
If the user asks for a filter that is not possible, return an empty array.

# Examples
- "features that we shipped last week"  
  (label: include, value: feature; date: after, value: "date from last week", unit: days)  

- "bugs from customer support"  
  (label: include, value: customer-support; label: include, value: bug)  

Today's date is ${new Date().toISOString().split("T")[0]}
`;

export const LABEL_COLORS = {
  gray: "#a4a8ae",
  neutral: "#95a2b3",
  green: "#4cb782",
  teal: "#26b5ce",
  blue: "#5e6ad2",
  yellow: "#f0bf00",
  orange: "#e99243",
  brown: "#c99d96",
  red: "#eb5757",
};

import type { Issue } from "./types";

const today = new Date();
const lastWeek = new Date();
lastWeek.setDate(today.getDate() - 7);

export const EXAMPLE_ISSUES: Issue[] = [
  {
    id: "LI-1131",
    title: "Fix login button not responding",
    createdAt: lastWeek.toISOString(),
    labels: ["bug"],
    status: "backlog",
  },
  {
    id: "LI-1232",
    title: "Add dark mode support",
    createdAt: lastWeek.toISOString(),
    labels: ["feature"],
    status: "in_progress",
  },
  {
    id: "LI-1331",
    title: "Resolve payment processing error",
    createdAt: lastWeek.toISOString(),
    labels: ["customer-support"],
    status: "done",
  },
  {
    id: "LI-1401",
    title: "Improve dashboard loading speed",
    createdAt: lastWeek.toISOString(),
    labels: ["bug", "feature"],
    status: "in_review",
  },
  {
    id: "LI-1502",
    title: "Implement user profile editing",
    createdAt: lastWeek.toISOString(),
    labels: ["feature"],
    status: "done",
  },
  {
    id: "LI-1603",
    title: "Fix notification dropdown not closing",
    createdAt: lastWeek.toISOString(),
    labels: ["customer-support", "bug"],
    status: "in_progress",
  },
  {
    id: "LI-1704",
    title: "Add password reset functionality",
    createdAt: lastWeek.toISOString(),
    labels: ["feature", "customer-support"],
    status: "todo",
  },
  {
    id: "LI-1805",
    title: "Resolve typo in settings page",
    createdAt: today.toISOString(),
    labels: ["bug"],
    status: "done",
  },
  {
    id: "LI-1906",
    title: "Enable multi-language support",
    createdAt: today.toISOString(),
    labels: ["feature", "customer-support"],
    status: "in_progress",
  },
  {
    id: "LI-1007",
    title: "Investigate slow API response times",
    createdAt: today.toISOString(),
    labels: ["customer-support"],
    status: "backlog",
  },
  {
    id: "LI-1108",
    title: "Fix broken image links on homepage",
    createdAt: today.toISOString(),
    labels: ["bug", "feature"],
    status: "done",
  },
  {
    id: "LI-1209",
    title: "Add export to CSV feature",
    createdAt: today.toISOString(),
    labels: ["feature"],
    status: "in_progress",
  },
  {
    id: "LI-1310",
    title: "Resolve crash on mobile devices",
    createdAt: today.toISOString(),
    labels: ["customer-support", "bug"],
    status: "todo",
  },
];
