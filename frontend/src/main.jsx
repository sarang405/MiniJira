import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // <--- THIS LINE IS CRITICAL
import 'flowbite/dist/flowbite.css'; // Add this for Flowbite components
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// 1. Import these from TanStack Query

// 2. Create a new QueryClient instance
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Wrap your App with the Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);