import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.ts";
process.loadEnvFile()

const connectionString = process.env.NODE_ENV != "test" ? 
    `${process.env.DATABASE_URL}` :
    `${process.env.DATABASE_URL_TEST}`

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };