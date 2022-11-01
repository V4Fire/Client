# components/traits

The module provides a set of traits for components. A trait is a special kind of abstract class that is used as an interface.
Why do we need it? Well, unlike Java or Kotlin, TypeScript interfaces cannot have default method implementations.
Therefore, we need to implement every method in our classes, even if the implementation doesn't change.
This is where traits come into play. How it works? Okay, let's list the steps to create a trait.

1. Create an abstract class where you define all the necessary abstract methods and properties (yes, a trait can also define properties,
   not just methods)..

   ```typescript
   abstract class Duckable {
     abstract name: string;
     abstract fly(): void;
   }
   ```

2. Define all non-abstract methods as simple methods with no implementation: use loopback code as the method body,
   such as `return Object.throw()`.

   ```typescript
   abstract class Duckable {
     abstract name: string;
     abstract fly(): void;

     getQuack(size: number): string {
       return Object.throw();
     }
   }
   ```

3. Define non-abstract methods as static methods of a class with the same names and signatures, but add a reference to
   the class instance as the first argument, as we do in Python or Rust. Also, we can use the `AddSelf` helper to generate less code.

   ```typescript
   abstract class Duckable {
     abstract name: string;
     abstract fly(): void;

     getQuack(size: number): string {
       return Object.throw();
     }

     // The first parameter provides a method to wrap.
     // The second parameter declares what type `self` is.
     static getQuack: AddSelf<Duckable['getQuack'], Duckable> = (self, size) => {
       if (size < 10) {
         return 'quack!';
       }

       if (size < 20) {
         return 'quack!!!';
       }

       return 'QUACK!!!';
     };
   }
   ```

We have created a trait. Now we can implement it in a simple class.

1. Create a simple class and implement the trait using the `implements` keyword.
   Do not implement methods whose implementations you want to keep default.

   ```typescript
   class DuckLike implements Duckable {
     name: string = 'Bob';

     fly(): void {
       // Do some logic to fly
     }
   }
   ```

2. Create an interface with the same name as our class and extend it from the trait using the `Trait` type.

   ```typescript
   interface DuckLike extends Trait<typeof Duckable> {}

   class DuckLike implements Duckable {
     name: string = 'Bob';

     fly(): void {
       // Do some logic to fly
     }
   }
   ```

3. Use the `derive` decorator from `core/functools/trait` with our class and specify any traits we want to implement automatically.

   ```typescript
   import { derive } from 'core/functools/trait';

   interface DuckLike extends Trait<typeof Duckable> {}

   @derive(Duckable)
   class DuckLike implements Duckable {
     name: string = 'Bob';

     fly(): void {
       // Do some logic to fly
     }
   }
   ```

4. Profit! Now TS understands interface methods by default and works at runtime.

   ```typescript
   import { derive } from 'core/functools/trait';

   interface DuckLike extends Trait<typeof Duckable> {}

   @derive(Duckable)
   class DuckLike implements Duckable {
     name: string = 'Bob';

     fly(): void {
       // Do some logic to fly
     }
   }

   /// 'QUACK!!!'
   console.log(new DuckLike().getQuack(60));
   ```

5. Of course, we can implement more than one trait in a component.

   ```typescript
   import { derive } from 'core/functools/trait';

   interface DuckLike extends Trait<typeof Duckable>, Trait<typeof AnotherTrait> {}

   @derive(Duckable, AnotherTrait)
   class DuckLike implements Duckable, AnotherTrait, SimpleInterfaceWithoutDefaultMethods {
     name: string = 'Bob';

     fly(): void {
       // Do some logic to fly
     }
   }
  ```

Apart from the normal methods, you can also define get/set accessors like this:

```typescript
abstract class Duckable {
  get canFly(): boolean {
    return Object.throw();
  }

  set canFly(value: boolean) {};

  static canFly(self: Duckable): string {
    if (arguments.length > 1) {
      const value = arguments[1];
      // Setter code

    } else {
      return /* Getter code */;
    }
  }
}
```
