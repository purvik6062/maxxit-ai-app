import React from "react";

interface VaultFormLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const VaultFormLayout: React.FC<VaultFormLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-[#020617] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E4EFFF] mb-4">
            {title}
          </h1>
          <p className="text-lg text-[#8ba1bc] max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-[#0D1321] rounded-2xl border border-[#353940] shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl mx-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultFormLayout;
