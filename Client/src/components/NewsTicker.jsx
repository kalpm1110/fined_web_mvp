import React, { useState, useEffect } from 'react';
import instance from '../lib/axios';

const NewsTicker = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await instance.get('/news/top-india-finance');
                if (res.data && Array.isArray(res.data)) {
                    setNews(res.data);
                }
            } catch (err) {
                console.error('Error fetching ticker news:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (!loading && (!news || news.length === 0)) {
        return null; // Hide ticker if no news
    }

    return (
        <div className="w-full bg-[#1a1a1a] border-t border-b border-gray-800 shadow-sm overflow-hidden z-30">
            <div className="max-w-[1400px] mx-auto h-9 sm:h-10 flex items-center relative">
                {/* Left Label - Market/News Indicator */}
                <div className="px-3 sm:px-4 h-full flex items-center justify-center bg-[#1a1a1a] z-20 relative border-r border-gray-800">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tighter whitespace-nowrap text-amber-400">
                        Top News
                    </span>
                </div>

                {/* Ticker Content */}
                <div className="flex-grow overflow-hidden relative h-full flex items-center">
                    {loading ? (
                        <div className="flex w-full px-4 items-center">
                            <div className="h-1 bg-gray-800 rounded-full w-full animate-pulse"></div>
                        </div>
                    ) : (
                        <div className="ticker-wrapper flex whitespace-nowrap items-center hover:pause-scroll">
                            {/* Duplicate news for seamless loop */}
                            {[...news, ...news].map((item, index) => (
                                <a
                                    key={index}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-5 sm:px-7 text-gray-300 hover:text-white transition-all duration-300 group border-r border-gray-800 last:border-r-0"
                                >
                                    <span className="text-[11px] sm:text-[13px] font-medium leading-none group-hover:underline underline-offset-4 decoration-amber-400/50">
                                        {item.title}
                                    </span>
                                    <span className="ml-3 text-[10px] text-gray-500 group-hover:text-amber-400">|</span>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Gradient Fade */}
                <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#1a1a1a] to-transparent z-10 pointer-events-none"></div>
            </div>

            <style>{`
                .ticker-wrapper {
                    display: flex;
                    animation: ticker 90s linear infinite;
                    will-change: transform;
                }

                .ticker-wrapper:hover {
                    animation-play-state: paused;
                }

                @keyframes ticker {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                @media (max-width: 640px) {
                    .ticker-wrapper {
                        animation-duration: 60s;
                    }
                }
            `}</style>
        </div>
    );
};

export default NewsTicker;
