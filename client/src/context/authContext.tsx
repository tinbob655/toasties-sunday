import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { accountObj } from '../components/pages/account/accountObj';
import { queryLoggedIn } from '../components/pages/account/accountAPI';

interface AuthContextType {
    loggedIn: boolean;
    username: string;
    loading: boolean;
    refreshAuth: (forceRefresh?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_CACHE_KEY = 'authCache';
const AUTH_CACHE_TTL_MS = 5 * 60 * 1000; //5 minutes

interface AuthCache {
    loggedIn: boolean;
    username: string;
    expiry: number;
}

function getAuthCache(): AuthCache | null {
    try {
        const cached = localStorage.getItem(AUTH_CACHE_KEY);
        if (!cached) return null;
        const parsed: AuthCache = JSON.parse(cached);
        if (parsed.expiry > Date.now()) {
            return parsed;
        }
        localStorage.removeItem(AUTH_CACHE_KEY);
    } catch {
        localStorage.removeItem(AUTH_CACHE_KEY);
    }
    return null;
}

function setAuthCache(loggedIn: boolean, username: string): void {
    const cache: AuthCache = {
        loggedIn,
        username,
        expiry: Date.now() + AUTH_CACHE_TTL_MS,
    };
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
}

function clearAuthCache(): void {
    localStorage.removeItem(AUTH_CACHE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const refreshAuth = useCallback(async (forceRefresh = false) => {

        //check cache first unless forcing refresh
        if (!forceRefresh) {
            const cached = getAuthCache();
            if (cached) {
                setLoggedIn(cached.loggedIn);
                setUsername(cached.username);
                setLoading(false);
                return;
            }
        }

        setLoading(true);
        try {
            const res: accountObj = await queryLoggedIn();
            setLoggedIn(res.loggedIn);
            setUsername(res.username);
            setAuthCache(res.loggedIn, res.username || '');
        } catch {
            setLoggedIn(false);
            setUsername('');
            clearAuthCache();
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
