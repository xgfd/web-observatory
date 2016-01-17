/**
 * Created by xgfd on 26/12/2015.
 */

//Declare a newe EJSON type @typeName with only one instance @singular
toEJSONSingularType = function (singleton, typeName) {

    check(typeof singleton, 'object');//check(singular, Ojbect) may give expected plain object error
    check(singleton.typeName, undefined);
    check(singleton.toJSONValue, undefined);
    check(typeName, String);

    singleton.typeName = function () {
        return typeName;
    };

    //the return value doesn't matter since the custom type always return one value
    singleton.toJSONValue = function () {
        return typeName;
    };

    EJSON.addType(typeName, function () {
        return singleton;
    });
};

