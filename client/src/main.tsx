import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './scss/main.scss';
import ScrollToTop from './components/multiPageComponents/scrollToTop';
import { AuthProvider } from './context/authContext';

import Header from './components/multiPageComponents/header';
import AllRoutes from './routes';
import Footer from './components/multiPageComponents/footer';

//configure React Query with sensible defaults for caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, //data considered fresh for 5 minutes
      gcTime: 10 * 60 * 1000, //cache garbage collected after 10 minutes
      refetchOnWindowFocus: false, //don't refetch when window regains focus
      retry: 1, //only retry failed requests once
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <header>
            <Header/>
          </header>

          <div id="content">
            <ScrollToTop/>
            <AllRoutes/>
          </div>

          <footer>
            <Footer/>
          </footer>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);