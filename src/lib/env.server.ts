import { createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Server-only environment access.
 *
 * Every variable is optional in the schema and required at the point of use.
 * A fresh clone with no secrets still has to build: prerendering runs route
 * loaders, so a schema that threw on a missing key would make `pnpm build`
 * depend on production credentials. Malformed values still fail immediately,
 * which is the failure worth catching early - an empty string that silently
 * authenticates as nobody is worse than a crash.
 */
const environmentSchema = z.object({
  /** Fine-grained token used to read GitHub activity for the home page. */
  GITHUB_ACTIVITY_TOKEN: z.string().min(1).optional(),
  /** Signing key for newsletter confirmation links. Rotating it invalidates every link in flight. */
  NEWSLETTER_SIGNING_SECRET: z.string().min(32).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_AUDIENCE_ID: z.string().min(1).optional(),
});

type Environment = z.infer<typeof environmentSchema>;

let cached: Readonly<Environment> | undefined;

/**
 * `createServerOnlyFn` is the guard rather than a runtime check: reading this
 * from the browser bundle throws instead of quietly resolving to nothing.
 */
const readEnvironment = createServerOnlyFn((): Readonly<Environment> => {
  cached ??= Object.freeze(environmentSchema.parse(process.env));

  return cached;
});

export function env(): Readonly<Environment> {
  return readEnvironment();
}

/**
 * Reads a variable that the calling feature cannot work without, failing with
 * the variable's name rather than with whatever the downstream API returns for
 * an empty credential.
 */
export function requireEnv<Key extends keyof Environment>(
  key: Key
): NonNullable<Environment[Key]> {
  const value = readEnvironment()[key];

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/** Test seam: forces the next read to re-parse `process.env`. */
export function resetEnvironmentCache(): void {
  cached = undefined;
}
