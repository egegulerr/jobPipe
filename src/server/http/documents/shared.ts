import { z } from "zod";

export const selectedDocumentIdsSchema = z.array(z.string().uuid()).min(1).max(100);
