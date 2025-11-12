import React from 'react';

// Props are unchanged
interface HeaderProps {
  onToggleSettings: () => void;
}

// SVG Icon component is unchanged
const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);


const Header: React.FC<HeaderProps> = ({ onToggleSettings }) => {
  return (
    <header 
      className="flex items-center justify-between px-6 py-4 z-20 flex-shrink-0"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* The old logo and h1 are replaced with a single image tag */}
      <div className="flex items-center">
        <img 
          src="/Logo.png" 
          alt="ThinkAI Logo" 
          className="h-8 w-auto" // Sets the height to match the old logo, width scales automatically
        />
      </div>
      
      {/* The robot emoji avatar remains unchanged */}
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: '#e5e7eb',
          fontSize: '20px',
        }}
      >
        🤖
      </div>
    </header>
  );
};

export default Header;