import { z } from "zod";

export const SupplierSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(5, "Le téléphone est requis").nullable().optional(),
  address: z.string().nullable().optional(),
  email: z.string().email("Email invalide").nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type Supplier = z.infer<typeof SupplierSchema>;

export const SupplierCreateSchema = SupplierSchema.omit({ id: true });
export const SupplierUpdateSchema = SupplierSchema.partial();
