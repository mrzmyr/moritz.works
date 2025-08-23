"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Video = ({
	src,
	...props
}: { src: string } & React.VideoHTMLAttributes<HTMLVideoElement>) => {
	const [isPlaying, setIsPlaying] = useState(false);

	const ref = useRef<HTMLVideoElement>(null);

	const togglePlay = () => {
		if (ref.current) {
			setIsPlaying((prev) => !prev);
			ref.current.paused ? ref.current.play() : ref.current.pause();
		}
	};

	useEffect(() => {
		if (ref.current) {
			setIsPlaying(!ref.current.paused);
		}
	}, []);

	return (
		<div className="relative w-full h-full group">
			<video
				ref={ref}
				src={src}
				autoPlay
				muted
				loop
				className="w-full h-full object-cover"
				{...props}
			/>
			<button
				onClick={togglePlay}
				type="button"
				className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 h-15 w-15 bg-black/80 rounded-full flex items-center justify-center cursor-pointer group-hover:opacity-100 ease-out opacity-0 transition-opacity duration-300"
			>
				{isPlaying ? (
					<PauseIcon className="w-6 h-6 text-white fill-white" />
				) : (
					<PlayIcon className="w-6 h-6 text-white fill-white" />
				)}
			</button>
		</div>
	);
};

export default Video;
