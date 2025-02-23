import { Badge } from "@tremor/react";

export const aiTrends = [
  { label: "#MultimodalAI", color: "bg-indigo-500" },
  { label: "#AIAgents", color: "bg-purple-500" },
  { label: "#GenAI", color: "bg-blue-500" },
  { label: "#FutureOfWork", color: "bg-pink-500" },
  { label: "#AIInnovation", color: "bg-cyan-500" }
];

export const AITrends = () => {
  return (
    <div className="flex flex-wrap gap-2">
      {aiTrends.map((trend) => (
        <span key={trend.label} className={`${trend.color} text-white px-2 py-1 rounded-full text-sm`}>
          {trend.label}
        </span>
      ))}
    </div>
  );
};
