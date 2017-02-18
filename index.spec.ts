import {expect} from 'chai';

import {StructuredObject, Structured} from './index';

class UntypedStructuredObject extends StructuredObject {
    constructor(param?: any) {
        super(param);
    }
}

// Правило для точки с запятой в конци строки

describe('StructuredObject', () => {
    describe('creating', () => {
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
            obj['obj'] = obj;

            expect(() => new StructuredObject(obj))
                .to.throw().an('error').property('message')
                .contain('StructuredObject constructor received non-valid JSON object');
        });
    });
});
