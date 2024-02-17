import type { z } from "zod";
import type { jwtPayloadSchema } from "./schema";

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
