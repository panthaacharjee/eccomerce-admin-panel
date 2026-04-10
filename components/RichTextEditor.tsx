// components/RichTextEditor.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import JoditEditor to avoid SSR issues
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] border border-gray-300 rounded-lg animate-pulse bg-gray-100"></div>
  ),
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter detailed product description...",
  className = "",
}) => {
  const editor = useRef(null);
  const [config, setConfig] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    setConfig({
      readonly: false,
      placeholder,
      height: 350,
      theme: "default",
      toolbarButtonSize: "medium",
      buttons: [
        "source",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "ul",
        "ol",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "video",
        "table",
        "link",
        "|",
        "align",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "fullsize",
        "preview",
      ],
      removeButtons: ["about", "print", "symbol", "copyformat", "dots"],
      uploader: {
        insertImageAsBase64URI: true,
        imagesExtensions: ["jpg", "png", "jpeg", "gif"],
        filesVariableName: function (t: any) {
          return "files";
        },
      },
      style: {
        background: "#ffffff",
        color: "#111827",
      },
      controls: {
        fontsize: {
          list: [
            "8",
            "9",
            "10",
            "11",
            "12",
            "14",
            "16",
            "18",
            "24",
            "30",
            "36",
            "48",
            "60",
            "72",
            "96",
          ],
        },
        font: {
          list: {
            "Arial,sans-serif": "Arial",
            "'Helvetica Neue',Helvetica,Arial,sans-serif": "Helvetica",
            "Georgia,serif": "Georgia",
            "Impact,Charcoal,sans-serif": "Impact",
            "'Times New Roman',Times,serif": "Times New Roman",
            "Verdana,Geneva,sans-serif": "Verdana",
          },
        },
      },
      colors: {
        greyscale: [
          "#000000",
          "#434343",
          "#666666",
          "#999999",
          "#B7B7B7",
          "#CCCCCC",
          "#D9D9D9",
          "#EFEFEF",
          "#F3F3F3",
          "#FFFFFF",
        ],
      },
      disablePlugins: ["mobile", "speechRecognize", "addNewLine"],
      events: {},
      textIcons: false,
      direction: "ltr",
      iframe: true,
      iframeStyle:
        "html{margin:0;padding:0;min-height:0;background:#fff}body{margin:8px;padding:0;font-family:sans-serif;font-size:14px;color:#111827}",
      defaultMode: "1",
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
    });
  }, [placeholder]);

  // Handle SSR
  if (!isClient) {
    return (
      <div className={`border border-gray-400 rounded-lg ${className}`}>
        <div className="min-h-[350px] p-4 bg-white">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full resize-none bg-transparent outline-none"
            rows={10}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="border border-gray-400 rounded-lg overflow-hidden">
        {config && (
          <JoditEditor
            ref={editor}
            value={value}
            config={config}
            onBlur={(newValue: string) => onChange(newValue)}
            onChange={(newValue: string) => onChange(newValue)}
          />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
