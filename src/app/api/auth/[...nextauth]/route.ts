import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db } from "@/lib/firebase-admin"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/signup',
    signOut: '/',
    error: '/signup',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) return false;
        
        const userRef = db.collection('users').doc(user.email);
        const userDoc = await userRef.get();
        
        const userData = {
          email: user.email,
          name: user.name || '',
          image: user.image || '',
          provider: account?.provider || 'google',
          updatedAt: new Date().toISOString(),
        };
        
        if (!userDoc.exists) {
          // Create new user
          await userRef.set({
            ...userData,
            createdAt: new Date().toISOString(),
          });
          console.log('New user created:', user.email);
        } else {
          // Update existing user
          await userRef.update(userData);
          console.log('User updated:', user.email);
        }
        
        return true;
      } catch (error) {
        console.error('Error saving user to Firestore:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }
