import { Prisma, PrismaClient } from "@prisma/client";
import { PPP } from "./ppp.script";
import { prismaTypes } from "./prismaTypes";

export const prisma = new PrismaClient();

export const DB = {
  get(modelName: Prisma.ModelName) {
    const fields = Prisma[`${modelName}ScalarFieldEnum`];
    const whereInput = `${modelName}WhereInput` as const;
    const select = `${modelName}Select` as const;
    const include = `${modelName}Include` as const;

    const tableName = "user";

    return new PPP<
      { [k in keyof typeof fields]?: any },
      prismaTypes[typeof whereInput],
      prismaTypes[typeof select],
      prismaTypes[typeof include]
    >(prisma[tableName]);
  },
};

prisma.user.findMany({});
