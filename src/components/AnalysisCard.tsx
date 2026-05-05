import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { VideoAnalysis } from '@/lib/firestore';
import { formatDate } from '@/lib/utils';

interface AnalysisCardProps {
    data: VideoAnalysis;
}

export const AnalysisCard = ({ data }: AnalysisCardProps) => {
    const { channelTitle, videoTitle, thumbnail, publishedAt, results: analyses } = data;
    const date = formatDate(publishedAt);

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-[#004d61]/30 transition-all duration-500 group">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={thumbnail}
                    alt={videoTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4a066] bg-[#004d61]/40 backdrop-blur-md px-2 py-1 rounded-md border border-[#004d61]/20 mb-2 inline-block">
                        {channelTitle}
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {videoTitle}
                    </h3>
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between text-[10px] text-gray-500 border-b border-white/5 pb-3">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {date}
                    </span>
                    <span className="italic">AI Analizi Tamamlandı</span>
                </div>

                <div className="space-y-3">
                    {analyses.map((item, idx) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm text-slate-200">{item.asset}</span>
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
                                    item.recommendation === 'AL' ? "text-emerald-400 bg-emerald-900/30 border border-emerald-500/20" :
                                        item.recommendation === 'SAT' ? "text-rose-400 bg-rose-900/30 border border-rose-500/20" :
                                            "text-amber-400 bg-amber-900/30 border border-amber-500/20"
                                )}>
                                    {item.recommendation === 'AL' ? <TrendingUp className="w-3 h-3" /> :
                                        item.recommendation === 'SAT' ? <TrendingDown className="w-3 h-3" /> :
                                            <Minus className="w-3 h-3" />}
                                    {item.recommendation}
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-500 mb-2">
                                <span className="text-gray-500 mr-1">Vade:</span> {item.timeframe}
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                "{item.reasoning}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
