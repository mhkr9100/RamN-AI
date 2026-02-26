export interface UserSession {
    email: string;
    id: string;
}

export const authService = {
    async login(email: string): Promise<UserSession> {
        // Implement email-only login. We can mock a session.
        const id = `user-${email}`;
        const session: UserSession = { email, id };
        localStorage.setItem('currentUser', JSON.stringify(session));
        return session;
    },

    async logout() {
        localStorage.removeItem('currentUser');
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
                    name: session.email.split('@')[0] || 'Architect'
                };
            }
            return null;
        } catch (e) {
            return null;
        }
    }
};
