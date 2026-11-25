import "server-only";

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { TaskNotFoundError } from "@/server/services/task.service";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return { headers: opts.headers };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const zodIssue = error.cause instanceof ZodError ? error.cause.issues[0] : undefined;
    return {
      ...shape,
      message: zodIssue ? zodIssue.message : shape.message,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const domainErrors = t.middleware(async ({ next }) => {
  const result = await next();
  if (!result.ok && result.error.cause instanceof TaskNotFoundError) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: result.error.cause.message,
      cause: result.error.cause,
    });
  }
  return result;
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(domainErrors);
