/*
 * Title: UTILITIES FOR PPP
 * Description: Some utility functions will be added here inShaAllah.
 * Author: Ashikur Rahman SA
 * Date: Thursday, 31 -October-2024 (16:01:53)
 *
 */
/************************************************************************************************* SIMPLE JSON BIG INT FIXER */
export const fixedJsonBigInt = (obj: any) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      return typeof value === "bigint" ? value.toString() : value;
    })
  );
};
