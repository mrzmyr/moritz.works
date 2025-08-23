import Script from "next/script";
import { GITHUB_REPO } from "@/config/app";

const PostComments = ({ slug }: { slug: string }) => {
	return (
		<Script
			src="https://utteranc.es/client.js"
			// @ts-expect-error - this is a valid attribute
			repo={GITHUB_REPO}
			issue-term={slug}
			theme="preferred-color-scheme"
			crossorigin="anonymous"
			async
		/>
	);
};

export default PostComments;
