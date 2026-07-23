"use client";

import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.random() * 25;
        return Math.min(prev + increment, 95);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-md">
      <div
        className={`h-1.5 rounded-full overflow-hidden dark:bg-slate-700 bg-slate-300`}
      >
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p
        className={`mt-2 text-center text-xs font-medium  dark:text-slate-400 text-slate-600`}
      >
        {Math.round(progress)}%
      </p>
    </div>
  );
}
