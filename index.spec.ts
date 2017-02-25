import {expect} from 'chai';

import {StructuredObject, Structured} from './index';

const UntypedStructuredObject: any = StructuredObject;

const circularObject: Structured = {};
circularObject['property'] = circularObject;

describe('StructuredObject', () => {
    const structuredObject = new StructuredObject();
    const untypedStructuredObject = new UntypedStructuredObject();

    describe('.getField() .setField()', () => {

        it('.getField() returns undefined on non-exist fields', () => {
            expect(untypedStructuredObject.getField()).undefined;
            expect(untypedStructuredObject.getField(1)).undefined;
            expect(structuredObject.getField('undefined')).undefined;
            expect(structuredObject.getField('')).undefined;
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

            expect(() => untypedStructuredObject.serialize(0))
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

        it('StructuredObject must have at least one property', () => {
            expect(() => structuredObject.serialize({}))
                .to.throw().an('error').property('message')
                .eql('StructuredObject must have at least one property');

            expect(() => structuredObject.serialize({property: {}}))
                .to.throw().an('error').property('message')
                .equal('StructuredObject must have at least one property in property [property]');
        });

        it('called on non-valid JSON object', () => {
            const circularObject: Structured = {};
            circularObject['property'] = circularObject;

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
    });
});
