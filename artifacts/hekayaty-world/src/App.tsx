import { lazy } from 'react';

const Home = lazy(() => import('@/pages/Home'));
const Characters = lazy(() => import('@/pages/Characters'));
const CharacterDetail = lazy(() => import('@/pages/CharacterDetail'));
const Comics = lazy(() => import('@/pages/Comics'));
const ComicDetail = lazy(() => import('@/pages/ComicDetail'));
const Worlds = lazy(() => import('@/pages/Worlds'));
const Timeline = lazy(() => import('@/pages/Timeline'));

// Placeholder components for the rest
const ComicRead = () => <div className="min-h-[70vh] flex items-center justify-center text-white text-2xl font-cinzel">Immersive Reader Coming Soon</div>;
const WorldDetail = () => <div className="min-h-[70vh] flex items-center justify-center text-white text-2xl font-cinzel">World Atlas Detail Coming Soon</div>;
const Community = () => <div className="min-h-[70vh] flex items-center justify-center text-white text-2xl font-cinzel">Community Coming Soon</div>;
const CardGame = () => <div className="min-h-[70vh] flex items-center justify-center text-white text-2xl font-cinzel">Card Game Coming Soon</div>;
const Profile = () => <div className="min-h-[70vh] flex items-center justify-center text-white text-2xl font-cinzel">Profile Coming Soon</div>;
const News = () => <div className="min-h-[70vh] flex items-center justify-center text-white text-2xl font-cinzel">News Portal Coming Soon</div>;

import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { RootLayout } from '@/components/layout/RootLayout';

function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 text-white">
      <h1 className="text-8xl font-cinzel font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl mb-8">Realm Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">The dimensional coordinates you requested do not exist in the known universe.</p>
      <a href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors">Return to Reality</a>
    </div>
  );
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <RootLayout>
        <Switch>
          <Route path="/" component={Home} />
          
          <Route path="/characters" component={Characters} />
          <Route path="/characters/:id" component={CharacterDetail} />
          
          <Route path="/comics" component={Comics} />
          <Route path="/comics/:id" component={ComicDetail} />
          <Route path="/comics/:id/read" component={ComicRead} />
          
          <Route path="/worlds" component={Worlds} />
          <Route path="/worlds/:id" component={WorldDetail} />
          
          <Route path="/timeline" component={Timeline} />
          
          <Route path="/news" component={News} />
          <Route path="/community" component={Community} />
          <Route path="/card-game" component={CardGame} />
          <Route path="/profile/:id" component={Profile} />
          
          <Route component={NotFound} />
        </Switch>
      </RootLayout>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;