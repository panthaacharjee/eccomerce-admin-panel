"use client"
// pages/auth/error.js or app/auth/error/page.jsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

// Define the error messages with a proper type
const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification link has expired or is invalid.",
    Default: "An unexpected error occurred during authentication.",
    CredentialsSignin: "Invalid email or password. Please try again.",
    OAuthSignin: "Error starting the OAuth sign-in process.",
    OAuthCallback: "Error during OAuth callback.",
    OAuthCreateAccount: "Could not create OAuth account.",
    EmailCreateAccount: "Could not create email account.",
    Callback: "Error during callback.",
    EmailSignin: "The email sign-in link is invalid.",
    SessionRequired: "Please sign in to access this page.",
};

export default function AuthError() {
    const router = useRouter();
    const { error } = router.query;

    useEffect(() => {
        if (error) {
            // Convert error to string if it's an array
            const errorKey = Array.isArray(error) ? error[0] : error;

            // Get the error message or use the error key itself as fallback
            const message = errorMessages[errorKey] || errorKey;

            toast.error(message);

            // Redirect back to home after 3 seconds
            setTimeout(() => {
                router.push("/");
            }, 3000);
        }
    }, [error, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
                <p className="text-gray-600">Redirecting you back to login...</p>
            </div>
        </div>
    );
}