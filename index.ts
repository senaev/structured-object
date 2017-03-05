type OneField = {
    propertyName: string;
    data: any;
};

export type Structured = {
    [propertyName: string]: Structured | null;
};

const clone = (data: any) => JSON.parse(JSON.stringify(data));

export class StructuredObject {
    private readonly fields: {
        [fieldName: string]: OneField;
    } = {};

    public serialize(incomingObject: Structured) {
        if (typeof incomingObject !== `object`) {
            throw new Error(`StructuredObject.prototype.serialize(${incomingObject
                }) called on non-object [${typeof incomingObject}]`);
        }

        let json: Structured;
        try {
            json = clone(incomingObject);
        } catch (e) {
            throw new Error(`StructuredObject.prototype.serialize(${incomingObject
                }) called on non-valid JSON object [${e}]`);
        }

        const serialize = (data: Structured, path: string[]): Structured => {
            const newObject: any = {};

            for (let propertyName in data) {
                if (data.hasOwnProperty(propertyName)) {
                    const val = data[propertyName];
                    const field = this.fields[propertyName];
                    const newPropertyName = field ? field.propertyName : propertyName;

                    const newPath = path.slice();
                    newPath.push(propertyName);

                    if (val === null) {
                        newObject[newPropertyName] = field ? field.data : null;
                    } else if (typeof val === 'object') {
                        newObject[newPropertyName] = serialize(val, newPath);
                    } else {
                        throw new Error(`StructuredObject property must be an object or null in property [${
                            newPath.join('.')
                            }], but got [${typeof val}][${val}]`);
                    }
                }
            }

            return newObject;
        };
        return serialize(json, []);
    }

    public setField(fieldName: string, propertyName: string, data: any = null) {
        const isFieldNameString = typeof fieldName !== 'string';

        if (typeof fieldName !== 'string' || typeof propertyName !== 'string') {
            throw new Error(`StructuredObject.prototype.setField(${fieldName}, ${propertyName}, ${data}) ` +
                `called on non-string value in ${isFieldNameString ? 'first' : 'second'} param`);
        }

        let json: Structured;
        try {
            json = clone(data);
        } catch (e) {
            throw new Error(`StructuredObject.prototype.setField(${fieldName}, ${propertyName}, ${
                data}) called on non-valid JSON object [${e}] in third param`);
        }

        this.fields[fieldName] = {
            propertyName,
            data: json
        };
    }

    public getField(fieldName: string): OneField {
        const field = this.fields[fieldName];
        if (field) {
            return field;
        } else {
            return {
                propertyName: fieldName,
                data: null
            };
        }
    }
}
