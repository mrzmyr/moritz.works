import {
  SandpackCodeEditor,
  SandpackLayout,
  type SandpackOptions,
  type SandpackPredefinedTemplate,
  SandpackPreview,
  SandpackProvider,
  type SandpackSetup,
} from "@codesandbox/sandpack-react";

export const FigureEditor = ({
  files,
  options,
  template,
  customSetup,
  ...props
}: {
  files: Record<string, string>;
  options?: SandpackOptions;
  template: SandpackPredefinedTemplate;
  customSetup?: SandpackSetup;
}) => {
  return (
    <SandpackProvider
      options={options}
      template={template}
      files={files}
      customSetup={customSetup}
      {...props}
      theme="auto"
    >
      <SandpackLayout className="border-0!">
        <SandpackCodeEditor showTabs={false} className="min-h-[600px]" />
        <SandpackPreview
          className="min-h-[600px]"
          showOpenInCodeSandbox={false}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
};
