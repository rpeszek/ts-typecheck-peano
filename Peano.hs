{-# LANGUAGE TypeFamilies #-}
{-# LANGUAGE GADTs #-}

{-
This program contains Nat example that tries to match
my TS code as close as possible.  
Obviously this is not a close analogy as semantics of structural and nominal 
typing differs.
-}


-- type level defs
-- I am not using DataKinds explicitly to mimic TypeScript construction
data Zero = Zero
newtype Succ t = Succ t  

-- | value level Nat
-- Needed because of nomial typing
data Nat t where
 Z :: Nat Zero 
 S :: Nat t-> Nat (Succ t)

-- | mimics TypeScript `Add` quite closely 
type family Add t r where
    Add (Succ t) r = Succ(Add t r)
    Add Zero r = r

-- | This is obviously not polymorphic in second parameter as structually typed
-- TS version is.
--
-- But the implementation is trivial and closely mimics the type family definition.
-- I really like how close type level code and value level code is. 
add :: Nat l -> Nat r -> Nat (Add l r)
add (S t) r = S (add t r)
add Z r = r

