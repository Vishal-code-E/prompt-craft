import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
    async signIn({ user }) {
      try {
        if (!user.email) return false;
        
        // Check if user has a default workspace, create one if not
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { ownedWorkspaces: true },
        });

        if (dbUser && dbUser.ownedWorkspaces.length === 0) {
          // Create default workspace for new user
          const workspace = await prisma.workspace.create({
            data: {
              name: 'My Workspace',
              ownerId: dbUser.id,
            },
          });

          await prisma.user.update({
            where: { id: dbUser.id },
            data: { defaultWorkspaceId: workspace.id },
          });
        }
        
        return true;
      } catch (error) {
        console.error('Error in sign-in callback:', error);
        return true; // Allow sign in even if workspace creation fails
      }
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        
        // Add default workspace to session
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { defaultWorkspaceId: true },
        });
        
        if (dbUser?.defaultWorkspaceId && session.user) {
          (session.user as { defaultWorkspaceId?: string }).defaultWorkspaceId = dbUser.defaultWorkspaceId;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
})
