import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { AppRoutes } from './routes';
import ErrorBoundary from './components/ErrorState/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Header />
        <main>
          <AppRoutes />
        </main>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
