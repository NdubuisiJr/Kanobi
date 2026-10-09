
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function ConsoleOutput({ logs }: { logs: string }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-black text-green-400 rounded-lg font-mono text-sm">
      <div
        className="flex items-center justify-between cursor-pointer p-2 bg-gray-800 rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span>Build and Deployment log</span>
        </div>
        <span className="text-gray-400 text-xs">
          {isOpen ? "Click to collapse" : "Click to expand"}
        </span>
      </div>

      {isOpen && (
        <div className="p-4 overflow-auto h-200 whitespace-pre-wrap">
          {logs}
        </div>
      )}
    </div>
  );
}
