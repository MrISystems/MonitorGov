import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import { User } from 'next-auth';

// Estendendo o tipo User para incluir role
declare module 'next-auth' {
  interface User {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
  }
}

// Schema de validação para credenciais
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Função para validar credenciais
async function validateCredentials(credentials: z.infer<typeof credentialsSchema>) {
  // TODO: Implementar validação real com banco de dados
  // Por enquanto, usa credenciais fixas para teste
  const validCredentials = {
    email: 'admin@monitorgov.gov.br',
    password: 'admin123',
  };

  if (
    credentials.email === validCredentials.email &&
    credentials.password === validCredentials.password
  ) {
    return {
      id: '1',
      email: credentials.email,
      name: 'Administrador',
      role: 'admin',
    };
  }

  return null;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Valida as credenciais
          const validatedCredentials = credentialsSchema.parse(credentials);

          // Verifica as credenciais
          const user = await validateCredentials(validatedCredentials);

          if (user) {
            return user;
          }

          return null;
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
