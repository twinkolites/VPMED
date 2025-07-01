import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
    <Router>
        <Routes>
          {/* Public routes with Layout */}
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/services" element={
            <Layout>
              <Services />
            </Layout>
          } />
          <Route path="/gallery" element={
            <Layout>
              <Gallery />
            </Layout>
          } />
          <Route path="/shop" element={
            <Layout>
              <Shop />
            </Layout>
          } />
          <Route path="/contact" element={
            <Layout>
              <Contact />
            </Layout>
          } />
          
          {/* Authentication routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
