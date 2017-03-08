import {expect} from 'chai';

import {StructuredObject, Structured} from './index';

const UntypedStructuredObject: any = StructuredObject;

const circularObject: Structured<'property'> = {};
circularObject['property'] = circularObject;

describe('StructuredObject', () => {
    type PossibleProperties = 'fieldName'
        | 'zero'
        | 'one'
        | 'two'
        | 'three'
        | 'four'
        | 'fife';

    const structuredObject = new StructuredObject<PossibleProperties>();
    const untypedStructuredObject = new UntypedStructuredObject();

    describe('.getField() .setField()', () => {
        it('.getField() returns empty field with the same name on non-exist fields', () => {
            expect(untypedStructuredObject.getField()).eql({
                propertyName: undefined,
                data: null
            });
            expect(untypedStructuredObject.getField(1)).eql({
                propertyName: 1,
                data: null
            });
            expect(structuredObject.getField('undefined')).eql({
                propertyName: 'undefined',
                data: null
            });
            expect(structuredObject.getField('')).eql({
                propertyName: '',
                data: null
            });
        });

        it('.setField() errors', () => {
            expect(() => untypedStructuredObject.setField())
                .to.throw().an('error').property('message')
                .eql('StructuredObject.prototype.setField(undefined, undefined, null) ' +
                    'called on non-string value in first param');

            expect(() => untypedStructuredObject.setField(0, 'newName'))
                .to.throw().an('error').property('message')
                .eql('StructuredObject.prototype.setField(0, newName, null) ' +
                    'called on non-string value in first param');

            expect(() => untypedStructuredObject.setField('field', null))
                .to.throw().an('error').property('message')
                .eql('StructuredObject.prototype.setField(field, null, null) ' +
                    'called on non-string value in second param');

            expect(() => structuredObject.setField('field', 'propName', circularObject))
                .to.throw().an('error').property('message')
                .contain('StructuredObject.prototype.setField(field, propName, [object Object]) ' +
                    'called on non-valid JSON object [');
        });

        it('.setField() .setField() normal behavior', () => {
            const field = {
                propertyName: 'propertyName',
                data: 0
            };

            structuredObject.setField('fieldName', field.propertyName, field.data);
            expect(structuredObject.getField('fieldName')).eql(field);
        });
    });

    describe('.serialize()', () => {
        it('called on not object or null', () => {
            expect(() => untypedStructuredObject.serialize())
                .to.throw().an('error').property('message')
                .eql('StructuredObject.prototype.serialize(undefined) called on non-object [undefined]');

            expect(() => untypedStructuredObject.serialize(1))
                .to.throw().an('error').property('message')
                .eql('StructuredObject.prototype.serialize(0) called on non-object [number]');

            expect(() => untypedStructuredObject.serialize({property: 0}))
                .to.throw().an('error').property('message')
                .eql('StructuredObject property must be an object or null in property [property], but got [number][0]');

            expect(() => untypedStructuredObject.serialize({property: {deepProperty: 'Hello!'}}))
                .to.throw().an('error').property('message')
                .eql('StructuredObject property must be an object or null in property [property.deepProperty],' +
                    ' but got [string][Hello!]');
        });

        it('StructuredObject can be empty', () => {
            expect(structuredObject.serialize({})).eql({});
            expect(structuredObject.serialize({fieldName: {}})).eql({propertyName: {}});
        });

        it('called on non-valid JSON object', () => {
            expect(() => structuredObject.serialize(circularObject))
                .to.throw().an('error').property('message')
                .contain('StructuredObject.prototype.serialize([object Object]) called on non-valid JSON object [');
        });

        it('normalBehavior', () => {
            expect(structuredObject.serialize({
                fieldName: null
            })).eql({
                propertyName: 0
            });

            structuredObject.setField('one', 'ONE', 1);
            structuredObject.setField('two', 'TWO', 2);
            structuredObject.setField('three', 'THREE', 3);
            structuredObject.setField('four', 'FOUR', 4);


            expect(structuredObject.serialize({
                one: null,
                two: null,
                three: null,
                four: null
            })).eql({
                ONE: 1,
                TWO: 2,
                THREE: 3,
                FOUR: 4
            });


            expect(structuredObject.serialize({
                one: null,
                two: {
                    one: null
                },
                three: {
                    two: {
                        one: null
                    }
                },
                four: {
                    three: {
                        two: {
                            one: null
                        }
                    }
                },
                fife: {
                    four: {
                        three: {
                            two: {
                                one: {
                                    zero: null
                                }
                            }
                        }
                    }
                }
            })).eql({
                ONE: 1,
                TWO: {
                    ONE: 1
                },
                THREE: {
                    TWO: {
                        ONE: 1
                    }
                },
                FOUR: {
                    THREE: {
                        TWO: {
                            ONE: 1
                        }
                    }
                },
                fife: {
                    FOUR: {
                        THREE: {
                            TWO: {
                                ONE: {
                                    zero: null
                                }
                            }
                        }
                    }
                }
            });
        });

        it('same property names in one level', () => {
            const struct = new StructuredObject();
            struct.setField('firstField', 'property', 1);
            struct.setField('secondField', 'property', 2);

            expect(struct.serialize({
                firstField: {
                    firstField: null,
                    secondField: null
                }
            })).eql({
                property: {
                    property: 2
                }
            });

            expect(struct.serialize({
                firstField: null,
                secondField: {
                    secondField: null
                }
            })).eql({
                property: {
                    property: 2
                }
            });

            expect(struct.serialize({
                secondField: {
                    secondField: null
                },
                firstField: null
            })).eql({
                property: 1
            });
        });

        it('set object as value', () => {
            const struct = new StructuredObject();

            struct.setField('firstField', 'FIRST_FIELD', {
                FIRST_FIELD_PROPERTY: 'FIRST_FIELD_VALUE'
            });
            struct.setField('secondField', 'SECOND_FIELD', {
                SECOND_FIELD_PROPERTY: 'SECOND_FIELD_VALUE'
            });
            expect(struct.serialize({
                firstField: {
                    firstField: null
                },
                secondField: {
                    firstField: {
                        secondField: null
                    }
                }
            })).eql({
                FIRST_FIELD: {
                    FIRST_FIELD: {
                        FIRST_FIELD_PROPERTY: 'FIRST_FIELD_VALUE'
                    }
                },
                SECOND_FIELD: {
                    FIRST_FIELD: {
                        SECOND_FIELD: {
                            SECOND_FIELD_PROPERTY: 'SECOND_FIELD_VALUE'
                        }
                    }
                }
            });
        });

        it('README.MD', () => {
            const struct = new StructuredObject();

            struct.setField('firstField', 'FIRST_FIELD', {
                FIRST_FIELD_PROPERTY: 'FIRST_FIELD_VALUE'
            });
            struct.setField('secondField', 'SECOND_FIELD', 2);

            expect(struct.serialize({
                firstField: null,
                secondField: null
            })).eql({
                FIRST_FIELD: {
                    FIRST_FIELD_PROPERTY: 'FIRST_FIELD_VALUE'
                },
                SECOND_FIELD: 2
            });

            expect(struct.serialize({
                firstField: {
                    firstField: null,
                    secondField: null,
                    extraField: null
                },
                secondField: {
                    extraField: {
                        secondField: null
                    }
                }
            })).eql({
                FIRST_FIELD: {
                    FIRST_FIELD: {
                        FIRST_FIELD_PROPERTY: 'FIRST_FIELD_VALUE'
                    },
                    SECOND_FIELD: 2,
                    extraField: null
                },
                SECOND_FIELD: {
                    extraField: {
                        SECOND_FIELD: 2
                    }
                }
            });

            expect(struct.getField('secondField')).eql({
                propertyName: 'SECOND_FIELD',
                data: 2
            });

            expect(struct.getField('extraField')).eql({
                propertyName: 'extraField',
                data: null
            });

            struct.setField('firstField', 'SECOND_FIELD', 1);

            expect(struct.serialize({
                firstField: null,
                secondField: null
            })).eql({
                SECOND_FIELD: 2
            });
        });
    });
});
