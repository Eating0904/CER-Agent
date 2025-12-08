import { StrictMode } from 'react';

import { ConfigProvider } from 'antd';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import store from './store';
import { theme } from './theme';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ConfigProvider theme={theme}>
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        </ConfigProvider>
    </StrictMode>,
);
