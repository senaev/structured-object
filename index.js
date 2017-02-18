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
            var isHashProperty = false;
            var hasAtLeastOwnProperty = false;
            for (var propertyName in data) {
                if (data.hasOwnProperty(propertyName)) {
                    hasAtLeastOwnProperty = true;
                    var val = data[propertyName];
                    var newPath = path.slice();
                    newPath.push(propertyName);
                    var existField = _this.getFieldByName(propertyName);
                    if (existField) {
                        var fieldPath = existField.path;
                        throw new Error("StructuredObject constructor got object with two identical property names " + (fieldPath.length ? "[" + fieldPath.join('.') + "." + propertyName + "]" : "[" + propertyName + "]") + " [" + newPath.join('.') + "]");
                    }
                    if (val === null) {
                        _this.fields.push({
                            fieldName: propertyName,
                            isDataField: true,
                            path: path.slice(),
                            propertyName: propertyName,
                            isHashProperty: isHashProperty,
                            data: null
                        });
                    }
                    else if (typeof val === 'object') {
                        _this.fields.push({
                            fieldName: propertyName,
                            isDataField: false,
                            path: path.slice(),
                            propertyName: propertyName,
                            isHashProperty: isHashProperty
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
    StructuredObject.prototype.getName = function (fieldName) {
        var field = this.getFieldByName(String(fieldName));
        if (field) {
            return field.propertyName;
        }
        else {
            return undefined;
        }
    };
    // If property isn't in StructuredObject instance, property gets into a hash,
    // it's name and data will be available in .getName() and .getData() methods,
    // but isn't available in .toJSON() method
    StructuredObject.prototype.setName = function (fieldName, propertyName) {
        var isFieldNameString = typeof fieldName !== 'string';
        if (typeof fieldName !== 'string' || typeof propertyName !== 'string') {
            throw new Error("StructuredObject.prototype.setPropertyName(" + fieldName + ", " + propertyName + ") " +
                ("received non-string value in " + (isFieldNameString ? 'first' : 'second') + " param"));
        }
        var field = this.getFieldByName(fieldName);
        if (field) {
            field.propertyName = propertyName;
        }
        else {
            this.fields.push({
                fieldName: fieldName,
                isDataField: true,
                path: [],
                propertyName: propertyName,
                isHashProperty: true,
                data: null
            });
        }
    };
    StructuredObject.prototype.getFieldByName = function (fieldName) {
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
    return StructuredObject;
}());
exports.__esModule = true;
exports["default"] = StructuredObject;
