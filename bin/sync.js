#!/usr/bin/env node

const { Prisma } = require("@prisma/client");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

exec("npx prisma generate", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error generating Prisma client: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Prisma generate stderr: ${stderr}`);
    return;
  }

  const models = Object.values(Prisma.ModelName).reduce((acc, name) => {
    acc += `\n${name}WhereInput?:Prisma.${name}WhereInput;`;
    acc += `\n${name}Select?:Prisma.${name}Select;`;
    acc += `\n${name}Include?:Prisma.${name}Include;`;
    return acc;
  }, "");

  const content = `import { Prisma } from "@prisma/client";\nexport interface prismaTypes{${models}}`;

  fs.writeFileSync(
    path.join(__dirname, "..", "src", "prismaTypes.ts"),
    content,
    (err) => {
      if (err) {
        console.error(`Error writing prismaTypes.ts: ${err.message}`);
      }
      return;
    }
  );
  console.log("Prisma client generated successfully.");
});
