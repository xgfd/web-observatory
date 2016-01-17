/**
 * Created by xgfd on 15/01/2016.
 */

/*
 * Extends @query with @or clause
 * If @query.$or exists, replace it with $and:[{$or:query.$or}, or]
 */
extendOr = function (query, or) {
    check(query, Object);
    check(or, {$or: Array});

    if (query.$or) {
        query.$and = [{$or: query.$or}, or];
        delete  query.$or;
    } else {
        _.extend(query, or);
    }
};
