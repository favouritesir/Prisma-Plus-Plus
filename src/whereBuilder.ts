/*
 * Title: Where object Builder
 * Description: This is not well tested or optimized. I just jumped to development, not a professional
 *              So if you have spare time, please try to contribute to make it faster and more accurate.
 * Author: Ashikur Rahman SA
 * Date: Thursday, 31 -October-2024 (17:22:43)
 *
 */

import { JsonBoundary } from "json-boundary";

type opsType = {
  [key: string]: string;
};
const ops: opsType = {
  "=": `"equals":`,
  "!=": `"not":`,
  ">": `"gt":`,
  "<": `"lt":`,
  ">=": `"gte":`,
  "<=": `"lte":`,
  "::": `"contains":`,
  "^": `"startsWith":`,
  $: `"endsWith":`,
  ">>": `"in":`,
  "<<": `"notIn":`,
  "@": `"has":`,
  "@*": `"hasEvery":`,
  "@?": `"hasSome":`,
  "@!": `"isEmpty":`,
  "!(": `"NOT":(`,
};

const JB = new JsonBoundary();

/**
 * build where
 * @param condition:string; like "id<100"
 * @returns object like {id:{lt:100}}
 ************************************************************************************************* BUILD WHERE OBJ
 */
export const buildWhere = (con: string) => {
  // get a simple form of json string
  const { id, str } = JB.getSimple(con, "###");
  con = str;

  /**
   * formate the keys
   * @input a>12
   * @output "a":{>12}
   */
  con = con
    .replace(/\n|\s|\t/g, "")
    .replace(
      /(\w+)?([><=!@^$:?*]{1,2}(\d+|###|true|false),?)+/g,
      function (match, g1): string {
        return `"${g1}":{${match.replace(g1, "")}}`;
      }
    );

  // /**
  //  * formate the operators
  //  * @input "a":{>12}
  //  * @output "a":{"gt":12}
  //  */
  const regex = /([><=!@^$:?*]{1,2}|!\()(\d+|###|"|true|false)/gi;
  con = con.replace(regex, (_, g1, g2) => ops[g1] + g2);

  /**
   * handle nested parentheses and logical operators
   */
  if (con.includes(`(`)) {
    const arr: number[] = [];
    let extra = 0;
    con.split("").forEach((l, i, cArr) => {
      if (l == "(") arr.push(i + extra);
      else if (l == ")") {
        const start = arr.pop() || 0;

        let str = conLogicHandler(con.substring(start, i + extra + 1));

        str = con[start - 1] == ":" ? `{${str.slice(1, -1)}}` : str;

        con = con.slice(0, start + 1) + str + con.slice(i + extra + 1);
        extra = str.length - (i - start);
      }
    });
    /**
     * remove extra commas and parentheses
     */
    con = con.replace(/\(|\)/g, "").replace(/'/g, `"`);
    con = con.replace(/,\}/g, "},").replace(/,\}/g, "}");
  }

  /**
   * after nested operation && formatting finally handle other logical operators
   * here our conLogicHandler get extra character to check the not operator is present or not.
   * so here we add extra character which may be any without colon (:)
   */
  con = conLogicHandler(con);

  // replace original string
  con = JB.replaceOriginal(con, id);

  try {
    return JSON.parse(`{${con}}`);
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
};

const conLogicHandler = (con: string) => {
  const orCons = con.split("||").map((c) => {
    const andCons = c.split("&&");
    return andCons.length > 1 ? `"AND":[{${andCons.join("},{")}}]` : c;
  });
  con = orCons.length > 1 ? `"OR":[{${orCons.join("},{")}}]` : con;

  const andCons = con.split("&&");
  con = andCons.length > 1 ? `"AND":[{${andCons.join("},{")}}]` : con;
  return con;
};
