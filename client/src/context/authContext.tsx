import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { accountObj } from '../components/pages/account/accountObj';
import { queryLoggedIn } from '../components/pages/account/accountAPI';

interface AuthContextType {
    loggedIn: boolean;
    username: string;
    loading: boolean;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const refreshAuth = useCallback(async () => {
        setLoading(true);
        try {
            const res: accountObj = await queryLoggedIn();
            setLoggedIn(res.loggedIn);
            setUsername(res.username);
        } catch {
            setLoggedIn(false);
            setUsername('');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshAuth();
    }, [refreshAuth]);

    return (
        <AuthContext.Provider value={{ loggedIn, username, loading, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
