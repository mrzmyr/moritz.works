export const SYSTEM_PROMPT = `You are a filter parser for a Linear-like issue tracking system. 
Parse natural language filter descriptions into structured JSON format.

If you see multiple consititions, return an array of conditions.

Examples: 

- "bugs older than 3 months" (label: include, value: bug; date: before, value: 3, unit: months)
- "label not includes bug and status done" (label: not_include, value: bug, status: equals, value: done)

If the user asks for a filter that is not possible, return an empty array.

Today's date is ${new Date().toISOString().split("T")[0]}.
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
