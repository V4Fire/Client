# components/traits

The module provides a set of traits for components.
A trait in TypeScript is an interface-like abstract class that serves as an interface.
But why do we need it?
Unlike Java or Kotlin, TypeScript interfaces cannot have default method implementations.
Consequently, in TypeScript, we have to implement every method in our classes,
even if the implementation remains unchanged.
This is where traits become useful.

## How Does It Work?

Let's list the steps to create a trait.

1. Create an abstract class that includes all the essential abstract methods and properties.

   ```typescript
   abstract class Duckable {
     abstract name: string;
     abstract fly(): void;
   }
   ```

2. Define all non-abstract methods as simple methods without any implementation.
   You can use loopback code as the method body, such as returning `Object.throw()`.

   ```typescript
   abstract class Duckable {
     abstract name: string;
     abstract fly(): void;

     getQuack(size: number): string {
       return Object.throw();
     }
   }
   ```

3. Define the non-abstract methods as static methods of a class with the same names and signatures,
   but include a reference to the class instance as the first argument,
   similar to the way it is done in Python or Rust.
   Additionally, you can use the `AddSelf` helper to generate less code.

   ```typescript
   abstract class Duckable {
     abstract name: string;
     abstract fly(): void;

     getQuack(size: number): string {
       return Object.throw();
     }

     // The first parameter represents the method to be wrapped.
     // The second parameter defines the type of 'self'.
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

We have defined a trait. We can now proceed to implement it in a basic class.

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

2. Create an interface with the same name as our class, and extend it
   based on the trait using the `extends` keyword with the type `Trait`.

   ```typescript
   interface DuckLike extends Trait<typeof Duckable> {}

   class DuckLike implements Duckable {
     name: string = 'Bob';

     fly(): void {
       // Do some logic to fly
     }
   }
   ```

3. Use the `derive` decorator from `core/functools/trait` with our class and
   specify any traits we want to automatically implement.

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

4. Profit! Now TS will automatically understand the methods of the interface, and they will work at runtime.

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

6. In addition to regular methods, you can also define get/set accessor methods like this:

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
