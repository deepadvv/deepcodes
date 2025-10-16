'use client';

import { ClerkProvider, useUser, useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import React, { useMemo } from 'react';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const userId = user?.id;

  const convexClient = useMemo(
    () => new ConvexReactClient(convexUrl),
    [userId]
  );

  // Use userId as the key, and always wrap useAuth in client scope
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ConvexProviderWithClerk
        client={convexClient}
        useAuth={useAuth}
        key={userId || 'anonymous'}
      >
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
