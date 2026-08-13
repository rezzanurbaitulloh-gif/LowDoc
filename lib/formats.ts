export type DocFormat =
  | "pdf" | "docx" | "doc" | "xlsx" | "xls" | "pptx" | "ppt"
  | "odt" | "ods" | "odp" | "pages" | "numbers" | "key"
  | "epub" | "mobi" | "azw3" | "fb2" | "html" | "md"
  | "txt" | "rtf" | "csv" | "tsv" | "djvu" | "xps" | "ps"
  | "wpd" | "wps" | "dwg" | "dxf" | "vsd" | "vsdx"
  | "pub" | "indd" | "tiff" | "tif" | "jpg" | "png" | "svg";

export type LogLevel = "info" | "warn" | "error" | "success";

export type LogLine = {
  seq: number;
  level: LogLevel;
  message: string;
  timestamp: Date;
};