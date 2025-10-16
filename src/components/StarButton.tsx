import { useAuth } from '@clerk/nextjs';
import { Id } from '../../convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Star } from 'lucide-react';
import React from 'react';

function StarButton({ snippetId }: { snippetId: Id<'snippets'> }) {
  const { isSignedIn } = useAuth();
  // These queries are user-scoped, so must re-run whenever user context changes.
  const isStarred = useQuery(api.snippets.isSnippetStarred, { snippetId });
  const starCount = useQuery(api.snippets.getSnippetStarCount, { snippetId });
  const star = useMutation(api.snippets.starSnippet);

  // Local loading state to prevent double submits
  const [pending, setPending] = React.useState(false);

  const handleStar = async () => {
    if (!isSignedIn || pending) return;
    setPending(true);
    await star({ snippetId });
    setPending(false);
  };

  // Only show button when loaded
  if (isStarred === undefined || starCount === undefined) {
    return (
      <button
        disabled
        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-500/10 text-gray-400"
      >
        <Star className="w-4 h-4 fill-none" />
        <span className="text-xs font-medium text-gray-400">...</span>
      </button>
    );
  }

  return (
    <button
      aria-label={isStarred ? 'Unstar snippet' : 'Star snippet'}
      aria-pressed={isStarred}
      disabled={!isSignedIn || pending}
      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
        isStarred
          ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
          : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
      }`}
      onClick={handleStar}
    >
      <Star
        className={`w-4 h-4 ${isStarred ? 'fill-yellow-500' : 'fill-none group-hover:fill-gray-400'}`}
      />
      <span
        className={`text-xs font-medium ${isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
      >
        {starCount}
      </span>
    </button>
  );
}

export default StarButton;
