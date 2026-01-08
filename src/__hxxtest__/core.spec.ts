import {
  createIdentifier,
  Inject,
  Injector,
} from '@wendellhu/redi';
import { afterEach, describe, expect, it } from 'vitest';
import { TEST_ONLY_clearKnownIdentifiers } from '../decorators';

function cleanupTest() {
  TEST_ONLY_clearKnownIdentifiers();
}

describe('core', () => {
  afterEach(() => cleanupTest());

  describe('basics', () => {
    it('should resolve instance and then cache it', () => {
      let createCount = 0;

      class A {
        constructor() {
          createCount += 1;
        }
      }

      const j = new Injector([[A]]);

      j.get(A);
      expect(createCount).toBe(1);

      j.get(A);
      expect(createCount).toBe(1);
    });

    it('should support adding dependencies', () => {
      const j = new Injector();

      class A {
        key = 'a';
      }

      class B {
        constructor(@Inject(A) public a: A) {}
      }

      interface C {
        key: string;
      }

      const cI = createIdentifier<C>('cI');
      const cII = createIdentifier<C>('cII');

      const a = new A();

      j.add([A, a]);
      j.add([B]);
      j.add([
        cI,
        {
          useFactory: (a: A) => ({
            key: a.key,
          }),
          deps: [A],
        },
      ]);
      j.add([
        cII,
        {
          useFactory: (a: A) => ({
            key: a.key,
          }),
          deps: [A],
        },
      ]);

      const b = j.get(B);
      expect(b.a).toBe(a);

      const c = j.get(cI);
      expect(c.key).toBe('a');

      const cii = j.get(cII);
      expect(cii.key).toBe('a');
    });

    // it('should throw error when adding a dependency after it get resolved', () => {
    //   const j = new Injector();

    //   interface IA {
    //     key: string;
    //   }

    //   const IA = createIdentifier<IA>('IA');

    //   class A implements IA {
    //     key = 'a';
    //   }

    //   class B {
    //     constructor(@Inject(IA) public a: IA) {}
    //   }

    //   j.add([IA, { useClass: A }]);
    //   j.add([B]);

    //   j.get(B);

    //   class AA implements IA {
    //     key = 'aa';
    //   }

    //   expectToThrow(() => {
    //     j.add([IA, { useClass: AA }]);
    //   });
    // });

    // it('should support replacing dependency', () => {
    //   const j = new Injector();

    //   interface IA {
    //     key: string;
    //   }

    //   const IA = createIdentifier<IA>('IA');

    //   class A implements IA {
    //     key = 'a';
    //   }

    //   class AA implements IA {
    //     key = 'aa';
    //   }

    //   class B {
    //     constructor(@Inject(IA) public a: IA) {}
    //   }

    //   j.add([IA, { useClass: A }]);
    //   j.add([B]);
    //   j.replace([IA, { useClass: AA }]);

    //   expect(j.get(B).a.key.length).toEqual(2);
    // });

    // it('should throw an error when replacing an identifier after it has instantiated', () => {
    //   const j = new Injector();

    //   interface IA {
    //     key: string;
    //   }

    //   const IA = createIdentifier<IA>('IA');

    //   class A implements IA {
    //     key = 'a';
    //   }

    //   class AA implements IA {
    //     key = 'aa';
    //   }

    //   class B {
    //     constructor(@Inject(IA) public a: IA) {}
    //   }

    //   j.add([IA, { useClass: A }]);
    //   j.add([B]);
    //   expect(j.get(B).a.key.length).toEqual(1);

    //   expectToThrow(() => {
    //     j.replace([IA, { useClass: AA }]);
    //   }, '[redi]: Cannot add dependency "IA" after it is already resolved.');
    // });

    // it('should "createInstance" work', () => {
    //   class A {
    //     key = 'a';
    //   }

    //   class B {
    //     constructor(@Inject(A) public a: A) {}
    //   }

    //   const j = new Injector([[A]]);
    //   const b = j.createInstance(B);

    //   expect(b.a.key).toBe('a');
    // });

    // it('should "createInstance" support custom args', () => {
    //   class A {
    //     key = 'a';
    //   }

    //   class B {
    //     constructor(
    //       private readonly otherKey: string,
    //       @Inject(A) public readonly a: A,
    //     ) {}

    //     get key() {
    //       return `${this.otherKey}a`;
    //     }
    //   }

    //   const j = new Injector([[A]]);
    //   const b = j.createInstance(B, 'another ');
    //   expect(b.key).toBe('another a');
    // });

    // it('should "createInstance" truncate extra custom args', () => {
    //   class A {
    //     key = 'a';
    //   }

    //   class B {
    //     constructor(
    //       private readonly otherKey: string,
    //       @Inject(A) public readonly a: A,
    //     ) {}

    //     get key() {
    //       return `${this.otherKey}a`;
    //     }
    //   }

    //   const j = new Injector([[A]]);
    //   // @ts-expect-error for testing purpose
    //   const b = j.createInstance(B, 'another ', 'extra', 'args', 'ignored');
    //   expect(b.key).toBe('another a');
    // });

    // it('should "createInstance" fill unprovided custom args with "undefined"', () => {
    //   class A {
    //     key = 'a';
    //   }

    //   class B {
    //     constructor(
    //       private readonly otherKey: string,
    //       private readonly secondKey: string,
    //       @Inject(A) public readonly a: A,
    //     ) {}

    //     get key() {
    //       return `${this.otherKey + this.secondKey} ${this.a.key}`;
    //     }
    //   }

    //   const spy = vi.spyOn(console, 'warn');
    //   spy.mockImplementation(() => {});

    //   const j = new Injector([[A]]);
    //   const b = j.createInstance(B, 'another ');

    //   expect(b.key).toBe('another undefined a');
    //   expect(spy).toHaveReturnedTimes(1);

    //   spy.mockRestore();
    // });

    // it('should detect circular dependency', () => {
    //   const aI = createIdentifier('aI');
    //   const bI = createIdentifier('bI');

    //   class A {
    //     constructor(@Inject(bI) private readonly b: any) {}
    //   }

    //   class B {
    //     constructor(@Inject(aI) private readonly a: any) {}
    //   }

    //   const j = new Injector([
    //     [aI, { useClass: A }],
    //     [bI, { useClass: B }],
    //   ]);

    //   expectToThrow(
    //     () => j.get(aI),
    //     `[redi]: Detecting cyclic dependency. The last identifier is "B".`,
    //   );
    // });

    // it('should "invoke" work', () => {
    //   class A {
    //     a = 'a';
    //   }

    //   const j = new Injector([[A]]);

    //   const a = j.invoke((accessor) => {
    //     // Can use `has` API to check if a dependency is registered.
    //     expect(accessor.has(A)).toBeTruthy();

    //     return accessor.get(A).a;
    //   });

    //   expect(a).toBe('a');
    // });

    // it('should support checking if a dependency could be resolved by an injector', () => {
    //   class A {}

    //   class B {}

    //   const j = new Injector([[A]]);

    //   expect(j.has(A)).toBeTruthy();
    //   expect(j.has(B)).toBeFalsy();
    // });

    // it('should support deleting unresolved dependencies', () => {
    //   class A {}

    //   const injector = new Injector([[A]]);
    //   injector.delete(A);

    //   expectToThrow(() => {
    //     injector.get(A);
    //   }, '[redi]: Expect 1 dependency item(s) for id "A" but get 0. Did you forget to register it?');
    // });

    // it('should throw an error trying to delete a resolved dependency', () => {
    //   class A {}

    //   const injector = new Injector([[A]]);

    //   injector.get(A);

    //   expectToThrow(() => {
    //     injector.delete(A);
    //   }, '[redi]: Cannot delete dependency "A" when it is already resolved.');
    // });
  });
});
