
// utility hole for typechecking
declare function _<T>(): T

/*
Peano numbers with + arithmetic. 
The goal is to stress the type checker and see how well it does.

This is how Peano numbers will be encoded:

{} //0
{prev: {}} //1
{prev: {prev: {}}} //2
{prev: {prev: {prev: {}}}} //3

These are singletons (each type is inhabited by only one value)
*/
export type Zero = {}  

export type Succ<T> = {prev: T}
export const n_0 : Zero = {}
export const n_1 : Succ<Zero> = {prev: n_0}
export const n_2 : Succ<Succ<Zero>>  = {prev: n_1}
export const n_3 : Succ<Succ<Succ<Zero>>> = {prev: n_2}

/*
Structural typing allows me to provide alternative names for these types
*/

export type One =  {prev: Zero} //alias to Succ<Zero>
export type Two =  {prev: One}  //alias to Succ<Succ<Zero>>
export type Tree = {prev: Two}  //alias to Succ<Succ<Succ<Zero>>> 

export const n__1 : One  = n_1
export const n__2 : Two  = n_2
export const n__3 : Tree  = n_3

//export type Succ<T extends Nat> = {prev: T} //very fast leads to compilation errors:  Type instantiation is excessively deep and possibly infinite

/*
a very type-safe succ function:
*/
export const succ = <N> (n: N): Succ<N>  => {
    //return n //this will no compile!
    return {prev: n}
}   

/*
a very type-safe previous function:
*/
export const previous = <N> (n : Succ<N>): N => {
    //return n //this will no compile!
    return n.prev
}

/*
Type level recursive definition of + (a bit type inductive)

l + r = (l == succ(lminus)) ? succ(l + r) : r 

It uses TypeScript's Conditional Types.

This mimics the https://github.com/fwcd/tylude definition
*/
export type Add<L,R> = L extends Succ<infer Lprev>
    ? Succ<Add<Lprev, R>> 
    : R;     

function proveExtends<T1, T2 extends T1>() {}

    // Example: Only type-checks if 1 + 1 = 2
proveExtends<Add<One, Zero>, One>();
proveExtends<Add<One, One>, Two>();
proveExtends<Two, Add<One, One>>();

/*
As expected, everything works fine for statically defined numbers.
*/
const n_2_plus_1 : Add<Two, One> = n_3
export const n_1_plus_1 : Add<One, One> = n_2
export const n_1_plus_0 : Add<One, Zero> = n_1

export const ns_2_plus_1 : Add<Succ<Succ<Zero>>, Succ<Zero>> = n_3
export const ns_1_plus_1 : Add<Succ<Zero>, Succ<Zero>> = n_2

/*
This is just to test what type checker figures out from the program that mimicst the type level `Add<L,R>` expression. 
Type checker cannot figure out the type unless I give it somethingm so I gave it _any_:

Compilation error without return type:   
'add_' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one of its return expressions.

This is makes sense, iso-recursive structural types are very hard for type checking!
*/
export const add_ = <Lprev, L extends Succ<Lprev> | Zero, R> (l: L, r: R) :any => {
    return ("prev" in l) ? succ(add_(l.prev, r)) : r
}

/*
My actuall test.

The code type annotates all 'RHS'-s to show what type checker agrees with 
and the code is commented out when it fails to type check.

The type level `L extends Succ<infer Lprev>` is hard to write code for but I managed with `in` 
because all my values are JS objects (e.g. Zero is not "zero"). 

Type checker figured out that the argument `l` is actually a successor of `Lprev`. 

I am providing a hacked `addSucc` helper that returns `Succ<Add<Lprev, R>>` this is exactly the first type in the type level 
ternary definition of 'Add'!!  

I am returning what the `Add` conditional type definition wants.  Yet the type-checker does not see it and will not unify it 
with `Add<L,R>`.  

The `else` case is where the type level ternary condition fails so I am supposed to return `R`, and I do!
But, again the type checker does not realize that, and I have to cast it!
*/
export const add = <Lprev, L extends Succ<Lprev> | Zero, R> (l: L, r: R): Add<L,R> => {
    //(1) what is the cannonical way that represents 'L extends Succ<infer Lprev>' check on value level?
    //I use 'in' but that would fail if I defined, say, 'type Zero = "zero"'
    if("prev" in l) {
        const lc : Succ<Lprev> = l //(2) compiler figured that much!
        let res0 : Succ<Add<Lprev,R>> = addSucc (lc, r) //(3) still good
        //let res : Add<L,R> = res0 //(4) Not Assignable compilation error, but this is 
                                    //definionally true from 'Add<_,_>' if 'L extends Succ<infer Lprev>' 
        let res = (res0 as unknown) as Add<L,R> //(4) oh no!
        return res
    } else {
        return r as any //(5) Not Assignable even though definionally true
    }
}

/* 
Helper function

(succ l) + r = succ(l + r)

PLEASE INGORE THIS IMPLEMENTATION, it is using a cast to 'any' to move forward, JUST FOCUS ON above 'add'
*/
export const addSucc = <L, R> (l: Succ<L>, r: R): Succ<Add<L,R>> => {
    const lminus :L = previous(l)
    const summinus = add (lminus as any, r) as Add<L, R>
    return succ(summinus)
}

//type checker (IntelliSense) recognized it is 3 as expected
export const tst3 = add(n_2, n_1) //const tst3: Succ<Succ<Succ<"zero">>>  


/*
Some explanation
================

TS seems to be clunky supporting the conditional types with infer
as shown by the following example:
*/

type HasContent<C> = {content: C}

type GetContent<T> = T extends HasContent <infer C> ? C : T

const getContent = <C, T extends HasContent<C>> (t: T) : GetContent<T> => {
   //return t.content //compiler error:  Type 'C' is not assignable to type 'GetContent<T>'
   return t.content as any
}


/*


Recursive Nat type
==================

Note this is iso-recursive, effectively infinte type

*/

//type Nat = Zero | Succ<Nat> //does not compile but is morally equivalent
export type Nat = Zero | {prev: Nat}

/*
Nat unifies all previously defined types
*/
export const n___0 : Nat =  n_0 
export const n___1 : Nat  = n_1
export const n___2 : Nat  = n_2
export const n___3:  Nat  = n_3




/*
Assume we have implemented this somehow:
*/
export const add2 = <L extends Nat, R extends Nat> (l:L, r: R): Add<L,R> => {
   return _() //hole to satisfy typechecker
}

/*
This is attempt to code reuse add2 to define `addNat` that just works on `Nat` elements

This produces compiler error: 'Type instantiation is excessively deep and possibly infinite'.

This is not surprising as `Nat` is potentially an infinite structure.
*/
export const addNat = <L extends Nat, R extends Nat> (l: L, r: R): Nat => { 
   //return add2(l, r) //'Type instantiation is excessively deep and possibly infinite'
   return _()
}

/*
Same for this attempt
*/
export const addNat_ =  (l: Nat, r: Nat): Nat => { 
    // return add2(l, r) //'Type instantiation is excessively deep and possibly infinite'
    return _()
 }
 

/*
I can still effectively work on the Nat type directly.
*/
export const addNat__ = <L extends Nat, R extends Nat> (l: L, r: R): Nat => { 
    return ("prev" in l) ? succ(addNat__(l.prev, r)) : r
}
