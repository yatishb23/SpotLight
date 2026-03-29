import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const AUTH_REQUEST_TIMEOUT_MS = 10000;

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getAuthServiceBaseUrl() {
  return trimTrailingSlash(
    process.env.AUTH_SERVICE_URL ||
      process.env.API_GATEWAY_URL ||
      process.env.BACKEND_URL ||
      "http://localhost:1111",
  );
}

async function postAuthService(path: string, payload: unknown) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getAuthServiceBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await response.text();
    let data: any = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

const handler = NextAuth({
  providers: [
    // ✅ GOOGLE OAUTH
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { response, data } = await postAuthService("/api/auth/login", {
              email: credentials.email,
              password: credentials.password,
          });

          if (response.ok && data?.success) {
            const role = (data.user.role || 'user').toLowerCase();
            return {
              id: data.user.id,
              name: data.user.fullName,
              email: data.user.email,
              role: role,
              image: data.user.image,
              accessToken: data.token,
            };
          }

          console.warn("Credentials authorize failed", {
            status: response.status,
            message: data?.message,
          });
          return null;
        } catch (error) {
          console.error("Credentials login error:", error);
          return null;
        }
      }
    })
  ],

  // pages: {
  //   signIn: '/login',
  // },

  callbacks: {
    async signIn({ user, account }) {
      return true;
    },

    // ✅ JWT STORAGE
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user'; // Default to user if not provided

        // If credentials login, use the accessToken from user
        if (account?.provider === "credentials" && user.accessToken) {
          token.accessToken = user.accessToken;
        }

        // If Google login, sync with backend and get real role
        if (account?.provider === "google") {
          try {
            const { response, data } = await postAuthService("/api/auth/google", {
                email: user.email,
                name: user.name,
                image: user.image,
                provider: "google",
                providerId: account.providerAccountId,
            });

            if (response.ok && data?.success && data?.user) {
                token.id = data.user.id;
                token.role = data.user.role;
                if (data.token) {
                    token.accessToken = data.token;
                }
            } else {
                console.warn("Backend sync failed for Google login, using default role");
            }
          } catch (error) {
            console.error("Google login backend sync error:", error);
            // Keep default 'user' role
          }
        }
      }
      return token;
    },

    // ✅ SESSION ACCESS (frontend)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;        
        session.user.accessToken = token.accessToken as string;
        session.user.name = session.user.name || "User"; 
      }
      return session;
    }
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }, 

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };