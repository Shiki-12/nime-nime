import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            image?: string | null;
            hasPassword: boolean;
            nsfwEnabled: boolean;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        image?: string | null;
        hasPassword?: boolean;
        nsfwEnabled?: boolean;
    }
}
