import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Share } from './pages/Share';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/share/:id" element={<Share />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
