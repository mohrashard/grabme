import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginWorkerAction } from '../actions/loginActions';
import { toast } from 'sonner';

export function useLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [identifier, setIdentifier] = useState(''); // Email, NIC, or Phone
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            // SECURITY REFACTOR: Migrate validation to Server Action
            // This ensures hashed passwords are never fetched into the browser.
            const result = await loginWorkerAction(identifier, password);

            if (!result.success) {
                setError(result.error || 'Login failed');
                toast.error(result.error || 'Login failed');
                return;
            }

            const { user } = result;

            // Store sanitized session data (No Hash, No Sensitive Meta)
            localStorage.setItem('grabme_user', JSON.stringify({
                id: user!.id,
                name: user!.full_name,
                role: 'worker',
                nic: user!.nic_number,
                status: user!.account_status
            }));

            router.push('/dashboard');
        } catch (err: any) {
            console.error('Portal Hook Error:', err);
            setError('Something went wrong. Please try again.');
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        identifier,
        setIdentifier,
        password,
        setPassword,
        error,
        handleLogin
    };
}
