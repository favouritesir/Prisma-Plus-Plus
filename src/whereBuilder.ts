/*
 * Title: Where object Builder
 * Description: This is not well tested or optimized. I just jumped to development, not a professional
 *              So if you have spare time, please try to contribute to make it faster and more accurate.
 * Author: Ashikur Rahman SA
 * Date: Thursday, 31 -October-2024 (17:22:43)
 *
 */

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
export const buildWhere = (con: string) => {
  /**
   * formate the keys
   * @input a>12
   * @output "a":{>12}
   */
  con = con
    .replace(/\n|\s|\t/g, "")
    .replace(
      /((,|\w+)?\s*?((>>|<<|<=|>=|=|!=|<|>|\^|\$|\:\:|@!|@\*|@\?|@|!\()\s*?(\d+|\[[^\]]*\]|"[^"]*"|'[^']*'|true|flase),?)+)/g,
      function (match, _, g2): string {
        return `"${g2}":{${match.replace(g2, "")}}`;
      }
    );

  /**
   * formate the operators
   * @input "a":{>12}
   * @output "a":{"gt":12}
   */
  const regex = /(>>|<<|<=|>=|=|!=|<|>|\^|\$|\:\:|@!|@\*|@\?|@|!\()/g;
  con = con.replace(regex, (m) => ops[m]);

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
        // console.log(str);
        str = con[start - 1] == ":" ? `{${str.slice(1, -1)}}` : str; //`${str.slice(1, -1)}`;

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
  // console.log(con);
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
  // console.log(con);
  return con;
};

console.log(
  JSON.stringify(
    buildWhere(
      // `(age > 20,<50,!=30 || year=2024 && (!(status = 'active') && (status != 'pending')))`
      `age > 18 , < 30 || (!(status = "inactive") && (role != "admin" || location="NY"))`
    )
  )
);
