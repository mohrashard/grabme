import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAdminAction, logoutAdminAction } from '../actions/authActions';

export function useAdminAuth() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Call Secure Server Action (Sets HttpOnly Cookie)
            const result = await verifyAdminAction(email, password);

            if (result.success) {
                // 2. Set client hint (Not for security, just UI state)
                localStorage.setItem('grabme_admin', JSON.stringify({ 
                    email: email, 
                    role: 'admin', 
                    loggedInAt: Date.now() 
                }));
                router.push('/admin');
            } else {
                setError(result.error || 'Access Denied: Highly Restricted Area');
            }
        } catch (err: any) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await logoutAdminAction();
        localStorage.removeItem('grabme_admin');
        router.push('/admin/login');
    };

    const isAdmin = (): boolean => {
        if (typeof window === 'undefined') return false;
        const raw = localStorage.getItem('grabme_admin');
        if (!raw) return false;
        try {
            const session = JSON.parse(raw);
            if (session.role !== 'admin') return false;
            
            // 8-hour expiration check (8 * 60 * 60 * 1000 ms)
            const EIGHT_HOURS = 8 * 60 * 60 * 1000;
            const isExpired = Date.now() - session.loggedInAt > EIGHT_HOURS;
            
            if (isExpired) {
                localStorage.removeItem('grabme_admin');
                return false;
            }
            
            return true;
        } catch {
            return false;
        }
    };

    return { email, setEmail, password, setPassword, loading, error, login, logout, isAdmin };
}
