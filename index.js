"use strict";
var StructuredObject = (function () {
    function StructuredObject(incomingObject) {
        var _this = this;
        this.fields = {};
        if (typeof incomingObject !== "object") {
            throw new Error("StructuredObject constructor receive an object, but [" + typeof incomingObject + "][" + incomingObject + "]");
        }
        var json;
        try {
            json = JSON.parse(JSON.stringify(incomingObject));
        }
        catch (e) {
            throw new Error("StructuredObject constructor receive a valid JSON object");
        }
        var addToFields = function (data, path) {
            var hasOwnProperties = false;
            for (var propName in data) {
                if (data.hasOwnProperty(propName)) {
                    hasOwnProperties = true;
                    var val = data[propName];
                    var newPath = path.slice();
                    newPath.push(propName);
                    if (_this.fields.hasOwnProperty(propName)) {
                        var fieldPath = _this.fields[propName].path;
                        throw new Error("StructuredObject constructor got object with two identical property names " + (fieldPath.length ? "[" + fieldPath.join('.') + "." + propName + "]" : propName) + " [" + newPath.join('.') + "]");
                    }
                    if (val === null) {
                        _this.fields[propName] = {
                            isDataField: true,
                            path: path.slice(),
                            propName: propName,
                            data: null
                        };
                    }
                    else if (typeof val === "object") {
                        _this.fields[propName] = {
                            isDataField: false,
                            path: path.slice(),
                            propName: propName
                        };
                        addToFields(val, newPath);
                    }
                    else {
                        throw new Error("StructuredObject property must be an object or null " +
                            ("[" + newPath.join('.') + "], but [" + typeof val + "][" + val + "]"));
                    }
                }
            }
            if (!hasOwnProperties) {
                throw new Error("StructuredObject must have at least one property " + (path.length ? "[" + path.join('.') + "]" : ""));
            }
        };
        addToFields(json, []);
    }
    StructuredObject.prototype.toJSON = function () {
    };
    return StructuredObject;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StructuredObject;
// const untipedStructuredObject: any = StructuredObject;
// StructuredObject must have at least one property
// console.log(new StructuredObject({}));
// StructuredObject must have at least one property [nanana]
// console.log(new StructuredObject({nanana: {}}));
// StructuredObject property must be an object or null [nanana], but [number][123]
// console.log(new untipedStructuredObject({nanana: 123}));
// StructuredObject constructor got object with two identical property names nanana [nanana.nanana]
// console.log(new untipedStructuredObject({nanana: {nanana: null}}));
// StructuredObject constructor got object with two identical property names [ururu.lalala.nanana] [ururu.tututu.nanana]
// console.log(new StructuredObject({ururu: {
//     lalala: {nanana: null},
//     tututu: {nanana: null}
// }}));
// StructuredObject constructor receive an object, but [number][123]
// console.log(new untipedStructuredObject(123));
// StructuredObject constructor receive a valid JSON object
// const obj: Structured = {};
// obj['obj'] = obj;
// console.log(new StructuredObject(obj));
console.log(new StructuredObject({
    ururu: {
        tututu: {
            lalala: null
        }
    },
    ololo: null
}));
