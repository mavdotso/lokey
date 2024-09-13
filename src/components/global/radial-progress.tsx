import React from "react";

export function RadialProgress({ progress }: { progress: number }) {
    return (
        <div
            x-data="scrollProgress"
            className="inline-flex justify-center items-center rounded-full overflow-hidden"
        >
            <svg className="w-20 h-20">
                <circle
                    className="text-muted"
                    strokeWidth={"4"}
                    stroke="currentColor"
                    fill="transparent"
                    r="30"
                    cx="40"
                    cy="40"
                />
                <circle
                    className="text-primary"
                    strokeWidth="4"
                    strokeDasharray={30 * 2 * Math.PI}
                    strokeDashoffset={100 - (progress / 100) * 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="30"
                    cx="40"
                    cy="40"
                />
            </svg>
            <span className="absolute text-primary text-sm" x-text="`${percent}%`">
                {progress}%
            </span>
        </div>
    );
}