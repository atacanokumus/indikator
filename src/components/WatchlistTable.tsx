"use client";

import { useState, useMemo } from 'react';
import { VideoAnalysis } from '@/lib/firestore';
import { TrendingUp, TrendingDown, Minus, Search, ChevronRight, Activity, Clock, Youtube, Info, Terminal } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { normalizeAsset } from '@/lib/asset-utils';

interface WatchlistTableProps {
    data: VideoAnalysis[];
    viewMode: 'asset' | 'analyst';
    prices?: Record<string, { price: number, currency: string }>;
}

interface SignalPoint {
    recommendation: 'AL' | 'SAT' | 'TUT' | 'GÖZLEMLE';
    date: string;
    videoId: string;
    videoTitle: string;
    reasoning: string;
    channelTitle: string;
    channelThumbnail?: string;
}

type SortOption = 'date' | 'name' | 'signalCount';

const RECOMMENDATION_SCORE: Record<string, number> = {
    'AL': 1,
    'SAT': -1,
    'TUT': 0,
    'GÖZLEMLE': 0
};

export const WatchlistTable = ({ data, viewMode, prices }: WatchlistTableProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date');

    const groups = useMemo(() => {
        const rawGroups = data.reduce((acc, video) => {
            video.results.forEach(res => {
                const normalizedAsset = normalizeAsset(res.asset);
                const groupKey = viewMode === 'asset' ? normalizedAsset : video.channelTitle;

                if (!acc[groupKey]) {
                    acc[groupKey] = {
                        name: groupKey,
                        originalName: res.asset, // Keep one for reference
                        signals: [],
                        latestDate: video.publishedAt
                    };
                }

                acc[groupKey].signals.push({
                    recommendation: res.recommendation,
                    date: video.publishedAt,
                    videoId: video.videoId,
                    videoTitle: video.videoTitle,
                    reasoning: res.reasoning,
                    channelTitle: video.channelTitle,
                    channelThumbnail: video.channelThumbnail
                });

                if (new Date(video.publishedAt) > new Date(acc[groupKey].latestDate)) {
                    acc[groupKey].latestDate = video.publishedAt;
                }
            });
            return acc;
        }, {} as Record<string, { name: string, originalName: string, signals: SignalPoint[], latestDate: string }>);

        return Object.values(rawGroups);
    }, [data, viewMode]);

    const consensusMap = useMemo(() => {
        const map: Record<string, { recommendation: string, score: number }> = {};
        groups.forEach(group => {
            let totalScore = 0;
            let validSignals = 0;

            group.signals.forEach(sig => {
                const score = RECOMMENDATION_SCORE[sig.recommendation];
                if (score !== undefined) {
                    totalScore += score;
                    validSignals++;
                }
            });

            const avgScore = validSignals > 0 ? totalScore / validSignals : 0;
            let recommendation = 'TUT';
            if (avgScore > 0.3) recommendation = 'AL';
            else if (avgScore < -0.3) recommendation = 'SAT';

            map[group.name] = { recommendation, score: avgScore };
        });
        return map;
    }, [groups]);

    const filteredAndSortedGroups = useMemo(() => {
        return groups
            .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (sortBy === 'date') return new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime();
                if (sortBy === 'name') return a.name.localeCompare(b.name);
                if (sortBy === 'signalCount') return b.signals.length - a.signals.length;
                return 0;
            });
    }, [groups, searchQuery, sortBy]);

    return (
        <div className="w-full bg-[#0e1014] rounded-sm border border-white/5 overflow-hidden shadow-2xl">
            {/* Table Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#12151a] gap-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 transition-colors group-hover:text-[#004d61]" />
                        <input
                            type="text"
                            placeholder="SEARCH TERMINAL..."
                            className="bg-black/60 border border-white/5 rounded px-9 py-2 text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:border-blue-500/50 w-full md:w-64 placeholder:text-slate-800 transition-all font-mono-data"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Sorting Sequence:</span>
                        <select
                            className="bg-[#16191f] border border-white/5 text-[9px] font-bold uppercase tracking-widest text-slate-300 px-3 py-1.5 rounded outline-none focus:border-blue-500/50 transition-colors"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                        >
                            <option value="date">Cronological (Latest)</option>
                            <option value="name">Alpha-Numeric</option>
                            <option value="signalCount">Data Density (Volume)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Terminal Table Body */}
            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-black/20 border-b border-white/5">
                            <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Instrument / Consensus</th>
                            <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Live Valuation</th>
                            <th className="px-6 py-4 text-left text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Analyst Intelligence Flow</th>
                            <th className="px-6 py-4 text-right text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">Last Sync</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedGroups.map((group) => {
                            const price = prices?.[group.name.toUpperCase()];
                            const consensus = consensusMap[group.name];

                            return (
                                <tr key={group.name} className="group border-b border-white/5 hover:bg-[#004d61]/[0.04] transition-all duration-300">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-extrabold text-white group-hover:text-[#004d61] transition-colors tracking-tight uppercase italic">{group.name}</span>
                                                {viewMode === 'asset' && consensus && (
                                                    <div className={cn(
                                                        "px-2 py-0.5 rounded-sm border text-[8px] font-bold uppercase tracking-widest",
                                                        consensus.recommendation === 'AL' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            consensus.recommendation === 'SAT' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                                'bg-slate-500/10 text-slate-500 border-white/5'
                                                    )}>
                                                        {consensus.recommendation} CONSENSUS
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                <Terminal className="w-3 h-3 text-slate-700" />
                                                {viewMode === 'asset' ? 'Aggregate Data Set' : 'Verified Node'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            {price ? (
                                                <span className="text-sm font-mono-data font-bold text-[#c4a066]">
                                                    {price.price.toLocaleString('tr-TR')} <span className="text-[9px] opacity-40 ml-1">{price.currency}</span>
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-bold text-slate-800 uppercase tracking-widest italic opacity-50">Polling Data...</span>
                                            )}
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <div className="w-1 h-1 bg-[#004d61] rounded-full animate-pulse" />
                                                <span className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.2em]">Active Liquidity Stream</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-3">
                                            {group.signals.slice(0, 6).map((sig, i) => (
                                                <SignalBadge key={i} signal={sig} />
                                            ))}
                                            {group.signals.length > 6 && (
                                                <div className="h-7 px-3 bg-white/5 border border-white/5 rounded-sm flex items-center justify-center">
                                                    <span className="text-[9px] font-bold text-slate-600">+{group.signals.length - 6} OVERFLOW</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2 text-slate-500 font-mono-data text-[10px]">
                                                <Clock className="w-3 h-3 opacity-40" />
                                                {formatDate(group.latestDate)}
                                            </div>
                                            <div className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">UTC SYNC SUCCESS</div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredAndSortedGroups.length === 0 && (
                <div className="py-24 text-center">
                    <div className="w-12 h-0.5 bg-slate-800 mx-auto mb-6 opacity-30" />
                    <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.5em]">Zero matches in current data scope</p>
                </div>
            )}
        </div>
    );
};

const SignalBadge = ({ signal }: { signal: SignalPoint }) => {
    const config = {
        AL: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: TrendingUp },
        SAT: { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: TrendingDown },
        TUT: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Minus },
        GÖZLEMLE: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', icon: Search }
    }[signal.recommendation] || {
        color: 'text-slate-500',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        icon: Minus
    };

    const Icon = config.icon;

    return (
        <div className={cn(
            "group/sig relative flex items-center gap-2 px-3 py-1.5 border rounded-sm transition-all hover:scale-105 duration-300 cursor-help",
            config.bg, config.color, config.border
        )}>
            <div className="flex flex-col items-center">
                <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest">{signal.recommendation}</span>

            {/* Analyst Avatar in bottom corner */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-black/40 bg-zinc-800 overflow-hidden shadow-sm shadow-black">
                {signal.channelThumbnail ? (
                    <img src={signal.channelThumbnail} alt={signal.channelTitle} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[7px] font-bold text-white bg-[#004d61]">
                        {signal.channelTitle.charAt(0)}
                    </div>
                )}
            </div>

            {/* Professional Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-5 bg-[#161a21] border border-white/10 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] opacity-0 group-hover/sig:opacity-100 pointer-events-none transition-all duration-300 scale-95 group-hover/sig:scale-100 origin-bottom">
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                                <img src={signal.channelThumbnail} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-bold text-[#c4a066] uppercase tracking-tighter">{signal.channelTitle}</span>
                        </div>
                        <span className="text-[9px] font-mono-data text-slate-500">{formatDate(signal.date)}</span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                            <Info className="w-3 h-3 text-[#004d61]/50" />
                            Intelligence Rationale
                        </div>
                        <p className="text-[12px] text-slate-200 leading-relaxed font-medium italic">"{signal.reasoning}"</p>
                    </div>

                    <div className="pt-3 flex items-center gap-2 border-t border-white/5">
                        <Youtube className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate flex-1">{signal.videoTitle}</span>
                        <ChevronRight className="w-3 h-3 text-slate-700" />
                    </div>
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#161a21] border-r border-b border-white/10 rotate-45" />
            </div>
        </div>
    );
};
