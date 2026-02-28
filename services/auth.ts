const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export interface UserSession {
    email: string;
    id: string;
    name?: string;
}

export const authService = {
    async register(email: string, password: string, name: string): Promise<UserSession> {
        if (!BACKEND_URL) {
            // Mock Fallback
            const id = `user-${Date.now()}`;
            const user = { email, password, name, id };
            const stored = JSON.parse(localStorage.getItem('mock_registry') || '[]');
            stored.push(user);
            localStorage.setItem('mock_registry', JSON.stringify(stored));

            const session: UserSession = { email, id, name };
            localStorage.setItem('currentUser', JSON.stringify(session));
            localStorage.setItem('auth_token', `mock-jwt-${id}`);
            return session;
        }

        const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Registration failed');
        }

        const session: UserSession = data.user;
        localStorage.setItem('currentUser', JSON.stringify(session));
        localStorage.setItem('auth_token', data.token);

        return session;
    },

    async login(email: string, password?: string): Promise<UserSession> {
        if (!BACKEND_URL) {
            // Mock Fallback with basic security check
            const storedUsers = JSON.parse(localStorage.getItem('mock_registry') || '[]');
            const user = storedUsers.find((u: any) => u.email === email && u.password === password);

            if (!user && password !== 'admin') { // Allow 'admin' as universal fallback for dev
                throw new Error('Invalid email or password');
            }

            const session: UserSession = {
                email,
                id: user?.id || `user-${email}`,
                name: user?.name || email.split('@')[0]
            };
            localStorage.setItem('currentUser', JSON.stringify(session));
            localStorage.setItem('auth_token', `mock-jwt-${session.id}`);
            return session;
        }

        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Login failed');
        }

        const session: UserSession = data.user;
        localStorage.setItem('currentUser', JSON.stringify(session));
        localStorage.setItem('auth_token', data.token);

        return session;
    },

    getToken(): string | null {
        return localStorage.getItem('auth_token');
    },

    async logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('auth_token');
    },

    async getCurrentUser() {
        try {
            const data = localStorage.getItem('currentUser');
            if (data) {
                const session: UserSession = JSON.parse(data);
                return {
                    id: session.id,
                    username: session.email,
                    email: session.email,
                    name: session.name || session.email.split('@')[0] || 'Architect'
                };
            }
            return null;
        } catch (e) {
            return null;
        }
    }
};
