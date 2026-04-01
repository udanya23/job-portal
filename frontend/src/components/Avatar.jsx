import React from 'react';

const Avatar = ({ src, name, size = "large", className = "" }) => {
  const initials = name ? name.charAt(0).toUpperCase() : "?";

  const sizeClasses = {
    small: "w-10 h-10 text-xs",
    medium: "w-16 h-16 text-lg",
    large: "w-24 h-24 text-2xl",
    xl: "w-32 h-32 text-4xl"
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.large;

  const containerCls = `${currentSizeClass} rounded-2xl flex items-center justify-center font-black shadow-lg border-4 border-white overflow-hidden shrink-0 ${className}`;

  if (src) {
    const fullSrc = src.startsWith('http') ? src : `http://localhost:5000${src}`;
    return (
      <div className={containerCls}>
        <img
          src={fullSrc}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div style={{ display: 'none' }} className="w-full h-full bg-emerald-600 text-white">
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerCls} bg-emerald-600 text-white`}>
      {initials}
    </div>
  );
};

export default Avatar;
