"use client";

import {
  Header,
  ImpactLeaderboard,
  HeartbeatDashboard,
  Home,
  Footer
} from "../components/index";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#020617]">
      <Header />
      
      {/* Add the Home component as Hero section below Header */}
      <div className="w-full">
        <Home />
      </div>
      
      <main className="flex-grow px-6 py-8 max-w-screen-2xl mx-auto w-full">
        {/* Main content container */}
        <div className="flex flex-col gap-8">
          
          {/* Two-column layout for dashboard components */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left component - ImpactLeaderboard takes 2/5 of the space */}
            <div className="lg:col-span-2 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50 shadow-lg h-fit">
              <ImpactLeaderboard />
            </div>
            
            {/* Right component - HeartbeatDashboard takes 3/5 of the space */}
            <div className="lg:col-span-3 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50 shadow-lg">
              <HeartbeatDashboard />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;