type OneField = {
    fieldName: string;
    isDataField: boolean;
    path: string[];
    propertyName: string;
    isHashProperty: boolean;
    data?: any;
};

const undefined = void 0;

export type Structured = {
    [propertyName: string]: Structured | null;
};

export class StructuredObject {
    private readonly fields: OneField[] = [];

    public constructor(incomingObject: Structured) {
        if (typeof incomingObject !== `object`) {
            throw new Error(`StructuredObject constructor receive an object, but ` +
                `[${typeof incomingObject}][${incomingObject}]`);
        }

        let json: Structured;
        try {
            json = JSON.parse(JSON.stringify(incomingObject));
        } catch (e) {
            throw new Error(`StructuredObject constructor received non-valid JSON object [${e}]`);
        }

        const addToFields = (data: Structured, path: string[]) => {
            const isHashProperty = false;
            let hasAtLeastOwnProperty = false;

            for (let propertyName in data) {
                if (data.hasOwnProperty(propertyName)) {
                    hasAtLeastOwnProperty = true;

                    const val = data[propertyName];

                    const newPath = path.slice();
                    newPath.push(propertyName);

                    const existField = this.getFieldByName(propertyName);
                    if (existField) {
                        const fieldPath = existField.path;
                        throw new Error(`StructuredObject constructor got object with two identical property names ${
                            fieldPath.length ? `[${fieldPath.join('.')}.${propertyName}]` : `[${propertyName}]`
                            } [${newPath.join('.')}]`);
                    }

                    if (val === null) {
                        this.fields.push({
                            fieldName: propertyName,
                            isDataField: true,
                            path: path.slice(),
                            propertyName,
                            isHashProperty,
                            data: null
                        });
                    } else if (typeof val === 'object') {
                        this.fields.push({
                            fieldName: propertyName,
                            isDataField: false,
                            path: path.slice(),
                            propertyName,
                            isHashProperty
                        });

                        addToFields(val, newPath);
                    } else {
                        throw new Error(`StructuredObject property must be an object or null in property [${
                            newPath.join('.')
                            }], but got [${typeof val}][${val}]`);
                    }
                }
            }

            if (!hasAtLeastOwnProperty) {
                throw new Error(`StructuredObject must have at least one property${
                    path.length ? ` in property [${path.join('.')}]` : ``
                    }`);
            }
        };
        addToFields(json, []);
    }

    public getName(fieldName: string): string | undefined {
        const field = this.getFieldByName(String(fieldName));
        if (field) {
            return field.propertyName;
        } else {
            return undefined;
        }
    }

    // If property isn't in StructuredObject instance, property gets into a hash,
    // it's name and data will be available in .getName() and .getData() methods,
    // but isn't available in .toJSON() method
    public setName(fieldName: string, propertyName: string) {
        const isFieldNameString = typeof fieldName !== 'string';

        if (typeof fieldName !== 'string' || typeof propertyName !== 'string') {
            throw new Error(`StructuredObject.prototype.setPropertyName(${fieldName}, ${propertyName}) ` +
                `received non-string value in ${isFieldNameString ? 'first' : 'second'} param`);
        }

        const field = this.getFieldByName(fieldName);
        if (field) {
            field.propertyName = propertyName;
        } else {
            this.fields.push({
                fieldName,
                isDataField: true,
                path: [],
                propertyName,
                isHashProperty: true,
                data: null
            });
        }
    }

    protected getFieldByName(fieldName: string): OneField | undefined {
        const {fields} = this;
        for (let key in fields) {
            if (fields.hasOwnProperty(key)) {
                const field = fields[key];
                if (field.fieldName === fieldName) {
                    return field;
                }
            }
        }

        return undefined;
    }
}
