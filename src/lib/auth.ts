import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

/**
 * Acceso solo por invitación (o primer usuario bootstrap).
 * El signup público queda bloqueado salvo invitación PENDING válida.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email.toLowerCase();
          const existingUsers = await prisma.user.count();

          if (existingUsers === 0) {
            return { data: { ...user, email } };
          }

          const invitation = await prisma.invitation.findFirst({
            where: {
              email,
              status: "PENDING",
              expiresAt: { gt: new Date() },
            },
          });

          if (!invitation) {
            throw new APIError("FORBIDDEN", {
              message: "El Consejo solo abre su puerta por invitación.",
            });
          }

          return { data: { ...user, email } };
        },
        after: async (user) => {
          const email = user.email.toLowerCase();
          const invitation = await prisma.invitation.findFirst({
            where: {
              email,
              status: "PENDING",
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
          });

          if (!invitation) {
            // Primer usuario: crear Consejo y nombrarlo organizador.
            const council = await prisma.council.create({
              data: {
                name: "El Consejo de Elrond",
                members: {
                  create: {
                    userId: user.id,
                    role: "ORGANIZADOR",
                  },
                },
                rules: { create: {} },
                approaches: {
                  create: [
                    { name: "Ética" },
                    { name: "Historia" },
                    { name: "Estrategia" },
                    { name: "Experiencia personal" },
                    { name: "Ciencia" },
                  ],
                },
              },
            });
            void council;
            return;
          }

          await prisma.$transaction([
            prisma.invitation.update({
              where: { id: invitation.id },
              data: {
                status: "ACCEPTED",
                acceptedAt: new Date(),
              },
            }),
            prisma.councilMember.create({
              data: {
                councilId: invitation.councilId,
                userId: user.id,
                role: invitation.role,
              },
            }),
          ]);
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
