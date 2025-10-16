import { currentUser } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import Link from 'next/link';
import { Blocks, Code2, Sparkles } from 'lucide-react';
import { SignedIn } from '@clerk/nextjs';
import ThemeSelector from './ThemeSelector';
import LanguageSelector from './LanguageSelector';
import RunButton from './RunButton';
import HeaderProfileBtn from './HeaderProfileBtn';
import Image from 'next/image';
import AnimatedBadge from '@/components/ui/animated-badge';

async function Header() {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const user = await currentUser();

  const convexUser = await convex.query(api.users.getUser, {
    userId: user?.id || '',
  });

  return (
    <div className="relative z-10">
      {/* Desktop & Large Screens */}
      <div className="hidden lg:block">
        <div
          className="flex items-center justify-between 
          bg-[#0a0a0f]/80 backdrop-blur-xl p-6 mb-4 rounded-lg"
        >
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group relative">
              {/* <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                <Image
                  width={100}
                  height={100}
                  alt={'Logo'}
                  className=" h-6 w-6"
                  src={'/fav-white.png'}
                />
              </div>

              <div className="relative">
                <span className="block text-lg font-semibold">DeepCodes</span>
                
              </div> */}
              <AnimatedBadge text="DeepCodes" color="#22d3ee" />
            </Link>

            <nav className="flex items-center space-x-1">
              <Link
                href="/snippets"
                className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-gray-300 bg-gray-800/50 
                hover:bg-blue-500/10 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 shadow-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Code2 className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
                <span className="text-sm font-medium relative z-10 group-hover:text-white transition-colors">
                  Snippets
                </span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <ThemeSelector />
              <LanguageSelector hasAccess={Boolean(convexUser?.isPro)} />
            </div>

            {!convexUser?.isPro && (
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-r from-amber-500/10 
                to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 text-amber-400 hover:text-amber-300" />
                <span className="text-sm font-medium text-amber-400/90 hover:text-amber-300">
                  Pro
                </span>
              </Link>
            )}

            <SignedIn>
              <RunButton />
            </SignedIn>

            <div className="pl-3 border-l border-gray-800">
              <HeaderProfileBtn />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Screens */}
      <div className="block lg:hidden">
        <div
          className="flex flex-col gap-4 items-center justify-center 
          bg-[#0a0a0f]/80 backdrop-blur-xl p-4 mb-4 rounded-lg text-center"
        >
          <Link href="/" className="flex items-center gap-3 group relative">
            {/* <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                <Image
                  width={100}
                  height={100}
                  alt={'Logo'}
                  className=" h-6 w-6"
                  src={'/fav-white.png'}
                />
              </div>

              <div className="relative">
                <span className="block text-lg font-semibold">DeepCodes</span>
                
              </div> */}
            <AnimatedBadge text="DeepCodes" color="#22d3ee" />
          </Link>
          {!convexUser?.isPro && (
            <div
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-r from-amber-500/10 
              to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400/90">
                Sign in to unlock
              </span>
            </div>
          )}
          <HeaderProfileBtn />

          <Link
            href="/snippets"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 bg-gray-800/50 
              hover:bg-blue-500/10 border border-gray-800 hover:border-blue-500/50 transition"
          >
            <Code2 className="w-4 h-4" />
            <span className="text-sm font-medium">Snippets</span>
          </Link>

          <div className="flex gap-3 items-center">
            <ThemeSelector />
            <LanguageSelector hasAccess={Boolean(convexUser?.isPro)} />
          </div>

          <SignedIn>
            <RunButton />
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default Header;
