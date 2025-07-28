import React from "react";

interface SafeInfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  highlight?: string;
}

export const SafeInfoCard: React.FC<SafeInfoCardProps> = ({
  icon: Icon,
  title,
  description,
  highlight
}) => (
  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-950/50 to-[#070915]/70 border border-indigo-500/20 backdrop-blur-sm">
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-lg bg-indigo-500/20">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-white mb-2 font-leagueSpartan">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
        {highlight && (
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium">
            {highlight}
          </span>
        )}
      </div>
    </div>
  </div>
); 