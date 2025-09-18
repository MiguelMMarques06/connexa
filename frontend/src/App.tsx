import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Registration from './components/Registration';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/register" element={<Registration />} />
          {/* Add more routes here as needed */}
          <Route path="/" element={<Registration />} /> {/* Temporary: redirect to registration */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
