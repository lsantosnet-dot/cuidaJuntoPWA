import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ROUTES } from '@/lib/routes'
import { RouteFallback } from './RouteFallback'

// Lazy-load pages so each module ships in its own chunk.
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const SchedulePage = lazy(() => import('@/pages/SchedulePage'))
const MedicationsPage = lazy(() => import('@/pages/MedicationsPage'))
const RoutinePage = lazy(() => import('@/pages/RoutinePage'))
const DiaryPage = lazy(() => import('@/pages/DiaryPage'))
const CirclesPage = lazy(() => import('@/pages/CirclesPage'))
const TeamPage = lazy(() => import('@/pages/TeamPage'))
const CostsPage = lazy(() => import('@/pages/CostsPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const JoinPage = lazy(() => import('@/pages/JoinPage'))

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        {/* Full-page, outside the shell (like sign-in). */}
        <Route
          path={`${ROUTES.join}/:token`}
          element={
            <Suspense fallback={<RouteFallback />}>
              <JoinPage />
            </Suspense>
          }
        />
        <Route element={<AppShell />}>
          <Route
            index
            element={
              <Suspense fallback={<RouteFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.schedule}
            element={
              <Suspense fallback={<RouteFallback />}>
                <SchedulePage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.medications}
            element={
              <Suspense fallback={<RouteFallback />}>
                <MedicationsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.routine}
            element={
              <Suspense fallback={<RouteFallback />}>
                <RoutinePage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.diary}
            element={
              <Suspense fallback={<RouteFallback />}>
                <DiaryPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.circles}
            element={
              <Suspense fallback={<RouteFallback />}>
                <CirclesPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.team}
            element={
              <Suspense fallback={<RouteFallback />}>
                <TeamPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.costs}
            element={
              <Suspense fallback={<RouteFallback />}>
                <CostsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.history}
            element={
              <Suspense fallback={<RouteFallback />}>
                <HistoryPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.profile}
            element={
              <Suspense fallback={<RouteFallback />}>
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.settings}
            element={
              <Suspense fallback={<RouteFallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<RouteFallback />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  )
}
