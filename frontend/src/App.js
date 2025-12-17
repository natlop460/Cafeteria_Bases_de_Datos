import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Coffee, Users, ShoppingCart, BarChart3, Package, Star, Activity, Home, Settings } from 'lucide-react';
import './App.css';

// Páginas
import Dashboard from './pages/Dashboard';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Pedidos from './pages/Pedidos';
import Reportes from './pages/Reportes';
import Resenas from './pages/Resenas';
import Logs from './pages/Logs';
import Admin from './pages/Admin';

// Navegación lateral
function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/productos', icon: Package, label: 'Productos' },
    { path: '/clientes', icon: Users, label: 'Clientes' },
    { path: '/pedidos', icon: ShoppingCart, label: 'Pedidos' },
    { path: '/reportes', icon: BarChart3, label: 'Reportes' },
    { path: '/resenas', icon: Star, label: 'Reseñas (NoSQL)' },
    { path: '/logs', icon: Activity, label: 'Logs (NoSQL)' },
    { path: '/admin', icon: Settings, label: 'Administración' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Coffee size={32} />
        <h1>Cafetería B&B</h1>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>TPA-3002 - Proyecto 2</p>
        <p>Bases de Datos</p>
      </div>
    </aside>
  );
}

// Layout principal
function Layout({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// Aplicación principal
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/resenas" element={<Resenas />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
