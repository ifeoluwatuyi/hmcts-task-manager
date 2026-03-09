import React from 'react';

// ─── Empty State ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
  hasFilters: boolean;
  onCreateClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters, onCreateClick }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
    <div className="w-20 h-20 rounded-2xl bg-crown-50 flex items-center justify-center mb-5">
      <svg className="w-10 h-10 text-crown-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </div>

    {hasFilters ? (
      <>
        <h3 className="font-display font-bold text-crown-800 text-xl mb-2">No tasks match your filters</h3>
        <p className="text-slate-500 font-sans text-sm max-w-xs">
          Try adjusting the status filter or sort options to find what you're looking for.
        </p>
      </>
    ) : (
      <>
        <h3 className="font-display font-bold text-crown-800 text-xl mb-2">No tasks yet</h3>
        <p className="text-slate-500 font-sans text-sm max-w-xs mb-6">
          Get started by creating your first task to track casework activities.
        </p>
        <button
          onClick={onCreateClick}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold font-sans text-crown-900
                     bg-gold-500 hover:bg-gold-400 transition-all shadow-sm"
        >
          Create first task
        </button>
      </>
    )}
  </div>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
export const TaskSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
    <div className="h-1 bg-slate-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-slate-200 rounded-full w-3/4" />
      <div className="h-3 bg-slate-100 rounded-full w-1/2" />
      <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100">
        <div className="h-3 bg-slate-100 rounded-full w-24" />
        <div className="h-5 bg-slate-100 rounded-full w-20" />
      </div>
    </div>
  </div>
);

export const LoadingGrid: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <TaskSkeleton key={i} />
    ))}
  </div>
);
