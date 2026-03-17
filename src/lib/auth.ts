import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    pages: { signIn: "/login" },
    providers: [
        Google({}),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email as string | undefined;
                const password = credentials?.password as string | undefined;

                if (!email || !password) {
                    throw new Error("Email and password are required.");
                }

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    throw new Error("No account found with this email.");
                }

                // OAuth-only user trying to log in with credentials
                if (!user.password) {
                    throw new Error(
                        "This account uses Google sign-in. Please use the Google button."
                    );
                }

                if (user.isVerified === false) {
                    throw new Error(
                        "Please verify your email before logging in."
                    );
                }

                const isPasswordValid = await bcryptjs.compare(
                    password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid password.");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            // 1. Pas pertama kali Sign In: masukin data dari user/DB ke token
            if (user) {
                token.id = user.id;
                token.name = user.name;
                
                // Tarik data terbaru dari DB buat ngecek password & image
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id as string },
                    select: { image: true, password: true },
                });
                
                // PENTING: Prioritasin image dari DB, kalau kosong baru ambil bawaan Google (user.image)
                token.image = dbUser?.image ?? user.image ?? null;
                token.hasPassword = !!dbUser?.password;
            } 
            
            // 2. Pas fungsi update() dipanggil dari frontend (Settings Page)
            if (trigger === "update" && token.id) {
                // Tarik ulang dari DB biar datanya fresh
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { name: true, email: true, image: true, password: true },
                });
                
                if (dbUser) {
                    token.name = dbUser.name;
                    token.email = dbUser.email;
                    token.image = dbUser.image ?? null;
                    token.hasPassword = !!dbUser.password;
                }
            }

            return token;
        },
        
        async session({ session, token }) {
            // 3. Pindahin data dari Token ke Session biar bisa dipake di frontend
            if (session.user && token.id) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.image = (token.image as string | null) ?? null;
                session.user.hasPassword = (token.hasPassword as boolean) ?? false;
            }
            return session;
        },
    },
});