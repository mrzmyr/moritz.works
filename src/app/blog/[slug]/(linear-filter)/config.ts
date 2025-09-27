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
