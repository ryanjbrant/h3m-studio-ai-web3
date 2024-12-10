import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/navigation/Header';
import { PageTransition } from './components/PageTransition';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useAuthStore } from './store/authStore';
import { onAuthChange } from './services/auth';
import './styles/theme.css';

// Lazy load pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const TextureGenerator = React.lazy(() => import('./pages/TextureGenerator'));
const TextTo3D = React.lazy(() => import('./pages/TextTo3D'));
const Resources = React.lazy(() => import('./pages/Resources'));
const SceneBuilder = React.lazy(() => import('./pages/SceneBuilder'));
const Staking = React.lazy(() => import('./pages/Staking'));
const Tokenomics = React.lazy(() => import('./pages/Tokenomics'));
const Roadmap = React.lazy(() => import('./pages/Roadmap'));
const Whitepaper = React.lazy(() => import('./pages/Whitepaper'));
const Mission = React.lazy(() => import('./pages/Mission'));
const Vision = React.lazy(() => import('./pages/Vision'));
const Team = React.lazy(() => import('./pages/Team'));
const Login = React.lazy(() => import('./pages/Login'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));

function App() {
  const { setUser, setLoading, user } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
        <Header />
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <PageTransition>
                  <LandingPage />
                </PageTransition>
              } />
              <Route path="/tools/texture-generator" element={
                <PageTransition>
                  <TextureGenerator />
                </PageTransition>
              } />
              <Route path="/tools/text-to-3d" element={
                <PageTransition>
                  <TextTo3D />
                </PageTransition>
              } />
              <Route path="/tools/resources" element={
                <PageTransition>
                  <Resources />
                </PageTransition>
              } />
              <Route path="/tools/scene-builder" element={
                <PageTransition>
                  <SceneBuilder />
                </PageTransition>
              } />
              <Route path="/defi/staking" element={
                <PageTransition>
                  <Staking />
                </PageTransition>
              } />
              <Route path="/defi/tokenomics" element={
                <PageTransition>
                  <Tokenomics />
                </PageTransition>
              } />
              <Route path="/defi/roadmap" element={
                <PageTransition>
                  <Roadmap />
                </PageTransition>
              } />
              <Route path="/defi/whitepaper" element={
                <PageTransition>
                  <Whitepaper />
                </PageTransition>
              } />
              <Route path="/about/mission" element={
                <PageTransition>
                  <Mission />
                </PageTransition>
              } />
              <Route path="/about/vision" element={
                <PageTransition>
                  <Vision />
                </PageTransition>
              } />
              <Route path="/about/team" element={
                <PageTransition>
                  <Team />
                </PageTransition>
              } />
              <Route path="/login" element={
                <PageTransition>
                  <Login />
                </PageTransition>
              } />
              <Route path="/profile" element={
                <PageTransition>
                  <Profile />
                </PageTransition>
              } />
              <Route path="/admin/*" element={
                user?.isAdmin ? (
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                ) : (
                  <Navigate to="/login" replace />
                )
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;