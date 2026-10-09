"use client";

import { useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "../public/swagger-dark.css";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function SwaggerViewer({ spec }: { spec: any }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
      <div
        className="flex items-center justify-between cursor-pointer p-2 bg-gray-900 border-b border-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-medium">API Documentation</span>
        </div>
        <span className="text-gray-400 text-xs">
          {isOpen ? "Click to collapse" : "Click to expand"}
        </span>
      </div>

      {isOpen && (
        <div className="overflow-hidden">
          <SwaggerUI spec={spec} />
        </div>
      )}
    </div>
  );
}
