import {
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    fetchAuthSession,
    fetchUserAttributes,
    getCurrentUser
} from 'aws-amplify/auth';

export interface UserSession {
    accessToken: string;
    idToken: string;
    refreshToken: string;
}

export const authService = {
    async login(email: string, password: string): Promise<UserSession> {
        const { isSignedIn, nextStep } = await signIn({
            username: email,
            password
        });

        if (!isSignedIn && nextStep.signInStep === 'CONFIRM_SIGN_UP') {
            throw new Error("User is not confirmed. Please verify your email first.");
        }

        const session = await fetchAuthSession();
        return {
            accessToken: session.tokens?.accessToken?.toString() || '',
            idToken: session.tokens?.idToken?.toString() || '',
            refreshToken: 'mock_refresh' // Amplify v6 manages refresh automatically
        };
    },

    async logout() {
        await signOut();
    },

    async signUp(name: string, password: string, email: string) {
        const { isSignUpComplete, userId, nextStep } = await signUp({
            username: email,
            password,
            options: {
                userAttributes: {
                    email,
                    name
                },
                autoSignIn: true
            }
        });
        return { isSignUpComplete, userId, nextStep };
    },

    async confirmSignUp(email: string, code: string) {
        return await confirmSignUp({
            username: email,
            confirmationCode: code
        });
    },

    async getCurrentUser() {
        try {
            const user = await getCurrentUser();
            const attributes = await fetchUserAttributes();
            return {
                id: user.userId,
                username: user.username,
                email: attributes.email,
                name: attributes.name
            };
        } catch (e) {
            return null;
        }
    }
};
