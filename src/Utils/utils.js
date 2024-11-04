"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixedJsonBigInt = void 0;
/*
 * Title: UTILITIES FOR PPP
 * Description: Some utility functions will be added here inShaAllah.
 * Author: Ashikur Rahman SA
 * Date: Thursday, 31 -October-2024 (16:01:53)
 *
 */
/************************************************************************************************* SIMPLE JSON BIG INT FIXER */
var fixedJsonBigInt = function (obj) {
    return JSON.parse(JSON.stringify(obj, function (key, value) {
        return typeof value === "bigint" ? value.toString() : value;
    }));
};
exports.fixedJsonBigInt = fixedJsonBigInt;
