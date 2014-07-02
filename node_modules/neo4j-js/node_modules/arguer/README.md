# Arguer

Arguer normalizes arguments for JavaScript functions with optional arguments and provides optional typing.

You could think of Arguer as a crude way to help implement function overloading, but it takes a different approach from other function overloading libraries and focuses more on handling optional parameters than traditional overloading.

## Installation

```
npm install arguer
```

... or `npm install --save arguer` if you want arguer added to your `package.json` automatically.

## Simple Example

A function's _arguments_ and a _format array_ are passed to the `arguer` function which returns a normalized object.   

```javascript
var arguer = require('./arguer.js');

var _testFormat = ['a', {name: 'b', optional: true}, 'c'];
function test (a, b, c) {
  var args = arguer(arguments, _testFormat);
  console.log(args);
}

test('hello', 'world');
```

Outputs:

```javascript
{ a: 'hello', b: undefined, c: 'world' }
```

> Note that `_testFormat` was declared outside the function which uses it. This is obviously not necessary, but there is a performance benefit to reusing a format array, not only because there is no overhead incurred in creating and garbage collecting an array, but also because Arguer won't have to re-count how many optional arguments exist every time the function is called.

This would have been roughly equivalent to the following code:

```javascript
function test (a, b, c) {
  if (arguments.length < 3) {
    c = b;
    b = undefined;
  }
  console.log({a: a, b: b, c: c});
}
```

With only one or two occasional optional arguments, it is not difficult to handle this with your own code such as above. Much of Arguer's usefulness comes from its ability to handle more complicated scenarios.

## Format Array

In the [simple example](#simple-example) above, we used

```javascript
['a', {name: 'b', optional: true}, 'c']
```

as our format array. It says `a` and `c` are required, and `b` is optional. Each element of the format array is either a string representing a required argument of any type, or an object which describes the accepted argument in more detail. These objects must contain the 'name' property. All other properties are optional.

### Properties

#### name : _string_

The name of the argument.

#### optional : _boolean_

If true, the argument will be considered optional.

#### type : _string_

If supplied `typeof` will be used to assess whether an argument is a match.

#### nType : _string_

Works opposite of type. In other words, an argument must not match this type in order to match.

#### instance : _Function_

Similar to type, except instanceof is used for comparison instead of typeof.

#### nInstance : _Function_

Opposite of instance.

### Back-Reference Properties

Each of the following properties accept a string which represents the name of a previous argument. ___Only previous___ arguments can referenced. In other words, arg with index 4 can reference any arg 0 through 3, but cannot reference arg 5. If any one or more of the following properties are used, optional:true is implied, and can be omitted.

#### requires : _string_

The name of a preceding argument which must have been fulfilled in order for the current argument to be considered.

#### requiredBy : _string_

The name of a preceding argument which, if fulfiled, causes the current argument to be required instead of optional.

#### mutex : _string_

Essentially the opposite of requires&requiredBy. If the named argument was fulfilled, then the current argument will not be considered.

## Matching Algorithm

It is important to understand that the matching algorithm evaluates arguments in order. It makes no attempt to find the "best" match for a format. If we modified our original simple example to make the `c` argument optional with `type: 'string'`

```javascript
var _testFormat = ['a', {name: 'b', optional: true}, {name: 'c', optional: true, type: 'string'}];
function test (a, b, c) {
  var args = arguer(arguments, _testFormat);
  console.log(args);
}

test('hello', 'world');
```

we might intuitively think `'world'` would be a better fit for argument `c` since it's a string; however, it be assigned to argument `b` because arguments are evaluated in-order and `b` can match anything. Therefore, this will output:

```javascript
{ a: 'hello', b: 'world', c: undefined }
```

If we _really_ want `c` to handle strings, and `b` to handle anything else, we could reorder the arguments so `c` comes first, or we could use [nType](#ntype) and apply `nType: 'string'` to `b`.

## Errors

If the arguments provided cannot be matched according to the rules of the format array, an `Error` object is returned instead of a normal object. This can be checked using the `instanceof` operator.

```javascript
function test (a, b, c) {
   var args = arguer(arguments, ['a', 'b', 'c']);
   if (args instanceof Error) {
     console.log(args.message);
     return;
   }
}

test('hello', 'world');
```

Outputs:

```
Not enough arguments provided.
```

## Additional Examples

Arguer was originally built as part of [neo4j-js](https://github.com/bretcope/neo4j-js), and, until more examples are added to this readme, it is probably the best source for examples.