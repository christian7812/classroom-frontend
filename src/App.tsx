import {
  Refine,
  GitHubBanner,
  WelcomePage,
  Authenticated,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { dataProvider } from "./providers/data";
import { Layout } from "./components/refine-ui/layout/layout";
import { Header } from "./components/refine-ui/layout/header";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import "./App.css";
import Dashboard from "./pages/dashboard";
import { BookOpenIcon, GraduationCap, Home } from "lucide-react";
import SubjectList from "./pages/subjects/subjectList";
import Create from "./pages/subjects/create";
import ClassList from "./pages/classes/list";
import ClassCreate from "./pages/classes/create";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "rkSoNW-dA1Fiz-Hlm1jU",
              }}

              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: { label: "Dashboard", icon: <Home /> }
                },
                {
                  name: "subjects",
                  list: "/subjects",
                  create: "/subjects/create",
                  meta: { label: "Subjects", icon: <BookOpenIcon /> }
                },
                {
                  name:'classes',
                  list: '/classes',
                  create:'/classes/create',
                  meta: {label: "Classes", icon: <GraduationCap />}
                }
              ]}
            >
              <Routes>
                <Route element={<Layout>
                 <Outlet />
                </Layout>}>
                  <Route path="/" element={<Dashboard />} />

                  <Route path="/subjects">
                  <Route index element={ <SubjectList /> } /> 
                   <Route path="create" element={ <Create /> } />
                  </Route>

                   <Route path="/classes">
                  <Route index element={ <ClassList /> } /> 
                   <Route path="create" element={ <ClassCreate /> } />
                  </Route>
                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
