"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export const Dropzone = ({ onDrop }: { onDrop: (files: File[]) => void }) => {
  const onDropAccepted = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropAccepted,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/msword": [".doc"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.apple.pages": [".pages"],
      "application/vnd.apple.numbers": [".numbers"],
      "application/vnd.apple.keynote": [".key"],
      "application/epub+zip": [".epub"],
      "application/x-mobipocket-ebook": [".mobi"],
      "text/markdown": [".md"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/svg+xml": [".svg"],
      "image/tiff": [".tiff", ".tif"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-500">Drop the files here ...</p>
      ) : (
        <p>Drag & drop files here, or click to select files</p>
      )}
    </div>
  );
};