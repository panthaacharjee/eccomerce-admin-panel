// pages/api/auth/[...nextauth].js or app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import Axios from "../../../../components/Axios";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
      httpOptions: {
        timeout: 10000,
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      httpOptions: {
        timeout: 10000,
      },
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
        type: { label: "type", type: "text" },
        firstName: { label: "firstName", type: "text" },
        lastName: { label: "lastName", type: "text" },
      },
      async authorize(credentials) {
        try {
          console.log("Auth attempt:", {
            email: credentials?.email,
            type: credentials?.type
          });

          if (credentials?.type === "Register") {
            // Handle Registration
            try {
              const { data } = await Axios.post("/register/user", {
                firstName: credentials.firstName,
                lastName: credentials.lastName,
                email: credentials.email,
                password: credentials.password,
              });

              let user = data.user;
              user.sessionToken = data.user?.authentication?.sessionToken;
              user.id = user._id || user.id;

              return user || null;
            } catch (error) {
              console.error("Registration error:", error.response?.data || error.message);

              if (error.response) {
                const { status, data } = error.response;

                if (status === 409 || data.message?.includes("exist")) {
                  throw new Error("User already exists with this email");
                } else if (status === 400) {
                  throw new Error(data.message || "Invalid registration data");
                } else if (status === 500) {
                  throw new Error("Server error. Please try again later.");
                } else {
                  throw new Error(data.message || "Registration failed");
                }
              }
              throw new Error("Network error during registration");
            }
          }
          else if (credentials?.type === "Admin") {
            // Handle Admin Login
            try {
              const { data } = await Axios.post("/login/admin", {
                email: credentials.email,
                password: credentials.password,
              });

              let user = data.user;
              user.sessionToken = data.user?.authentication?.sessionToken;
              user.id = user._id || user.id;

              return user || null;
            } catch (error) {
              console.error("Admin login error:", error.response?.data || error.message);

              if (error.response) {
                const { status, data } = error.response;

                if (status === 401) {
                  throw new Error("Invalid email or password");
                } else if (status === 404) {
                  throw new Error("Admin account not found");
                } else {
                  throw new Error(data.message || "Admin login failed");
                }
              }
              throw new Error("Network error during admin login");
            }
          }
          else {
            // Handle Regular User Login
            try {
              const { data } = await Axios.post("/login/user", {
                email: credentials?.email,
                password: credentials?.password,
              });

              console.log("Login response:", data);

              if (!data.user) {
                throw new Error("Invalid email or password");
              }

              let user = data.user;
              user.sessionToken = data.user?.authentication?.sessionToken;
              user.id = user._id || user.id;

              return user || null;
            } catch (error) {
              console.error("Login error:", error.response?.data || error.message);

              if (error.response) {
                const { status, data } = error.response;

                if (status === 401) {
                  throw new Error("Invalid email or password");
                } else if (status === 404) {
                  throw new Error("User not found. Please sign up first.");
                } else {
                  throw new Error(data.message || "Login failed");
                }
              }
              throw new Error("Network error during login");
            }
          }
        } catch (error) {
          // Throw the error to be caught by NextAuth
          throw new Error(error.message);
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, profile, account }) {
      // Handle Credentials Provider
      if (account?.provider === "credentials") {
        // If user has sessionToken, it's valid
        return user?.sessionToken ? true : false;
      }

      // Handle OAuth Providers (Google, GitHub)
      try {
        // For OAuth, we can auto-create/verify user in your backend
        const { data } = await Axios.post(`/login/auth`, {
          email: profile?.email || user.email,
          name: profile?.name || user.name,
          accountType: account?.provider,
        });

        user.sessionToken = data.user?.authentication?.sessionToken;
        user.id = data.user?._id || data.user?.id;

        return user?.sessionToken ? true : false;
      } catch (err) {
        console.error("OAuth sign-in error:", err.response?.data || err.message);

        // You can throw specific errors that will be caught by the frontend
        if (err.response?.status === 409) {
          throw new Error("Email already exists with another provider");
        }

        return false;
      }
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        token.id = user.id;
        token.sessionToken = user.sessionToken;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }

      return token;
    },

    async session({ session, token }) {
      // Add custom properties to session
      if (session.user) {
        session.user.id = token.sessionToken;
        session.user.email = token.email;
        session.user.name = token.name;
      }

      session.accessToken = token.accessToken;
      session.provider = token.provider;

      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 5, // 5 hours
  },

  jwt: {
    secret: process.env.AUTH_SECRET,
    maxAge: 60 * 60 * 5, // 5 hours
  },

  pages: {
    signIn: "/signin",
    error: "/auth/error", // Custom error page
    newUser: "/welcome",  // Optional: redirect new users
  },

  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
      },
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",

  // Secret for encrypting tokens
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
});

export { handler as GET, handler as POST };