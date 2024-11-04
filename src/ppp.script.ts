import { fixedJsonBigInt } from "./Utils/utils";
import { DBTableType } from "./interfaces";
// ============================================================================================
// ===================================== PRISMA PLUS PLUS =====================================
// ============================================================================================
// AUTHOR       : Ashikur Rahman
// DESCRIPTION  : Prisma++ is an utility library for Prisma ORM to provide a smooth experience
//                and to increase code readability. It is free software thats makes Prisma easy.
// VERSION      : v1.0.0
// Date         : Thursday, 31 -October-2024 (15:40:08)
// ============================================================================================

export interface QueryType {
  where?: any;
  select?: any;
  skip?: number;
  take?: number;
  orderBy?: any;
  data?: object;
  cursor?: any;
  distinct?: any;
  include?: object;
}
export interface DBTablePropertyType {
  query?: QueryType;
  fields?: string[]; // table header fields
  totalRows?: number; // total rows in the table
  table: DBTableType;
}

export class DBTable {
  private query: QueryType = {};
  private totalRows: number = 0; // total rows in the table
  private table: DBTableType;
  private errValue: any = undefined;
  constructor(options: DBTablePropertyType) {
    this.table = options.table;
    if (options.totalRows) this.totalRows = options.totalRows;
    if (options.query) this.query = { ...options.query };
  }

  /************************************************************************************************* NEW INSTANT MAKER */
  private getInstant() {
    return new DBTable({
      table: this.table,
      query: this.query,
      totalRows: this.totalRows,
    });
  }

  private selectOrInclude(params: string[] | object) {
    // convert array to object for params query objects
    return Array.isArray(params)
      ? params.reduce((acc, val) => {
          acc[val] = true;
          return acc;
        }, {} as any)
      : params;
  }

  private queryFilter(keys: string[]) {
    return keys.reduce((acc, key) => {
      const query = (this.query as any)[key];
      if (query) acc[key] = query;
      return acc;
    }, {} as any);
  }

  /************************************************************************************************* GET QUERY & QUERY FILTER */
  // for debugging the filter result
  getQuery() {
    return this.query;
  }
  getQueryFilter(keys: string[]) {
    return this.queryFilter(keys);
  }

  /************************************************************************************************* SET CUSTOM ERR VALUE */
  getIfErr(val: any) {
    this.errValue = val;
    return this.getInstant();
  }
  getErrAs(val: any) {
    return this.getIfErr(val);
  }
  /************************************************************************************************* WHERE OBJECT */
  where(cond: string | object) {
    // const condition = typeof cond === "string" ? buildWhere(cond) : cond;
    // this.query.where = this.query.where
    //   ? { ...this.query.where, ...condition }
    //   : { ...condition };

    return this.getInstant();
  }

  when(cond: string | object) {
    return this.where(cond); // alternative to increase the readability of the where query
  }

  if(cond: string | object) {
    return this.where(cond); // alternative to increase the readability of the where query
  }

  /************************************************************************************************* INCLUDE OBJECT */
  include(include: string[] | object) {
    // convert array to object for include query objects
    const query = this.selectOrInclude(include);

    // initialize the query
    this.query.include = this.query.include
      ? { ...this.query.include, ...query }
      : query;

    //return new instance
    return this.getInstant();
  }

  with(include: string[] | object) {
    return this.include(include);
  }

  // remove relations
  exclude(exclude: string[]) {
    // convert array to object for exclude query objects
    exclude.forEach((key) => delete (this.query.include as any)[key]);
    return this.getInstant();
  }

  without(exclude: string[]) {
    return this.exclude(exclude);
  }

  /************************************************************************************************* SELECT OBJ */

  select(select: string[] | object) {
    // convert array to object for select query objects
    const query = this.selectOrInclude(select);

    // initialize the query
    this.query.select = this.query.select
      ? { ...this.query.select, ...query }
      : query;

    //return new instance
    return this.getInstant();
  }

  getFields(columns?: string[] | Object) {
    if (!columns) return Object.keys(this.table.fields);
    return this.select(columns);
  }

  for(columns: string[] | object) {
    return this.select(columns);
  }

  getIfDone(columns: string[] | object) {
    return this.select(columns);
  }

  /************************************************************************************************* ORDER BY */
  orderBy(columns: string[], order?: "asc" | "desc") {
    let query: any = [];

    columns.forEach((column) =>
      query.push({
        [column]: order,
      })
    );

    // initialize the query
    this.query.orderBy = this.query.orderBy
      ? [...this.query.orderBy, ...query]
      : query;

    return this.getInstant();
  }

  ascBy(columns: string[]) {
    return this.orderBy(columns, "asc");
  }

  descBy(columns: string[]) {
    return this.orderBy(columns, "desc");
  }

  /************************************************************************************************* PAGINATION */
  setPageSize(n: number) {
    this.query.take = n;
    return this.getInstant();
  }
  getPage(n: number) {
    this.query.skip = (n - 1) * (this.query.take || 0);
    return this.getInstant();
  }

  take(n: number) {
    this.query.take = n;
    return this.getInstant();
  }
  /************************************************************************************************* GET COUNT */
  async count() {
    return await this.table.count(this.query);
  }
  /************************************************************************************************* FETCH THE TABLE DATA */
  async fetch(select?: string[] | object) {
    if (select) this.query.select = this.selectOrInclude(select); // it cancels all previous selects.
    try {
      return this.query.where
        ? fixedJsonBigInt(
            await this.table.findUnique(
              this.queryFilter(["where", "select", "include"])
            )
          )
        : "";
    } catch (error) {
      if (this.errValue != undefined) return this.errValue;
      else throw new Error("wrong query");
    }
  }

  async fetchAll(select?: string[] | object) {
    if (select) this.query.select = this.selectOrInclude(select); // it cancels all previous selects.
    try {
      return fixedJsonBigInt(await this.table.findMany(this.query));
    } catch (error) {
      if (this.errValue != undefined) return this.errValue;
      else throw new Error("wrong query");
    }
  }

  /************************************************************************************************* UPDATE THE TABLE DATA */
  async push(data: object) {
    try {
      if (this.query.where) {
        // update the data
        return fixedJsonBigInt(
          await this.table.update({
            data,
            ...this.queryFilter(["where", "include", "select"]),
          })
        );
      } else {
        //create a new
        return fixedJsonBigInt(
          await this.table.create({
            data,
            ...this.queryFilter(["include", "select"]),
          })
        );
      }
    } catch (error) {
      if (this.errValue != undefined) return this.errValue;
      else throw new Error("wrong query try to select single unique range");
    }
  }

  async pushAll(data: object[] | object, skipDuplicate: boolean = true) {
    try {
      if (this.query.where && !Array.isArray(data)) {
        // update all data
        return fixedJsonBigInt(
          await this.table.updateMany({
            data,
            where: this.query.where,
          })
        );
      } else {
        // create many new rows
        return fixedJsonBigInt(
          await this.table.createMany({
            data,
            skipDuplicate: skipDuplicate,
          })
        );
      }
    } catch (error) {
      if (this.errValue != undefined) return this.errValue;
      else throw new Error("wrong query");
    }
  }

  /************************************************************************************************* DELETE THE TABLE DATA */
  // TODO: NEED TO IMPLEMENT SOFT DELETE
  async del() {
    try {
      return fixedJsonBigInt(
        await this.table.update({
          data: { deleted: true },
          ...this.queryFilter(["where", "include", "select"]),
        })
      );
    } catch (error) {
      if (this.errValue != undefined) return this.errValue;
      else throw new Error("wrong query");
    }
  }

  async delAll() {
    try {
      return fixedJsonBigInt(
        await this.table.updateMany({
          data: { deleted: true },
          ...this.queryFilter(["where"]),
        })
      );
    } catch (error) {
      if (this.errValue != undefined) return this.errValue;
      else throw new Error("wrong query");
    }
  }

  /************************************************************************************************* PERMANENTLY DELETE  */
  // TODO: NEED TO IMPLEMENT PERMANENT DELETE
  async deletePermanently() {
    return fixedJsonBigInt(
      await this.table.delete({
        where: this.query.where,
        include: this.query.include,
        select: this.query.select,
      })
    );
  }

  async deleteAllPermanently() {
    return fixedJsonBigInt(
      await this.table.deleteMany({
        where: this.query.where,
        include: this.query.include,
        select: this.query.select,
      })
    );
  }
}
