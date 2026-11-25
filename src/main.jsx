import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './estilos.css';
import App from './App.jsx';

for(const key of ['pixelbyte_users','pixelbyte_active_user','pixelbyte_products','pixelbyte_messages','pixelbyte_orders']) localStorage.removeItem(key);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HashRouter>
            <App />
        </HashRouter>
    </React.StrictMode>
);