# Prisma-Plus-Plus (v1)
Write clean, readable, and meaningful code effortlessly with Prisma++. 

It's still under development for version 2 . Here's some example which was in version 1.
# Creatation:
```Javascript
import { PrismaClient } from "@prisma/client";
import { DBTable } from "./table";

const prisma = new PrismaClient();

const usersTable = new PPP({ table: prisma.users });
```
# Some Basic Oparation
```Javascript
(async () => {
  let data;

  /********************************************** Get All Users */
  data = await usersTable.fetchAll();
  console.log(data);

  // Or, in prisma -
  data = await prisma.users.findMany();
  console.log(data);

  /********************************************** Get Users by ID */
  data = await usersTable.if("id=1").fetch();
  console.log(data);

  // Or, in prisma -
  data = await prisma.users.findUnique({ where: { id: 1 } });
  console.log(data);

  /********************************************** Create a User */
  const newUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "password123",
  };
  data = await usersTable.push(newUser);
  console.log(data);

  // Or, in prisma -
  await prisma.users.create({ data: newUser });
  console.log(data);

  /********************************************** Update a User */
  const updatedUser = {
    id: 1,
    name: "Jane Doe",
    email: "jane.doe@example.com",
    password: "newPassword456",
  };
  data = await usersTable.if("id=1").push(updatedUser);
  console.log(data);

  // Or, in prisma -
  await prisma.users.update({
    where: { id: 1 },
    data: updatedUser,
  });

  /********************************************** Delete a User (soft delete) */
  data = await usersTable.if("id=1").del();
  console.log(data);

  // Or, in prisma -
  await prisma.users.update({
    where: { id: 1 },
    data: { deleted: true },
  });
  console.log(data);

  /********************************************** Delete a User (permanently) */
  data = await usersTable.if("id=1").deletePermanently();
  console.log(data);

  // Or, in prisma -
  await prisma.users.delete({
    where: { id: 1 },
  });
  console.log(data);
})();
```

# some Filtering operation
```Javascript

(async () => {
  let data;

  /********************************************** Get User with partial fields */
  data = await usersTable.if(`email='10@mail.com'`).fetch(["id", "password"]);
  console.log(data);

  // or in prisma
  data = await prisma.users.findUnique({
    where: { email: "10@mail.com" },
    select: {
      id: true,
      password: true,
    },
  });

  /********************************************** Get All Users with partial fields */
  data = await usersTable.fetchAll(["id", "verified", "proUser"]);
  console.log(data);

  //   or in prisma-
  data = await prisma.users.findMany({
    select: { id: true, verified: true, proUser: true },
  });
  console.log(data);

  /************************************************ get all user with specific field from 5th page */
  data = await usersTable
    .setPageSize(10)
    .getPage(5)
    .fetchAll(["id", "email", "password"]);

  console.log(data);

  // or in prisma
  data = await prisma.users.findMany({
    skip: 40,
    take: 10,
    select: {
      id: true,
      email: true,
      password: true,
    },
  });

  /**************************************************** Make page for a range of data & select some field with multipe order */
  const pages = usersTable.setPageSize(10).if("4<id<=75"); // we can save specific pages
  const orderById = pages.ascBy(["id"]);
  const dsecOrderById = pages.descBy(["id"]);

  // all email for id 5 to 75 in ascending order
  data = await orderById.fetchAll(["email"]);
  console.log(data);

  // or in prisma
  data = await prisma.users.findMany({
    where: {
      id: {
        gt: 4,
        lte: 75,
      },
    },
    orderBy: [{ id: "asc" }],
    select: {
      email: true,
    },
  });

  // all id and deleted fields for 25 to 30 in ase order
  data = await orderById.getPage(3).fetchAll(["id", "deleted"]);
  console.log(data);

  //or in prisma
  data = await prisma.users.findMany({
    skip: 24,
    take: 10,
    where: {
      id: {
        gt: 4,
        lte: 75,
      },
    },
    orderBy: [{ id: "asc" }],
    select: {
      id: true,
      deleted: true,
    },
  });

  // all fields for id 35 to 45 if they are deleted
  data = await dsecOrderById.getPage(4).if("deleted=true").fetchAll(["id"]);
  console.log(data);

  // or in prisma
  data = await prisma.users.findMany({
    skip: 34,
    take: 10,
    where: {
      id: {
        gt: 4,
        lte: 75,
      },
      deleted: true,
    },
    orderBy: [{ id: "asc" }],
    select: {
      id: true,
    },
  });
})();
