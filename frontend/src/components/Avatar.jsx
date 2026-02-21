import React from 'react';

const Avatar = ({ src, name, size = "large", className = "" }) => {
    const initials = name ? name.charAt(0).toUpperCase() : "?";

    const sizeClasses = {
        small: "w-10 h-10 text-sm",
        medium: "w-16 h-16 text-xl",
        large: "w-24 h-24 text-3xl",
        xl: "w-32 h-32 text-4xl"
    };

    const currentSizeClass = sizeClasses[size] || sizeClasses.large;

    if (src) {
        // If src is a relative path starting with /uploads, prepend the backend URL if needed
        // Assuming backend is at http://localhost:5000
        const fullSrc = src.startsWith('http') ? src : `http://localhost:5000${src}`;

        return (
            <div className={`${currentSizeClass} rounded-2xl overflow-hidden shadow-lg border-4 border-white ${className}`}>
                <img
                    src={fullSrc}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
                <div style={{ display: 'none' }} className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black">
                    {initials}
                </div>
            </div>
        );
    }

    return (
        <div className={`${currentSizeClass} rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg border-4 border-white ${className}`}>
            {initials}
        </div>
    );
};

export default Avatar;
