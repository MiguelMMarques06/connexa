import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RouteGuard, { AdminGuard, ModeratorGuard } from './components/RouteGuard';
import Login from './components/Login';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';

// Páginas de erro e status
import { NotFoundPage, UnauthorizedPage, LoadingPage } from './pages';
import AdminPage from './pages/AdminPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* ===== ROTAS PÚBLICAS ===== */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Registration />
                </ProtectedRoute>
              } 
            />

            {/* ===== ROTAS PROTEGIDAS BÁSICAS ===== */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Exemplo de rota para usuários ativos */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requireActiveUser={true}>
                  <div>Página de Perfil (em construção)</div>
                </ProtectedRoute>
              } 
            />

            {/* ===== ROTAS PARA MODERADORES ===== */}
            <Route 
              path="/moderator/*" 
              element={
                <ProtectedRoute>
                  <ModeratorGuard>
                    <Routes>
                      <Route index element={<div>Dashboard do Moderador</div>} />
                      <Route path="users" element={<div>Gerenciar Usuários</div>} />
                      <Route path="reports" element={<div>Relatórios</div>} />
                    </Routes>
                  </ModeratorGuard>
                </ProtectedRoute>
              } 
            />

            {/* ===== ROTAS PARA ADMINISTRADORES ===== */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminGuard>
                    <AdminPage />
                  </AdminGuard>
                </ProtectedRoute>
              } 
            />

            {/* ===== ROTAS COM PERMISSÕES CUSTOMIZADAS ===== */}
            <Route 
              path="/advanced-feature" 
              element={
                <ProtectedRoute>
                  <RouteGuard
                    permissions={[
                      {
                        level: 'user',
                        customCheck: (user) => user.isActive && user.role !== 'guest'
                      }
                    ]}
                  >
                    <div>Funcionalidade Avançada</div>
                  </RouteGuard>
                </ProtectedRoute>
              } 
            />

            {/* ===== PÁGINAS DE STATUS ===== */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/loading" element={<LoadingPage />} />

            {/* ===== ROTA RAIZ ===== */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute 
                  requireAuth={false}
                  fallbackComponent={<Navigate to="/dashboard" replace />}
                >
                  <Navigate to="/login" replace />
                </ProtectedRoute>
              } 
            />

            {/* ===== ROTA 404 ===== */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
