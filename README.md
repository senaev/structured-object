# structured-object
Библиотека для создания объектов к консистентной структурой и динамически изменяемыми именами свойств.

```bash
$ npm install structured-object
```

Структура задаётся при создании экземпляра класса. Каждое свойство обхекта являестя полем, у которого есть имя и
значение. Дефолтное имя - имя свойства объекта, дефолтное значение - `null`. Чтобы значение поля отображалось в итоговом
объекте, необходимо в свойстве указать значение `null`.

Для примера возьмём объект, в котором будем хранить данные об именах и возрасте родителей семейной пары.

```javascript
const {StructuredObject} = require('structured-object');

let structuredObject = new StructuredObject({
    husband: {
        husbandFather: null,
        husbandMother: null
    },
    wife: {
        wifeFather: null,
        wifeMother: null
    }
});
```

Чтобы заполнить данные, необходимо назначить имена полям.

```javascript
structuredObject.setName('husband', 'John Smith');
structuredObject.setName('wife', 'Elizabeth Smith');

console.log(structuredObject.toJSON());
```
```json
{
  "John Smith": {
    "husbandFather": null,
    "husbandMother": null
  },
  "Elizabeth Smith": {
    "wifeFather": null,
    "wifeMother": null
  }
}
```
```javascript
structuredObject.setName('husbandFather', 'Anton Smith');
structuredObject.setName('husbandMother', 'Justin Smith');
structuredObject.setName('wifeFather', 'Mark Clarke');
structuredObject.setName('wifeMother', 'Monica Clarke');

console.log(structuredObject.toJSON());
```
```json
{
  "John Smith": {
    "Anton Smith": null,
    "Justin Smith": null
  },
  "Elizabeth Smith": {
    "Mark Clarke": null,
    "Monica Clarke": null
  }
}
```

Теперь подставим данные, которые нам необходимы.

```javascript
structuredObject.setData('husbandFather', 53);
structuredObject.setData('husbandMother', 52);
structuredObject.setData('wifeFather', 47);
structuredObject.setData('wifeMother', 49);

console.log(structuredObject.toJSON());
```
```json
{
  "John Smith": {
    "Anton Smith": 53,
    "Justin Smith": 52
  },
  "Elizabeth Smith": {
    "Mark Clarke": 47,
    "Monica Clarke": 49
  }
}
```

Теперь мы получили то, что хотели. Но время идёт, у отца мужа день рождения.

```javascript
structuredObject.setData('husbandFather', structuredObject.getData('husbandFather') + 1);

console.log(structuredObject.toJSON());
```
```json
{
  "John Smith": {
    "Anton Smith": 54,
    "Justin Smith": 52
  },
  "Elizabeth Smith": {
    "Mark Clarke": 47,
    "Monica Clarke": 49
  }
}
```

Может случиться и так, что кто-то захочет изменить своё имя. Например, жена решила взять имя 'John Smith'. Мы попадаем в
непростую ситуацию, в которой у объекта имеются два свойства с одним именем. В этом случае будет взято свойство, которое
было назначено последним.

```javascript
structuredObject.setName('wife', 'John Smith');

console.log(structuredObject.toJSON());
```
```json
{
  "John Smith": {
    "Mark Clarke": 47,
    "Monica Clarke": 49
  }
}
```

Рекомендую не допускать подобных ситуаций ни в программировании ни в жизни и использовать такие структуры данных, в
которых подобная ситуация невозможна, либо контролировать этот механизм. К счастью при желании можно всё вернуть.

```javascript
structuredObject.setName('wife', 'Elizabeth Smith');

console.log(structuredObject.toJSON());
```
```json
{
  "John Smith": {
    "Anton Smith": 54,
    "Justin Smith": 52
  },
  "Elizabeth Smith": {
    "Mark Clarke": 47,
    "Monica Clarke": 49
  }
}
```

Плюсы такого подхода:
* В любой момент можно изменить структуру объекта в коде, не меняя остальную логику
* Вы можете удалить свойство из объекта, но при этом так-же обращаться к свойству, назначать и получать его значение
* Можно обращаться и назначать несуществующее в объекте свойство, а когда нужно - добавить его в объект
* Вы можете хранить данные в нескольких местах этой структуры под одним именем

Например, мы можем перестроить структуру таким образом:

```javascript
structuredObject = new StructuredObject({
    husbandMother: {
        husbandFather: {
            husband: {
                wife: {
                    wifeFather: {
                        wifeMother: null
                    }
                },
                wifeMother: {
                    husband
                }
            }
        }
    },
    wifeMother: null
});
```

После того, как мы произведём те-же манипуляции, получим объект:
```json
{
  "Justin Smith": {
    "Anton Smith": {
      "John Smith": {
        "Elizabeth Smith": {
          "Mark Clarke": {
            "Monica Clarke": 49
          }
        },
        "Monica Clarke": {
          "John Smith": null
        }
      }
    }
  },
  "Monica Clarke": 49
}
```

Обратите внимание:
* Дублированные поля отобразились во всех местах, хотя мы нанзначили их всего раз
* Мы так и не задали возраст жениха и вместо него отобразилось дефолтное значение `null`
* Поскольку некоторые поля теперь используются как имена свойств, данные о них в объекте не отображаются
