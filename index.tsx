// Import library React dan ReactDOM untuk membuat dan me-render aplikasi ke dalam DOM.
import React from 'react';
import ReactDOM from 'react-dom/client';
// Import komponen utama aplikasi.
import App from './App';

// Mencari elemen HTML dengan id 'root' sebagai tempat aplikasi akan di-mount
const rootElement = document.getElementById('root');
if (!rootElement) {
  // Jika elemen root tidak ditemukan, lemparkan error untuk menghentikan eksekusi.
  throw new Error("Could not find root element to mount to");
}

// Membuat root React untuk render aplikasi secara concurrent
const root = ReactDOM.createRoot(rootElement);
// Me-render komponen App di dalam StrictMode untuk menyoroti potensi masalah dalam aplikasi
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);