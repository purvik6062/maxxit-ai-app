import React from "react";

const VaultInfoPanel: React.FC = () => {
  const infoItems = [
    {
      icon: "💰",
      text: "Vault creation requires a transaction fee (gas)",
    },
    {
      icon: "👤",
      text: "You will be the owner and manager of the created vault",
    },
    {
      icon: "⚙️",
      text: "Fees and policies can be configured to match your investment strategy",
    },
    {
      icon: "🔒",
      text: "The 'Allowed Depositors' policy restricts who can invest in your vault",
    },
    {
      icon: "🔧",
      text: "Some settings can be modified later through the Enzyme interface",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#E4EFFF] mb-4 flex items-center gap-2">
        <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        Important Information
      </h3>
      <ul className="space-y-3">
        {infoItems.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-sm text-[#8ba1bc]"
          >
            <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VaultInfoPanel;
