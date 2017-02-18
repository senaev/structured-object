import {expect} from 'chai';

import {Structured, StructuredObject} from './index';

describe('StructuredObject', () => {
    describe('.constructor()', () => {
        class UntypedStructuredObject extends StructuredObject {
            constructor(param?: any) {
                super(param);
            }
        }

        it('StructuredObject constructor received not object or null', () => {
            expect(() => new UntypedStructuredObject())
                .to.throw().an('error').property('message')
                .eql('StructuredObject constructor receive an object, but [undefined][undefined]');

            expect(() => new UntypedStructuredObject(0))
                .to.throw().an('error').property('message')
                .eql('StructuredObject constructor receive an object, but [number][0]');

            expect(() => new UntypedStructuredObject({property: 0}))
                .to.throw().an('error').property('message')
                .eql('StructuredObject property must be an object or null in property [property], but got [number][0]');

            expect(() => new UntypedStructuredObject({property: {deepProperty: 'Hello!'}}))
                .to.throw().an('error').property('message')
                .eql('StructuredObject property must be an object or null in property [property.deepProperty],' +
                    ' but got [string][Hello!]');
        });

        it('StructuredObject must have at least one property', () => {
            expect(() => new StructuredObject({}))
                .to.throw().an('error').property('message')
                .eql('StructuredObject must have at least one property');

            expect(() => new StructuredObject({property: {}}))
                .to.throw().an('error').property('message')
                .equal('StructuredObject must have at least one property in property [property]');
        });

        it('StructuredObject received two identical property names', () => {
            expect(() => new StructuredObject({
                property: {
                    property: null
                }
            }))
                .to.throw().an('error').property('message')
                .eql('StructuredObject constructor got object with two identical property names ' +
                    '[property] [property.property]');

            expect(() => new StructuredObject({
                property1: {
                    identicalProperty: null
                },
                property2: {
                    property3: {
                        identicalProperty: {
                            property4: null
                        }
                    }
                }
            }))
                .to.throw().an('error').property('message')
                .eql('StructuredObject constructor got object with two identical property names ' +
                    '[property1.identicalProperty] [property2.property3.identicalProperty]');
        });

        it('StructuredObject constructor receive a valid JSON object', () => {
            const obj: Structured = {};
            obj['property'] = obj;

            expect(() => new StructuredObject(obj))
                .to.throw().an('error').property('message')
                .contain('StructuredObject constructor received non-valid JSON object');
        });

        it('StructuredObject normal creating', () => {
            expect(new StructuredObject({property: null})).to.be.instanceOf(StructuredObject);
            expect(new StructuredObject({
                property1: {
                    property2: null,
                    property3: {
                        property4: null
                    }
                }
            })).to.be.instanceOf(StructuredObject);
        });
    });

    describe('.getName() .setName()', () => {
        const structuredObject = new StructuredObject({
            property1: {
                property2: null,
                property3: {
                    property4: null
                }
            },
            property5: {
                [0]: null,
                null: null
            }
        });
        const untypedStructuredObject: any = structuredObject;

        it('Not valid properties', () => {
            expect(untypedStructuredObject.getName()).undefined;
            expect(untypedStructuredObject.getName(1)).undefined;
        });

        it('If property not exists, .getName() returns undefined', () => {
            expect(structuredObject.getName('undefined')).undefined;
            expect(structuredObject.getName('')).undefined;
        });

        it('Properties return its initial name', () => {
            expect(structuredObject.getName('property1')).eql('property1');
            expect(structuredObject.getName('property4')).eql('property4');
            expect(structuredObject.getName('0')).eql('0');
            expect(untypedStructuredObject.getName(0)).eql('0');
            expect(untypedStructuredObject.getName(null)).eql('null');
        });

        it('.setName() errors', () => {
            expect(() => untypedStructuredObject.setName())
                .to.throw().an('error').property('message')
                .eql('StructuredObject.prototype.setPropertyName(undefined, undefined) ' +
                    'received non-string value in first param');

            expect(() => untypedStructuredObject.setName(0, 'newName'))
                .to.throw().an('error').property('message')
                .eql('StructuredObject.prototype.setPropertyName(0, newName) ' +
                    'received non-string value in first param');

            expect(() => untypedStructuredObject.setName('property1', null))
                .to.throw().an('error').property('message')
                .eql('StructuredObject.prototype.setPropertyName(property1, null) ' +
                    'received non-string value in second param');
        });

        it('.setName() and .getName() for non exists in StructuredObject properties', () => {
            expect(() => structuredObject.setName('nonExists', 'newName'))
                .to.not.throw();

            expect(structuredObject.getName('nonExists')).eql('newName');
        });
    });
});
