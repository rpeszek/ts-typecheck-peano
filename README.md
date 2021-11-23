
# ts-typecheck-peano code experiment to push limits of the TypeScript type-checker

## Summary of what I want to do

Type level programming in TypeScript is _Turing complete_
(see https://github.com/microsoft/TypeScript/issues/14833).
Which means, that at least semantically, types in TypeScript are very powerful and expressive.

Fancy types are not very useful on their own, the compiler needs to be able to use them effectively to verify 
correctness of value level expressions. 

[Peano.ts](src/Peano.ts) is a code experiment to test TypeScript type checker on very recursive types. 

This project contains type level definition of Peano numbers https://github.com/fwcd/tylude. 
My definition differs only slightly.

Peano natural numbers are an ideal playground for playing with types because it is easy to make them singletons (define them in a way that there is exactly one value for each type).  
I can define simple operations (like successor `n -> succ n` (next number) or `n, m -> n + m`) on the type level.

The question is: Can I implement these type level operations?  
For example is the type `n, m -> n + m` inhabited (Can I write a program that satisfies it)? 
Such program would be extremely type safe as the only thing the program could do is to mimic the type level definition of `+`.  
This obviously stresses the type checker ... and TS does not seem to be able to do that.

The power of structural types is visible in how `+` is defined. `+` is polymorphic in the second argument (you can add Peano to anything). Something that is probably impossible with nominal typing. 


### [Peano.hs](Peano.hs) for comparison

I tried to mimic my TS definitions as closely as I could in Haskell.  But Haskell types are quite different. 
I am including Haskell code because I love how Type Level `Add` and value level program `add` have almost identical code.
You just unCamel case.
This similarity is what I was trying to accomplish with in my TS example.

## Running Tests / setup

This is a minimalist node app. The only way to intact with it is using _jest_ or _tsc_ compiler.

```
npm install
```

To run tests:

```
npx jest
```