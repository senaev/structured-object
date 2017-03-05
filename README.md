# structured-object

Assign dynamyc properties' names and data for object

```bash
$ npm install structured-object
```

Assign fields' names and values for object properties.
Then you can pass JSON object to `.serialize(json)` method and get object with replaced properties' names and data.
Properties with value `null` will be replaced with data from fields.

```javascript
var StructuredObject = require('structured-object').StructuredObject;

var struct = new StructuredObject();

struct.setField('firstField', 'FIRST_FIELD', {
    FIRST_FIELD_PROPERTY: 'FIRST_FIELD_VALUE'
});
struct.setField('secondField', 'SECOND_FIELD', 2);

struct.serialize({
    firstField: null,
    secondField: null
});
```
```json
{
  "FIRST_FIELD": {
    "FIRST_FIELD_PROPERTY": "FIRST_FIELD_VALUE"
  },
  "SECOND_FIELD": 2
}
```

It's posiible to pass an object with some identical properties. All of them will be replaced.
If value is not assigned, it will remain unchanged in serialized object.

```javascript
struct.serialize({
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
});
```
```json
{
  "FIRST_FIELD": {
    "FIRST_FIELD": {
      "FIRST_FIELD_PROPERTY": "FIRST_FIELD_VALUE"
    },
    "SECOND_FIELD": 2,
    "extraField": null
  },
  "SECOND_FIELD": {
    "extraField": {
      "SECOND_FIELD": 2
    }
  }
}
```

It's able to get assigned fields.
If there is no asked field in the object the empty field will be return with the same name. 

```javascript
struct.getField('secondField');
```
```json
{
  "propertyName": "SECOND_FIELD",
  "data": 2
}
```
```javascript
struct.getField('extraField');
```
```json
{
  "propertyName": "extraField",
  "data": null
}
```

Note!

Giving the adjacent object properties the same names, the final object will have the last enumerable property.

```javascript
struct.setField('firstField', 'SECOND_FIELD', 1);

struct.serialize({
    firstField: null,
    secondField: null
});
```
```json
{
  "SECOND_FIELD": 2
}
```
