import {
    createContext,
    useContext,
    useMemo,
    useState,
} from 'react';

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
    const [headerContent, setHeaderContent] = useState(null);

    const value = useMemo(
        () => ({ headerContent, setHeaderContent }),
        [headerContent],
    );

    return (
        <HeaderContext.Provider value={value}>
            {children}
        </HeaderContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHeaderContext = () => {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error('useHeaderContext must be used within a HeaderProvider');
    }
    return context;
};
