// backend-graphql/src/resolvers/clients.ts

import { Context } from "../context";
import { Prisma } from "@prisma/client";

const toNull = (v?: string | null) => (v && v.trim() ? v.trim() : null);
const up = (v?: string | null) => (v && v.trim() ? v.trim().toUpperCase() : null);

type ClientsArgs = {
  type?: "PERSONAL" | "COMPANY";
  search?: string | null;
  take?: number | null;
  skip?: number | null;
};

const searchWhere = (q?: string | null): Prisma.clientsWhereInput | undefined => {
  const s = q?.trim();
  if (!s) return undefined;
  return {
    OR: [
      { first_name:   { contains: s, mode: "insensitive" } },
      { last_name:    { contains: s, mode: "insensitive" } },
      { company_name: { contains: s, mode: "insensitive" } },
      { email:        { contains: s, mode: "insensitive" } },
      { dni:          { contains: s, mode: "insensitive" } },
      { vat_number:   { contains: s, mode: "insensitive" } },
    ],
  };
};

export const clientsResolvers = {
  Query: {
    clients: async (_: unknown, args: ClientsArgs = {}, { db }: Context) => {
      const { type, search, take, skip } = args;
      const where: Prisma.clientsWhereInput = {
        ...(type ? { type } : {}),
        ...(searchWhere(search)),
      };
      return db.clients.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: typeof take === "number" ? Math.max(1, Math.min(100, take)) : 50,
        skip: typeof skip === "number" ? Math.max(0, skip) : 0,
      });
    },

    client: async (_: unknown, { client_id }: { client_id: number }, { db }: Context) => {
      return db.clients.findUnique({ where: { client_id } });
    },

    // Compat si aún lo usas en algún sitio
    personalClients: async (_: unknown, __: unknown, { db }: Context) => {
      return db.clients.findMany({
        where: { type: "PERSONAL" },
        orderBy: { created_at: "desc" },
      });
    },
  },

  Mutation: {
    createClient: async (
      _: unknown,
      {
        data,
      }: {
        data: {
          type: "PERSONAL" | "COMPANY";
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          vat_number?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          dni?: string | null;
          address?: string | null;
          country?: string | null;
          city?: string | null;
          postal_code?: string | null;
        };
      },
      { db }: Context
    ) => {
      const isCompany = data.type === "COMPANY";

      try {
        const created = await db.clients.create({
          data: {
            type: data.type,
            // Personal
            first_name: isCompany ? null : toNull(data.first_name),
            last_name: isCompany ? null : toNull(data.last_name),
            // Company
            company_name: isCompany ? toNull(data.company_name) : null,
            vat_number: isCompany ? up(data.vat_number) : null,
            contact_person: isCompany ? toNull(data.contact_person) : null,
            // Compartidos
            email: toNull(data.email),
            phone: toNull(data.phone),
            dni: up(data.dni),
            address: toNull(data.address),
            country: toNull(data.country),
            city: toNull(data.city),
            postal_code: toNull(data.postal_code),
          },
        });
        return created;
      } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          const target = (e.meta?.target as string[])?.[0] ?? "field";
          throw new Error(
            target === "email"
              ? "Email already exists"
              : target === "dni"
              ? "DNI already exists"
              : target === "vat_number"
              ? "VAT number already exists"
              : "Unique constraint failed"
          );
        }
        throw e;
      }
    },

    updateClient: async (
      _: unknown,
      {
        client_id,
        data,
      }: {
        client_id: number;
        data: {
          type?: "PERSONAL" | "COMPANY";
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          vat_number?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          dni?: string | null;
          address?: string | null;
          country?: string | null;
          city?: string | null;
          postal_code?: string | null;
        };
      },
      { db }: Context
    ) => {
      const current = await db.clients.findUnique({ where: { client_id } });
      if (!current) throw new Error("Client not found");

      const nextType = (data.type ?? current.type) as "PERSONAL" | "COMPANY";

      const payload: Prisma.clientsUpdateInput = {
        // Compartidos
        type: nextType,
        email:       data.email       !== undefined ? toNull(data.email)       : undefined,
        phone:       data.phone       !== undefined ? toNull(data.phone)       : undefined,
        dni:         data.dni         !== undefined ? up(data.dni)             : undefined,
        address:     data.address     !== undefined ? toNull(data.address)     : undefined,
        country:     data.country     !== undefined ? toNull(data.country)     : undefined,
        city:        data.city        !== undefined ? toNull(data.city)        : undefined,
        postal_code: data.postal_code !== undefined ? toNull(data.postal_code) : undefined,
        updated_at: new Date(),
      };

      if (nextType === "COMPANY") {
        // Forzar personales a null SIEMPRE
        payload.first_name = null;
        payload.last_name = null;

        // Actualizar campos de empresa si vienen
        payload.company_name   = data.company_name   !== undefined ? toNull(data.company_name)    : undefined;
        payload.vat_number     = data.vat_number     !== undefined ? up(data.vat_number)          : undefined;
        payload.contact_person = data.contact_person !== undefined ? toNull(data.contact_person)   : undefined;
      } else {
        // PERSONAL — Forzar company_* a null SIEMPRE
        payload.company_name = null;
        payload.vat_number = null;
        payload.contact_person = null;

        // Actualizar personales si vienen
        payload.first_name = data.first_name !== undefined ? toNull(data.first_name) : undefined;
        payload.last_name = data.last_name !== undefined ? toNull(data.last_name) : undefined;
      }

      try {
        return await db.clients.update({ where: { client_id }, data: payload });
      } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
          const target = (e.meta?.target as string[])?.[0] ?? "field";
          throw new Error(
            target === "email"
              ? "Email already exists"
              : target === "dni"
              ? "DNI already exists"
              : target === "vat_number"
              ? "VAT number already exists"
              : "Unique constraint failed"
          );
        }
        throw e;
      }
    },

    deleteClient: async (_: unknown, { clientId }: { clientId: number }, { db }: Context) => {
      try {
        await db.clients.delete({ where: { client_id: clientId } });
        return true;
      } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
          // FK constraint (tiene vehículos/órdenes)
          throw new Error("Cannot delete client with related records (vehicles/work orders).");
        }
        throw e;
      }
    },
  },

  // 👇 resolvers de tipo
  Client: {
    vehicles: async (parent: { client_id: number }, _args: unknown, ctx: Context) => {
      // Usa DataLoader si está en el contexto; si no, fallback a query directa
      const loaders = (ctx as any)?.loaders as
        | { vehiclesByClientId?: { load: (id: number) => Promise<any[]> } }
        | undefined;

      if (loaders?.vehiclesByClientId) {
        return loaders.vehiclesByClientId.load(parent.client_id);
      }

      return ctx.db.vehicles.findMany({
        where: { client_id: parent.client_id },
        orderBy: { created_at: "desc" },
      });
    },
  },
};
