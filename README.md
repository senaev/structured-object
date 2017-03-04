# structured-object
Определение динамических имён свойств и данных для объекта

```bash
$ npm install structured-object
```

Сначала вы задаёте имена и значения полей, а затем передаёте объект, в котором указанные имена свойств и значения будут
заменены.
Можно дублировать свойства.
Замена значений произойдёт для свойств, значение которых равно `null`.
Поля, для которых значение не задано, останутся в первоначальном виде.
Назначать можно только JSON-валидные данные.

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

Можно получить значение полей, уже имеющихся в объекте.
Если поля с запрашиваемым именем нет в объекте, будет возвращено пустое поле с тем-же именем
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
Если вы назначаете свойствам объекта, передаваемого в метод `.serialize()` одинаковые имена, в итоговый объект попадёт
значение из последнего в порядке перечисления.
