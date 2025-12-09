import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VideoProvider } from './context/VideoContext';
import { DeviceProvider } from './context/DeviceContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Watch } from './pages/Watch';
import { Upload } from './pages/Upload';
import { Admin } from './pages/Admin';

const App: React.FC = () => {
  return (
    <HashRouter>
      <DeviceProvider>
        <VideoProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </VideoProvider>
      </DeviceProvider>
    </HashRouter>
  );
};

export default App;