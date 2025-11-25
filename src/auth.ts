import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

// Lazy load Firebase Admin to avoid initialization errors
async function getFirestore() {
  if (db) return db;
  
  try {
    const { db: firestore } = await import("@/lib/firebase-admin");
    db = firestore;
    return db;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/signup',
    signOut: '/',
    error: '/signup',
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) return false;
        
        const firestore = await getFirestore();
        
        if (firestore) {
          const userRef = firestore.collection('users').doc(user.email);
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
        } else {
          console.log('Firebase not available, user sign-in allowed but not saved:', user.email);
        }
        
        return true;
      } catch (error) {
        console.error('Error saving user to Firestore:', error);
        // Allow sign in even if Firebase fails
        return true;
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // @ts-expect-error - Adding custom id field to session.user
        session.user.id = token.sub;
      }
      return session;
    },
  },
})
