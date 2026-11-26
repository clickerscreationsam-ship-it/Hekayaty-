import React, { lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { RootLayout } from '@/components/layout/RootLayout';
import { useAuthStore } from '@/stores/useAuthStore';

// Core Pages (Lazy loaded for optimal performance)
const Home = lazy(() => import('@/pages/Home'));
const Discover = lazy(() => import('@/pages/Discover'));

// Authentication & Account
const Welcome = lazy(() => import('@/pages/Welcome'));
const WelcomeAboard = lazy(() => import('@/pages/WelcomeAboard'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

// Subscriptions & Membership
const SubscriptionPlansPage = lazy(() => import('@/pages/SubscriptionPlansPage'));
const SubscriptionPaymentPage = lazy(() => import('@/pages/SubscriptionPaymentPage'));
const SubscriptionRedeemPage = lazy(() => import('@/pages/SubscriptionRedeemPage'));

// Comics & Reader
const Comics = lazy(() => import('@/pages/Comics'));
const ComicDetail = lazy(() => import('@/pages/ComicDetail'));
const ComicReader = lazy(() => import('@/pages/ComicReader'));
const UniversalCustomReader = lazy(() => import('@/pages/UniversalCustomReader'));
const SeriesDetail = lazy(() => import('@/pages/SeriesDetail'));

// Series Platform (Novels, Comics, Seasons, Episodes)
const SeriesPlatform = lazy(() => import('@/pages/SeriesPlatform'));
const SeriesLandingPage = lazy(() => import('@/pages/SeriesLandingPage'));
const SeriesEpisodeReader = lazy(() => import('@/pages/SeriesEpisodeReader'));
const MySeriesLibrary = lazy(() => import('@/pages/MySeriesLibrary'));

// Stories
const Stories = lazy(() => import('@/pages/Stories'));
const StoryDetail = lazy(() => import('@/pages/StoryDetail'));

// Characters & Worlds
const Characters = lazy(() => import('@/pages/Characters'));
const CharacterDetail = lazy(() => import('@/pages/CharacterDetail'));
const Worlds = lazy(() => import('@/pages/Worlds'));
const WorldDetail = lazy(() => import('@/pages/WorldDetail'));

// Universe Lore
const Timeline = lazy(() => import('@/pages/Timeline'));
const Encyclopedia = lazy(() => import('@/pages/Encyclopedia'));
const EncyclopediaDetail = lazy(() => import('@/pages/EncyclopediaDetail'));

// Community, Selected & Gaming
const HekayatySelected = lazy(() => import('@/pages/HekayatySelected'));
const News = lazy(() => import('@/pages/News'));
const NewsDetail = lazy(() => import('@/pages/NewsDetail'));
const Events = lazy(() => import('@/pages/Events'));
const EventDetail = lazy(() => import('@/pages/EventDetail'));
const Mystery = lazy(() => import('@/pages/Mystery'));
const MysteryEpisodeReader = lazy(() => import('@/pages/MysteryEpisodeReader'));
const VotingPage = lazy(() => import('@/pages/VotingPage'));
const Awards = lazy(() => import('@/pages/Awards'));
const AwardDetail = lazy(() => import('@/pages/AwardDetail'));
const CompetitionDetail = lazy(() => import('@/pages/CompetitionDetail'));
const Community = lazy(() => import('@/pages/Community'));
const CardGame = lazy(() => import('@/pages/CardGame'));
const Profile = lazy(() => import('@/pages/Profile'));
const Editorial = lazy(() => import('@/pages/Editorial'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const PublishingStudio = lazy(() => import('@/pages/PublishingStudio'));

const NotFound = lazy(() => import('@/pages/not-found'));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-white font-arabic gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
      <span className="text-xs text-zinc-400">جاري تحميل أبعاد الكون...</span>
    </div>
  );
}

function Router() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <RootLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          {/* Main Discovery */}
          <Route path="/" component={Home} />
          <Route path="/welcome" component={Welcome} />
          <Route path="/welcome-aboard" component={WelcomeAboard} />
          <Route path="/discover" component={Discover} />

          {/* Authentication & User Recovery */}
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />

          {/* Subscriptions & Membership */}
          <Route path="/subscribe" component={SubscriptionPlansPage} />
          <Route path="/subscriptions" component={SubscriptionPlansPage} />
          <Route path="/subscribe/payment" component={SubscriptionPaymentPage} />
          <Route path="/subscribe/redeem" component={SubscriptionRedeemPage} />

          {/* Comics Ecosystem */}
          <Route path="/comics" component={Comics} />
          <Route path="/comics/:id" component={ComicDetail} />
          <Route path="/comics/:id/read" component={ComicReader} />
          <Route path="/comics/:id/immersive" component={UniversalCustomReader} />
          <Route path="/reader" component={UniversalCustomReader} />
          <Route path="/reader/:id" component={UniversalCustomReader} />

          {/* Hekayaty Series Platform */}
          <Route path="/series" component={SeriesPlatform} />
          <Route path="/series/:slug" component={SeriesLandingPage} />
          <Route path="/series/:seriesSlug/read/:episodeId" component={SeriesEpisodeReader} />
          <Route path="/my-series" component={MySeriesLibrary} />

          {/* Stories Ecosystem */}
          <Route path="/stories" component={Stories} />
          <Route path="/stories/:id" component={StoryDetail} />
          <Route path="/stories/:id/read" component={UniversalCustomReader} />

          {/* Characters Ecosystem */}
          <Route path="/characters" component={Characters} />
          <Route path="/characters/:id" component={CharacterDetail} />

          {/* Worlds Ecosystem */}
          <Route path="/worlds" component={Worlds} />
          <Route path="/worlds/:id" component={WorldDetail} />

          {/* Universe Lore */}
          <Route path="/timeline" component={Timeline} />
          <Route path="/encyclopedia" component={Encyclopedia} />
          <Route path="/encyclopedia/:id" component={EncyclopediaDetail} />

          {/* Selected & Community */}
          <Route path="/selected" component={HekayatySelected} />
          <Route path="/news" component={News} />
          <Route path="/news/:id" component={NewsDetail} />
          <Route path="/events" component={Events} />
          <Route path="/events/:slug" component={EventDetail} />
          <Route path="/mystery" component={Mystery} />
          <Route path="/mystery/:slug" component={MysteryEpisodeReader} />
          <Route path="/carnivals" component={Events} />
          <Route path="/carnivals/:slug" component={EventDetail} />
          <Route path="/competitions/:slug" component={CompetitionDetail} />
          <Route path="/voting/:slug" component={VotingPage} />
          <Route path="/awards" component={Awards} />
          <Route path="/awards/:certId" component={AwardDetail} />
          <Route path="/community" component={Community} />
          <Route path="/card-game" component={CardGame} />

          {/* User Profile & Internal Editorial */}
          <Route path="/profile" component={Profile} />
          <Route path="/profile/:id" component={Profile} />
          <Route path="/editorial" component={Editorial} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/studio" component={PublishingStudio} />
          <Route path="/publishing-studio" component={PublishingStudio} />

          {/* 404 Realm Not Found */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </RootLayout>
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
