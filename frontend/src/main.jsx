import { StrictMode } from 'react';

import { App, ConfigProvider } from 'antd';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import AppComponent from './App';
import store from './store';
import { theme } from './theme';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ConfigProvider theme={theme}>
            <App>
                <Provider store={store}>
                    <BrowserRouter>
                        <AppComponent />
                    </BrowserRouter>
                </Provider>
            </App>
        </ConfigProvider>
    </StrictMode>,
);
