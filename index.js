"use strict";
var clone = function (data) { return JSON.parse(JSON.stringify(data)); };
var StructuredObject = (function () {
    function StructuredObject() {
        this.fields = {};
    }
    StructuredObject.prototype.serialize = function (incomingObject) {
        var _this = this;
        if (typeof incomingObject !== "object") {
            throw new Error("StructuredObject.prototype.serialize(" + incomingObject + ") called on non-object [" + typeof incomingObject + "]");
        }
        var json;
        try {
            json = clone(incomingObject);
        }
        catch (e) {
            throw new Error("StructuredObject.prototype.serialize(" + incomingObject + ") called on non-valid JSON object [" + e + "]");
        }
        var serialize = function (data, path) {
            var hasAtLeastOwnProperty = false;
            var newObject = {};
            for (var propertyName in data) {
                if (data.hasOwnProperty(propertyName)) {
                    hasAtLeastOwnProperty = true;
                    var val = data[propertyName];
                    var field = _this.fields[propertyName];
                    var newPropertyName = field ? field.propertyName : propertyName;
                    var newPath = path.slice();
                    newPath.push(propertyName);
                    if (val === null) {
                        newObject[newPropertyName] = field ? field.data : null;
                    }
                    else if (typeof val === 'object') {
                        newObject[newPropertyName] = serialize(val, newPath);
                    }
                    else {
                        throw new Error("StructuredObject property must be an object or null in property [" + newPath.join('.') + "], but got [" + typeof val + "][" + val + "]");
                    }
                }
            }
            if (!hasAtLeastOwnProperty) {
                throw new Error("StructuredObject must have at least one property" + (path.length ? " in property [" + path.join('.') + "]" : ""));
            }
            return newObject;
        };
        return serialize(json, []);
    };
    StructuredObject.prototype.setField = function (fieldName, propertyName, data) {
        if (data === void 0) { data = null; }
        var isFieldNameString = typeof fieldName !== 'string';
        if (typeof fieldName !== 'string' || typeof propertyName !== 'string') {
            throw new Error("StructuredObject.prototype.setField(" + fieldName + ", " + propertyName + ", " + data + ") " +
                ("called on non-string value in " + (isFieldNameString ? 'first' : 'second') + " param"));
        }
        var json;
        try {
            json = clone(data);
        }
        catch (e) {
            throw new Error("StructuredObject.prototype.setField(" + fieldName + ", " + propertyName + ", " + data + ") called on non-valid JSON object [" + e + "] in third param");
        }
        this.fields[fieldName] = {
            propertyName: propertyName,
            data: json
        };
    };
    StructuredObject.prototype.getField = function (fieldName) {
        return this.fields[fieldName];
    };
    return StructuredObject;
}());
exports.StructuredObject = StructuredObject;
