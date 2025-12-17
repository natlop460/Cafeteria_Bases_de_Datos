import React, { useState, useEffect } from 'react';
import { Settings, Database, Server, FileText, ExternalLink, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { adminAPI } from '../services/api';

function Admin() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.healthCheck();
      setHealth(response.data);
      setLastCheck(new Date().toLocaleString('es-CR'));
    } catch (error) {
      setHealth({ status: 'error', error: 'No se pudo conectar con el backend' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return <CheckCircle size={20} className="status-icon-success" />;
      case 'disconnected':
      case 'error':
        return <XCircle size={20} className="status-icon-error" />;
      default:
        return <AlertCircle size={20} className="status-icon-warning" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      connected: 'success',
      healthy: 'success',
      disconnected: 'danger',
      error: 'danger',
    };
    return statusMap[status] || 'warning';
  };

  const resources = [
    {
      category: 'Administración de Base de Datos',
      items: [
        { name: 'phpMyAdmin (MySQL)', url: 'http://localhost:8080', icon: Database, description: 'Interfaz web para administrar MySQL' },
        { name: 'Mongo Express (MongoDB)', url: 'http://localhost:8081', icon: Database, description: 'Interfaz web para administrar MongoDB' },
      ]
    },
    {
      category: 'Backend & APIs',
      items: [
        { name: 'API Backend', url: 'http://localhost:4000/api', icon: Server, description: 'Servidor Node.js con Express' },
        { name: 'Health Check', url: 'http://localhost:4000/api/health', icon: Server, description: 'Estado del servidor y bases de datos' },
      ]
    },
    {
      category: 'Documentación',
      items: [
        { name: 'MySQL Docs', url: 'https://dev.mysql.com/doc/', icon: FileText, description: 'Documentación oficial de MySQL' },
        { name: 'MongoDB Docs', url: 'https://docs.mongodb.com/', icon: FileText, description: 'Documentación oficial de MongoDB' },
        { name: 'Node.js Docs', url: 'https://nodejs.org/docs/', icon: FileText, description: 'Documentación oficial de Node.js' },
        { name: 'React Docs', url: 'https://react.dev/', icon: FileText, description: 'Documentación oficial de React' },
        { name: 'Express Docs', url: 'https://expressjs.com/', icon: FileText, description: 'Documentación oficial de Express' },
      ]
    },
    {
      category: 'Herramientas de Desarrollo',
      items: [
        { name: 'Docker Hub', url: 'https://hub.docker.com/', icon: Server, description: 'Repositorio de imágenes Docker' },
        { name: 'npm Registry', url: 'https://www.npmjs.com/', icon: Server, description: 'Registro de paquetes Node.js' },
      ]
    }
  ];

  const techStack = [
    { name: 'MySQL', version: '8.0', description: 'Base de datos relacional', color: '#00758F' },
    { name: 'MongoDB', version: '6.0', description: 'Base de datos NoSQL', color: '#47A248' },
    { name: 'Node.js', version: '18+', description: 'Runtime de JavaScript', color: '#339933' },
    { name: 'Express', version: '4.x', description: 'Framework web para Node.js', color: '#000000' },
    { name: 'React', version: '18.x', description: 'Librería UI', color: '#61DAFB' },
    { name: 'Docker', version: '24+', description: 'Plataforma de contenedores', color: '#2496ED' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2><Settings size={28} /> Administración del Sistema</h2>
        <button className="btn btn-secondary" onClick={checkHealth} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spinning' : ''} /> Actualizar Estado
        </button>
      </div>

      {/* Health Check Section */}
      <div className="card">
        <div className="card-header">
          <h3>Estado de Conexiones</h3>
          {lastCheck && <span className="text-muted">Última verificación: {lastCheck}</span>}
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading">Verificando conexiones...</div>
          ) : health ? (
            <div className="health-grid">
              {/* Backend Status */}
              <div className="health-card">
                <div className="health-header">
                  <Server size={24} />
                  <h4>Backend API</h4>
                </div>
                <div className="health-status">
                  {getStatusIcon(health.status)}
                  <span className={`badge badge-${getStatusBadge(health.status)}`}>
                    {health.status === 'healthy' ? 'Conectado' : 'Error'}
                  </span>
                </div>
                {health.uptime && (
                  <p className="health-info">Uptime: {Math.floor(health.uptime / 60)} minutos</p>
                )}
              </div>

              {/* MySQL Status */}
              {health.mysql && (
                <div className="health-card">
                  <div className="health-header">
                    <Database size={24} />
                    <h4>MySQL</h4>
                  </div>
                  <div className="health-status">
                    {getStatusIcon(health.mysql.status)}
                    <span className={`badge badge-${getStatusBadge(health.mysql.status)}`}>
                      {health.mysql.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                  {health.mysql.database && (
                    <p className="health-info">Base de datos: {health.mysql.database}</p>
                  )}
                  {health.mysql.error && (
                    <p className="health-error">{health.mysql.error}</p>
                  )}
                </div>
              )}

              {/* MongoDB Status */}
              {health.mongodb && (
                <div className="health-card">
                  <div className="health-header">
                    <Database size={24} />
                    <h4>MongoDB</h4>
                  </div>
                  <div className="health-status">
                    {getStatusIcon(health.mongodb.status)}
                    <span className={`badge badge-${getStatusBadge(health.mongodb.status)}`}>
                      {health.mongodb.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                  {health.mongodb.database && (
                    <p className="health-info">Base de datos: {health.mongodb.database}</p>
                  )}
                  {health.mongodb.error && (
                    <p className="health-error">{health.mongodb.error}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="alert alert-danger">No se pudo obtener el estado del sistema</div>
          )}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card">
        <div className="card-header">
          <h3>Stack Tecnológico</h3>
        </div>
        <div className="card-body">
          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <div key={index} className="tech-card" style={{ borderLeftColor: tech.color }}>
                <h4>{tech.name}</h4>
                <span className="badge badge-info">{tech.version}</span>
                <p>{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Links */}
      {resources.map((section, sectionIndex) => (
        <div key={sectionIndex} className="card">
          <div className="card-header">
            <h3>{section.category}</h3>
          </div>
          <div className="card-body">
            <div className="resources-grid">
              {section.items.map((item, itemIndex) => (
                <a
                  key={itemIndex}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-card"
                >
                  <div className="resource-icon">
                    <item.icon size={24} />
                  </div>
                  <div className="resource-content">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <ExternalLink size={18} className="resource-external" />
                </a>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Project Info */}
      <div className="card">
        <div className="card-header">
          <h3>Información del Proyecto</h3>
        </div>
        <div className="card-body">
          <div className="project-info">
            <div className="info-row">
              <strong>Nombre:</strong>
              <span>Sistema de Gestión - Cafetería B&B</span>
            </div>
            <div className="info-row">
              <strong>Curso:</strong>
              <span>TPA-3002 - Bases de Datos</span>
            </div>
            <div className="info-row">
              <strong>Proyecto:</strong>
              <span>Proyecto 2 - Sistema Híbrido SQL/NoSQL</span>
            </div>
            <div className="info-row">
              <strong>Características:</strong>
              <ul>
                <li>Base de datos relacional MySQL para datos transaccionales</li>
                <li>Base de datos NoSQL MongoDB para logs y reseñas</li>
                <li>Procedimientos almacenados y triggers</li>
                <li>Funciones personalizadas y vistas</li>
                <li>Sistema de gestión de pedidos y clientes</li>
                <li>Reportes y análisis de ventas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
