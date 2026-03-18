import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

type RouteHandler = (
    req: NextRequest,
    context?: unknown
) => Promise<NextResponse> | NextResponse;

export function withAuthAndValidation<T>(
    handler: RouteHandler,
    schema?: z.ZodSchema<T>
): RouteHandler {
    return async (req: NextRequest, context?: unknown) => {
        try {
            // 1. Auth Check
            const session = await auth();
            if (!session?.user?.id) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // 2. Validation Check
            let reqForHandler = req;
            if (schema) {
                reqForHandler = req.clone() as NextRequest;
                let body;
                try {
                    body = await req.json();
                } catch {
                    return NextResponse.json(
                        { error: "Invalid JSON payload" },
                        { status: 400 }
                    );
                }

                const result = schema.safeParse(body);
                if (!result.success) {
                    return NextResponse.json(
                        { error: "Validation Error", details: result.error.format() },
                        { status: 400 }
                    );
                }
            }

            // 3. Execute Handler
            return await handler(reqForHandler, context);
        } catch (error) {
            console.error("[API_WRAPPER_ERROR]", error);
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }
    };
}
