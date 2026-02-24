import Image from "next/image";

export function AgentOpsPreview() {
  return (
    <div className="w-full h-[220px] overflow-hidden rounded-lg">
      <Image
        src="/agent-ops-preview-light.png"
        alt="Agent Ops canvas preview"
        width={1012}
        height={504}
        className="w-full h-full object-cover object-left-top dark:hidden"
      />
      <Image
        src="/agent-ops-preview.png"
        alt="Agent Ops canvas preview"
        width={1012}
        height={504}
        className="w-full h-full object-cover object-left-top hidden dark:block"
      />
    </div>
  );
}
