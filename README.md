# Parameters

[![npm version](https://badge.fury.io/js/@universal-packages%2Fparameters.svg)](https://www.npmjs.com/package/@universal-packages/parameters)
[![Testing](https://github.com/universal-packages/universal-parameters/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-parameters/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-parameters/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-parameters)

Compact parameters checker and shaper. You may use this when you need to clean up parameters coming from a request to take an expected and clean shape.

## Install

```shell
npm install @universal-packages/parameters
```

## Parameters

The Parameters class is the main interface to start checking and shaping objects.

```js
import { Parameters } from '@universal-packages/parameters'

const subject = { user: { name: 'David', undesirable: '555' } }
const parameters = new Parameters(subject)

const shaped = parameters.shape({ user: ['name'] })

console.log(shaped)

// > { user: { name: 'David' } }
```

### Instance methods
#### **`shape(...shape: Object | string[])`**

The `shape` method arguments should be the list of attributes you want to preserve when shaping a subject, we call these each a `ParamEntry` and the whole list of them is the shape.
#### String entries

The most simple way of shaping an object is just by passing the name of the attributes you want to preserve from the subject.

```js
import { Parameters } from '@universal-packages/parameters'

const subject = { a: 'a', b: 'b', c: 'c' }
const parameters = new Parameters(subject)

const shaped = parameters.shape('a', 'b')

// > { a: 'a', b: 'b' }
```

Alternatively you can describe the list ob attribute keys by passing an object with those keys

```js
const shaped = parameters.shape({ a: {} }, { b: {} })
```

or even

```js
const shaped = parameters.shape({ a: {}, b: {} })
```

The attributes point to objects that describe the attribute, in this case we just need the attributes to be preserved so we let them empty.

#### Deep shaping

To describe the shape deeper you need to describe attributes through object descriptors. In the bellow example we describe that the root subject should contain a `user` key, and then we describe that key as a `shape`, again, a shape can be an array of string listing what that object should contain or attribute descriptors.

```js
import { Parameters } from '@universal-packages/parameters'

const subject = { user: { name: 'David', undesirable: '555' } }
const parameters = new Parameters(subject)

const shaped = parameters.shape({ user: ['name'] })

// > { user: { name: 'David' } }
```

Alternatively you can describe the same as:

```js
const shaped = parameters.shape({ user: [{ name: {} }] })
```

or

```js
const shaped = parameters.shape({ user: { shape: ['name'] } })
```

or

```js
const shaped = parameters.shape({ user: { shape: [{ name: {} }] } })
```

#### Arrays

To describe an attribute as an array you wrap your shape in a another array.

```js
import { Parameters } from '@universal-packages/parameters'

const subject = {
  user: {
    name: 'David',
    books: [
      { id: 1, name: 'A', selected: true },
      { id: 2, name: 'B', selected: false }
    ]
  }
}
const parameters = new Parameters(subject)

const shaped = parameters.shape({ user: ['name', { books: [['id', 'selected']] }] })

// > { user: { name: 'David', books: [{ id: 1, selected: true }, { id: 2, selected: false }] } }
```

Alternatively you can describe the same as:

```js
const shaped = parameters.shape({ user: ['name', { books: { shape: [['id', 'selected']] } }] })
```

#### Enums

As a good to have for params we support enum shaping, if the subject does not provide a value within the enum constrain the shape method will throw an error.

```js
import { Parameters } from '@universal-packages/parameters'

const subject = { settings: { color: 'red' } }
const parameters = new Parameters(subject)

const shaped = parameters.shape({ settings: [{ color: new Set(['red', 'blue', 'white']) }] })

// > { settings: { color: 'red' } }
```

Alternatively you can describe the same as:

```js
const shaped = parameters.shape({ settings: [{ color: { enum: new Set(['red', 'blue', 'white']) } }] })
```

### Errors

The shape function will throw and error when the shape can not be obtain through the subject.

```js
import { Parameters } from '@universal-packages/parameters'

const subject = { user: { name: 'David', undesirable: '555' } }
const parameters = new Parameters(subject)

const shaped = parameters.shape({ user: ['firstName'] })
```

> **Error: subject/user/firstName was not provided and is not optional**

if you want shape to not throw errors for some attributes when the subject does not provide them, you can describe them as optional.

```js
import { Parameters } from '@universal-packages/parameters'

const subject = { user: { name: 'David', undesirable: '555' } }
const parameters = new Parameters(subject)

const shaped = parameters.shape({ user: [{ firstName: { optional: true } }] })
```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
