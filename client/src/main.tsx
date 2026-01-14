import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router';

import Header from './components/multiPageComponents/header';
import AllRoutes from './routes';
import Footer from './components/multiPageComponents/footer';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <header>
        <Header/>
      </header>

      <div id="content">
        <AllRoutes/>
      </div>

      <footer>
        <Footer/>
      </footer>
    </BrowserRouter>
  </StrictMode>
);