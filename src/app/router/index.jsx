import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUpPage from '../pages/SignUpPage/SignUpPage';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;