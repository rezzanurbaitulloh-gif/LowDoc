"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";

const categories = [
  "All Categories",
  "Office",
  "Apple Ecosystem",
  "Data & Spreadsheets",
  "E-Books & Publishing",
  "CAD & Engineering",
  "Legacy Systems",
  "Text & Markup",
];

const formats = [
  "docx", "doc", "pdf", "xlsx", "xls", "pptx", "ppt", "odt", "ods", "odp",
  "pages", "numbers", "key", "epub", "mobi", "azw3", "fb2", "html", "md",
  "txt", "rtf", "csv", "tsv", "djvu", "xps", "ps", "wpd", "wps", "dwg",
  "dxf", "vsd", "vsdx", "pub", "indd", "tiff", "tif", "jpg", "png", "svg",
];

export const ConversionControlBar = ({
  onFromChange,
  onToChange,
}: {
  onFromChange: (format: string) => void;
  onToChange: (format: string) => void;
}) => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");

  const filteredFormats = formats.filter((format) => {
    if (selectedCategory === "All Categories") return true;
    if (selectedCategory === "Office" && ["docx", "doc", "xlsx", "xls", "pptx", "ppt", "odt", "ods", "odp", "rtf", "txt"].includes(format)) return true;
    if (selectedCategory === "Apple Ecosystem" && ["pages", "numbers", "key"].includes(format)) return true;
    if (selectedCategory === "Data & Spreadsheets" && ["xlsx", "xls", "ods", "csv", "tsv"].includes(format)) return true;
    if (selectedCategory === "E-Books & Publishing" && ["epub", "mobi", "azw3", "fb2", "pdf"].includes(format)) return true;
    if (selectedCategory === "CAD & Engineering" && ["dwg", "dxf", "vsd", "vsdx"].includes(format)) return true;
    if (selectedCategory === "Legacy Systems" && ["wpd", "wps"].includes(format)) return true;
    if (selectedCategory === "Text & Markup" && ["html", "md", "txt", "rtf"].includes(format)) return true;
    return false;
  });

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="text-blue-500" size={18} />
          <select
            className="bg-slate-700 text-white p-2 rounded border border-slate-600"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Search className="text-blue-500" size={18} />
            <input
              type="text"
              placeholder="Search FROM format..."
              className="bg-slate-700 text-white p-2 rounded border border-slate-600 w-full"
              value={fromSearch}
              onChange={(e) => setFromSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {filteredFormats
              .filter((format) => format.includes(fromSearch.toLowerCase()))
              .map((format) => (
                <button
                  key={format}
                  className="bg-slate-700 text-white p-2 rounded border border-slate-600 hover:bg-slate-600"
                  onClick={() => onFromChange(format)}
                >
                  {format}
                </button>
              ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Search className="text-blue-500" size={18} />
            <input
              type="text"
              placeholder="Search TO format..."
              className="bg-slate-700 text-white p-2 rounded border border-slate-600 w-full"
              value={toSearch}
              onChange={(e) => setToSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {filteredFormats
              .filter((format) => format.includes(toSearch.toLowerCase()))
              .map((format) => (
                <button
                  key={format}
                  className="bg-slate-700 text-white p-2 rounded border border-slate-600 hover:bg-slate-600"
                  onClick={() => onToChange(format)}
                >
                  {format}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};