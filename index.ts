type OneField = {
    fieldName: string;
    isDataField: boolean;
    path: string[];
    propName: string;
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
            let hasAtLeastOwnProperty = false;

            for (let propName in data) {
                if (data.hasOwnProperty(propName)) {
                    hasAtLeastOwnProperty = true;

                    const val = data[propName];

                    const newPath = path.slice();
                    newPath.push(propName);

                    const existField = this.getByFieldName(propName);
                    if (existField) {
                        const fieldPath = existField.path;
                        throw new Error(`StructuredObject constructor got object with two identical property names ${
                            fieldPath.length ? `[${fieldPath.join('.')}.${propName}]` : `[${propName}]`
                            } [${newPath.join('.')}]`);
                    }

                    if (val === null) {
                        this.fields.push({
                            fieldName: propName,
                            isDataField: true,
                            path: path.slice(),
                            propName,
                            data: null
                        });
                    } else if (typeof val === 'object') {
                        this.fields.push({
                            fieldName: propName,
                            isDataField: false,
                            path: path.slice(),
                            propName
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

    protected getByFieldName(fieldName: string): OneField | undefined {
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

    public toJSON(): Structured {
        return {};
    }
}
