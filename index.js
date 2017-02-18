"use strict";
var undefined = void 0;
var StructuredObject = (function () {
    function StructuredObject(incomingObject) {
        var _this = this;
        this.fields = [];
        if (typeof incomingObject !== "object") {
            throw new Error("StructuredObject constructor receive an object, but " +
                ("[" + typeof incomingObject + "][" + incomingObject + "]"));
        }
        var json;
        try {
            json = JSON.parse(JSON.stringify(incomingObject));
        }
        catch (e) {
            throw new Error("StructuredObject constructor received non-valid JSON object [" + e + "]");
        }
        var addToFields = function (data, path) {
            var hasAtLeastOwnProperty = false;
            for (var propName in data) {
                if (data.hasOwnProperty(propName)) {
                    hasAtLeastOwnProperty = true;
                    var val = data[propName];
                    var newPath = path.slice();
                    newPath.push(propName);
                    var existField = _this.getByFieldName(propName);
                    if (existField) {
                        var fieldPath = existField.path;
                        throw new Error("StructuredObject constructor got object with two identical property names " + (fieldPath.length ? "[" + fieldPath.join('.') + "." + propName + "]" : "[" + propName + "]") + " [" + newPath.join('.') + "]");
                    }
                    if (val === null) {
                        _this.fields.push({
                            fieldName: propName,
                            isDataField: true,
                            path: path.slice(),
                            propName: propName,
                            data: null
                        });
                    }
                    else if (typeof val === 'object') {
                        _this.fields.push({
                            fieldName: propName,
                            isDataField: false,
                            path: path.slice(),
                            propName: propName
                        });
                        addToFields(val, newPath);
                    }
                    else {
                        throw new Error("StructuredObject property must be an object or null in property [" + newPath.join('.') + "], but got [" + typeof val + "][" + val + "]");
                    }
                }
            }
            if (!hasAtLeastOwnProperty) {
                throw new Error("StructuredObject must have at least one property" + (path.length ? " in property [" + path.join('.') + "]" : ""));
            }
        };
        addToFields(json, []);
    }
    StructuredObject.prototype.getByFieldName = function (fieldName) {
        var fields = this.fields;
        for (var key in fields) {
            if (fields.hasOwnProperty(key)) {
                var field = fields[key];
                if (field.fieldName === fieldName) {
                    return field;
                }
            }
        }
        return undefined;
    };
    StructuredObject.prototype.toJSON = function () {
        return {};
    };
    return StructuredObject;
}());
exports.StructuredObject = StructuredObject;
