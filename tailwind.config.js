/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	plugins: [require("@tailwindcss/typography")],
	theme: {
		extend: {
			typography: ({ theme }) => ({
				neutral: {
					css: {
						"--tw-prose-body": theme("colors.neutral[700]"),
						"--tw-prose-headings": theme("colors.neutral[900]"),
						"--tw-prose-lead": theme("colors.neutral[600]"),
						"--tw-prose-links": theme("colors.neutral[900]"),
						"--tw-prose-bold": theme("colors.neutral[900]"),
						"--tw-prose-counters": theme("colors.neutral[500]"),
						"--tw-prose-bullets": theme("colors.neutral[300]"),
						"--tw-prose-hr": theme("colors.neutral[200]"),
						"--tw-prose-quotes": theme("colors.neutral[900]"),
						"--tw-prose-quote-borders": theme("colors.neutral[200]"),
						"--tw-prose-captions": theme("colors.neutral[500]"),
						"--tw-prose-code": theme("colors.neutral[900]"),
						"--tw-prose-pre-code": theme("colors.neutral[200]"),
						"--tw-prose-pre-bg": theme("colors.neutral[800]"),
						"--tw-prose-th-borders": theme("colors.neutral[300]"),
						"--tw-prose-td-borders": theme("colors.neutral[200]"),
					},
				},
			}),
		},
	},
};
