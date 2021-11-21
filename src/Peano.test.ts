import * as P from './Peano'

test('check add', () => {
    console.log(P.n_0)
    console.log(P.n_1)
    console.log(P.n_2)
    
    expect (P.add(P.n_2, P.n_1)).toStrictEqual(P.n_3)
    expect (P.add(P.n_2, "hello")).toStrictEqual({prev: { prev: "hello"}})

 });

test("check add_", () => {
     expect (P.add_(P.n_1, P.n_1)).toStrictEqual(P.n_2)
 });

test("check addNat__", () => {
    expect (P.addNat__(P.n_1, P.n_1)).toStrictEqual(P.n_2)
});