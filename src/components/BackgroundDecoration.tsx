"use client";

import React from 'react';

export const BackgroundDecoration = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            overflow: 'hidden',
            pointerEvents: 'none'
        }}>
            {/* Moving Grid */}
            <div className="bg-grid-animate" style={{
                position: 'absolute',
                top: -40,
                left: 0,
                right: 0,
                bottom: 0,
            }} />

            {/* Glow Effects */}
            <div className="bg-glow" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }} />

            {/* Decorative Lines */}
            <div className="chart-line" style={{ top: '20%', animationDelay: '0s' }} />
            <div className="chart-line" style={{ top: '45%', animationDelay: '-5s', opacity: 0.05 }} />
            <div className="chart-line" style={{ top: '75%', animationDelay: '-12s' }} />

            {/* Subtle Floating Shapes */}
            <div style={{
                position: 'absolute',
                top: '10%',
                right: '5%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 77, 97, 0.03) 0%, transparent 70%)',
                filter: 'blur(60px)',
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                left: '5%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(196, 160, 102, 0.03) 0%, transparent 70%)',
                filter: 'blur(80px)',
            }} />
        </div>
    );
};
