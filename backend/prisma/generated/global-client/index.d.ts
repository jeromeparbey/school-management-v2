
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Etablissement
 * 
 */
export type Etablissement = $Result.DefaultSelection<Prisma.$EtablissementPayload>
/**
 * Model UtilisateurGlobal
 * 
 */
export type UtilisateurGlobal = $Result.DefaultSelection<Prisma.$UtilisateurGlobalPayload>
/**
 * Model AbonnementEtablissement
 * 
 */
export type AbonnementEtablissement = $Result.DefaultSelection<Prisma.$AbonnementEtablissementPayload>
/**
 * Model FactureEtablissement
 * 
 */
export type FactureEtablissement = $Result.DefaultSelection<Prisma.$FactureEtablissementPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TypeEtablissement: {
  PUBLIC: 'PUBLIC',
  PRIVE: 'PRIVE',
  PRIVE_LAIQUE: 'PRIVE_LAIQUE',
  PRIVE_CONFESSIONNEL: 'PRIVE_CONFESSIONNEL',
  INTERNATIONAL: 'INTERNATIONAL'
};

export type TypeEtablissement = (typeof TypeEtablissement)[keyof typeof TypeEtablissement]


export const PlanAbonnement: {
  GRATUIT: 'GRATUIT',
  BASIQUE: 'BASIQUE',
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE'
};

export type PlanAbonnement = (typeof PlanAbonnement)[keyof typeof PlanAbonnement]


export const StatutProvisionnement: {
  EN_ATTENTE: 'EN_ATTENTE',
  EN_COURS: 'EN_COURS',
  TERMINE: 'TERMINE',
  ECHEC: 'ECHEC'
};

export type StatutProvisionnement = (typeof StatutProvisionnement)[keyof typeof StatutProvisionnement]


export const RoleGlobal: {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_SYSTEME: 'ADMIN_SYSTEME'
};

export type RoleGlobal = (typeof RoleGlobal)[keyof typeof RoleGlobal]


export const StatutFacture: {
  EN_ATTENTE: 'EN_ATTENTE',
  PAYEE: 'PAYEE',
  EN_RETARD: 'EN_RETARD',
  ANNULEE: 'ANNULEE',
  REMBOURSEE: 'REMBOURSEE'
};

export type StatutFacture = (typeof StatutFacture)[keyof typeof StatutFacture]

}

export type TypeEtablissement = $Enums.TypeEtablissement

export const TypeEtablissement: typeof $Enums.TypeEtablissement

export type PlanAbonnement = $Enums.PlanAbonnement

export const PlanAbonnement: typeof $Enums.PlanAbonnement

export type StatutProvisionnement = $Enums.StatutProvisionnement

export const StatutProvisionnement: typeof $Enums.StatutProvisionnement

export type RoleGlobal = $Enums.RoleGlobal

export const RoleGlobal: typeof $Enums.RoleGlobal

export type StatutFacture = $Enums.StatutFacture

export const StatutFacture: typeof $Enums.StatutFacture

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Etablissements
 * const etablissements = await prisma.etablissement.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Etablissements
   * const etablissements = await prisma.etablissement.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.PrismaClientConstructorArgs<ClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.etablissement`: Exposes CRUD operations for the **Etablissement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Etablissements
    * const etablissements = await prisma.etablissement.findMany()
    * ```
    */
  get etablissement(): Prisma.EtablissementDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.utilisateurGlobal`: Exposes CRUD operations for the **UtilisateurGlobal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UtilisateurGlobals
    * const utilisateurGlobals = await prisma.utilisateurGlobal.findMany()
    * ```
    */
  get utilisateurGlobal(): Prisma.UtilisateurGlobalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.abonnementEtablissement`: Exposes CRUD operations for the **AbonnementEtablissement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AbonnementEtablissements
    * const abonnementEtablissements = await prisma.abonnementEtablissement.findMany()
    * ```
    */
  get abonnementEtablissement(): Prisma.AbonnementEtablissementDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.factureEtablissement`: Exposes CRUD operations for the **FactureEtablissement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FactureEtablissements
    * const factureEtablissements = await prisma.factureEtablissement.findMany()
    * ```
    */
  get factureEtablissement(): Prisma.FactureEtablissementDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.10.0
   * Query Engine version: 0edf323efd1d98336f3f0a68684b56f689b900d3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * Resolved type of the argument passed to the `PrismaClient` constructor.
   *
   * When called without a narrower options type (the common case), this resolves
   * to `PrismaClientOptions` directly, which produces a clear TypeScript error
   * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
   * the argument is missing or incomplete. When the user supplies a narrower
   * options type (e.g. via a literal), it falls back to `Subset` to keep
   * filtering out unknown properties.
   */
  export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> =
    [PrismaClientOptions] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      ((Without<T, U> & U) | (Without<U, T> & T)) & object
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Etablissement: 'Etablissement',
    UtilisateurGlobal: 'UtilisateurGlobal',
    AbonnementEtablissement: 'AbonnementEtablissement',
    FactureEtablissement: 'FactureEtablissement'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "etablissement" | "utilisateurGlobal" | "abonnementEtablissement" | "factureEtablissement"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Etablissement: {
        payload: Prisma.$EtablissementPayload<ExtArgs>
        fields: Prisma.EtablissementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EtablissementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EtablissementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload>
          }
          findFirst: {
            args: Prisma.EtablissementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EtablissementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload>
          }
          findMany: {
            args: Prisma.EtablissementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload>[]
          }
          create: {
            args: Prisma.EtablissementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload>
          }
          createMany: {
            args: Prisma.EtablissementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EtablissementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload>[]
          }
          delete: {
            args: Prisma.EtablissementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload>
          }
          update: {
            args: Prisma.EtablissementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload>
          }
          deleteMany: {
            args: Prisma.EtablissementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EtablissementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EtablissementUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload>[]
          }
          upsert: {
            args: Prisma.EtablissementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EtablissementPayload>
          }
          aggregate: {
            args: Prisma.EtablissementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEtablissement>
          }
          groupBy: {
            args: Prisma.EtablissementGroupByArgs<ExtArgs>
            result: $Utils.Optional<EtablissementGroupByOutputType>[]
          }
          count: {
            args: Prisma.EtablissementCountArgs<ExtArgs>
            result: $Utils.Optional<EtablissementCountAggregateOutputType> | number
          }
        }
      }
      UtilisateurGlobal: {
        payload: Prisma.$UtilisateurGlobalPayload<ExtArgs>
        fields: Prisma.UtilisateurGlobalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UtilisateurGlobalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UtilisateurGlobalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload>
          }
          findFirst: {
            args: Prisma.UtilisateurGlobalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UtilisateurGlobalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload>
          }
          findMany: {
            args: Prisma.UtilisateurGlobalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload>[]
          }
          create: {
            args: Prisma.UtilisateurGlobalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload>
          }
          createMany: {
            args: Prisma.UtilisateurGlobalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UtilisateurGlobalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload>[]
          }
          delete: {
            args: Prisma.UtilisateurGlobalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload>
          }
          update: {
            args: Prisma.UtilisateurGlobalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload>
          }
          deleteMany: {
            args: Prisma.UtilisateurGlobalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UtilisateurGlobalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UtilisateurGlobalUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload>[]
          }
          upsert: {
            args: Prisma.UtilisateurGlobalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UtilisateurGlobalPayload>
          }
          aggregate: {
            args: Prisma.UtilisateurGlobalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUtilisateurGlobal>
          }
          groupBy: {
            args: Prisma.UtilisateurGlobalGroupByArgs<ExtArgs>
            result: $Utils.Optional<UtilisateurGlobalGroupByOutputType>[]
          }
          count: {
            args: Prisma.UtilisateurGlobalCountArgs<ExtArgs>
            result: $Utils.Optional<UtilisateurGlobalCountAggregateOutputType> | number
          }
        }
      }
      AbonnementEtablissement: {
        payload: Prisma.$AbonnementEtablissementPayload<ExtArgs>
        fields: Prisma.AbonnementEtablissementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AbonnementEtablissementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AbonnementEtablissementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload>
          }
          findFirst: {
            args: Prisma.AbonnementEtablissementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AbonnementEtablissementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload>
          }
          findMany: {
            args: Prisma.AbonnementEtablissementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload>[]
          }
          create: {
            args: Prisma.AbonnementEtablissementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload>
          }
          createMany: {
            args: Prisma.AbonnementEtablissementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AbonnementEtablissementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload>[]
          }
          delete: {
            args: Prisma.AbonnementEtablissementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload>
          }
          update: {
            args: Prisma.AbonnementEtablissementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload>
          }
          deleteMany: {
            args: Prisma.AbonnementEtablissementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AbonnementEtablissementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AbonnementEtablissementUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload>[]
          }
          upsert: {
            args: Prisma.AbonnementEtablissementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AbonnementEtablissementPayload>
          }
          aggregate: {
            args: Prisma.AbonnementEtablissementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAbonnementEtablissement>
          }
          groupBy: {
            args: Prisma.AbonnementEtablissementGroupByArgs<ExtArgs>
            result: $Utils.Optional<AbonnementEtablissementGroupByOutputType>[]
          }
          count: {
            args: Prisma.AbonnementEtablissementCountArgs<ExtArgs>
            result: $Utils.Optional<AbonnementEtablissementCountAggregateOutputType> | number
          }
        }
      }
      FactureEtablissement: {
        payload: Prisma.$FactureEtablissementPayload<ExtArgs>
        fields: Prisma.FactureEtablissementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FactureEtablissementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FactureEtablissementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload>
          }
          findFirst: {
            args: Prisma.FactureEtablissementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FactureEtablissementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload>
          }
          findMany: {
            args: Prisma.FactureEtablissementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload>[]
          }
          create: {
            args: Prisma.FactureEtablissementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload>
          }
          createMany: {
            args: Prisma.FactureEtablissementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FactureEtablissementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload>[]
          }
          delete: {
            args: Prisma.FactureEtablissementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload>
          }
          update: {
            args: Prisma.FactureEtablissementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload>
          }
          deleteMany: {
            args: Prisma.FactureEtablissementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FactureEtablissementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FactureEtablissementUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload>[]
          }
          upsert: {
            args: Prisma.FactureEtablissementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FactureEtablissementPayload>
          }
          aggregate: {
            args: Prisma.FactureEtablissementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFactureEtablissement>
          }
          groupBy: {
            args: Prisma.FactureEtablissementGroupByArgs<ExtArgs>
            result: $Utils.Optional<FactureEtablissementGroupByOutputType>[]
          }
          count: {
            args: Prisma.FactureEtablissementCountArgs<ExtArgs>
            result: $Utils.Optional<FactureEtablissementCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     * 
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     * 
     * Learn more: https://pris.ly/d/driver-adapters
     * 
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     * 
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     * 
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    etablissement?: EtablissementOmit
    utilisateurGlobal?: UtilisateurGlobalOmit
    abonnementEtablissement?: AbonnementEtablissementOmit
    factureEtablissement?: FactureEtablissementOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type EtablissementCountOutputType
   */

  export type EtablissementCountOutputType = {
    utilisateursGlobaux: number
    abonnements: number
    factures: number
  }

  export type EtablissementCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    utilisateursGlobaux?: boolean | EtablissementCountOutputTypeCountUtilisateursGlobauxArgs
    abonnements?: boolean | EtablissementCountOutputTypeCountAbonnementsArgs
    factures?: boolean | EtablissementCountOutputTypeCountFacturesArgs
  }

  // Custom InputTypes
  /**
   * EtablissementCountOutputType without action
   */
  export type EtablissementCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EtablissementCountOutputType
     */
    select?: EtablissementCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EtablissementCountOutputType without action
   */
  export type EtablissementCountOutputTypeCountUtilisateursGlobauxArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UtilisateurGlobalWhereInput
  }

  /**
   * EtablissementCountOutputType without action
   */
  export type EtablissementCountOutputTypeCountAbonnementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AbonnementEtablissementWhereInput
  }

  /**
   * EtablissementCountOutputType without action
   */
  export type EtablissementCountOutputTypeCountFacturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FactureEtablissementWhereInput
  }


  /**
   * Count Type AbonnementEtablissementCountOutputType
   */

  export type AbonnementEtablissementCountOutputType = {
    factures: number
  }

  export type AbonnementEtablissementCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    factures?: boolean | AbonnementEtablissementCountOutputTypeCountFacturesArgs
  }

  // Custom InputTypes
  /**
   * AbonnementEtablissementCountOutputType without action
   */
  export type AbonnementEtablissementCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissementCountOutputType
     */
    select?: AbonnementEtablissementCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AbonnementEtablissementCountOutputType without action
   */
  export type AbonnementEtablissementCountOutputTypeCountFacturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FactureEtablissementWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Etablissement
   */

  export type AggregateEtablissement = {
    _count: EtablissementCountAggregateOutputType | null
    _avg: EtablissementAvgAggregateOutputType | null
    _sum: EtablissementSumAggregateOutputType | null
    _min: EtablissementMinAggregateOutputType | null
    _max: EtablissementMaxAggregateOutputType | null
  }

  export type EtablissementAvgAggregateOutputType = {
    toleranceRetard: number | null
    tauxHeureSup: number | null
    maxUtilisateurs: number | null
  }

  export type EtablissementSumAggregateOutputType = {
    toleranceRetard: number | null
    tauxHeureSup: number | null
    maxUtilisateurs: number | null
  }

  export type EtablissementMinAggregateOutputType = {
    id: string | null
    nom: string | null
    code: string | null
    schemaName: string | null
    type: $Enums.TypeEtablissement | null
    logo: string | null
    adresse: string | null
    ville: string | null
    pays: string | null
    telephone: string | null
    email: string | null
    siteWeb: string | null
    numeroAgrement: string | null
    devise: string | null
    fuseauHoraire: string | null
    formatDate: string | null
    heureDebut: string | null
    heureFin: string | null
    toleranceRetard: number | null
    tauxHeureSup: number | null
    estActif: boolean | null
    estArchive: boolean | null
    planAbonnement: $Enums.PlanAbonnement | null
    dateExpiration: Date | null
    maxUtilisateurs: number | null
    statutProvisionnement: $Enums.StatutProvisionnement | null
    erreurProvisionnement: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EtablissementMaxAggregateOutputType = {
    id: string | null
    nom: string | null
    code: string | null
    schemaName: string | null
    type: $Enums.TypeEtablissement | null
    logo: string | null
    adresse: string | null
    ville: string | null
    pays: string | null
    telephone: string | null
    email: string | null
    siteWeb: string | null
    numeroAgrement: string | null
    devise: string | null
    fuseauHoraire: string | null
    formatDate: string | null
    heureDebut: string | null
    heureFin: string | null
    toleranceRetard: number | null
    tauxHeureSup: number | null
    estActif: boolean | null
    estArchive: boolean | null
    planAbonnement: $Enums.PlanAbonnement | null
    dateExpiration: Date | null
    maxUtilisateurs: number | null
    statutProvisionnement: $Enums.StatutProvisionnement | null
    erreurProvisionnement: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EtablissementCountAggregateOutputType = {
    id: number
    nom: number
    code: number
    schemaName: number
    type: number
    logo: number
    adresse: number
    ville: number
    pays: number
    telephone: number
    email: number
    siteWeb: number
    numeroAgrement: number
    devise: number
    fuseauHoraire: number
    formatDate: number
    joursOuvrables: number
    heureDebut: number
    heureFin: number
    toleranceRetard: number
    tauxHeureSup: number
    estActif: number
    estArchive: number
    planAbonnement: number
    dateExpiration: number
    maxUtilisateurs: number
    statutProvisionnement: number
    erreurProvisionnement: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type EtablissementAvgAggregateInputType = {
    toleranceRetard?: true
    tauxHeureSup?: true
    maxUtilisateurs?: true
  }

  export type EtablissementSumAggregateInputType = {
    toleranceRetard?: true
    tauxHeureSup?: true
    maxUtilisateurs?: true
  }

  export type EtablissementMinAggregateInputType = {
    id?: true
    nom?: true
    code?: true
    schemaName?: true
    type?: true
    logo?: true
    adresse?: true
    ville?: true
    pays?: true
    telephone?: true
    email?: true
    siteWeb?: true
    numeroAgrement?: true
    devise?: true
    fuseauHoraire?: true
    formatDate?: true
    heureDebut?: true
    heureFin?: true
    toleranceRetard?: true
    tauxHeureSup?: true
    estActif?: true
    estArchive?: true
    planAbonnement?: true
    dateExpiration?: true
    maxUtilisateurs?: true
    statutProvisionnement?: true
    erreurProvisionnement?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EtablissementMaxAggregateInputType = {
    id?: true
    nom?: true
    code?: true
    schemaName?: true
    type?: true
    logo?: true
    adresse?: true
    ville?: true
    pays?: true
    telephone?: true
    email?: true
    siteWeb?: true
    numeroAgrement?: true
    devise?: true
    fuseauHoraire?: true
    formatDate?: true
    heureDebut?: true
    heureFin?: true
    toleranceRetard?: true
    tauxHeureSup?: true
    estActif?: true
    estArchive?: true
    planAbonnement?: true
    dateExpiration?: true
    maxUtilisateurs?: true
    statutProvisionnement?: true
    erreurProvisionnement?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EtablissementCountAggregateInputType = {
    id?: true
    nom?: true
    code?: true
    schemaName?: true
    type?: true
    logo?: true
    adresse?: true
    ville?: true
    pays?: true
    telephone?: true
    email?: true
    siteWeb?: true
    numeroAgrement?: true
    devise?: true
    fuseauHoraire?: true
    formatDate?: true
    joursOuvrables?: true
    heureDebut?: true
    heureFin?: true
    toleranceRetard?: true
    tauxHeureSup?: true
    estActif?: true
    estArchive?: true
    planAbonnement?: true
    dateExpiration?: true
    maxUtilisateurs?: true
    statutProvisionnement?: true
    erreurProvisionnement?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type EtablissementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Etablissement to aggregate.
     */
    where?: EtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Etablissements to fetch.
     */
    orderBy?: EtablissementOrderByWithRelationInput | EtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Etablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Etablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Etablissements
    **/
    _count?: true | EtablissementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EtablissementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EtablissementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EtablissementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EtablissementMaxAggregateInputType
  }

  export type GetEtablissementAggregateType<T extends EtablissementAggregateArgs> = {
        [P in keyof T & keyof AggregateEtablissement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEtablissement[P]>
      : GetScalarType<T[P], AggregateEtablissement[P]>
  }




  export type EtablissementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EtablissementWhereInput
    orderBy?: EtablissementOrderByWithAggregationInput | EtablissementOrderByWithAggregationInput[]
    by: EtablissementScalarFieldEnum[] | EtablissementScalarFieldEnum
    having?: EtablissementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EtablissementCountAggregateInputType | true
    _avg?: EtablissementAvgAggregateInputType
    _sum?: EtablissementSumAggregateInputType
    _min?: EtablissementMinAggregateInputType
    _max?: EtablissementMaxAggregateInputType
  }

  export type EtablissementGroupByOutputType = {
    id: string
    nom: string
    code: string
    schemaName: string
    type: $Enums.TypeEtablissement
    logo: string | null
    adresse: string | null
    ville: string | null
    pays: string
    telephone: string | null
    email: string | null
    siteWeb: string | null
    numeroAgrement: string | null
    devise: string
    fuseauHoraire: string
    formatDate: string
    joursOuvrables: string[]
    heureDebut: string | null
    heureFin: string | null
    toleranceRetard: number
    tauxHeureSup: number
    estActif: boolean
    estArchive: boolean
    planAbonnement: $Enums.PlanAbonnement
    dateExpiration: Date | null
    maxUtilisateurs: number
    statutProvisionnement: $Enums.StatutProvisionnement
    erreurProvisionnement: string | null
    createdAt: Date
    updatedAt: Date
    _count: EtablissementCountAggregateOutputType | null
    _avg: EtablissementAvgAggregateOutputType | null
    _sum: EtablissementSumAggregateOutputType | null
    _min: EtablissementMinAggregateOutputType | null
    _max: EtablissementMaxAggregateOutputType | null
  }

  type GetEtablissementGroupByPayload<T extends EtablissementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EtablissementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EtablissementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EtablissementGroupByOutputType[P]>
            : GetScalarType<T[P], EtablissementGroupByOutputType[P]>
        }
      >
    >


  export type EtablissementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nom?: boolean
    code?: boolean
    schemaName?: boolean
    type?: boolean
    logo?: boolean
    adresse?: boolean
    ville?: boolean
    pays?: boolean
    telephone?: boolean
    email?: boolean
    siteWeb?: boolean
    numeroAgrement?: boolean
    devise?: boolean
    fuseauHoraire?: boolean
    formatDate?: boolean
    joursOuvrables?: boolean
    heureDebut?: boolean
    heureFin?: boolean
    toleranceRetard?: boolean
    tauxHeureSup?: boolean
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: boolean
    dateExpiration?: boolean
    maxUtilisateurs?: boolean
    statutProvisionnement?: boolean
    erreurProvisionnement?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    utilisateursGlobaux?: boolean | Etablissement$utilisateursGlobauxArgs<ExtArgs>
    abonnements?: boolean | Etablissement$abonnementsArgs<ExtArgs>
    factures?: boolean | Etablissement$facturesArgs<ExtArgs>
    _count?: boolean | EtablissementCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["etablissement"]>

  export type EtablissementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nom?: boolean
    code?: boolean
    schemaName?: boolean
    type?: boolean
    logo?: boolean
    adresse?: boolean
    ville?: boolean
    pays?: boolean
    telephone?: boolean
    email?: boolean
    siteWeb?: boolean
    numeroAgrement?: boolean
    devise?: boolean
    fuseauHoraire?: boolean
    formatDate?: boolean
    joursOuvrables?: boolean
    heureDebut?: boolean
    heureFin?: boolean
    toleranceRetard?: boolean
    tauxHeureSup?: boolean
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: boolean
    dateExpiration?: boolean
    maxUtilisateurs?: boolean
    statutProvisionnement?: boolean
    erreurProvisionnement?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["etablissement"]>

  export type EtablissementSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nom?: boolean
    code?: boolean
    schemaName?: boolean
    type?: boolean
    logo?: boolean
    adresse?: boolean
    ville?: boolean
    pays?: boolean
    telephone?: boolean
    email?: boolean
    siteWeb?: boolean
    numeroAgrement?: boolean
    devise?: boolean
    fuseauHoraire?: boolean
    formatDate?: boolean
    joursOuvrables?: boolean
    heureDebut?: boolean
    heureFin?: boolean
    toleranceRetard?: boolean
    tauxHeureSup?: boolean
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: boolean
    dateExpiration?: boolean
    maxUtilisateurs?: boolean
    statutProvisionnement?: boolean
    erreurProvisionnement?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["etablissement"]>

  export type EtablissementSelectScalar = {
    id?: boolean
    nom?: boolean
    code?: boolean
    schemaName?: boolean
    type?: boolean
    logo?: boolean
    adresse?: boolean
    ville?: boolean
    pays?: boolean
    telephone?: boolean
    email?: boolean
    siteWeb?: boolean
    numeroAgrement?: boolean
    devise?: boolean
    fuseauHoraire?: boolean
    formatDate?: boolean
    joursOuvrables?: boolean
    heureDebut?: boolean
    heureFin?: boolean
    toleranceRetard?: boolean
    tauxHeureSup?: boolean
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: boolean
    dateExpiration?: boolean
    maxUtilisateurs?: boolean
    statutProvisionnement?: boolean
    erreurProvisionnement?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type EtablissementOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nom" | "code" | "schemaName" | "type" | "logo" | "adresse" | "ville" | "pays" | "telephone" | "email" | "siteWeb" | "numeroAgrement" | "devise" | "fuseauHoraire" | "formatDate" | "joursOuvrables" | "heureDebut" | "heureFin" | "toleranceRetard" | "tauxHeureSup" | "estActif" | "estArchive" | "planAbonnement" | "dateExpiration" | "maxUtilisateurs" | "statutProvisionnement" | "erreurProvisionnement" | "createdAt" | "updatedAt", ExtArgs["result"]["etablissement"]>
  export type EtablissementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    utilisateursGlobaux?: boolean | Etablissement$utilisateursGlobauxArgs<ExtArgs>
    abonnements?: boolean | Etablissement$abonnementsArgs<ExtArgs>
    factures?: boolean | Etablissement$facturesArgs<ExtArgs>
    _count?: boolean | EtablissementCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type EtablissementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type EtablissementIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $EtablissementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Etablissement"
    objects: {
      utilisateursGlobaux: Prisma.$UtilisateurGlobalPayload<ExtArgs>[]
      abonnements: Prisma.$AbonnementEtablissementPayload<ExtArgs>[]
      factures: Prisma.$FactureEtablissementPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nom: string
      code: string
      schemaName: string
      type: $Enums.TypeEtablissement
      logo: string | null
      adresse: string | null
      ville: string | null
      pays: string
      telephone: string | null
      email: string | null
      siteWeb: string | null
      numeroAgrement: string | null
      devise: string
      fuseauHoraire: string
      formatDate: string
      joursOuvrables: string[]
      heureDebut: string | null
      heureFin: string | null
      toleranceRetard: number
      tauxHeureSup: number
      estActif: boolean
      estArchive: boolean
      planAbonnement: $Enums.PlanAbonnement
      dateExpiration: Date | null
      maxUtilisateurs: number
      statutProvisionnement: $Enums.StatutProvisionnement
      erreurProvisionnement: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["etablissement"]>
    composites: {}
  }

  type EtablissementGetPayload<S extends boolean | null | undefined | EtablissementDefaultArgs> = $Result.GetResult<Prisma.$EtablissementPayload, S>

  type EtablissementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EtablissementFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EtablissementCountAggregateInputType | true
    }

  export interface EtablissementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Etablissement'], meta: { name: 'Etablissement' } }
    /**
     * Find zero or one Etablissement that matches the filter.
     * @param {EtablissementFindUniqueArgs} args - Arguments to find a Etablissement
     * @example
     * // Get one Etablissement
     * const etablissement = await prisma.etablissement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EtablissementFindUniqueArgs>(args: SelectSubset<T, EtablissementFindUniqueArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Etablissement that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EtablissementFindUniqueOrThrowArgs} args - Arguments to find a Etablissement
     * @example
     * // Get one Etablissement
     * const etablissement = await prisma.etablissement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EtablissementFindUniqueOrThrowArgs>(args: SelectSubset<T, EtablissementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Etablissement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EtablissementFindFirstArgs} args - Arguments to find a Etablissement
     * @example
     * // Get one Etablissement
     * const etablissement = await prisma.etablissement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EtablissementFindFirstArgs>(args?: SelectSubset<T, EtablissementFindFirstArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Etablissement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EtablissementFindFirstOrThrowArgs} args - Arguments to find a Etablissement
     * @example
     * // Get one Etablissement
     * const etablissement = await prisma.etablissement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EtablissementFindFirstOrThrowArgs>(args?: SelectSubset<T, EtablissementFindFirstOrThrowArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Etablissements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EtablissementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Etablissements
     * const etablissements = await prisma.etablissement.findMany()
     * 
     * // Get first 10 Etablissements
     * const etablissements = await prisma.etablissement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const etablissementWithIdOnly = await prisma.etablissement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EtablissementFindManyArgs>(args?: SelectSubset<T, EtablissementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Etablissement.
     * @param {EtablissementCreateArgs} args - Arguments to create a Etablissement.
     * @example
     * // Create one Etablissement
     * const Etablissement = await prisma.etablissement.create({
     *   data: {
     *     // ... data to create a Etablissement
     *   }
     * })
     * 
     */
    create<T extends EtablissementCreateArgs>(args: SelectSubset<T, EtablissementCreateArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Etablissements.
     * @param {EtablissementCreateManyArgs} args - Arguments to create many Etablissements.
     * @example
     * // Create many Etablissements
     * const etablissement = await prisma.etablissement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EtablissementCreateManyArgs>(args?: SelectSubset<T, EtablissementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Etablissements and returns the data saved in the database.
     * @param {EtablissementCreateManyAndReturnArgs} args - Arguments to create many Etablissements.
     * @example
     * // Create many Etablissements
     * const etablissement = await prisma.etablissement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Etablissements and only return the `id`
     * const etablissementWithIdOnly = await prisma.etablissement.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EtablissementCreateManyAndReturnArgs>(args?: SelectSubset<T, EtablissementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Etablissement.
     * @param {EtablissementDeleteArgs} args - Arguments to delete one Etablissement.
     * @example
     * // Delete one Etablissement
     * const Etablissement = await prisma.etablissement.delete({
     *   where: {
     *     // ... filter to delete one Etablissement
     *   }
     * })
     * 
     */
    delete<T extends EtablissementDeleteArgs>(args: SelectSubset<T, EtablissementDeleteArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Etablissement.
     * @param {EtablissementUpdateArgs} args - Arguments to update one Etablissement.
     * @example
     * // Update one Etablissement
     * const etablissement = await prisma.etablissement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EtablissementUpdateArgs>(args: SelectSubset<T, EtablissementUpdateArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Etablissements.
     * @param {EtablissementDeleteManyArgs} args - Arguments to filter Etablissements to delete.
     * @example
     * // Delete a few Etablissements
     * const { count } = await prisma.etablissement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EtablissementDeleteManyArgs>(args?: SelectSubset<T, EtablissementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Etablissements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EtablissementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Etablissements
     * const etablissement = await prisma.etablissement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EtablissementUpdateManyArgs>(args: SelectSubset<T, EtablissementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Etablissements and returns the data updated in the database.
     * @param {EtablissementUpdateManyAndReturnArgs} args - Arguments to update many Etablissements.
     * @example
     * // Update many Etablissements
     * const etablissement = await prisma.etablissement.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Etablissements and only return the `id`
     * const etablissementWithIdOnly = await prisma.etablissement.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EtablissementUpdateManyAndReturnArgs>(args: SelectSubset<T, EtablissementUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Etablissement.
     * @param {EtablissementUpsertArgs} args - Arguments to update or create a Etablissement.
     * @example
     * // Update or create a Etablissement
     * const etablissement = await prisma.etablissement.upsert({
     *   create: {
     *     // ... data to create a Etablissement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Etablissement we want to update
     *   }
     * })
     */
    upsert<T extends EtablissementUpsertArgs>(args: SelectSubset<T, EtablissementUpsertArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Etablissements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EtablissementCountArgs} args - Arguments to filter Etablissements to count.
     * @example
     * // Count the number of Etablissements
     * const count = await prisma.etablissement.count({
     *   where: {
     *     // ... the filter for the Etablissements we want to count
     *   }
     * })
    **/
    count<T extends EtablissementCountArgs>(
      args?: Subset<T, EtablissementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EtablissementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Etablissement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EtablissementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EtablissementAggregateArgs>(args: Subset<T, EtablissementAggregateArgs>): Prisma.PrismaPromise<GetEtablissementAggregateType<T>>

    /**
     * Group by Etablissement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EtablissementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EtablissementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EtablissementGroupByArgs['orderBy'] }
        : { orderBy?: EtablissementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EtablissementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEtablissementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Etablissement model
   */
  readonly fields: EtablissementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Etablissement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EtablissementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    utilisateursGlobaux<T extends Etablissement$utilisateursGlobauxArgs<ExtArgs> = {}>(args?: Subset<T, Etablissement$utilisateursGlobauxArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    abonnements<T extends Etablissement$abonnementsArgs<ExtArgs> = {}>(args?: Subset<T, Etablissement$abonnementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    factures<T extends Etablissement$facturesArgs<ExtArgs> = {}>(args?: Subset<T, Etablissement$facturesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Etablissement model
   */
  interface EtablissementFieldRefs {
    readonly id: FieldRef<"Etablissement", 'String'>
    readonly nom: FieldRef<"Etablissement", 'String'>
    readonly code: FieldRef<"Etablissement", 'String'>
    readonly schemaName: FieldRef<"Etablissement", 'String'>
    readonly type: FieldRef<"Etablissement", 'TypeEtablissement'>
    readonly logo: FieldRef<"Etablissement", 'String'>
    readonly adresse: FieldRef<"Etablissement", 'String'>
    readonly ville: FieldRef<"Etablissement", 'String'>
    readonly pays: FieldRef<"Etablissement", 'String'>
    readonly telephone: FieldRef<"Etablissement", 'String'>
    readonly email: FieldRef<"Etablissement", 'String'>
    readonly siteWeb: FieldRef<"Etablissement", 'String'>
    readonly numeroAgrement: FieldRef<"Etablissement", 'String'>
    readonly devise: FieldRef<"Etablissement", 'String'>
    readonly fuseauHoraire: FieldRef<"Etablissement", 'String'>
    readonly formatDate: FieldRef<"Etablissement", 'String'>
    readonly joursOuvrables: FieldRef<"Etablissement", 'String[]'>
    readonly heureDebut: FieldRef<"Etablissement", 'String'>
    readonly heureFin: FieldRef<"Etablissement", 'String'>
    readonly toleranceRetard: FieldRef<"Etablissement", 'Int'>
    readonly tauxHeureSup: FieldRef<"Etablissement", 'Float'>
    readonly estActif: FieldRef<"Etablissement", 'Boolean'>
    readonly estArchive: FieldRef<"Etablissement", 'Boolean'>
    readonly planAbonnement: FieldRef<"Etablissement", 'PlanAbonnement'>
    readonly dateExpiration: FieldRef<"Etablissement", 'DateTime'>
    readonly maxUtilisateurs: FieldRef<"Etablissement", 'Int'>
    readonly statutProvisionnement: FieldRef<"Etablissement", 'StatutProvisionnement'>
    readonly erreurProvisionnement: FieldRef<"Etablissement", 'String'>
    readonly createdAt: FieldRef<"Etablissement", 'DateTime'>
    readonly updatedAt: FieldRef<"Etablissement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Etablissement findUnique
   */
  export type EtablissementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
    /**
     * Filter, which Etablissement to fetch.
     */
    where: EtablissementWhereUniqueInput
  }

  /**
   * Etablissement findUniqueOrThrow
   */
  export type EtablissementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
    /**
     * Filter, which Etablissement to fetch.
     */
    where: EtablissementWhereUniqueInput
  }

  /**
   * Etablissement findFirst
   */
  export type EtablissementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
    /**
     * Filter, which Etablissement to fetch.
     */
    where?: EtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Etablissements to fetch.
     */
    orderBy?: EtablissementOrderByWithRelationInput | EtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Etablissements.
     */
    cursor?: EtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Etablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Etablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Etablissements.
     */
    distinct?: EtablissementScalarFieldEnum | EtablissementScalarFieldEnum[]
  }

  /**
   * Etablissement findFirstOrThrow
   */
  export type EtablissementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
    /**
     * Filter, which Etablissement to fetch.
     */
    where?: EtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Etablissements to fetch.
     */
    orderBy?: EtablissementOrderByWithRelationInput | EtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Etablissements.
     */
    cursor?: EtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Etablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Etablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Etablissements.
     */
    distinct?: EtablissementScalarFieldEnum | EtablissementScalarFieldEnum[]
  }

  /**
   * Etablissement findMany
   */
  export type EtablissementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
    /**
     * Filter, which Etablissements to fetch.
     */
    where?: EtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Etablissements to fetch.
     */
    orderBy?: EtablissementOrderByWithRelationInput | EtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Etablissements.
     */
    cursor?: EtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Etablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Etablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Etablissements.
     */
    distinct?: EtablissementScalarFieldEnum | EtablissementScalarFieldEnum[]
  }

  /**
   * Etablissement create
   */
  export type EtablissementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
    /**
     * The data needed to create a Etablissement.
     */
    data: XOR<EtablissementCreateInput, EtablissementUncheckedCreateInput>
  }

  /**
   * Etablissement createMany
   */
  export type EtablissementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Etablissements.
     */
    data: EtablissementCreateManyInput | EtablissementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Etablissement createManyAndReturn
   */
  export type EtablissementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * The data used to create many Etablissements.
     */
    data: EtablissementCreateManyInput | EtablissementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Etablissement update
   */
  export type EtablissementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
    /**
     * The data needed to update a Etablissement.
     */
    data: XOR<EtablissementUpdateInput, EtablissementUncheckedUpdateInput>
    /**
     * Choose, which Etablissement to update.
     */
    where: EtablissementWhereUniqueInput
  }

  /**
   * Etablissement updateMany
   */
  export type EtablissementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Etablissements.
     */
    data: XOR<EtablissementUpdateManyMutationInput, EtablissementUncheckedUpdateManyInput>
    /**
     * Filter which Etablissements to update
     */
    where?: EtablissementWhereInput
    /**
     * Limit how many Etablissements to update.
     */
    limit?: number
  }

  /**
   * Etablissement updateManyAndReturn
   */
  export type EtablissementUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * The data used to update Etablissements.
     */
    data: XOR<EtablissementUpdateManyMutationInput, EtablissementUncheckedUpdateManyInput>
    /**
     * Filter which Etablissements to update
     */
    where?: EtablissementWhereInput
    /**
     * Limit how many Etablissements to update.
     */
    limit?: number
  }

  /**
   * Etablissement upsert
   */
  export type EtablissementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
    /**
     * The filter to search for the Etablissement to update in case it exists.
     */
    where: EtablissementWhereUniqueInput
    /**
     * In case the Etablissement found by the `where` argument doesn't exist, create a new Etablissement with this data.
     */
    create: XOR<EtablissementCreateInput, EtablissementUncheckedCreateInput>
    /**
     * In case the Etablissement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EtablissementUpdateInput, EtablissementUncheckedUpdateInput>
  }

  /**
   * Etablissement delete
   */
  export type EtablissementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
    /**
     * Filter which Etablissement to delete.
     */
    where: EtablissementWhereUniqueInput
  }

  /**
   * Etablissement deleteMany
   */
  export type EtablissementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Etablissements to delete
     */
    where?: EtablissementWhereInput
    /**
     * Limit how many Etablissements to delete.
     */
    limit?: number
  }

  /**
   * Etablissement.utilisateursGlobaux
   */
  export type Etablissement$utilisateursGlobauxArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
    where?: UtilisateurGlobalWhereInput
    orderBy?: UtilisateurGlobalOrderByWithRelationInput | UtilisateurGlobalOrderByWithRelationInput[]
    cursor?: UtilisateurGlobalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UtilisateurGlobalScalarFieldEnum | UtilisateurGlobalScalarFieldEnum[]
  }

  /**
   * Etablissement.abonnements
   */
  export type Etablissement$abonnementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    where?: AbonnementEtablissementWhereInput
    orderBy?: AbonnementEtablissementOrderByWithRelationInput | AbonnementEtablissementOrderByWithRelationInput[]
    cursor?: AbonnementEtablissementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AbonnementEtablissementScalarFieldEnum | AbonnementEtablissementScalarFieldEnum[]
  }

  /**
   * Etablissement.factures
   */
  export type Etablissement$facturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    where?: FactureEtablissementWhereInput
    orderBy?: FactureEtablissementOrderByWithRelationInput | FactureEtablissementOrderByWithRelationInput[]
    cursor?: FactureEtablissementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FactureEtablissementScalarFieldEnum | FactureEtablissementScalarFieldEnum[]
  }

  /**
   * Etablissement without action
   */
  export type EtablissementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
  }


  /**
   * Model UtilisateurGlobal
   */

  export type AggregateUtilisateurGlobal = {
    _count: UtilisateurGlobalCountAggregateOutputType | null
    _min: UtilisateurGlobalMinAggregateOutputType | null
    _max: UtilisateurGlobalMaxAggregateOutputType | null
  }

  export type UtilisateurGlobalMinAggregateOutputType = {
    id: string | null
    email: string | null
    motDePasse: string | null
    prenom: string | null
    nom: string | null
    role: $Enums.RoleGlobal | null
    estActif: boolean | null
    emailVerifie: boolean | null
    telephone: string | null
    photoProfil: string | null
    derniereConnexion: Date | null
    jetonActualisation: string | null
    etablissementId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UtilisateurGlobalMaxAggregateOutputType = {
    id: string | null
    email: string | null
    motDePasse: string | null
    prenom: string | null
    nom: string | null
    role: $Enums.RoleGlobal | null
    estActif: boolean | null
    emailVerifie: boolean | null
    telephone: string | null
    photoProfil: string | null
    derniereConnexion: Date | null
    jetonActualisation: string | null
    etablissementId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UtilisateurGlobalCountAggregateOutputType = {
    id: number
    email: number
    motDePasse: number
    prenom: number
    nom: number
    role: number
    estActif: number
    emailVerifie: number
    telephone: number
    photoProfil: number
    derniereConnexion: number
    jetonActualisation: number
    etablissementId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UtilisateurGlobalMinAggregateInputType = {
    id?: true
    email?: true
    motDePasse?: true
    prenom?: true
    nom?: true
    role?: true
    estActif?: true
    emailVerifie?: true
    telephone?: true
    photoProfil?: true
    derniereConnexion?: true
    jetonActualisation?: true
    etablissementId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UtilisateurGlobalMaxAggregateInputType = {
    id?: true
    email?: true
    motDePasse?: true
    prenom?: true
    nom?: true
    role?: true
    estActif?: true
    emailVerifie?: true
    telephone?: true
    photoProfil?: true
    derniereConnexion?: true
    jetonActualisation?: true
    etablissementId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UtilisateurGlobalCountAggregateInputType = {
    id?: true
    email?: true
    motDePasse?: true
    prenom?: true
    nom?: true
    role?: true
    estActif?: true
    emailVerifie?: true
    telephone?: true
    photoProfil?: true
    derniereConnexion?: true
    jetonActualisation?: true
    etablissementId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UtilisateurGlobalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UtilisateurGlobal to aggregate.
     */
    where?: UtilisateurGlobalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UtilisateurGlobals to fetch.
     */
    orderBy?: UtilisateurGlobalOrderByWithRelationInput | UtilisateurGlobalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UtilisateurGlobalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UtilisateurGlobals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UtilisateurGlobals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UtilisateurGlobals
    **/
    _count?: true | UtilisateurGlobalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UtilisateurGlobalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UtilisateurGlobalMaxAggregateInputType
  }

  export type GetUtilisateurGlobalAggregateType<T extends UtilisateurGlobalAggregateArgs> = {
        [P in keyof T & keyof AggregateUtilisateurGlobal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUtilisateurGlobal[P]>
      : GetScalarType<T[P], AggregateUtilisateurGlobal[P]>
  }




  export type UtilisateurGlobalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UtilisateurGlobalWhereInput
    orderBy?: UtilisateurGlobalOrderByWithAggregationInput | UtilisateurGlobalOrderByWithAggregationInput[]
    by: UtilisateurGlobalScalarFieldEnum[] | UtilisateurGlobalScalarFieldEnum
    having?: UtilisateurGlobalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UtilisateurGlobalCountAggregateInputType | true
    _min?: UtilisateurGlobalMinAggregateInputType
    _max?: UtilisateurGlobalMaxAggregateInputType
  }

  export type UtilisateurGlobalGroupByOutputType = {
    id: string
    email: string
    motDePasse: string
    prenom: string
    nom: string
    role: $Enums.RoleGlobal
    estActif: boolean
    emailVerifie: boolean
    telephone: string | null
    photoProfil: string | null
    derniereConnexion: Date | null
    jetonActualisation: string | null
    etablissementId: string | null
    createdAt: Date
    updatedAt: Date
    _count: UtilisateurGlobalCountAggregateOutputType | null
    _min: UtilisateurGlobalMinAggregateOutputType | null
    _max: UtilisateurGlobalMaxAggregateOutputType | null
  }

  type GetUtilisateurGlobalGroupByPayload<T extends UtilisateurGlobalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UtilisateurGlobalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UtilisateurGlobalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UtilisateurGlobalGroupByOutputType[P]>
            : GetScalarType<T[P], UtilisateurGlobalGroupByOutputType[P]>
        }
      >
    >


  export type UtilisateurGlobalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    motDePasse?: boolean
    prenom?: boolean
    nom?: boolean
    role?: boolean
    estActif?: boolean
    emailVerifie?: boolean
    telephone?: boolean
    photoProfil?: boolean
    derniereConnexion?: boolean
    jetonActualisation?: boolean
    etablissementId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    etablissement?: boolean | UtilisateurGlobal$etablissementArgs<ExtArgs>
  }, ExtArgs["result"]["utilisateurGlobal"]>

  export type UtilisateurGlobalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    motDePasse?: boolean
    prenom?: boolean
    nom?: boolean
    role?: boolean
    estActif?: boolean
    emailVerifie?: boolean
    telephone?: boolean
    photoProfil?: boolean
    derniereConnexion?: boolean
    jetonActualisation?: boolean
    etablissementId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    etablissement?: boolean | UtilisateurGlobal$etablissementArgs<ExtArgs>
  }, ExtArgs["result"]["utilisateurGlobal"]>

  export type UtilisateurGlobalSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    motDePasse?: boolean
    prenom?: boolean
    nom?: boolean
    role?: boolean
    estActif?: boolean
    emailVerifie?: boolean
    telephone?: boolean
    photoProfil?: boolean
    derniereConnexion?: boolean
    jetonActualisation?: boolean
    etablissementId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    etablissement?: boolean | UtilisateurGlobal$etablissementArgs<ExtArgs>
  }, ExtArgs["result"]["utilisateurGlobal"]>

  export type UtilisateurGlobalSelectScalar = {
    id?: boolean
    email?: boolean
    motDePasse?: boolean
    prenom?: boolean
    nom?: boolean
    role?: boolean
    estActif?: boolean
    emailVerifie?: boolean
    telephone?: boolean
    photoProfil?: boolean
    derniereConnexion?: boolean
    jetonActualisation?: boolean
    etablissementId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UtilisateurGlobalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "motDePasse" | "prenom" | "nom" | "role" | "estActif" | "emailVerifie" | "telephone" | "photoProfil" | "derniereConnexion" | "jetonActualisation" | "etablissementId" | "createdAt" | "updatedAt", ExtArgs["result"]["utilisateurGlobal"]>
  export type UtilisateurGlobalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etablissement?: boolean | UtilisateurGlobal$etablissementArgs<ExtArgs>
  }
  export type UtilisateurGlobalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etablissement?: boolean | UtilisateurGlobal$etablissementArgs<ExtArgs>
  }
  export type UtilisateurGlobalIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etablissement?: boolean | UtilisateurGlobal$etablissementArgs<ExtArgs>
  }

  export type $UtilisateurGlobalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UtilisateurGlobal"
    objects: {
      etablissement: Prisma.$EtablissementPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      motDePasse: string
      prenom: string
      nom: string
      role: $Enums.RoleGlobal
      estActif: boolean
      emailVerifie: boolean
      telephone: string | null
      photoProfil: string | null
      derniereConnexion: Date | null
      jetonActualisation: string | null
      etablissementId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["utilisateurGlobal"]>
    composites: {}
  }

  type UtilisateurGlobalGetPayload<S extends boolean | null | undefined | UtilisateurGlobalDefaultArgs> = $Result.GetResult<Prisma.$UtilisateurGlobalPayload, S>

  type UtilisateurGlobalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UtilisateurGlobalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UtilisateurGlobalCountAggregateInputType | true
    }

  export interface UtilisateurGlobalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UtilisateurGlobal'], meta: { name: 'UtilisateurGlobal' } }
    /**
     * Find zero or one UtilisateurGlobal that matches the filter.
     * @param {UtilisateurGlobalFindUniqueArgs} args - Arguments to find a UtilisateurGlobal
     * @example
     * // Get one UtilisateurGlobal
     * const utilisateurGlobal = await prisma.utilisateurGlobal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UtilisateurGlobalFindUniqueArgs>(args: SelectSubset<T, UtilisateurGlobalFindUniqueArgs<ExtArgs>>): Prisma__UtilisateurGlobalClient<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UtilisateurGlobal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UtilisateurGlobalFindUniqueOrThrowArgs} args - Arguments to find a UtilisateurGlobal
     * @example
     * // Get one UtilisateurGlobal
     * const utilisateurGlobal = await prisma.utilisateurGlobal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UtilisateurGlobalFindUniqueOrThrowArgs>(args: SelectSubset<T, UtilisateurGlobalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UtilisateurGlobalClient<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UtilisateurGlobal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UtilisateurGlobalFindFirstArgs} args - Arguments to find a UtilisateurGlobal
     * @example
     * // Get one UtilisateurGlobal
     * const utilisateurGlobal = await prisma.utilisateurGlobal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UtilisateurGlobalFindFirstArgs>(args?: SelectSubset<T, UtilisateurGlobalFindFirstArgs<ExtArgs>>): Prisma__UtilisateurGlobalClient<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UtilisateurGlobal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UtilisateurGlobalFindFirstOrThrowArgs} args - Arguments to find a UtilisateurGlobal
     * @example
     * // Get one UtilisateurGlobal
     * const utilisateurGlobal = await prisma.utilisateurGlobal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UtilisateurGlobalFindFirstOrThrowArgs>(args?: SelectSubset<T, UtilisateurGlobalFindFirstOrThrowArgs<ExtArgs>>): Prisma__UtilisateurGlobalClient<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UtilisateurGlobals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UtilisateurGlobalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UtilisateurGlobals
     * const utilisateurGlobals = await prisma.utilisateurGlobal.findMany()
     * 
     * // Get first 10 UtilisateurGlobals
     * const utilisateurGlobals = await prisma.utilisateurGlobal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const utilisateurGlobalWithIdOnly = await prisma.utilisateurGlobal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UtilisateurGlobalFindManyArgs>(args?: SelectSubset<T, UtilisateurGlobalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UtilisateurGlobal.
     * @param {UtilisateurGlobalCreateArgs} args - Arguments to create a UtilisateurGlobal.
     * @example
     * // Create one UtilisateurGlobal
     * const UtilisateurGlobal = await prisma.utilisateurGlobal.create({
     *   data: {
     *     // ... data to create a UtilisateurGlobal
     *   }
     * })
     * 
     */
    create<T extends UtilisateurGlobalCreateArgs>(args: SelectSubset<T, UtilisateurGlobalCreateArgs<ExtArgs>>): Prisma__UtilisateurGlobalClient<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UtilisateurGlobals.
     * @param {UtilisateurGlobalCreateManyArgs} args - Arguments to create many UtilisateurGlobals.
     * @example
     * // Create many UtilisateurGlobals
     * const utilisateurGlobal = await prisma.utilisateurGlobal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UtilisateurGlobalCreateManyArgs>(args?: SelectSubset<T, UtilisateurGlobalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UtilisateurGlobals and returns the data saved in the database.
     * @param {UtilisateurGlobalCreateManyAndReturnArgs} args - Arguments to create many UtilisateurGlobals.
     * @example
     * // Create many UtilisateurGlobals
     * const utilisateurGlobal = await prisma.utilisateurGlobal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UtilisateurGlobals and only return the `id`
     * const utilisateurGlobalWithIdOnly = await prisma.utilisateurGlobal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UtilisateurGlobalCreateManyAndReturnArgs>(args?: SelectSubset<T, UtilisateurGlobalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UtilisateurGlobal.
     * @param {UtilisateurGlobalDeleteArgs} args - Arguments to delete one UtilisateurGlobal.
     * @example
     * // Delete one UtilisateurGlobal
     * const UtilisateurGlobal = await prisma.utilisateurGlobal.delete({
     *   where: {
     *     // ... filter to delete one UtilisateurGlobal
     *   }
     * })
     * 
     */
    delete<T extends UtilisateurGlobalDeleteArgs>(args: SelectSubset<T, UtilisateurGlobalDeleteArgs<ExtArgs>>): Prisma__UtilisateurGlobalClient<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UtilisateurGlobal.
     * @param {UtilisateurGlobalUpdateArgs} args - Arguments to update one UtilisateurGlobal.
     * @example
     * // Update one UtilisateurGlobal
     * const utilisateurGlobal = await prisma.utilisateurGlobal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UtilisateurGlobalUpdateArgs>(args: SelectSubset<T, UtilisateurGlobalUpdateArgs<ExtArgs>>): Prisma__UtilisateurGlobalClient<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UtilisateurGlobals.
     * @param {UtilisateurGlobalDeleteManyArgs} args - Arguments to filter UtilisateurGlobals to delete.
     * @example
     * // Delete a few UtilisateurGlobals
     * const { count } = await prisma.utilisateurGlobal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UtilisateurGlobalDeleteManyArgs>(args?: SelectSubset<T, UtilisateurGlobalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UtilisateurGlobals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UtilisateurGlobalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UtilisateurGlobals
     * const utilisateurGlobal = await prisma.utilisateurGlobal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UtilisateurGlobalUpdateManyArgs>(args: SelectSubset<T, UtilisateurGlobalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UtilisateurGlobals and returns the data updated in the database.
     * @param {UtilisateurGlobalUpdateManyAndReturnArgs} args - Arguments to update many UtilisateurGlobals.
     * @example
     * // Update many UtilisateurGlobals
     * const utilisateurGlobal = await prisma.utilisateurGlobal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UtilisateurGlobals and only return the `id`
     * const utilisateurGlobalWithIdOnly = await prisma.utilisateurGlobal.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UtilisateurGlobalUpdateManyAndReturnArgs>(args: SelectSubset<T, UtilisateurGlobalUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UtilisateurGlobal.
     * @param {UtilisateurGlobalUpsertArgs} args - Arguments to update or create a UtilisateurGlobal.
     * @example
     * // Update or create a UtilisateurGlobal
     * const utilisateurGlobal = await prisma.utilisateurGlobal.upsert({
     *   create: {
     *     // ... data to create a UtilisateurGlobal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UtilisateurGlobal we want to update
     *   }
     * })
     */
    upsert<T extends UtilisateurGlobalUpsertArgs>(args: SelectSubset<T, UtilisateurGlobalUpsertArgs<ExtArgs>>): Prisma__UtilisateurGlobalClient<$Result.GetResult<Prisma.$UtilisateurGlobalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UtilisateurGlobals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UtilisateurGlobalCountArgs} args - Arguments to filter UtilisateurGlobals to count.
     * @example
     * // Count the number of UtilisateurGlobals
     * const count = await prisma.utilisateurGlobal.count({
     *   where: {
     *     // ... the filter for the UtilisateurGlobals we want to count
     *   }
     * })
    **/
    count<T extends UtilisateurGlobalCountArgs>(
      args?: Subset<T, UtilisateurGlobalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UtilisateurGlobalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UtilisateurGlobal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UtilisateurGlobalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UtilisateurGlobalAggregateArgs>(args: Subset<T, UtilisateurGlobalAggregateArgs>): Prisma.PrismaPromise<GetUtilisateurGlobalAggregateType<T>>

    /**
     * Group by UtilisateurGlobal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UtilisateurGlobalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UtilisateurGlobalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UtilisateurGlobalGroupByArgs['orderBy'] }
        : { orderBy?: UtilisateurGlobalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UtilisateurGlobalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUtilisateurGlobalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UtilisateurGlobal model
   */
  readonly fields: UtilisateurGlobalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UtilisateurGlobal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UtilisateurGlobalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    etablissement<T extends UtilisateurGlobal$etablissementArgs<ExtArgs> = {}>(args?: Subset<T, UtilisateurGlobal$etablissementArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UtilisateurGlobal model
   */
  interface UtilisateurGlobalFieldRefs {
    readonly id: FieldRef<"UtilisateurGlobal", 'String'>
    readonly email: FieldRef<"UtilisateurGlobal", 'String'>
    readonly motDePasse: FieldRef<"UtilisateurGlobal", 'String'>
    readonly prenom: FieldRef<"UtilisateurGlobal", 'String'>
    readonly nom: FieldRef<"UtilisateurGlobal", 'String'>
    readonly role: FieldRef<"UtilisateurGlobal", 'RoleGlobal'>
    readonly estActif: FieldRef<"UtilisateurGlobal", 'Boolean'>
    readonly emailVerifie: FieldRef<"UtilisateurGlobal", 'Boolean'>
    readonly telephone: FieldRef<"UtilisateurGlobal", 'String'>
    readonly photoProfil: FieldRef<"UtilisateurGlobal", 'String'>
    readonly derniereConnexion: FieldRef<"UtilisateurGlobal", 'DateTime'>
    readonly jetonActualisation: FieldRef<"UtilisateurGlobal", 'String'>
    readonly etablissementId: FieldRef<"UtilisateurGlobal", 'String'>
    readonly createdAt: FieldRef<"UtilisateurGlobal", 'DateTime'>
    readonly updatedAt: FieldRef<"UtilisateurGlobal", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UtilisateurGlobal findUnique
   */
  export type UtilisateurGlobalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
    /**
     * Filter, which UtilisateurGlobal to fetch.
     */
    where: UtilisateurGlobalWhereUniqueInput
  }

  /**
   * UtilisateurGlobal findUniqueOrThrow
   */
  export type UtilisateurGlobalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
    /**
     * Filter, which UtilisateurGlobal to fetch.
     */
    where: UtilisateurGlobalWhereUniqueInput
  }

  /**
   * UtilisateurGlobal findFirst
   */
  export type UtilisateurGlobalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
    /**
     * Filter, which UtilisateurGlobal to fetch.
     */
    where?: UtilisateurGlobalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UtilisateurGlobals to fetch.
     */
    orderBy?: UtilisateurGlobalOrderByWithRelationInput | UtilisateurGlobalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UtilisateurGlobals.
     */
    cursor?: UtilisateurGlobalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UtilisateurGlobals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UtilisateurGlobals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UtilisateurGlobals.
     */
    distinct?: UtilisateurGlobalScalarFieldEnum | UtilisateurGlobalScalarFieldEnum[]
  }

  /**
   * UtilisateurGlobal findFirstOrThrow
   */
  export type UtilisateurGlobalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
    /**
     * Filter, which UtilisateurGlobal to fetch.
     */
    where?: UtilisateurGlobalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UtilisateurGlobals to fetch.
     */
    orderBy?: UtilisateurGlobalOrderByWithRelationInput | UtilisateurGlobalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UtilisateurGlobals.
     */
    cursor?: UtilisateurGlobalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UtilisateurGlobals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UtilisateurGlobals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UtilisateurGlobals.
     */
    distinct?: UtilisateurGlobalScalarFieldEnum | UtilisateurGlobalScalarFieldEnum[]
  }

  /**
   * UtilisateurGlobal findMany
   */
  export type UtilisateurGlobalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
    /**
     * Filter, which UtilisateurGlobals to fetch.
     */
    where?: UtilisateurGlobalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UtilisateurGlobals to fetch.
     */
    orderBy?: UtilisateurGlobalOrderByWithRelationInput | UtilisateurGlobalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UtilisateurGlobals.
     */
    cursor?: UtilisateurGlobalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UtilisateurGlobals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UtilisateurGlobals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UtilisateurGlobals.
     */
    distinct?: UtilisateurGlobalScalarFieldEnum | UtilisateurGlobalScalarFieldEnum[]
  }

  /**
   * UtilisateurGlobal create
   */
  export type UtilisateurGlobalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
    /**
     * The data needed to create a UtilisateurGlobal.
     */
    data: XOR<UtilisateurGlobalCreateInput, UtilisateurGlobalUncheckedCreateInput>
  }

  /**
   * UtilisateurGlobal createMany
   */
  export type UtilisateurGlobalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UtilisateurGlobals.
     */
    data: UtilisateurGlobalCreateManyInput | UtilisateurGlobalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UtilisateurGlobal createManyAndReturn
   */
  export type UtilisateurGlobalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * The data used to create many UtilisateurGlobals.
     */
    data: UtilisateurGlobalCreateManyInput | UtilisateurGlobalCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UtilisateurGlobal update
   */
  export type UtilisateurGlobalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
    /**
     * The data needed to update a UtilisateurGlobal.
     */
    data: XOR<UtilisateurGlobalUpdateInput, UtilisateurGlobalUncheckedUpdateInput>
    /**
     * Choose, which UtilisateurGlobal to update.
     */
    where: UtilisateurGlobalWhereUniqueInput
  }

  /**
   * UtilisateurGlobal updateMany
   */
  export type UtilisateurGlobalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UtilisateurGlobals.
     */
    data: XOR<UtilisateurGlobalUpdateManyMutationInput, UtilisateurGlobalUncheckedUpdateManyInput>
    /**
     * Filter which UtilisateurGlobals to update
     */
    where?: UtilisateurGlobalWhereInput
    /**
     * Limit how many UtilisateurGlobals to update.
     */
    limit?: number
  }

  /**
   * UtilisateurGlobal updateManyAndReturn
   */
  export type UtilisateurGlobalUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * The data used to update UtilisateurGlobals.
     */
    data: XOR<UtilisateurGlobalUpdateManyMutationInput, UtilisateurGlobalUncheckedUpdateManyInput>
    /**
     * Filter which UtilisateurGlobals to update
     */
    where?: UtilisateurGlobalWhereInput
    /**
     * Limit how many UtilisateurGlobals to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UtilisateurGlobal upsert
   */
  export type UtilisateurGlobalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
    /**
     * The filter to search for the UtilisateurGlobal to update in case it exists.
     */
    where: UtilisateurGlobalWhereUniqueInput
    /**
     * In case the UtilisateurGlobal found by the `where` argument doesn't exist, create a new UtilisateurGlobal with this data.
     */
    create: XOR<UtilisateurGlobalCreateInput, UtilisateurGlobalUncheckedCreateInput>
    /**
     * In case the UtilisateurGlobal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UtilisateurGlobalUpdateInput, UtilisateurGlobalUncheckedUpdateInput>
  }

  /**
   * UtilisateurGlobal delete
   */
  export type UtilisateurGlobalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
    /**
     * Filter which UtilisateurGlobal to delete.
     */
    where: UtilisateurGlobalWhereUniqueInput
  }

  /**
   * UtilisateurGlobal deleteMany
   */
  export type UtilisateurGlobalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UtilisateurGlobals to delete
     */
    where?: UtilisateurGlobalWhereInput
    /**
     * Limit how many UtilisateurGlobals to delete.
     */
    limit?: number
  }

  /**
   * UtilisateurGlobal.etablissement
   */
  export type UtilisateurGlobal$etablissementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Etablissement
     */
    select?: EtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Etablissement
     */
    omit?: EtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EtablissementInclude<ExtArgs> | null
    where?: EtablissementWhereInput
  }

  /**
   * UtilisateurGlobal without action
   */
  export type UtilisateurGlobalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UtilisateurGlobal
     */
    select?: UtilisateurGlobalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UtilisateurGlobal
     */
    omit?: UtilisateurGlobalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UtilisateurGlobalInclude<ExtArgs> | null
  }


  /**
   * Model AbonnementEtablissement
   */

  export type AggregateAbonnementEtablissement = {
    _count: AbonnementEtablissementCountAggregateOutputType | null
    _avg: AbonnementEtablissementAvgAggregateOutputType | null
    _sum: AbonnementEtablissementSumAggregateOutputType | null
    _min: AbonnementEtablissementMinAggregateOutputType | null
    _max: AbonnementEtablissementMaxAggregateOutputType | null
  }

  export type AbonnementEtablissementAvgAggregateOutputType = {
    montantMensuel: number | null
  }

  export type AbonnementEtablissementSumAggregateOutputType = {
    montantMensuel: number | null
  }

  export type AbonnementEtablissementMinAggregateOutputType = {
    id: string | null
    etablissementId: string | null
    plan: $Enums.PlanAbonnement | null
    dateDebut: Date | null
    dateFin: Date | null
    montantMensuel: number | null
    estActif: boolean | null
    renouvellementAuto: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AbonnementEtablissementMaxAggregateOutputType = {
    id: string | null
    etablissementId: string | null
    plan: $Enums.PlanAbonnement | null
    dateDebut: Date | null
    dateFin: Date | null
    montantMensuel: number | null
    estActif: boolean | null
    renouvellementAuto: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AbonnementEtablissementCountAggregateOutputType = {
    id: number
    etablissementId: number
    plan: number
    dateDebut: number
    dateFin: number
    montantMensuel: number
    estActif: number
    renouvellementAuto: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AbonnementEtablissementAvgAggregateInputType = {
    montantMensuel?: true
  }

  export type AbonnementEtablissementSumAggregateInputType = {
    montantMensuel?: true
  }

  export type AbonnementEtablissementMinAggregateInputType = {
    id?: true
    etablissementId?: true
    plan?: true
    dateDebut?: true
    dateFin?: true
    montantMensuel?: true
    estActif?: true
    renouvellementAuto?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AbonnementEtablissementMaxAggregateInputType = {
    id?: true
    etablissementId?: true
    plan?: true
    dateDebut?: true
    dateFin?: true
    montantMensuel?: true
    estActif?: true
    renouvellementAuto?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AbonnementEtablissementCountAggregateInputType = {
    id?: true
    etablissementId?: true
    plan?: true
    dateDebut?: true
    dateFin?: true
    montantMensuel?: true
    estActif?: true
    renouvellementAuto?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AbonnementEtablissementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AbonnementEtablissement to aggregate.
     */
    where?: AbonnementEtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AbonnementEtablissements to fetch.
     */
    orderBy?: AbonnementEtablissementOrderByWithRelationInput | AbonnementEtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AbonnementEtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AbonnementEtablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AbonnementEtablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AbonnementEtablissements
    **/
    _count?: true | AbonnementEtablissementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AbonnementEtablissementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AbonnementEtablissementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AbonnementEtablissementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AbonnementEtablissementMaxAggregateInputType
  }

  export type GetAbonnementEtablissementAggregateType<T extends AbonnementEtablissementAggregateArgs> = {
        [P in keyof T & keyof AggregateAbonnementEtablissement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAbonnementEtablissement[P]>
      : GetScalarType<T[P], AggregateAbonnementEtablissement[P]>
  }




  export type AbonnementEtablissementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AbonnementEtablissementWhereInput
    orderBy?: AbonnementEtablissementOrderByWithAggregationInput | AbonnementEtablissementOrderByWithAggregationInput[]
    by: AbonnementEtablissementScalarFieldEnum[] | AbonnementEtablissementScalarFieldEnum
    having?: AbonnementEtablissementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AbonnementEtablissementCountAggregateInputType | true
    _avg?: AbonnementEtablissementAvgAggregateInputType
    _sum?: AbonnementEtablissementSumAggregateInputType
    _min?: AbonnementEtablissementMinAggregateInputType
    _max?: AbonnementEtablissementMaxAggregateInputType
  }

  export type AbonnementEtablissementGroupByOutputType = {
    id: string
    etablissementId: string
    plan: $Enums.PlanAbonnement
    dateDebut: Date
    dateFin: Date
    montantMensuel: number
    estActif: boolean
    renouvellementAuto: boolean
    createdAt: Date
    updatedAt: Date
    _count: AbonnementEtablissementCountAggregateOutputType | null
    _avg: AbonnementEtablissementAvgAggregateOutputType | null
    _sum: AbonnementEtablissementSumAggregateOutputType | null
    _min: AbonnementEtablissementMinAggregateOutputType | null
    _max: AbonnementEtablissementMaxAggregateOutputType | null
  }

  type GetAbonnementEtablissementGroupByPayload<T extends AbonnementEtablissementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AbonnementEtablissementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AbonnementEtablissementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AbonnementEtablissementGroupByOutputType[P]>
            : GetScalarType<T[P], AbonnementEtablissementGroupByOutputType[P]>
        }
      >
    >


  export type AbonnementEtablissementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    etablissementId?: boolean
    plan?: boolean
    dateDebut?: boolean
    dateFin?: boolean
    montantMensuel?: boolean
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
    factures?: boolean | AbonnementEtablissement$facturesArgs<ExtArgs>
    _count?: boolean | AbonnementEtablissementCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["abonnementEtablissement"]>

  export type AbonnementEtablissementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    etablissementId?: boolean
    plan?: boolean
    dateDebut?: boolean
    dateFin?: boolean
    montantMensuel?: boolean
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["abonnementEtablissement"]>

  export type AbonnementEtablissementSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    etablissementId?: boolean
    plan?: boolean
    dateDebut?: boolean
    dateFin?: boolean
    montantMensuel?: boolean
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["abonnementEtablissement"]>

  export type AbonnementEtablissementSelectScalar = {
    id?: boolean
    etablissementId?: boolean
    plan?: boolean
    dateDebut?: boolean
    dateFin?: boolean
    montantMensuel?: boolean
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AbonnementEtablissementOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "etablissementId" | "plan" | "dateDebut" | "dateFin" | "montantMensuel" | "estActif" | "renouvellementAuto" | "createdAt" | "updatedAt", ExtArgs["result"]["abonnementEtablissement"]>
  export type AbonnementEtablissementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
    factures?: boolean | AbonnementEtablissement$facturesArgs<ExtArgs>
    _count?: boolean | AbonnementEtablissementCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AbonnementEtablissementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
  }
  export type AbonnementEtablissementIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
  }

  export type $AbonnementEtablissementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AbonnementEtablissement"
    objects: {
      etablissement: Prisma.$EtablissementPayload<ExtArgs>
      factures: Prisma.$FactureEtablissementPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      etablissementId: string
      plan: $Enums.PlanAbonnement
      dateDebut: Date
      dateFin: Date
      montantMensuel: number
      estActif: boolean
      renouvellementAuto: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["abonnementEtablissement"]>
    composites: {}
  }

  type AbonnementEtablissementGetPayload<S extends boolean | null | undefined | AbonnementEtablissementDefaultArgs> = $Result.GetResult<Prisma.$AbonnementEtablissementPayload, S>

  type AbonnementEtablissementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AbonnementEtablissementFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AbonnementEtablissementCountAggregateInputType | true
    }

  export interface AbonnementEtablissementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AbonnementEtablissement'], meta: { name: 'AbonnementEtablissement' } }
    /**
     * Find zero or one AbonnementEtablissement that matches the filter.
     * @param {AbonnementEtablissementFindUniqueArgs} args - Arguments to find a AbonnementEtablissement
     * @example
     * // Get one AbonnementEtablissement
     * const abonnementEtablissement = await prisma.abonnementEtablissement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AbonnementEtablissementFindUniqueArgs>(args: SelectSubset<T, AbonnementEtablissementFindUniqueArgs<ExtArgs>>): Prisma__AbonnementEtablissementClient<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AbonnementEtablissement that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AbonnementEtablissementFindUniqueOrThrowArgs} args - Arguments to find a AbonnementEtablissement
     * @example
     * // Get one AbonnementEtablissement
     * const abonnementEtablissement = await prisma.abonnementEtablissement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AbonnementEtablissementFindUniqueOrThrowArgs>(args: SelectSubset<T, AbonnementEtablissementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AbonnementEtablissementClient<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AbonnementEtablissement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbonnementEtablissementFindFirstArgs} args - Arguments to find a AbonnementEtablissement
     * @example
     * // Get one AbonnementEtablissement
     * const abonnementEtablissement = await prisma.abonnementEtablissement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AbonnementEtablissementFindFirstArgs>(args?: SelectSubset<T, AbonnementEtablissementFindFirstArgs<ExtArgs>>): Prisma__AbonnementEtablissementClient<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AbonnementEtablissement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbonnementEtablissementFindFirstOrThrowArgs} args - Arguments to find a AbonnementEtablissement
     * @example
     * // Get one AbonnementEtablissement
     * const abonnementEtablissement = await prisma.abonnementEtablissement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AbonnementEtablissementFindFirstOrThrowArgs>(args?: SelectSubset<T, AbonnementEtablissementFindFirstOrThrowArgs<ExtArgs>>): Prisma__AbonnementEtablissementClient<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AbonnementEtablissements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbonnementEtablissementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AbonnementEtablissements
     * const abonnementEtablissements = await prisma.abonnementEtablissement.findMany()
     * 
     * // Get first 10 AbonnementEtablissements
     * const abonnementEtablissements = await prisma.abonnementEtablissement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const abonnementEtablissementWithIdOnly = await prisma.abonnementEtablissement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AbonnementEtablissementFindManyArgs>(args?: SelectSubset<T, AbonnementEtablissementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AbonnementEtablissement.
     * @param {AbonnementEtablissementCreateArgs} args - Arguments to create a AbonnementEtablissement.
     * @example
     * // Create one AbonnementEtablissement
     * const AbonnementEtablissement = await prisma.abonnementEtablissement.create({
     *   data: {
     *     // ... data to create a AbonnementEtablissement
     *   }
     * })
     * 
     */
    create<T extends AbonnementEtablissementCreateArgs>(args: SelectSubset<T, AbonnementEtablissementCreateArgs<ExtArgs>>): Prisma__AbonnementEtablissementClient<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AbonnementEtablissements.
     * @param {AbonnementEtablissementCreateManyArgs} args - Arguments to create many AbonnementEtablissements.
     * @example
     * // Create many AbonnementEtablissements
     * const abonnementEtablissement = await prisma.abonnementEtablissement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AbonnementEtablissementCreateManyArgs>(args?: SelectSubset<T, AbonnementEtablissementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AbonnementEtablissements and returns the data saved in the database.
     * @param {AbonnementEtablissementCreateManyAndReturnArgs} args - Arguments to create many AbonnementEtablissements.
     * @example
     * // Create many AbonnementEtablissements
     * const abonnementEtablissement = await prisma.abonnementEtablissement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AbonnementEtablissements and only return the `id`
     * const abonnementEtablissementWithIdOnly = await prisma.abonnementEtablissement.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AbonnementEtablissementCreateManyAndReturnArgs>(args?: SelectSubset<T, AbonnementEtablissementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AbonnementEtablissement.
     * @param {AbonnementEtablissementDeleteArgs} args - Arguments to delete one AbonnementEtablissement.
     * @example
     * // Delete one AbonnementEtablissement
     * const AbonnementEtablissement = await prisma.abonnementEtablissement.delete({
     *   where: {
     *     // ... filter to delete one AbonnementEtablissement
     *   }
     * })
     * 
     */
    delete<T extends AbonnementEtablissementDeleteArgs>(args: SelectSubset<T, AbonnementEtablissementDeleteArgs<ExtArgs>>): Prisma__AbonnementEtablissementClient<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AbonnementEtablissement.
     * @param {AbonnementEtablissementUpdateArgs} args - Arguments to update one AbonnementEtablissement.
     * @example
     * // Update one AbonnementEtablissement
     * const abonnementEtablissement = await prisma.abonnementEtablissement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AbonnementEtablissementUpdateArgs>(args: SelectSubset<T, AbonnementEtablissementUpdateArgs<ExtArgs>>): Prisma__AbonnementEtablissementClient<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AbonnementEtablissements.
     * @param {AbonnementEtablissementDeleteManyArgs} args - Arguments to filter AbonnementEtablissements to delete.
     * @example
     * // Delete a few AbonnementEtablissements
     * const { count } = await prisma.abonnementEtablissement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AbonnementEtablissementDeleteManyArgs>(args?: SelectSubset<T, AbonnementEtablissementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AbonnementEtablissements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbonnementEtablissementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AbonnementEtablissements
     * const abonnementEtablissement = await prisma.abonnementEtablissement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AbonnementEtablissementUpdateManyArgs>(args: SelectSubset<T, AbonnementEtablissementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AbonnementEtablissements and returns the data updated in the database.
     * @param {AbonnementEtablissementUpdateManyAndReturnArgs} args - Arguments to update many AbonnementEtablissements.
     * @example
     * // Update many AbonnementEtablissements
     * const abonnementEtablissement = await prisma.abonnementEtablissement.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AbonnementEtablissements and only return the `id`
     * const abonnementEtablissementWithIdOnly = await prisma.abonnementEtablissement.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AbonnementEtablissementUpdateManyAndReturnArgs>(args: SelectSubset<T, AbonnementEtablissementUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AbonnementEtablissement.
     * @param {AbonnementEtablissementUpsertArgs} args - Arguments to update or create a AbonnementEtablissement.
     * @example
     * // Update or create a AbonnementEtablissement
     * const abonnementEtablissement = await prisma.abonnementEtablissement.upsert({
     *   create: {
     *     // ... data to create a AbonnementEtablissement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AbonnementEtablissement we want to update
     *   }
     * })
     */
    upsert<T extends AbonnementEtablissementUpsertArgs>(args: SelectSubset<T, AbonnementEtablissementUpsertArgs<ExtArgs>>): Prisma__AbonnementEtablissementClient<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AbonnementEtablissements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbonnementEtablissementCountArgs} args - Arguments to filter AbonnementEtablissements to count.
     * @example
     * // Count the number of AbonnementEtablissements
     * const count = await prisma.abonnementEtablissement.count({
     *   where: {
     *     // ... the filter for the AbonnementEtablissements we want to count
     *   }
     * })
    **/
    count<T extends AbonnementEtablissementCountArgs>(
      args?: Subset<T, AbonnementEtablissementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AbonnementEtablissementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AbonnementEtablissement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbonnementEtablissementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AbonnementEtablissementAggregateArgs>(args: Subset<T, AbonnementEtablissementAggregateArgs>): Prisma.PrismaPromise<GetAbonnementEtablissementAggregateType<T>>

    /**
     * Group by AbonnementEtablissement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AbonnementEtablissementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AbonnementEtablissementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AbonnementEtablissementGroupByArgs['orderBy'] }
        : { orderBy?: AbonnementEtablissementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AbonnementEtablissementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAbonnementEtablissementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AbonnementEtablissement model
   */
  readonly fields: AbonnementEtablissementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AbonnementEtablissement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AbonnementEtablissementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    etablissement<T extends EtablissementDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EtablissementDefaultArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    factures<T extends AbonnementEtablissement$facturesArgs<ExtArgs> = {}>(args?: Subset<T, AbonnementEtablissement$facturesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AbonnementEtablissement model
   */
  interface AbonnementEtablissementFieldRefs {
    readonly id: FieldRef<"AbonnementEtablissement", 'String'>
    readonly etablissementId: FieldRef<"AbonnementEtablissement", 'String'>
    readonly plan: FieldRef<"AbonnementEtablissement", 'PlanAbonnement'>
    readonly dateDebut: FieldRef<"AbonnementEtablissement", 'DateTime'>
    readonly dateFin: FieldRef<"AbonnementEtablissement", 'DateTime'>
    readonly montantMensuel: FieldRef<"AbonnementEtablissement", 'Float'>
    readonly estActif: FieldRef<"AbonnementEtablissement", 'Boolean'>
    readonly renouvellementAuto: FieldRef<"AbonnementEtablissement", 'Boolean'>
    readonly createdAt: FieldRef<"AbonnementEtablissement", 'DateTime'>
    readonly updatedAt: FieldRef<"AbonnementEtablissement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AbonnementEtablissement findUnique
   */
  export type AbonnementEtablissementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    /**
     * Filter, which AbonnementEtablissement to fetch.
     */
    where: AbonnementEtablissementWhereUniqueInput
  }

  /**
   * AbonnementEtablissement findUniqueOrThrow
   */
  export type AbonnementEtablissementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    /**
     * Filter, which AbonnementEtablissement to fetch.
     */
    where: AbonnementEtablissementWhereUniqueInput
  }

  /**
   * AbonnementEtablissement findFirst
   */
  export type AbonnementEtablissementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    /**
     * Filter, which AbonnementEtablissement to fetch.
     */
    where?: AbonnementEtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AbonnementEtablissements to fetch.
     */
    orderBy?: AbonnementEtablissementOrderByWithRelationInput | AbonnementEtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AbonnementEtablissements.
     */
    cursor?: AbonnementEtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AbonnementEtablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AbonnementEtablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AbonnementEtablissements.
     */
    distinct?: AbonnementEtablissementScalarFieldEnum | AbonnementEtablissementScalarFieldEnum[]
  }

  /**
   * AbonnementEtablissement findFirstOrThrow
   */
  export type AbonnementEtablissementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    /**
     * Filter, which AbonnementEtablissement to fetch.
     */
    where?: AbonnementEtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AbonnementEtablissements to fetch.
     */
    orderBy?: AbonnementEtablissementOrderByWithRelationInput | AbonnementEtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AbonnementEtablissements.
     */
    cursor?: AbonnementEtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AbonnementEtablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AbonnementEtablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AbonnementEtablissements.
     */
    distinct?: AbonnementEtablissementScalarFieldEnum | AbonnementEtablissementScalarFieldEnum[]
  }

  /**
   * AbonnementEtablissement findMany
   */
  export type AbonnementEtablissementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    /**
     * Filter, which AbonnementEtablissements to fetch.
     */
    where?: AbonnementEtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AbonnementEtablissements to fetch.
     */
    orderBy?: AbonnementEtablissementOrderByWithRelationInput | AbonnementEtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AbonnementEtablissements.
     */
    cursor?: AbonnementEtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AbonnementEtablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AbonnementEtablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AbonnementEtablissements.
     */
    distinct?: AbonnementEtablissementScalarFieldEnum | AbonnementEtablissementScalarFieldEnum[]
  }

  /**
   * AbonnementEtablissement create
   */
  export type AbonnementEtablissementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    /**
     * The data needed to create a AbonnementEtablissement.
     */
    data: XOR<AbonnementEtablissementCreateInput, AbonnementEtablissementUncheckedCreateInput>
  }

  /**
   * AbonnementEtablissement createMany
   */
  export type AbonnementEtablissementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AbonnementEtablissements.
     */
    data: AbonnementEtablissementCreateManyInput | AbonnementEtablissementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AbonnementEtablissement createManyAndReturn
   */
  export type AbonnementEtablissementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * The data used to create many AbonnementEtablissements.
     */
    data: AbonnementEtablissementCreateManyInput | AbonnementEtablissementCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AbonnementEtablissement update
   */
  export type AbonnementEtablissementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    /**
     * The data needed to update a AbonnementEtablissement.
     */
    data: XOR<AbonnementEtablissementUpdateInput, AbonnementEtablissementUncheckedUpdateInput>
    /**
     * Choose, which AbonnementEtablissement to update.
     */
    where: AbonnementEtablissementWhereUniqueInput
  }

  /**
   * AbonnementEtablissement updateMany
   */
  export type AbonnementEtablissementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AbonnementEtablissements.
     */
    data: XOR<AbonnementEtablissementUpdateManyMutationInput, AbonnementEtablissementUncheckedUpdateManyInput>
    /**
     * Filter which AbonnementEtablissements to update
     */
    where?: AbonnementEtablissementWhereInput
    /**
     * Limit how many AbonnementEtablissements to update.
     */
    limit?: number
  }

  /**
   * AbonnementEtablissement updateManyAndReturn
   */
  export type AbonnementEtablissementUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * The data used to update AbonnementEtablissements.
     */
    data: XOR<AbonnementEtablissementUpdateManyMutationInput, AbonnementEtablissementUncheckedUpdateManyInput>
    /**
     * Filter which AbonnementEtablissements to update
     */
    where?: AbonnementEtablissementWhereInput
    /**
     * Limit how many AbonnementEtablissements to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AbonnementEtablissement upsert
   */
  export type AbonnementEtablissementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    /**
     * The filter to search for the AbonnementEtablissement to update in case it exists.
     */
    where: AbonnementEtablissementWhereUniqueInput
    /**
     * In case the AbonnementEtablissement found by the `where` argument doesn't exist, create a new AbonnementEtablissement with this data.
     */
    create: XOR<AbonnementEtablissementCreateInput, AbonnementEtablissementUncheckedCreateInput>
    /**
     * In case the AbonnementEtablissement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AbonnementEtablissementUpdateInput, AbonnementEtablissementUncheckedUpdateInput>
  }

  /**
   * AbonnementEtablissement delete
   */
  export type AbonnementEtablissementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    /**
     * Filter which AbonnementEtablissement to delete.
     */
    where: AbonnementEtablissementWhereUniqueInput
  }

  /**
   * AbonnementEtablissement deleteMany
   */
  export type AbonnementEtablissementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AbonnementEtablissements to delete
     */
    where?: AbonnementEtablissementWhereInput
    /**
     * Limit how many AbonnementEtablissements to delete.
     */
    limit?: number
  }

  /**
   * AbonnementEtablissement.factures
   */
  export type AbonnementEtablissement$facturesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    where?: FactureEtablissementWhereInput
    orderBy?: FactureEtablissementOrderByWithRelationInput | FactureEtablissementOrderByWithRelationInput[]
    cursor?: FactureEtablissementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FactureEtablissementScalarFieldEnum | FactureEtablissementScalarFieldEnum[]
  }

  /**
   * AbonnementEtablissement without action
   */
  export type AbonnementEtablissementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
  }


  /**
   * Model FactureEtablissement
   */

  export type AggregateFactureEtablissement = {
    _count: FactureEtablissementCountAggregateOutputType | null
    _avg: FactureEtablissementAvgAggregateOutputType | null
    _sum: FactureEtablissementSumAggregateOutputType | null
    _min: FactureEtablissementMinAggregateOutputType | null
    _max: FactureEtablissementMaxAggregateOutputType | null
  }

  export type FactureEtablissementAvgAggregateOutputType = {
    montant: number | null
  }

  export type FactureEtablissementSumAggregateOutputType = {
    montant: number | null
  }

  export type FactureEtablissementMinAggregateOutputType = {
    id: string | null
    etablissementId: string | null
    abonnementId: string | null
    numeroFacture: string | null
    montant: number | null
    dateEmission: Date | null
    dateEcheance: Date | null
    datePaiement: Date | null
    statut: $Enums.StatutFacture | null
    methodePaiement: string | null
    referencePaiement: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FactureEtablissementMaxAggregateOutputType = {
    id: string | null
    etablissementId: string | null
    abonnementId: string | null
    numeroFacture: string | null
    montant: number | null
    dateEmission: Date | null
    dateEcheance: Date | null
    datePaiement: Date | null
    statut: $Enums.StatutFacture | null
    methodePaiement: string | null
    referencePaiement: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FactureEtablissementCountAggregateOutputType = {
    id: number
    etablissementId: number
    abonnementId: number
    numeroFacture: number
    montant: number
    dateEmission: number
    dateEcheance: number
    datePaiement: number
    statut: number
    methodePaiement: number
    referencePaiement: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FactureEtablissementAvgAggregateInputType = {
    montant?: true
  }

  export type FactureEtablissementSumAggregateInputType = {
    montant?: true
  }

  export type FactureEtablissementMinAggregateInputType = {
    id?: true
    etablissementId?: true
    abonnementId?: true
    numeroFacture?: true
    montant?: true
    dateEmission?: true
    dateEcheance?: true
    datePaiement?: true
    statut?: true
    methodePaiement?: true
    referencePaiement?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FactureEtablissementMaxAggregateInputType = {
    id?: true
    etablissementId?: true
    abonnementId?: true
    numeroFacture?: true
    montant?: true
    dateEmission?: true
    dateEcheance?: true
    datePaiement?: true
    statut?: true
    methodePaiement?: true
    referencePaiement?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FactureEtablissementCountAggregateInputType = {
    id?: true
    etablissementId?: true
    abonnementId?: true
    numeroFacture?: true
    montant?: true
    dateEmission?: true
    dateEcheance?: true
    datePaiement?: true
    statut?: true
    methodePaiement?: true
    referencePaiement?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FactureEtablissementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FactureEtablissement to aggregate.
     */
    where?: FactureEtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FactureEtablissements to fetch.
     */
    orderBy?: FactureEtablissementOrderByWithRelationInput | FactureEtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FactureEtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FactureEtablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FactureEtablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FactureEtablissements
    **/
    _count?: true | FactureEtablissementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FactureEtablissementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FactureEtablissementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FactureEtablissementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FactureEtablissementMaxAggregateInputType
  }

  export type GetFactureEtablissementAggregateType<T extends FactureEtablissementAggregateArgs> = {
        [P in keyof T & keyof AggregateFactureEtablissement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFactureEtablissement[P]>
      : GetScalarType<T[P], AggregateFactureEtablissement[P]>
  }




  export type FactureEtablissementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FactureEtablissementWhereInput
    orderBy?: FactureEtablissementOrderByWithAggregationInput | FactureEtablissementOrderByWithAggregationInput[]
    by: FactureEtablissementScalarFieldEnum[] | FactureEtablissementScalarFieldEnum
    having?: FactureEtablissementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FactureEtablissementCountAggregateInputType | true
    _avg?: FactureEtablissementAvgAggregateInputType
    _sum?: FactureEtablissementSumAggregateInputType
    _min?: FactureEtablissementMinAggregateInputType
    _max?: FactureEtablissementMaxAggregateInputType
  }

  export type FactureEtablissementGroupByOutputType = {
    id: string
    etablissementId: string
    abonnementId: string | null
    numeroFacture: string
    montant: number
    dateEmission: Date
    dateEcheance: Date
    datePaiement: Date | null
    statut: $Enums.StatutFacture
    methodePaiement: string | null
    referencePaiement: string | null
    createdAt: Date
    updatedAt: Date
    _count: FactureEtablissementCountAggregateOutputType | null
    _avg: FactureEtablissementAvgAggregateOutputType | null
    _sum: FactureEtablissementSumAggregateOutputType | null
    _min: FactureEtablissementMinAggregateOutputType | null
    _max: FactureEtablissementMaxAggregateOutputType | null
  }

  type GetFactureEtablissementGroupByPayload<T extends FactureEtablissementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FactureEtablissementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FactureEtablissementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FactureEtablissementGroupByOutputType[P]>
            : GetScalarType<T[P], FactureEtablissementGroupByOutputType[P]>
        }
      >
    >


  export type FactureEtablissementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    etablissementId?: boolean
    abonnementId?: boolean
    numeroFacture?: boolean
    montant?: boolean
    dateEmission?: boolean
    dateEcheance?: boolean
    datePaiement?: boolean
    statut?: boolean
    methodePaiement?: boolean
    referencePaiement?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
    abonnement?: boolean | FactureEtablissement$abonnementArgs<ExtArgs>
  }, ExtArgs["result"]["factureEtablissement"]>

  export type FactureEtablissementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    etablissementId?: boolean
    abonnementId?: boolean
    numeroFacture?: boolean
    montant?: boolean
    dateEmission?: boolean
    dateEcheance?: boolean
    datePaiement?: boolean
    statut?: boolean
    methodePaiement?: boolean
    referencePaiement?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
    abonnement?: boolean | FactureEtablissement$abonnementArgs<ExtArgs>
  }, ExtArgs["result"]["factureEtablissement"]>

  export type FactureEtablissementSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    etablissementId?: boolean
    abonnementId?: boolean
    numeroFacture?: boolean
    montant?: boolean
    dateEmission?: boolean
    dateEcheance?: boolean
    datePaiement?: boolean
    statut?: boolean
    methodePaiement?: boolean
    referencePaiement?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
    abonnement?: boolean | FactureEtablissement$abonnementArgs<ExtArgs>
  }, ExtArgs["result"]["factureEtablissement"]>

  export type FactureEtablissementSelectScalar = {
    id?: boolean
    etablissementId?: boolean
    abonnementId?: boolean
    numeroFacture?: boolean
    montant?: boolean
    dateEmission?: boolean
    dateEcheance?: boolean
    datePaiement?: boolean
    statut?: boolean
    methodePaiement?: boolean
    referencePaiement?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FactureEtablissementOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "etablissementId" | "abonnementId" | "numeroFacture" | "montant" | "dateEmission" | "dateEcheance" | "datePaiement" | "statut" | "methodePaiement" | "referencePaiement" | "createdAt" | "updatedAt", ExtArgs["result"]["factureEtablissement"]>
  export type FactureEtablissementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
    abonnement?: boolean | FactureEtablissement$abonnementArgs<ExtArgs>
  }
  export type FactureEtablissementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
    abonnement?: boolean | FactureEtablissement$abonnementArgs<ExtArgs>
  }
  export type FactureEtablissementIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    etablissement?: boolean | EtablissementDefaultArgs<ExtArgs>
    abonnement?: boolean | FactureEtablissement$abonnementArgs<ExtArgs>
  }

  export type $FactureEtablissementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FactureEtablissement"
    objects: {
      etablissement: Prisma.$EtablissementPayload<ExtArgs>
      abonnement: Prisma.$AbonnementEtablissementPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      etablissementId: string
      abonnementId: string | null
      numeroFacture: string
      montant: number
      dateEmission: Date
      dateEcheance: Date
      datePaiement: Date | null
      statut: $Enums.StatutFacture
      methodePaiement: string | null
      referencePaiement: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["factureEtablissement"]>
    composites: {}
  }

  type FactureEtablissementGetPayload<S extends boolean | null | undefined | FactureEtablissementDefaultArgs> = $Result.GetResult<Prisma.$FactureEtablissementPayload, S>

  type FactureEtablissementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FactureEtablissementFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FactureEtablissementCountAggregateInputType | true
    }

  export interface FactureEtablissementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FactureEtablissement'], meta: { name: 'FactureEtablissement' } }
    /**
     * Find zero or one FactureEtablissement that matches the filter.
     * @param {FactureEtablissementFindUniqueArgs} args - Arguments to find a FactureEtablissement
     * @example
     * // Get one FactureEtablissement
     * const factureEtablissement = await prisma.factureEtablissement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FactureEtablissementFindUniqueArgs>(args: SelectSubset<T, FactureEtablissementFindUniqueArgs<ExtArgs>>): Prisma__FactureEtablissementClient<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FactureEtablissement that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FactureEtablissementFindUniqueOrThrowArgs} args - Arguments to find a FactureEtablissement
     * @example
     * // Get one FactureEtablissement
     * const factureEtablissement = await prisma.factureEtablissement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FactureEtablissementFindUniqueOrThrowArgs>(args: SelectSubset<T, FactureEtablissementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FactureEtablissementClient<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FactureEtablissement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FactureEtablissementFindFirstArgs} args - Arguments to find a FactureEtablissement
     * @example
     * // Get one FactureEtablissement
     * const factureEtablissement = await prisma.factureEtablissement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FactureEtablissementFindFirstArgs>(args?: SelectSubset<T, FactureEtablissementFindFirstArgs<ExtArgs>>): Prisma__FactureEtablissementClient<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FactureEtablissement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FactureEtablissementFindFirstOrThrowArgs} args - Arguments to find a FactureEtablissement
     * @example
     * // Get one FactureEtablissement
     * const factureEtablissement = await prisma.factureEtablissement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FactureEtablissementFindFirstOrThrowArgs>(args?: SelectSubset<T, FactureEtablissementFindFirstOrThrowArgs<ExtArgs>>): Prisma__FactureEtablissementClient<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FactureEtablissements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FactureEtablissementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FactureEtablissements
     * const factureEtablissements = await prisma.factureEtablissement.findMany()
     * 
     * // Get first 10 FactureEtablissements
     * const factureEtablissements = await prisma.factureEtablissement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const factureEtablissementWithIdOnly = await prisma.factureEtablissement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FactureEtablissementFindManyArgs>(args?: SelectSubset<T, FactureEtablissementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FactureEtablissement.
     * @param {FactureEtablissementCreateArgs} args - Arguments to create a FactureEtablissement.
     * @example
     * // Create one FactureEtablissement
     * const FactureEtablissement = await prisma.factureEtablissement.create({
     *   data: {
     *     // ... data to create a FactureEtablissement
     *   }
     * })
     * 
     */
    create<T extends FactureEtablissementCreateArgs>(args: SelectSubset<T, FactureEtablissementCreateArgs<ExtArgs>>): Prisma__FactureEtablissementClient<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FactureEtablissements.
     * @param {FactureEtablissementCreateManyArgs} args - Arguments to create many FactureEtablissements.
     * @example
     * // Create many FactureEtablissements
     * const factureEtablissement = await prisma.factureEtablissement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FactureEtablissementCreateManyArgs>(args?: SelectSubset<T, FactureEtablissementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FactureEtablissements and returns the data saved in the database.
     * @param {FactureEtablissementCreateManyAndReturnArgs} args - Arguments to create many FactureEtablissements.
     * @example
     * // Create many FactureEtablissements
     * const factureEtablissement = await prisma.factureEtablissement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FactureEtablissements and only return the `id`
     * const factureEtablissementWithIdOnly = await prisma.factureEtablissement.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FactureEtablissementCreateManyAndReturnArgs>(args?: SelectSubset<T, FactureEtablissementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FactureEtablissement.
     * @param {FactureEtablissementDeleteArgs} args - Arguments to delete one FactureEtablissement.
     * @example
     * // Delete one FactureEtablissement
     * const FactureEtablissement = await prisma.factureEtablissement.delete({
     *   where: {
     *     // ... filter to delete one FactureEtablissement
     *   }
     * })
     * 
     */
    delete<T extends FactureEtablissementDeleteArgs>(args: SelectSubset<T, FactureEtablissementDeleteArgs<ExtArgs>>): Prisma__FactureEtablissementClient<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FactureEtablissement.
     * @param {FactureEtablissementUpdateArgs} args - Arguments to update one FactureEtablissement.
     * @example
     * // Update one FactureEtablissement
     * const factureEtablissement = await prisma.factureEtablissement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FactureEtablissementUpdateArgs>(args: SelectSubset<T, FactureEtablissementUpdateArgs<ExtArgs>>): Prisma__FactureEtablissementClient<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FactureEtablissements.
     * @param {FactureEtablissementDeleteManyArgs} args - Arguments to filter FactureEtablissements to delete.
     * @example
     * // Delete a few FactureEtablissements
     * const { count } = await prisma.factureEtablissement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FactureEtablissementDeleteManyArgs>(args?: SelectSubset<T, FactureEtablissementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FactureEtablissements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FactureEtablissementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FactureEtablissements
     * const factureEtablissement = await prisma.factureEtablissement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FactureEtablissementUpdateManyArgs>(args: SelectSubset<T, FactureEtablissementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FactureEtablissements and returns the data updated in the database.
     * @param {FactureEtablissementUpdateManyAndReturnArgs} args - Arguments to update many FactureEtablissements.
     * @example
     * // Update many FactureEtablissements
     * const factureEtablissement = await prisma.factureEtablissement.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FactureEtablissements and only return the `id`
     * const factureEtablissementWithIdOnly = await prisma.factureEtablissement.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FactureEtablissementUpdateManyAndReturnArgs>(args: SelectSubset<T, FactureEtablissementUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FactureEtablissement.
     * @param {FactureEtablissementUpsertArgs} args - Arguments to update or create a FactureEtablissement.
     * @example
     * // Update or create a FactureEtablissement
     * const factureEtablissement = await prisma.factureEtablissement.upsert({
     *   create: {
     *     // ... data to create a FactureEtablissement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FactureEtablissement we want to update
     *   }
     * })
     */
    upsert<T extends FactureEtablissementUpsertArgs>(args: SelectSubset<T, FactureEtablissementUpsertArgs<ExtArgs>>): Prisma__FactureEtablissementClient<$Result.GetResult<Prisma.$FactureEtablissementPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FactureEtablissements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FactureEtablissementCountArgs} args - Arguments to filter FactureEtablissements to count.
     * @example
     * // Count the number of FactureEtablissements
     * const count = await prisma.factureEtablissement.count({
     *   where: {
     *     // ... the filter for the FactureEtablissements we want to count
     *   }
     * })
    **/
    count<T extends FactureEtablissementCountArgs>(
      args?: Subset<T, FactureEtablissementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FactureEtablissementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FactureEtablissement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FactureEtablissementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FactureEtablissementAggregateArgs>(args: Subset<T, FactureEtablissementAggregateArgs>): Prisma.PrismaPromise<GetFactureEtablissementAggregateType<T>>

    /**
     * Group by FactureEtablissement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FactureEtablissementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FactureEtablissementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FactureEtablissementGroupByArgs['orderBy'] }
        : { orderBy?: FactureEtablissementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FactureEtablissementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFactureEtablissementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FactureEtablissement model
   */
  readonly fields: FactureEtablissementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FactureEtablissement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FactureEtablissementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    etablissement<T extends EtablissementDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EtablissementDefaultArgs<ExtArgs>>): Prisma__EtablissementClient<$Result.GetResult<Prisma.$EtablissementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    abonnement<T extends FactureEtablissement$abonnementArgs<ExtArgs> = {}>(args?: Subset<T, FactureEtablissement$abonnementArgs<ExtArgs>>): Prisma__AbonnementEtablissementClient<$Result.GetResult<Prisma.$AbonnementEtablissementPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FactureEtablissement model
   */
  interface FactureEtablissementFieldRefs {
    readonly id: FieldRef<"FactureEtablissement", 'String'>
    readonly etablissementId: FieldRef<"FactureEtablissement", 'String'>
    readonly abonnementId: FieldRef<"FactureEtablissement", 'String'>
    readonly numeroFacture: FieldRef<"FactureEtablissement", 'String'>
    readonly montant: FieldRef<"FactureEtablissement", 'Float'>
    readonly dateEmission: FieldRef<"FactureEtablissement", 'DateTime'>
    readonly dateEcheance: FieldRef<"FactureEtablissement", 'DateTime'>
    readonly datePaiement: FieldRef<"FactureEtablissement", 'DateTime'>
    readonly statut: FieldRef<"FactureEtablissement", 'StatutFacture'>
    readonly methodePaiement: FieldRef<"FactureEtablissement", 'String'>
    readonly referencePaiement: FieldRef<"FactureEtablissement", 'String'>
    readonly createdAt: FieldRef<"FactureEtablissement", 'DateTime'>
    readonly updatedAt: FieldRef<"FactureEtablissement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FactureEtablissement findUnique
   */
  export type FactureEtablissementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    /**
     * Filter, which FactureEtablissement to fetch.
     */
    where: FactureEtablissementWhereUniqueInput
  }

  /**
   * FactureEtablissement findUniqueOrThrow
   */
  export type FactureEtablissementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    /**
     * Filter, which FactureEtablissement to fetch.
     */
    where: FactureEtablissementWhereUniqueInput
  }

  /**
   * FactureEtablissement findFirst
   */
  export type FactureEtablissementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    /**
     * Filter, which FactureEtablissement to fetch.
     */
    where?: FactureEtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FactureEtablissements to fetch.
     */
    orderBy?: FactureEtablissementOrderByWithRelationInput | FactureEtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FactureEtablissements.
     */
    cursor?: FactureEtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FactureEtablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FactureEtablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FactureEtablissements.
     */
    distinct?: FactureEtablissementScalarFieldEnum | FactureEtablissementScalarFieldEnum[]
  }

  /**
   * FactureEtablissement findFirstOrThrow
   */
  export type FactureEtablissementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    /**
     * Filter, which FactureEtablissement to fetch.
     */
    where?: FactureEtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FactureEtablissements to fetch.
     */
    orderBy?: FactureEtablissementOrderByWithRelationInput | FactureEtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FactureEtablissements.
     */
    cursor?: FactureEtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FactureEtablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FactureEtablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FactureEtablissements.
     */
    distinct?: FactureEtablissementScalarFieldEnum | FactureEtablissementScalarFieldEnum[]
  }

  /**
   * FactureEtablissement findMany
   */
  export type FactureEtablissementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    /**
     * Filter, which FactureEtablissements to fetch.
     */
    where?: FactureEtablissementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FactureEtablissements to fetch.
     */
    orderBy?: FactureEtablissementOrderByWithRelationInput | FactureEtablissementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FactureEtablissements.
     */
    cursor?: FactureEtablissementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FactureEtablissements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FactureEtablissements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FactureEtablissements.
     */
    distinct?: FactureEtablissementScalarFieldEnum | FactureEtablissementScalarFieldEnum[]
  }

  /**
   * FactureEtablissement create
   */
  export type FactureEtablissementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    /**
     * The data needed to create a FactureEtablissement.
     */
    data: XOR<FactureEtablissementCreateInput, FactureEtablissementUncheckedCreateInput>
  }

  /**
   * FactureEtablissement createMany
   */
  export type FactureEtablissementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FactureEtablissements.
     */
    data: FactureEtablissementCreateManyInput | FactureEtablissementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FactureEtablissement createManyAndReturn
   */
  export type FactureEtablissementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * The data used to create many FactureEtablissements.
     */
    data: FactureEtablissementCreateManyInput | FactureEtablissementCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FactureEtablissement update
   */
  export type FactureEtablissementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    /**
     * The data needed to update a FactureEtablissement.
     */
    data: XOR<FactureEtablissementUpdateInput, FactureEtablissementUncheckedUpdateInput>
    /**
     * Choose, which FactureEtablissement to update.
     */
    where: FactureEtablissementWhereUniqueInput
  }

  /**
   * FactureEtablissement updateMany
   */
  export type FactureEtablissementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FactureEtablissements.
     */
    data: XOR<FactureEtablissementUpdateManyMutationInput, FactureEtablissementUncheckedUpdateManyInput>
    /**
     * Filter which FactureEtablissements to update
     */
    where?: FactureEtablissementWhereInput
    /**
     * Limit how many FactureEtablissements to update.
     */
    limit?: number
  }

  /**
   * FactureEtablissement updateManyAndReturn
   */
  export type FactureEtablissementUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * The data used to update FactureEtablissements.
     */
    data: XOR<FactureEtablissementUpdateManyMutationInput, FactureEtablissementUncheckedUpdateManyInput>
    /**
     * Filter which FactureEtablissements to update
     */
    where?: FactureEtablissementWhereInput
    /**
     * Limit how many FactureEtablissements to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * FactureEtablissement upsert
   */
  export type FactureEtablissementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    /**
     * The filter to search for the FactureEtablissement to update in case it exists.
     */
    where: FactureEtablissementWhereUniqueInput
    /**
     * In case the FactureEtablissement found by the `where` argument doesn't exist, create a new FactureEtablissement with this data.
     */
    create: XOR<FactureEtablissementCreateInput, FactureEtablissementUncheckedCreateInput>
    /**
     * In case the FactureEtablissement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FactureEtablissementUpdateInput, FactureEtablissementUncheckedUpdateInput>
  }

  /**
   * FactureEtablissement delete
   */
  export type FactureEtablissementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
    /**
     * Filter which FactureEtablissement to delete.
     */
    where: FactureEtablissementWhereUniqueInput
  }

  /**
   * FactureEtablissement deleteMany
   */
  export type FactureEtablissementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FactureEtablissements to delete
     */
    where?: FactureEtablissementWhereInput
    /**
     * Limit how many FactureEtablissements to delete.
     */
    limit?: number
  }

  /**
   * FactureEtablissement.abonnement
   */
  export type FactureEtablissement$abonnementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AbonnementEtablissement
     */
    select?: AbonnementEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AbonnementEtablissement
     */
    omit?: AbonnementEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AbonnementEtablissementInclude<ExtArgs> | null
    where?: AbonnementEtablissementWhereInput
  }

  /**
   * FactureEtablissement without action
   */
  export type FactureEtablissementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FactureEtablissement
     */
    select?: FactureEtablissementSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FactureEtablissement
     */
    omit?: FactureEtablissementOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FactureEtablissementInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const EtablissementScalarFieldEnum: {
    id: 'id',
    nom: 'nom',
    code: 'code',
    schemaName: 'schemaName',
    type: 'type',
    logo: 'logo',
    adresse: 'adresse',
    ville: 'ville',
    pays: 'pays',
    telephone: 'telephone',
    email: 'email',
    siteWeb: 'siteWeb',
    numeroAgrement: 'numeroAgrement',
    devise: 'devise',
    fuseauHoraire: 'fuseauHoraire',
    formatDate: 'formatDate',
    joursOuvrables: 'joursOuvrables',
    heureDebut: 'heureDebut',
    heureFin: 'heureFin',
    toleranceRetard: 'toleranceRetard',
    tauxHeureSup: 'tauxHeureSup',
    estActif: 'estActif',
    estArchive: 'estArchive',
    planAbonnement: 'planAbonnement',
    dateExpiration: 'dateExpiration',
    maxUtilisateurs: 'maxUtilisateurs',
    statutProvisionnement: 'statutProvisionnement',
    erreurProvisionnement: 'erreurProvisionnement',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type EtablissementScalarFieldEnum = (typeof EtablissementScalarFieldEnum)[keyof typeof EtablissementScalarFieldEnum]


  export const UtilisateurGlobalScalarFieldEnum: {
    id: 'id',
    email: 'email',
    motDePasse: 'motDePasse',
    prenom: 'prenom',
    nom: 'nom',
    role: 'role',
    estActif: 'estActif',
    emailVerifie: 'emailVerifie',
    telephone: 'telephone',
    photoProfil: 'photoProfil',
    derniereConnexion: 'derniereConnexion',
    jetonActualisation: 'jetonActualisation',
    etablissementId: 'etablissementId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UtilisateurGlobalScalarFieldEnum = (typeof UtilisateurGlobalScalarFieldEnum)[keyof typeof UtilisateurGlobalScalarFieldEnum]


  export const AbonnementEtablissementScalarFieldEnum: {
    id: 'id',
    etablissementId: 'etablissementId',
    plan: 'plan',
    dateDebut: 'dateDebut',
    dateFin: 'dateFin',
    montantMensuel: 'montantMensuel',
    estActif: 'estActif',
    renouvellementAuto: 'renouvellementAuto',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AbonnementEtablissementScalarFieldEnum = (typeof AbonnementEtablissementScalarFieldEnum)[keyof typeof AbonnementEtablissementScalarFieldEnum]


  export const FactureEtablissementScalarFieldEnum: {
    id: 'id',
    etablissementId: 'etablissementId',
    abonnementId: 'abonnementId',
    numeroFacture: 'numeroFacture',
    montant: 'montant',
    dateEmission: 'dateEmission',
    dateEcheance: 'dateEcheance',
    datePaiement: 'datePaiement',
    statut: 'statut',
    methodePaiement: 'methodePaiement',
    referencePaiement: 'referencePaiement',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type FactureEtablissementScalarFieldEnum = (typeof FactureEtablissementScalarFieldEnum)[keyof typeof FactureEtablissementScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'TypeEtablissement'
   */
  export type EnumTypeEtablissementFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TypeEtablissement'>
    


  /**
   * Reference to a field of type 'TypeEtablissement[]'
   */
  export type ListEnumTypeEtablissementFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TypeEtablissement[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'PlanAbonnement'
   */
  export type EnumPlanAbonnementFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlanAbonnement'>
    


  /**
   * Reference to a field of type 'PlanAbonnement[]'
   */
  export type ListEnumPlanAbonnementFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlanAbonnement[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'StatutProvisionnement'
   */
  export type EnumStatutProvisionnementFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatutProvisionnement'>
    


  /**
   * Reference to a field of type 'StatutProvisionnement[]'
   */
  export type ListEnumStatutProvisionnementFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatutProvisionnement[]'>
    


  /**
   * Reference to a field of type 'RoleGlobal'
   */
  export type EnumRoleGlobalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RoleGlobal'>
    


  /**
   * Reference to a field of type 'RoleGlobal[]'
   */
  export type ListEnumRoleGlobalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RoleGlobal[]'>
    


  /**
   * Reference to a field of type 'StatutFacture'
   */
  export type EnumStatutFactureFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatutFacture'>
    


  /**
   * Reference to a field of type 'StatutFacture[]'
   */
  export type ListEnumStatutFactureFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatutFacture[]'>
    
  /**
   * Deep Input Types
   */


  export type EtablissementWhereInput = {
    AND?: EtablissementWhereInput | EtablissementWhereInput[]
    OR?: EtablissementWhereInput[]
    NOT?: EtablissementWhereInput | EtablissementWhereInput[]
    id?: StringFilter<"Etablissement"> | string
    nom?: StringFilter<"Etablissement"> | string
    code?: StringFilter<"Etablissement"> | string
    schemaName?: StringFilter<"Etablissement"> | string
    type?: EnumTypeEtablissementFilter<"Etablissement"> | $Enums.TypeEtablissement
    logo?: StringNullableFilter<"Etablissement"> | string | null
    adresse?: StringNullableFilter<"Etablissement"> | string | null
    ville?: StringNullableFilter<"Etablissement"> | string | null
    pays?: StringFilter<"Etablissement"> | string
    telephone?: StringNullableFilter<"Etablissement"> | string | null
    email?: StringNullableFilter<"Etablissement"> | string | null
    siteWeb?: StringNullableFilter<"Etablissement"> | string | null
    numeroAgrement?: StringNullableFilter<"Etablissement"> | string | null
    devise?: StringFilter<"Etablissement"> | string
    fuseauHoraire?: StringFilter<"Etablissement"> | string
    formatDate?: StringFilter<"Etablissement"> | string
    joursOuvrables?: StringNullableListFilter<"Etablissement">
    heureDebut?: StringNullableFilter<"Etablissement"> | string | null
    heureFin?: StringNullableFilter<"Etablissement"> | string | null
    toleranceRetard?: IntFilter<"Etablissement"> | number
    tauxHeureSup?: FloatFilter<"Etablissement"> | number
    estActif?: BoolFilter<"Etablissement"> | boolean
    estArchive?: BoolFilter<"Etablissement"> | boolean
    planAbonnement?: EnumPlanAbonnementFilter<"Etablissement"> | $Enums.PlanAbonnement
    dateExpiration?: DateTimeNullableFilter<"Etablissement"> | Date | string | null
    maxUtilisateurs?: IntFilter<"Etablissement"> | number
    statutProvisionnement?: EnumStatutProvisionnementFilter<"Etablissement"> | $Enums.StatutProvisionnement
    erreurProvisionnement?: StringNullableFilter<"Etablissement"> | string | null
    createdAt?: DateTimeFilter<"Etablissement"> | Date | string
    updatedAt?: DateTimeFilter<"Etablissement"> | Date | string
    utilisateursGlobaux?: UtilisateurGlobalListRelationFilter
    abonnements?: AbonnementEtablissementListRelationFilter
    factures?: FactureEtablissementListRelationFilter
  }

  export type EtablissementOrderByWithRelationInput = {
    id?: SortOrder
    nom?: SortOrder
    code?: SortOrder
    schemaName?: SortOrder
    type?: SortOrder
    logo?: SortOrderInput | SortOrder
    adresse?: SortOrderInput | SortOrder
    ville?: SortOrderInput | SortOrder
    pays?: SortOrder
    telephone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    siteWeb?: SortOrderInput | SortOrder
    numeroAgrement?: SortOrderInput | SortOrder
    devise?: SortOrder
    fuseauHoraire?: SortOrder
    formatDate?: SortOrder
    joursOuvrables?: SortOrder
    heureDebut?: SortOrderInput | SortOrder
    heureFin?: SortOrderInput | SortOrder
    toleranceRetard?: SortOrder
    tauxHeureSup?: SortOrder
    estActif?: SortOrder
    estArchive?: SortOrder
    planAbonnement?: SortOrder
    dateExpiration?: SortOrderInput | SortOrder
    maxUtilisateurs?: SortOrder
    statutProvisionnement?: SortOrder
    erreurProvisionnement?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    utilisateursGlobaux?: UtilisateurGlobalOrderByRelationAggregateInput
    abonnements?: AbonnementEtablissementOrderByRelationAggregateInput
    factures?: FactureEtablissementOrderByRelationAggregateInput
  }

  export type EtablissementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    schemaName?: string
    AND?: EtablissementWhereInput | EtablissementWhereInput[]
    OR?: EtablissementWhereInput[]
    NOT?: EtablissementWhereInput | EtablissementWhereInput[]
    nom?: StringFilter<"Etablissement"> | string
    type?: EnumTypeEtablissementFilter<"Etablissement"> | $Enums.TypeEtablissement
    logo?: StringNullableFilter<"Etablissement"> | string | null
    adresse?: StringNullableFilter<"Etablissement"> | string | null
    ville?: StringNullableFilter<"Etablissement"> | string | null
    pays?: StringFilter<"Etablissement"> | string
    telephone?: StringNullableFilter<"Etablissement"> | string | null
    email?: StringNullableFilter<"Etablissement"> | string | null
    siteWeb?: StringNullableFilter<"Etablissement"> | string | null
    numeroAgrement?: StringNullableFilter<"Etablissement"> | string | null
    devise?: StringFilter<"Etablissement"> | string
    fuseauHoraire?: StringFilter<"Etablissement"> | string
    formatDate?: StringFilter<"Etablissement"> | string
    joursOuvrables?: StringNullableListFilter<"Etablissement">
    heureDebut?: StringNullableFilter<"Etablissement"> | string | null
    heureFin?: StringNullableFilter<"Etablissement"> | string | null
    toleranceRetard?: IntFilter<"Etablissement"> | number
    tauxHeureSup?: FloatFilter<"Etablissement"> | number
    estActif?: BoolFilter<"Etablissement"> | boolean
    estArchive?: BoolFilter<"Etablissement"> | boolean
    planAbonnement?: EnumPlanAbonnementFilter<"Etablissement"> | $Enums.PlanAbonnement
    dateExpiration?: DateTimeNullableFilter<"Etablissement"> | Date | string | null
    maxUtilisateurs?: IntFilter<"Etablissement"> | number
    statutProvisionnement?: EnumStatutProvisionnementFilter<"Etablissement"> | $Enums.StatutProvisionnement
    erreurProvisionnement?: StringNullableFilter<"Etablissement"> | string | null
    createdAt?: DateTimeFilter<"Etablissement"> | Date | string
    updatedAt?: DateTimeFilter<"Etablissement"> | Date | string
    utilisateursGlobaux?: UtilisateurGlobalListRelationFilter
    abonnements?: AbonnementEtablissementListRelationFilter
    factures?: FactureEtablissementListRelationFilter
  }, "id" | "code" | "schemaName">

  export type EtablissementOrderByWithAggregationInput = {
    id?: SortOrder
    nom?: SortOrder
    code?: SortOrder
    schemaName?: SortOrder
    type?: SortOrder
    logo?: SortOrderInput | SortOrder
    adresse?: SortOrderInput | SortOrder
    ville?: SortOrderInput | SortOrder
    pays?: SortOrder
    telephone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    siteWeb?: SortOrderInput | SortOrder
    numeroAgrement?: SortOrderInput | SortOrder
    devise?: SortOrder
    fuseauHoraire?: SortOrder
    formatDate?: SortOrder
    joursOuvrables?: SortOrder
    heureDebut?: SortOrderInput | SortOrder
    heureFin?: SortOrderInput | SortOrder
    toleranceRetard?: SortOrder
    tauxHeureSup?: SortOrder
    estActif?: SortOrder
    estArchive?: SortOrder
    planAbonnement?: SortOrder
    dateExpiration?: SortOrderInput | SortOrder
    maxUtilisateurs?: SortOrder
    statutProvisionnement?: SortOrder
    erreurProvisionnement?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: EtablissementCountOrderByAggregateInput
    _avg?: EtablissementAvgOrderByAggregateInput
    _max?: EtablissementMaxOrderByAggregateInput
    _min?: EtablissementMinOrderByAggregateInput
    _sum?: EtablissementSumOrderByAggregateInput
  }

  export type EtablissementScalarWhereWithAggregatesInput = {
    AND?: EtablissementScalarWhereWithAggregatesInput | EtablissementScalarWhereWithAggregatesInput[]
    OR?: EtablissementScalarWhereWithAggregatesInput[]
    NOT?: EtablissementScalarWhereWithAggregatesInput | EtablissementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Etablissement"> | string
    nom?: StringWithAggregatesFilter<"Etablissement"> | string
    code?: StringWithAggregatesFilter<"Etablissement"> | string
    schemaName?: StringWithAggregatesFilter<"Etablissement"> | string
    type?: EnumTypeEtablissementWithAggregatesFilter<"Etablissement"> | $Enums.TypeEtablissement
    logo?: StringNullableWithAggregatesFilter<"Etablissement"> | string | null
    adresse?: StringNullableWithAggregatesFilter<"Etablissement"> | string | null
    ville?: StringNullableWithAggregatesFilter<"Etablissement"> | string | null
    pays?: StringWithAggregatesFilter<"Etablissement"> | string
    telephone?: StringNullableWithAggregatesFilter<"Etablissement"> | string | null
    email?: StringNullableWithAggregatesFilter<"Etablissement"> | string | null
    siteWeb?: StringNullableWithAggregatesFilter<"Etablissement"> | string | null
    numeroAgrement?: StringNullableWithAggregatesFilter<"Etablissement"> | string | null
    devise?: StringWithAggregatesFilter<"Etablissement"> | string
    fuseauHoraire?: StringWithAggregatesFilter<"Etablissement"> | string
    formatDate?: StringWithAggregatesFilter<"Etablissement"> | string
    joursOuvrables?: StringNullableListFilter<"Etablissement">
    heureDebut?: StringNullableWithAggregatesFilter<"Etablissement"> | string | null
    heureFin?: StringNullableWithAggregatesFilter<"Etablissement"> | string | null
    toleranceRetard?: IntWithAggregatesFilter<"Etablissement"> | number
    tauxHeureSup?: FloatWithAggregatesFilter<"Etablissement"> | number
    estActif?: BoolWithAggregatesFilter<"Etablissement"> | boolean
    estArchive?: BoolWithAggregatesFilter<"Etablissement"> | boolean
    planAbonnement?: EnumPlanAbonnementWithAggregatesFilter<"Etablissement"> | $Enums.PlanAbonnement
    dateExpiration?: DateTimeNullableWithAggregatesFilter<"Etablissement"> | Date | string | null
    maxUtilisateurs?: IntWithAggregatesFilter<"Etablissement"> | number
    statutProvisionnement?: EnumStatutProvisionnementWithAggregatesFilter<"Etablissement"> | $Enums.StatutProvisionnement
    erreurProvisionnement?: StringNullableWithAggregatesFilter<"Etablissement"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Etablissement"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Etablissement"> | Date | string
  }

  export type UtilisateurGlobalWhereInput = {
    AND?: UtilisateurGlobalWhereInput | UtilisateurGlobalWhereInput[]
    OR?: UtilisateurGlobalWhereInput[]
    NOT?: UtilisateurGlobalWhereInput | UtilisateurGlobalWhereInput[]
    id?: StringFilter<"UtilisateurGlobal"> | string
    email?: StringFilter<"UtilisateurGlobal"> | string
    motDePasse?: StringFilter<"UtilisateurGlobal"> | string
    prenom?: StringFilter<"UtilisateurGlobal"> | string
    nom?: StringFilter<"UtilisateurGlobal"> | string
    role?: EnumRoleGlobalFilter<"UtilisateurGlobal"> | $Enums.RoleGlobal
    estActif?: BoolFilter<"UtilisateurGlobal"> | boolean
    emailVerifie?: BoolFilter<"UtilisateurGlobal"> | boolean
    telephone?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    photoProfil?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    derniereConnexion?: DateTimeNullableFilter<"UtilisateurGlobal"> | Date | string | null
    jetonActualisation?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    etablissementId?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    createdAt?: DateTimeFilter<"UtilisateurGlobal"> | Date | string
    updatedAt?: DateTimeFilter<"UtilisateurGlobal"> | Date | string
    etablissement?: XOR<EtablissementNullableScalarRelationFilter, EtablissementWhereInput> | null
  }

  export type UtilisateurGlobalOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    motDePasse?: SortOrder
    prenom?: SortOrder
    nom?: SortOrder
    role?: SortOrder
    estActif?: SortOrder
    emailVerifie?: SortOrder
    telephone?: SortOrderInput | SortOrder
    photoProfil?: SortOrderInput | SortOrder
    derniereConnexion?: SortOrderInput | SortOrder
    jetonActualisation?: SortOrderInput | SortOrder
    etablissementId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    etablissement?: EtablissementOrderByWithRelationInput
  }

  export type UtilisateurGlobalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UtilisateurGlobalWhereInput | UtilisateurGlobalWhereInput[]
    OR?: UtilisateurGlobalWhereInput[]
    NOT?: UtilisateurGlobalWhereInput | UtilisateurGlobalWhereInput[]
    motDePasse?: StringFilter<"UtilisateurGlobal"> | string
    prenom?: StringFilter<"UtilisateurGlobal"> | string
    nom?: StringFilter<"UtilisateurGlobal"> | string
    role?: EnumRoleGlobalFilter<"UtilisateurGlobal"> | $Enums.RoleGlobal
    estActif?: BoolFilter<"UtilisateurGlobal"> | boolean
    emailVerifie?: BoolFilter<"UtilisateurGlobal"> | boolean
    telephone?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    photoProfil?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    derniereConnexion?: DateTimeNullableFilter<"UtilisateurGlobal"> | Date | string | null
    jetonActualisation?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    etablissementId?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    createdAt?: DateTimeFilter<"UtilisateurGlobal"> | Date | string
    updatedAt?: DateTimeFilter<"UtilisateurGlobal"> | Date | string
    etablissement?: XOR<EtablissementNullableScalarRelationFilter, EtablissementWhereInput> | null
  }, "id" | "email">

  export type UtilisateurGlobalOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    motDePasse?: SortOrder
    prenom?: SortOrder
    nom?: SortOrder
    role?: SortOrder
    estActif?: SortOrder
    emailVerifie?: SortOrder
    telephone?: SortOrderInput | SortOrder
    photoProfil?: SortOrderInput | SortOrder
    derniereConnexion?: SortOrderInput | SortOrder
    jetonActualisation?: SortOrderInput | SortOrder
    etablissementId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UtilisateurGlobalCountOrderByAggregateInput
    _max?: UtilisateurGlobalMaxOrderByAggregateInput
    _min?: UtilisateurGlobalMinOrderByAggregateInput
  }

  export type UtilisateurGlobalScalarWhereWithAggregatesInput = {
    AND?: UtilisateurGlobalScalarWhereWithAggregatesInput | UtilisateurGlobalScalarWhereWithAggregatesInput[]
    OR?: UtilisateurGlobalScalarWhereWithAggregatesInput[]
    NOT?: UtilisateurGlobalScalarWhereWithAggregatesInput | UtilisateurGlobalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UtilisateurGlobal"> | string
    email?: StringWithAggregatesFilter<"UtilisateurGlobal"> | string
    motDePasse?: StringWithAggregatesFilter<"UtilisateurGlobal"> | string
    prenom?: StringWithAggregatesFilter<"UtilisateurGlobal"> | string
    nom?: StringWithAggregatesFilter<"UtilisateurGlobal"> | string
    role?: EnumRoleGlobalWithAggregatesFilter<"UtilisateurGlobal"> | $Enums.RoleGlobal
    estActif?: BoolWithAggregatesFilter<"UtilisateurGlobal"> | boolean
    emailVerifie?: BoolWithAggregatesFilter<"UtilisateurGlobal"> | boolean
    telephone?: StringNullableWithAggregatesFilter<"UtilisateurGlobal"> | string | null
    photoProfil?: StringNullableWithAggregatesFilter<"UtilisateurGlobal"> | string | null
    derniereConnexion?: DateTimeNullableWithAggregatesFilter<"UtilisateurGlobal"> | Date | string | null
    jetonActualisation?: StringNullableWithAggregatesFilter<"UtilisateurGlobal"> | string | null
    etablissementId?: StringNullableWithAggregatesFilter<"UtilisateurGlobal"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"UtilisateurGlobal"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UtilisateurGlobal"> | Date | string
  }

  export type AbonnementEtablissementWhereInput = {
    AND?: AbonnementEtablissementWhereInput | AbonnementEtablissementWhereInput[]
    OR?: AbonnementEtablissementWhereInput[]
    NOT?: AbonnementEtablissementWhereInput | AbonnementEtablissementWhereInput[]
    id?: StringFilter<"AbonnementEtablissement"> | string
    etablissementId?: StringFilter<"AbonnementEtablissement"> | string
    plan?: EnumPlanAbonnementFilter<"AbonnementEtablissement"> | $Enums.PlanAbonnement
    dateDebut?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    dateFin?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    montantMensuel?: FloatFilter<"AbonnementEtablissement"> | number
    estActif?: BoolFilter<"AbonnementEtablissement"> | boolean
    renouvellementAuto?: BoolFilter<"AbonnementEtablissement"> | boolean
    createdAt?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    updatedAt?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    etablissement?: XOR<EtablissementScalarRelationFilter, EtablissementWhereInput>
    factures?: FactureEtablissementListRelationFilter
  }

  export type AbonnementEtablissementOrderByWithRelationInput = {
    id?: SortOrder
    etablissementId?: SortOrder
    plan?: SortOrder
    dateDebut?: SortOrder
    dateFin?: SortOrder
    montantMensuel?: SortOrder
    estActif?: SortOrder
    renouvellementAuto?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    etablissement?: EtablissementOrderByWithRelationInput
    factures?: FactureEtablissementOrderByRelationAggregateInput
  }

  export type AbonnementEtablissementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AbonnementEtablissementWhereInput | AbonnementEtablissementWhereInput[]
    OR?: AbonnementEtablissementWhereInput[]
    NOT?: AbonnementEtablissementWhereInput | AbonnementEtablissementWhereInput[]
    etablissementId?: StringFilter<"AbonnementEtablissement"> | string
    plan?: EnumPlanAbonnementFilter<"AbonnementEtablissement"> | $Enums.PlanAbonnement
    dateDebut?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    dateFin?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    montantMensuel?: FloatFilter<"AbonnementEtablissement"> | number
    estActif?: BoolFilter<"AbonnementEtablissement"> | boolean
    renouvellementAuto?: BoolFilter<"AbonnementEtablissement"> | boolean
    createdAt?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    updatedAt?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    etablissement?: XOR<EtablissementScalarRelationFilter, EtablissementWhereInput>
    factures?: FactureEtablissementListRelationFilter
  }, "id">

  export type AbonnementEtablissementOrderByWithAggregationInput = {
    id?: SortOrder
    etablissementId?: SortOrder
    plan?: SortOrder
    dateDebut?: SortOrder
    dateFin?: SortOrder
    montantMensuel?: SortOrder
    estActif?: SortOrder
    renouvellementAuto?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AbonnementEtablissementCountOrderByAggregateInput
    _avg?: AbonnementEtablissementAvgOrderByAggregateInput
    _max?: AbonnementEtablissementMaxOrderByAggregateInput
    _min?: AbonnementEtablissementMinOrderByAggregateInput
    _sum?: AbonnementEtablissementSumOrderByAggregateInput
  }

  export type AbonnementEtablissementScalarWhereWithAggregatesInput = {
    AND?: AbonnementEtablissementScalarWhereWithAggregatesInput | AbonnementEtablissementScalarWhereWithAggregatesInput[]
    OR?: AbonnementEtablissementScalarWhereWithAggregatesInput[]
    NOT?: AbonnementEtablissementScalarWhereWithAggregatesInput | AbonnementEtablissementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AbonnementEtablissement"> | string
    etablissementId?: StringWithAggregatesFilter<"AbonnementEtablissement"> | string
    plan?: EnumPlanAbonnementWithAggregatesFilter<"AbonnementEtablissement"> | $Enums.PlanAbonnement
    dateDebut?: DateTimeWithAggregatesFilter<"AbonnementEtablissement"> | Date | string
    dateFin?: DateTimeWithAggregatesFilter<"AbonnementEtablissement"> | Date | string
    montantMensuel?: FloatWithAggregatesFilter<"AbonnementEtablissement"> | number
    estActif?: BoolWithAggregatesFilter<"AbonnementEtablissement"> | boolean
    renouvellementAuto?: BoolWithAggregatesFilter<"AbonnementEtablissement"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"AbonnementEtablissement"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AbonnementEtablissement"> | Date | string
  }

  export type FactureEtablissementWhereInput = {
    AND?: FactureEtablissementWhereInput | FactureEtablissementWhereInput[]
    OR?: FactureEtablissementWhereInput[]
    NOT?: FactureEtablissementWhereInput | FactureEtablissementWhereInput[]
    id?: StringFilter<"FactureEtablissement"> | string
    etablissementId?: StringFilter<"FactureEtablissement"> | string
    abonnementId?: StringNullableFilter<"FactureEtablissement"> | string | null
    numeroFacture?: StringFilter<"FactureEtablissement"> | string
    montant?: FloatFilter<"FactureEtablissement"> | number
    dateEmission?: DateTimeFilter<"FactureEtablissement"> | Date | string
    dateEcheance?: DateTimeFilter<"FactureEtablissement"> | Date | string
    datePaiement?: DateTimeNullableFilter<"FactureEtablissement"> | Date | string | null
    statut?: EnumStatutFactureFilter<"FactureEtablissement"> | $Enums.StatutFacture
    methodePaiement?: StringNullableFilter<"FactureEtablissement"> | string | null
    referencePaiement?: StringNullableFilter<"FactureEtablissement"> | string | null
    createdAt?: DateTimeFilter<"FactureEtablissement"> | Date | string
    updatedAt?: DateTimeFilter<"FactureEtablissement"> | Date | string
    etablissement?: XOR<EtablissementScalarRelationFilter, EtablissementWhereInput>
    abonnement?: XOR<AbonnementEtablissementNullableScalarRelationFilter, AbonnementEtablissementWhereInput> | null
  }

  export type FactureEtablissementOrderByWithRelationInput = {
    id?: SortOrder
    etablissementId?: SortOrder
    abonnementId?: SortOrderInput | SortOrder
    numeroFacture?: SortOrder
    montant?: SortOrder
    dateEmission?: SortOrder
    dateEcheance?: SortOrder
    datePaiement?: SortOrderInput | SortOrder
    statut?: SortOrder
    methodePaiement?: SortOrderInput | SortOrder
    referencePaiement?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    etablissement?: EtablissementOrderByWithRelationInput
    abonnement?: AbonnementEtablissementOrderByWithRelationInput
  }

  export type FactureEtablissementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    numeroFacture?: string
    AND?: FactureEtablissementWhereInput | FactureEtablissementWhereInput[]
    OR?: FactureEtablissementWhereInput[]
    NOT?: FactureEtablissementWhereInput | FactureEtablissementWhereInput[]
    etablissementId?: StringFilter<"FactureEtablissement"> | string
    abonnementId?: StringNullableFilter<"FactureEtablissement"> | string | null
    montant?: FloatFilter<"FactureEtablissement"> | number
    dateEmission?: DateTimeFilter<"FactureEtablissement"> | Date | string
    dateEcheance?: DateTimeFilter<"FactureEtablissement"> | Date | string
    datePaiement?: DateTimeNullableFilter<"FactureEtablissement"> | Date | string | null
    statut?: EnumStatutFactureFilter<"FactureEtablissement"> | $Enums.StatutFacture
    methodePaiement?: StringNullableFilter<"FactureEtablissement"> | string | null
    referencePaiement?: StringNullableFilter<"FactureEtablissement"> | string | null
    createdAt?: DateTimeFilter<"FactureEtablissement"> | Date | string
    updatedAt?: DateTimeFilter<"FactureEtablissement"> | Date | string
    etablissement?: XOR<EtablissementScalarRelationFilter, EtablissementWhereInput>
    abonnement?: XOR<AbonnementEtablissementNullableScalarRelationFilter, AbonnementEtablissementWhereInput> | null
  }, "id" | "numeroFacture">

  export type FactureEtablissementOrderByWithAggregationInput = {
    id?: SortOrder
    etablissementId?: SortOrder
    abonnementId?: SortOrderInput | SortOrder
    numeroFacture?: SortOrder
    montant?: SortOrder
    dateEmission?: SortOrder
    dateEcheance?: SortOrder
    datePaiement?: SortOrderInput | SortOrder
    statut?: SortOrder
    methodePaiement?: SortOrderInput | SortOrder
    referencePaiement?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FactureEtablissementCountOrderByAggregateInput
    _avg?: FactureEtablissementAvgOrderByAggregateInput
    _max?: FactureEtablissementMaxOrderByAggregateInput
    _min?: FactureEtablissementMinOrderByAggregateInput
    _sum?: FactureEtablissementSumOrderByAggregateInput
  }

  export type FactureEtablissementScalarWhereWithAggregatesInput = {
    AND?: FactureEtablissementScalarWhereWithAggregatesInput | FactureEtablissementScalarWhereWithAggregatesInput[]
    OR?: FactureEtablissementScalarWhereWithAggregatesInput[]
    NOT?: FactureEtablissementScalarWhereWithAggregatesInput | FactureEtablissementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"FactureEtablissement"> | string
    etablissementId?: StringWithAggregatesFilter<"FactureEtablissement"> | string
    abonnementId?: StringNullableWithAggregatesFilter<"FactureEtablissement"> | string | null
    numeroFacture?: StringWithAggregatesFilter<"FactureEtablissement"> | string
    montant?: FloatWithAggregatesFilter<"FactureEtablissement"> | number
    dateEmission?: DateTimeWithAggregatesFilter<"FactureEtablissement"> | Date | string
    dateEcheance?: DateTimeWithAggregatesFilter<"FactureEtablissement"> | Date | string
    datePaiement?: DateTimeNullableWithAggregatesFilter<"FactureEtablissement"> | Date | string | null
    statut?: EnumStatutFactureWithAggregatesFilter<"FactureEtablissement"> | $Enums.StatutFacture
    methodePaiement?: StringNullableWithAggregatesFilter<"FactureEtablissement"> | string | null
    referencePaiement?: StringNullableWithAggregatesFilter<"FactureEtablissement"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"FactureEtablissement"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"FactureEtablissement"> | Date | string
  }

  export type EtablissementCreateInput = {
    id?: string
    nom: string
    code: string
    schemaName: string
    type?: $Enums.TypeEtablissement
    logo?: string | null
    adresse?: string | null
    ville?: string | null
    pays?: string
    telephone?: string | null
    email?: string | null
    siteWeb?: string | null
    numeroAgrement?: string | null
    devise?: string
    fuseauHoraire?: string
    formatDate?: string
    joursOuvrables?: EtablissementCreatejoursOuvrablesInput | string[]
    heureDebut?: string | null
    heureFin?: string | null
    toleranceRetard?: number
    tauxHeureSup?: number
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: $Enums.PlanAbonnement
    dateExpiration?: Date | string | null
    maxUtilisateurs?: number
    statutProvisionnement?: $Enums.StatutProvisionnement
    erreurProvisionnement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    utilisateursGlobaux?: UtilisateurGlobalCreateNestedManyWithoutEtablissementInput
    abonnements?: AbonnementEtablissementCreateNestedManyWithoutEtablissementInput
    factures?: FactureEtablissementCreateNestedManyWithoutEtablissementInput
  }

  export type EtablissementUncheckedCreateInput = {
    id?: string
    nom: string
    code: string
    schemaName: string
    type?: $Enums.TypeEtablissement
    logo?: string | null
    adresse?: string | null
    ville?: string | null
    pays?: string
    telephone?: string | null
    email?: string | null
    siteWeb?: string | null
    numeroAgrement?: string | null
    devise?: string
    fuseauHoraire?: string
    formatDate?: string
    joursOuvrables?: EtablissementCreatejoursOuvrablesInput | string[]
    heureDebut?: string | null
    heureFin?: string | null
    toleranceRetard?: number
    tauxHeureSup?: number
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: $Enums.PlanAbonnement
    dateExpiration?: Date | string | null
    maxUtilisateurs?: number
    statutProvisionnement?: $Enums.StatutProvisionnement
    erreurProvisionnement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    utilisateursGlobaux?: UtilisateurGlobalUncheckedCreateNestedManyWithoutEtablissementInput
    abonnements?: AbonnementEtablissementUncheckedCreateNestedManyWithoutEtablissementInput
    factures?: FactureEtablissementUncheckedCreateNestedManyWithoutEtablissementInput
  }

  export type EtablissementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    schemaName?: StringFieldUpdateOperationsInput | string
    type?: EnumTypeEtablissementFieldUpdateOperationsInput | $Enums.TypeEtablissement
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    pays?: StringFieldUpdateOperationsInput | string
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    siteWeb?: NullableStringFieldUpdateOperationsInput | string | null
    numeroAgrement?: NullableStringFieldUpdateOperationsInput | string | null
    devise?: StringFieldUpdateOperationsInput | string
    fuseauHoraire?: StringFieldUpdateOperationsInput | string
    formatDate?: StringFieldUpdateOperationsInput | string
    joursOuvrables?: EtablissementUpdatejoursOuvrablesInput | string[]
    heureDebut?: NullableStringFieldUpdateOperationsInput | string | null
    heureFin?: NullableStringFieldUpdateOperationsInput | string | null
    toleranceRetard?: IntFieldUpdateOperationsInput | number
    tauxHeureSup?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    estArchive?: BoolFieldUpdateOperationsInput | boolean
    planAbonnement?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateExpiration?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUtilisateurs?: IntFieldUpdateOperationsInput | number
    statutProvisionnement?: EnumStatutProvisionnementFieldUpdateOperationsInput | $Enums.StatutProvisionnement
    erreurProvisionnement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    utilisateursGlobaux?: UtilisateurGlobalUpdateManyWithoutEtablissementNestedInput
    abonnements?: AbonnementEtablissementUpdateManyWithoutEtablissementNestedInput
    factures?: FactureEtablissementUpdateManyWithoutEtablissementNestedInput
  }

  export type EtablissementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    schemaName?: StringFieldUpdateOperationsInput | string
    type?: EnumTypeEtablissementFieldUpdateOperationsInput | $Enums.TypeEtablissement
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    pays?: StringFieldUpdateOperationsInput | string
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    siteWeb?: NullableStringFieldUpdateOperationsInput | string | null
    numeroAgrement?: NullableStringFieldUpdateOperationsInput | string | null
    devise?: StringFieldUpdateOperationsInput | string
    fuseauHoraire?: StringFieldUpdateOperationsInput | string
    formatDate?: StringFieldUpdateOperationsInput | string
    joursOuvrables?: EtablissementUpdatejoursOuvrablesInput | string[]
    heureDebut?: NullableStringFieldUpdateOperationsInput | string | null
    heureFin?: NullableStringFieldUpdateOperationsInput | string | null
    toleranceRetard?: IntFieldUpdateOperationsInput | number
    tauxHeureSup?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    estArchive?: BoolFieldUpdateOperationsInput | boolean
    planAbonnement?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateExpiration?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUtilisateurs?: IntFieldUpdateOperationsInput | number
    statutProvisionnement?: EnumStatutProvisionnementFieldUpdateOperationsInput | $Enums.StatutProvisionnement
    erreurProvisionnement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    utilisateursGlobaux?: UtilisateurGlobalUncheckedUpdateManyWithoutEtablissementNestedInput
    abonnements?: AbonnementEtablissementUncheckedUpdateManyWithoutEtablissementNestedInput
    factures?: FactureEtablissementUncheckedUpdateManyWithoutEtablissementNestedInput
  }

  export type EtablissementCreateManyInput = {
    id?: string
    nom: string
    code: string
    schemaName: string
    type?: $Enums.TypeEtablissement
    logo?: string | null
    adresse?: string | null
    ville?: string | null
    pays?: string
    telephone?: string | null
    email?: string | null
    siteWeb?: string | null
    numeroAgrement?: string | null
    devise?: string
    fuseauHoraire?: string
    formatDate?: string
    joursOuvrables?: EtablissementCreatejoursOuvrablesInput | string[]
    heureDebut?: string | null
    heureFin?: string | null
    toleranceRetard?: number
    tauxHeureSup?: number
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: $Enums.PlanAbonnement
    dateExpiration?: Date | string | null
    maxUtilisateurs?: number
    statutProvisionnement?: $Enums.StatutProvisionnement
    erreurProvisionnement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EtablissementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    schemaName?: StringFieldUpdateOperationsInput | string
    type?: EnumTypeEtablissementFieldUpdateOperationsInput | $Enums.TypeEtablissement
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    pays?: StringFieldUpdateOperationsInput | string
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    siteWeb?: NullableStringFieldUpdateOperationsInput | string | null
    numeroAgrement?: NullableStringFieldUpdateOperationsInput | string | null
    devise?: StringFieldUpdateOperationsInput | string
    fuseauHoraire?: StringFieldUpdateOperationsInput | string
    formatDate?: StringFieldUpdateOperationsInput | string
    joursOuvrables?: EtablissementUpdatejoursOuvrablesInput | string[]
    heureDebut?: NullableStringFieldUpdateOperationsInput | string | null
    heureFin?: NullableStringFieldUpdateOperationsInput | string | null
    toleranceRetard?: IntFieldUpdateOperationsInput | number
    tauxHeureSup?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    estArchive?: BoolFieldUpdateOperationsInput | boolean
    planAbonnement?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateExpiration?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUtilisateurs?: IntFieldUpdateOperationsInput | number
    statutProvisionnement?: EnumStatutProvisionnementFieldUpdateOperationsInput | $Enums.StatutProvisionnement
    erreurProvisionnement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EtablissementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    schemaName?: StringFieldUpdateOperationsInput | string
    type?: EnumTypeEtablissementFieldUpdateOperationsInput | $Enums.TypeEtablissement
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    pays?: StringFieldUpdateOperationsInput | string
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    siteWeb?: NullableStringFieldUpdateOperationsInput | string | null
    numeroAgrement?: NullableStringFieldUpdateOperationsInput | string | null
    devise?: StringFieldUpdateOperationsInput | string
    fuseauHoraire?: StringFieldUpdateOperationsInput | string
    formatDate?: StringFieldUpdateOperationsInput | string
    joursOuvrables?: EtablissementUpdatejoursOuvrablesInput | string[]
    heureDebut?: NullableStringFieldUpdateOperationsInput | string | null
    heureFin?: NullableStringFieldUpdateOperationsInput | string | null
    toleranceRetard?: IntFieldUpdateOperationsInput | number
    tauxHeureSup?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    estArchive?: BoolFieldUpdateOperationsInput | boolean
    planAbonnement?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateExpiration?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUtilisateurs?: IntFieldUpdateOperationsInput | number
    statutProvisionnement?: EnumStatutProvisionnementFieldUpdateOperationsInput | $Enums.StatutProvisionnement
    erreurProvisionnement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UtilisateurGlobalCreateInput = {
    id?: string
    email: string
    motDePasse: string
    prenom: string
    nom: string
    role?: $Enums.RoleGlobal
    estActif?: boolean
    emailVerifie?: boolean
    telephone?: string | null
    photoProfil?: string | null
    derniereConnexion?: Date | string | null
    jetonActualisation?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    etablissement?: EtablissementCreateNestedOneWithoutUtilisateursGlobauxInput
  }

  export type UtilisateurGlobalUncheckedCreateInput = {
    id?: string
    email: string
    motDePasse: string
    prenom: string
    nom: string
    role?: $Enums.RoleGlobal
    estActif?: boolean
    emailVerifie?: boolean
    telephone?: string | null
    photoProfil?: string | null
    derniereConnexion?: Date | string | null
    jetonActualisation?: string | null
    etablissementId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UtilisateurGlobalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    motDePasse?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleGlobalFieldUpdateOperationsInput | $Enums.RoleGlobal
    estActif?: BoolFieldUpdateOperationsInput | boolean
    emailVerifie?: BoolFieldUpdateOperationsInput | boolean
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    photoProfil?: NullableStringFieldUpdateOperationsInput | string | null
    derniereConnexion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jetonActualisation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    etablissement?: EtablissementUpdateOneWithoutUtilisateursGlobauxNestedInput
  }

  export type UtilisateurGlobalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    motDePasse?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleGlobalFieldUpdateOperationsInput | $Enums.RoleGlobal
    estActif?: BoolFieldUpdateOperationsInput | boolean
    emailVerifie?: BoolFieldUpdateOperationsInput | boolean
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    photoProfil?: NullableStringFieldUpdateOperationsInput | string | null
    derniereConnexion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jetonActualisation?: NullableStringFieldUpdateOperationsInput | string | null
    etablissementId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UtilisateurGlobalCreateManyInput = {
    id?: string
    email: string
    motDePasse: string
    prenom: string
    nom: string
    role?: $Enums.RoleGlobal
    estActif?: boolean
    emailVerifie?: boolean
    telephone?: string | null
    photoProfil?: string | null
    derniereConnexion?: Date | string | null
    jetonActualisation?: string | null
    etablissementId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UtilisateurGlobalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    motDePasse?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleGlobalFieldUpdateOperationsInput | $Enums.RoleGlobal
    estActif?: BoolFieldUpdateOperationsInput | boolean
    emailVerifie?: BoolFieldUpdateOperationsInput | boolean
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    photoProfil?: NullableStringFieldUpdateOperationsInput | string | null
    derniereConnexion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jetonActualisation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UtilisateurGlobalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    motDePasse?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleGlobalFieldUpdateOperationsInput | $Enums.RoleGlobal
    estActif?: BoolFieldUpdateOperationsInput | boolean
    emailVerifie?: BoolFieldUpdateOperationsInput | boolean
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    photoProfil?: NullableStringFieldUpdateOperationsInput | string | null
    derniereConnexion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jetonActualisation?: NullableStringFieldUpdateOperationsInput | string | null
    etablissementId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AbonnementEtablissementCreateInput = {
    id?: string
    plan: $Enums.PlanAbonnement
    dateDebut: Date | string
    dateFin: Date | string
    montantMensuel: number
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    etablissement: EtablissementCreateNestedOneWithoutAbonnementsInput
    factures?: FactureEtablissementCreateNestedManyWithoutAbonnementInput
  }

  export type AbonnementEtablissementUncheckedCreateInput = {
    id?: string
    etablissementId: string
    plan: $Enums.PlanAbonnement
    dateDebut: Date | string
    dateFin: Date | string
    montantMensuel: number
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    factures?: FactureEtablissementUncheckedCreateNestedManyWithoutAbonnementInput
  }

  export type AbonnementEtablissementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateDebut?: DateTimeFieldUpdateOperationsInput | Date | string
    dateFin?: DateTimeFieldUpdateOperationsInput | Date | string
    montantMensuel?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    renouvellementAuto?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    etablissement?: EtablissementUpdateOneRequiredWithoutAbonnementsNestedInput
    factures?: FactureEtablissementUpdateManyWithoutAbonnementNestedInput
  }

  export type AbonnementEtablissementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    etablissementId?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateDebut?: DateTimeFieldUpdateOperationsInput | Date | string
    dateFin?: DateTimeFieldUpdateOperationsInput | Date | string
    montantMensuel?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    renouvellementAuto?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    factures?: FactureEtablissementUncheckedUpdateManyWithoutAbonnementNestedInput
  }

  export type AbonnementEtablissementCreateManyInput = {
    id?: string
    etablissementId: string
    plan: $Enums.PlanAbonnement
    dateDebut: Date | string
    dateFin: Date | string
    montantMensuel: number
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AbonnementEtablissementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateDebut?: DateTimeFieldUpdateOperationsInput | Date | string
    dateFin?: DateTimeFieldUpdateOperationsInput | Date | string
    montantMensuel?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    renouvellementAuto?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AbonnementEtablissementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    etablissementId?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateDebut?: DateTimeFieldUpdateOperationsInput | Date | string
    dateFin?: DateTimeFieldUpdateOperationsInput | Date | string
    montantMensuel?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    renouvellementAuto?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FactureEtablissementCreateInput = {
    id?: string
    numeroFacture: string
    montant: number
    dateEmission?: Date | string
    dateEcheance: Date | string
    datePaiement?: Date | string | null
    statut?: $Enums.StatutFacture
    methodePaiement?: string | null
    referencePaiement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    etablissement: EtablissementCreateNestedOneWithoutFacturesInput
    abonnement?: AbonnementEtablissementCreateNestedOneWithoutFacturesInput
  }

  export type FactureEtablissementUncheckedCreateInput = {
    id?: string
    etablissementId: string
    abonnementId?: string | null
    numeroFacture: string
    montant: number
    dateEmission?: Date | string
    dateEcheance: Date | string
    datePaiement?: Date | string | null
    statut?: $Enums.StatutFacture
    methodePaiement?: string | null
    referencePaiement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FactureEtablissementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFacture?: StringFieldUpdateOperationsInput | string
    montant?: FloatFieldUpdateOperationsInput | number
    dateEmission?: DateTimeFieldUpdateOperationsInput | Date | string
    dateEcheance?: DateTimeFieldUpdateOperationsInput | Date | string
    datePaiement?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statut?: EnumStatutFactureFieldUpdateOperationsInput | $Enums.StatutFacture
    methodePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    referencePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    etablissement?: EtablissementUpdateOneRequiredWithoutFacturesNestedInput
    abonnement?: AbonnementEtablissementUpdateOneWithoutFacturesNestedInput
  }

  export type FactureEtablissementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    etablissementId?: StringFieldUpdateOperationsInput | string
    abonnementId?: NullableStringFieldUpdateOperationsInput | string | null
    numeroFacture?: StringFieldUpdateOperationsInput | string
    montant?: FloatFieldUpdateOperationsInput | number
    dateEmission?: DateTimeFieldUpdateOperationsInput | Date | string
    dateEcheance?: DateTimeFieldUpdateOperationsInput | Date | string
    datePaiement?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statut?: EnumStatutFactureFieldUpdateOperationsInput | $Enums.StatutFacture
    methodePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    referencePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FactureEtablissementCreateManyInput = {
    id?: string
    etablissementId: string
    abonnementId?: string | null
    numeroFacture: string
    montant: number
    dateEmission?: Date | string
    dateEcheance: Date | string
    datePaiement?: Date | string | null
    statut?: $Enums.StatutFacture
    methodePaiement?: string | null
    referencePaiement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FactureEtablissementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFacture?: StringFieldUpdateOperationsInput | string
    montant?: FloatFieldUpdateOperationsInput | number
    dateEmission?: DateTimeFieldUpdateOperationsInput | Date | string
    dateEcheance?: DateTimeFieldUpdateOperationsInput | Date | string
    datePaiement?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statut?: EnumStatutFactureFieldUpdateOperationsInput | $Enums.StatutFacture
    methodePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    referencePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FactureEtablissementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    etablissementId?: StringFieldUpdateOperationsInput | string
    abonnementId?: NullableStringFieldUpdateOperationsInput | string | null
    numeroFacture?: StringFieldUpdateOperationsInput | string
    montant?: FloatFieldUpdateOperationsInput | number
    dateEmission?: DateTimeFieldUpdateOperationsInput | Date | string
    dateEcheance?: DateTimeFieldUpdateOperationsInput | Date | string
    datePaiement?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statut?: EnumStatutFactureFieldUpdateOperationsInput | $Enums.StatutFacture
    methodePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    referencePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumTypeEtablissementFilter<$PrismaModel = never> = {
    equals?: $Enums.TypeEtablissement | EnumTypeEtablissementFieldRefInput<$PrismaModel>
    in?: $Enums.TypeEtablissement[] | ListEnumTypeEtablissementFieldRefInput<$PrismaModel>
    notIn?: $Enums.TypeEtablissement[] | ListEnumTypeEtablissementFieldRefInput<$PrismaModel>
    not?: NestedEnumTypeEtablissementFilter<$PrismaModel> | $Enums.TypeEtablissement
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumPlanAbonnementFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanAbonnement | EnumPlanAbonnementFieldRefInput<$PrismaModel>
    in?: $Enums.PlanAbonnement[] | ListEnumPlanAbonnementFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanAbonnement[] | ListEnumPlanAbonnementFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanAbonnementFilter<$PrismaModel> | $Enums.PlanAbonnement
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnumStatutProvisionnementFilter<$PrismaModel = never> = {
    equals?: $Enums.StatutProvisionnement | EnumStatutProvisionnementFieldRefInput<$PrismaModel>
    in?: $Enums.StatutProvisionnement[] | ListEnumStatutProvisionnementFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatutProvisionnement[] | ListEnumStatutProvisionnementFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutProvisionnementFilter<$PrismaModel> | $Enums.StatutProvisionnement
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UtilisateurGlobalListRelationFilter = {
    every?: UtilisateurGlobalWhereInput
    some?: UtilisateurGlobalWhereInput
    none?: UtilisateurGlobalWhereInput
  }

  export type AbonnementEtablissementListRelationFilter = {
    every?: AbonnementEtablissementWhereInput
    some?: AbonnementEtablissementWhereInput
    none?: AbonnementEtablissementWhereInput
  }

  export type FactureEtablissementListRelationFilter = {
    every?: FactureEtablissementWhereInput
    some?: FactureEtablissementWhereInput
    none?: FactureEtablissementWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UtilisateurGlobalOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AbonnementEtablissementOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FactureEtablissementOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EtablissementCountOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    code?: SortOrder
    schemaName?: SortOrder
    type?: SortOrder
    logo?: SortOrder
    adresse?: SortOrder
    ville?: SortOrder
    pays?: SortOrder
    telephone?: SortOrder
    email?: SortOrder
    siteWeb?: SortOrder
    numeroAgrement?: SortOrder
    devise?: SortOrder
    fuseauHoraire?: SortOrder
    formatDate?: SortOrder
    joursOuvrables?: SortOrder
    heureDebut?: SortOrder
    heureFin?: SortOrder
    toleranceRetard?: SortOrder
    tauxHeureSup?: SortOrder
    estActif?: SortOrder
    estArchive?: SortOrder
    planAbonnement?: SortOrder
    dateExpiration?: SortOrder
    maxUtilisateurs?: SortOrder
    statutProvisionnement?: SortOrder
    erreurProvisionnement?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EtablissementAvgOrderByAggregateInput = {
    toleranceRetard?: SortOrder
    tauxHeureSup?: SortOrder
    maxUtilisateurs?: SortOrder
  }

  export type EtablissementMaxOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    code?: SortOrder
    schemaName?: SortOrder
    type?: SortOrder
    logo?: SortOrder
    adresse?: SortOrder
    ville?: SortOrder
    pays?: SortOrder
    telephone?: SortOrder
    email?: SortOrder
    siteWeb?: SortOrder
    numeroAgrement?: SortOrder
    devise?: SortOrder
    fuseauHoraire?: SortOrder
    formatDate?: SortOrder
    heureDebut?: SortOrder
    heureFin?: SortOrder
    toleranceRetard?: SortOrder
    tauxHeureSup?: SortOrder
    estActif?: SortOrder
    estArchive?: SortOrder
    planAbonnement?: SortOrder
    dateExpiration?: SortOrder
    maxUtilisateurs?: SortOrder
    statutProvisionnement?: SortOrder
    erreurProvisionnement?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EtablissementMinOrderByAggregateInput = {
    id?: SortOrder
    nom?: SortOrder
    code?: SortOrder
    schemaName?: SortOrder
    type?: SortOrder
    logo?: SortOrder
    adresse?: SortOrder
    ville?: SortOrder
    pays?: SortOrder
    telephone?: SortOrder
    email?: SortOrder
    siteWeb?: SortOrder
    numeroAgrement?: SortOrder
    devise?: SortOrder
    fuseauHoraire?: SortOrder
    formatDate?: SortOrder
    heureDebut?: SortOrder
    heureFin?: SortOrder
    toleranceRetard?: SortOrder
    tauxHeureSup?: SortOrder
    estActif?: SortOrder
    estArchive?: SortOrder
    planAbonnement?: SortOrder
    dateExpiration?: SortOrder
    maxUtilisateurs?: SortOrder
    statutProvisionnement?: SortOrder
    erreurProvisionnement?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EtablissementSumOrderByAggregateInput = {
    toleranceRetard?: SortOrder
    tauxHeureSup?: SortOrder
    maxUtilisateurs?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumTypeEtablissementWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TypeEtablissement | EnumTypeEtablissementFieldRefInput<$PrismaModel>
    in?: $Enums.TypeEtablissement[] | ListEnumTypeEtablissementFieldRefInput<$PrismaModel>
    notIn?: $Enums.TypeEtablissement[] | ListEnumTypeEtablissementFieldRefInput<$PrismaModel>
    not?: NestedEnumTypeEtablissementWithAggregatesFilter<$PrismaModel> | $Enums.TypeEtablissement
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTypeEtablissementFilter<$PrismaModel>
    _max?: NestedEnumTypeEtablissementFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumPlanAbonnementWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanAbonnement | EnumPlanAbonnementFieldRefInput<$PrismaModel>
    in?: $Enums.PlanAbonnement[] | ListEnumPlanAbonnementFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanAbonnement[] | ListEnumPlanAbonnementFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanAbonnementWithAggregatesFilter<$PrismaModel> | $Enums.PlanAbonnement
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlanAbonnementFilter<$PrismaModel>
    _max?: NestedEnumPlanAbonnementFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumStatutProvisionnementWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatutProvisionnement | EnumStatutProvisionnementFieldRefInput<$PrismaModel>
    in?: $Enums.StatutProvisionnement[] | ListEnumStatutProvisionnementFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatutProvisionnement[] | ListEnumStatutProvisionnementFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutProvisionnementWithAggregatesFilter<$PrismaModel> | $Enums.StatutProvisionnement
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatutProvisionnementFilter<$PrismaModel>
    _max?: NestedEnumStatutProvisionnementFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumRoleGlobalFilter<$PrismaModel = never> = {
    equals?: $Enums.RoleGlobal | EnumRoleGlobalFieldRefInput<$PrismaModel>
    in?: $Enums.RoleGlobal[] | ListEnumRoleGlobalFieldRefInput<$PrismaModel>
    notIn?: $Enums.RoleGlobal[] | ListEnumRoleGlobalFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleGlobalFilter<$PrismaModel> | $Enums.RoleGlobal
  }

  export type EtablissementNullableScalarRelationFilter = {
    is?: EtablissementWhereInput | null
    isNot?: EtablissementWhereInput | null
  }

  export type UtilisateurGlobalCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    motDePasse?: SortOrder
    prenom?: SortOrder
    nom?: SortOrder
    role?: SortOrder
    estActif?: SortOrder
    emailVerifie?: SortOrder
    telephone?: SortOrder
    photoProfil?: SortOrder
    derniereConnexion?: SortOrder
    jetonActualisation?: SortOrder
    etablissementId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UtilisateurGlobalMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    motDePasse?: SortOrder
    prenom?: SortOrder
    nom?: SortOrder
    role?: SortOrder
    estActif?: SortOrder
    emailVerifie?: SortOrder
    telephone?: SortOrder
    photoProfil?: SortOrder
    derniereConnexion?: SortOrder
    jetonActualisation?: SortOrder
    etablissementId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UtilisateurGlobalMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    motDePasse?: SortOrder
    prenom?: SortOrder
    nom?: SortOrder
    role?: SortOrder
    estActif?: SortOrder
    emailVerifie?: SortOrder
    telephone?: SortOrder
    photoProfil?: SortOrder
    derniereConnexion?: SortOrder
    jetonActualisation?: SortOrder
    etablissementId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumRoleGlobalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RoleGlobal | EnumRoleGlobalFieldRefInput<$PrismaModel>
    in?: $Enums.RoleGlobal[] | ListEnumRoleGlobalFieldRefInput<$PrismaModel>
    notIn?: $Enums.RoleGlobal[] | ListEnumRoleGlobalFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleGlobalWithAggregatesFilter<$PrismaModel> | $Enums.RoleGlobal
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleGlobalFilter<$PrismaModel>
    _max?: NestedEnumRoleGlobalFilter<$PrismaModel>
  }

  export type EtablissementScalarRelationFilter = {
    is?: EtablissementWhereInput
    isNot?: EtablissementWhereInput
  }

  export type AbonnementEtablissementCountOrderByAggregateInput = {
    id?: SortOrder
    etablissementId?: SortOrder
    plan?: SortOrder
    dateDebut?: SortOrder
    dateFin?: SortOrder
    montantMensuel?: SortOrder
    estActif?: SortOrder
    renouvellementAuto?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AbonnementEtablissementAvgOrderByAggregateInput = {
    montantMensuel?: SortOrder
  }

  export type AbonnementEtablissementMaxOrderByAggregateInput = {
    id?: SortOrder
    etablissementId?: SortOrder
    plan?: SortOrder
    dateDebut?: SortOrder
    dateFin?: SortOrder
    montantMensuel?: SortOrder
    estActif?: SortOrder
    renouvellementAuto?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AbonnementEtablissementMinOrderByAggregateInput = {
    id?: SortOrder
    etablissementId?: SortOrder
    plan?: SortOrder
    dateDebut?: SortOrder
    dateFin?: SortOrder
    montantMensuel?: SortOrder
    estActif?: SortOrder
    renouvellementAuto?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AbonnementEtablissementSumOrderByAggregateInput = {
    montantMensuel?: SortOrder
  }

  export type EnumStatutFactureFilter<$PrismaModel = never> = {
    equals?: $Enums.StatutFacture | EnumStatutFactureFieldRefInput<$PrismaModel>
    in?: $Enums.StatutFacture[] | ListEnumStatutFactureFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatutFacture[] | ListEnumStatutFactureFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutFactureFilter<$PrismaModel> | $Enums.StatutFacture
  }

  export type AbonnementEtablissementNullableScalarRelationFilter = {
    is?: AbonnementEtablissementWhereInput | null
    isNot?: AbonnementEtablissementWhereInput | null
  }

  export type FactureEtablissementCountOrderByAggregateInput = {
    id?: SortOrder
    etablissementId?: SortOrder
    abonnementId?: SortOrder
    numeroFacture?: SortOrder
    montant?: SortOrder
    dateEmission?: SortOrder
    dateEcheance?: SortOrder
    datePaiement?: SortOrder
    statut?: SortOrder
    methodePaiement?: SortOrder
    referencePaiement?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FactureEtablissementAvgOrderByAggregateInput = {
    montant?: SortOrder
  }

  export type FactureEtablissementMaxOrderByAggregateInput = {
    id?: SortOrder
    etablissementId?: SortOrder
    abonnementId?: SortOrder
    numeroFacture?: SortOrder
    montant?: SortOrder
    dateEmission?: SortOrder
    dateEcheance?: SortOrder
    datePaiement?: SortOrder
    statut?: SortOrder
    methodePaiement?: SortOrder
    referencePaiement?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FactureEtablissementMinOrderByAggregateInput = {
    id?: SortOrder
    etablissementId?: SortOrder
    abonnementId?: SortOrder
    numeroFacture?: SortOrder
    montant?: SortOrder
    dateEmission?: SortOrder
    dateEcheance?: SortOrder
    datePaiement?: SortOrder
    statut?: SortOrder
    methodePaiement?: SortOrder
    referencePaiement?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FactureEtablissementSumOrderByAggregateInput = {
    montant?: SortOrder
  }

  export type EnumStatutFactureWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatutFacture | EnumStatutFactureFieldRefInput<$PrismaModel>
    in?: $Enums.StatutFacture[] | ListEnumStatutFactureFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatutFacture[] | ListEnumStatutFactureFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutFactureWithAggregatesFilter<$PrismaModel> | $Enums.StatutFacture
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatutFactureFilter<$PrismaModel>
    _max?: NestedEnumStatutFactureFilter<$PrismaModel>
  }

  export type EtablissementCreatejoursOuvrablesInput = {
    set: string[]
  }

  export type UtilisateurGlobalCreateNestedManyWithoutEtablissementInput = {
    create?: XOR<UtilisateurGlobalCreateWithoutEtablissementInput, UtilisateurGlobalUncheckedCreateWithoutEtablissementInput> | UtilisateurGlobalCreateWithoutEtablissementInput[] | UtilisateurGlobalUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: UtilisateurGlobalCreateOrConnectWithoutEtablissementInput | UtilisateurGlobalCreateOrConnectWithoutEtablissementInput[]
    createMany?: UtilisateurGlobalCreateManyEtablissementInputEnvelope
    connect?: UtilisateurGlobalWhereUniqueInput | UtilisateurGlobalWhereUniqueInput[]
  }

  export type AbonnementEtablissementCreateNestedManyWithoutEtablissementInput = {
    create?: XOR<AbonnementEtablissementCreateWithoutEtablissementInput, AbonnementEtablissementUncheckedCreateWithoutEtablissementInput> | AbonnementEtablissementCreateWithoutEtablissementInput[] | AbonnementEtablissementUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: AbonnementEtablissementCreateOrConnectWithoutEtablissementInput | AbonnementEtablissementCreateOrConnectWithoutEtablissementInput[]
    createMany?: AbonnementEtablissementCreateManyEtablissementInputEnvelope
    connect?: AbonnementEtablissementWhereUniqueInput | AbonnementEtablissementWhereUniqueInput[]
  }

  export type FactureEtablissementCreateNestedManyWithoutEtablissementInput = {
    create?: XOR<FactureEtablissementCreateWithoutEtablissementInput, FactureEtablissementUncheckedCreateWithoutEtablissementInput> | FactureEtablissementCreateWithoutEtablissementInput[] | FactureEtablissementUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: FactureEtablissementCreateOrConnectWithoutEtablissementInput | FactureEtablissementCreateOrConnectWithoutEtablissementInput[]
    createMany?: FactureEtablissementCreateManyEtablissementInputEnvelope
    connect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
  }

  export type UtilisateurGlobalUncheckedCreateNestedManyWithoutEtablissementInput = {
    create?: XOR<UtilisateurGlobalCreateWithoutEtablissementInput, UtilisateurGlobalUncheckedCreateWithoutEtablissementInput> | UtilisateurGlobalCreateWithoutEtablissementInput[] | UtilisateurGlobalUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: UtilisateurGlobalCreateOrConnectWithoutEtablissementInput | UtilisateurGlobalCreateOrConnectWithoutEtablissementInput[]
    createMany?: UtilisateurGlobalCreateManyEtablissementInputEnvelope
    connect?: UtilisateurGlobalWhereUniqueInput | UtilisateurGlobalWhereUniqueInput[]
  }

  export type AbonnementEtablissementUncheckedCreateNestedManyWithoutEtablissementInput = {
    create?: XOR<AbonnementEtablissementCreateWithoutEtablissementInput, AbonnementEtablissementUncheckedCreateWithoutEtablissementInput> | AbonnementEtablissementCreateWithoutEtablissementInput[] | AbonnementEtablissementUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: AbonnementEtablissementCreateOrConnectWithoutEtablissementInput | AbonnementEtablissementCreateOrConnectWithoutEtablissementInput[]
    createMany?: AbonnementEtablissementCreateManyEtablissementInputEnvelope
    connect?: AbonnementEtablissementWhereUniqueInput | AbonnementEtablissementWhereUniqueInput[]
  }

  export type FactureEtablissementUncheckedCreateNestedManyWithoutEtablissementInput = {
    create?: XOR<FactureEtablissementCreateWithoutEtablissementInput, FactureEtablissementUncheckedCreateWithoutEtablissementInput> | FactureEtablissementCreateWithoutEtablissementInput[] | FactureEtablissementUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: FactureEtablissementCreateOrConnectWithoutEtablissementInput | FactureEtablissementCreateOrConnectWithoutEtablissementInput[]
    createMany?: FactureEtablissementCreateManyEtablissementInputEnvelope
    connect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumTypeEtablissementFieldUpdateOperationsInput = {
    set?: $Enums.TypeEtablissement
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EtablissementUpdatejoursOuvrablesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumPlanAbonnementFieldUpdateOperationsInput = {
    set?: $Enums.PlanAbonnement
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumStatutProvisionnementFieldUpdateOperationsInput = {
    set?: $Enums.StatutProvisionnement
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UtilisateurGlobalUpdateManyWithoutEtablissementNestedInput = {
    create?: XOR<UtilisateurGlobalCreateWithoutEtablissementInput, UtilisateurGlobalUncheckedCreateWithoutEtablissementInput> | UtilisateurGlobalCreateWithoutEtablissementInput[] | UtilisateurGlobalUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: UtilisateurGlobalCreateOrConnectWithoutEtablissementInput | UtilisateurGlobalCreateOrConnectWithoutEtablissementInput[]
    upsert?: UtilisateurGlobalUpsertWithWhereUniqueWithoutEtablissementInput | UtilisateurGlobalUpsertWithWhereUniqueWithoutEtablissementInput[]
    createMany?: UtilisateurGlobalCreateManyEtablissementInputEnvelope
    set?: UtilisateurGlobalWhereUniqueInput | UtilisateurGlobalWhereUniqueInput[]
    disconnect?: UtilisateurGlobalWhereUniqueInput | UtilisateurGlobalWhereUniqueInput[]
    delete?: UtilisateurGlobalWhereUniqueInput | UtilisateurGlobalWhereUniqueInput[]
    connect?: UtilisateurGlobalWhereUniqueInput | UtilisateurGlobalWhereUniqueInput[]
    update?: UtilisateurGlobalUpdateWithWhereUniqueWithoutEtablissementInput | UtilisateurGlobalUpdateWithWhereUniqueWithoutEtablissementInput[]
    updateMany?: UtilisateurGlobalUpdateManyWithWhereWithoutEtablissementInput | UtilisateurGlobalUpdateManyWithWhereWithoutEtablissementInput[]
    deleteMany?: UtilisateurGlobalScalarWhereInput | UtilisateurGlobalScalarWhereInput[]
  }

  export type AbonnementEtablissementUpdateManyWithoutEtablissementNestedInput = {
    create?: XOR<AbonnementEtablissementCreateWithoutEtablissementInput, AbonnementEtablissementUncheckedCreateWithoutEtablissementInput> | AbonnementEtablissementCreateWithoutEtablissementInput[] | AbonnementEtablissementUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: AbonnementEtablissementCreateOrConnectWithoutEtablissementInput | AbonnementEtablissementCreateOrConnectWithoutEtablissementInput[]
    upsert?: AbonnementEtablissementUpsertWithWhereUniqueWithoutEtablissementInput | AbonnementEtablissementUpsertWithWhereUniqueWithoutEtablissementInput[]
    createMany?: AbonnementEtablissementCreateManyEtablissementInputEnvelope
    set?: AbonnementEtablissementWhereUniqueInput | AbonnementEtablissementWhereUniqueInput[]
    disconnect?: AbonnementEtablissementWhereUniqueInput | AbonnementEtablissementWhereUniqueInput[]
    delete?: AbonnementEtablissementWhereUniqueInput | AbonnementEtablissementWhereUniqueInput[]
    connect?: AbonnementEtablissementWhereUniqueInput | AbonnementEtablissementWhereUniqueInput[]
    update?: AbonnementEtablissementUpdateWithWhereUniqueWithoutEtablissementInput | AbonnementEtablissementUpdateWithWhereUniqueWithoutEtablissementInput[]
    updateMany?: AbonnementEtablissementUpdateManyWithWhereWithoutEtablissementInput | AbonnementEtablissementUpdateManyWithWhereWithoutEtablissementInput[]
    deleteMany?: AbonnementEtablissementScalarWhereInput | AbonnementEtablissementScalarWhereInput[]
  }

  export type FactureEtablissementUpdateManyWithoutEtablissementNestedInput = {
    create?: XOR<FactureEtablissementCreateWithoutEtablissementInput, FactureEtablissementUncheckedCreateWithoutEtablissementInput> | FactureEtablissementCreateWithoutEtablissementInput[] | FactureEtablissementUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: FactureEtablissementCreateOrConnectWithoutEtablissementInput | FactureEtablissementCreateOrConnectWithoutEtablissementInput[]
    upsert?: FactureEtablissementUpsertWithWhereUniqueWithoutEtablissementInput | FactureEtablissementUpsertWithWhereUniqueWithoutEtablissementInput[]
    createMany?: FactureEtablissementCreateManyEtablissementInputEnvelope
    set?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    disconnect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    delete?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    connect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    update?: FactureEtablissementUpdateWithWhereUniqueWithoutEtablissementInput | FactureEtablissementUpdateWithWhereUniqueWithoutEtablissementInput[]
    updateMany?: FactureEtablissementUpdateManyWithWhereWithoutEtablissementInput | FactureEtablissementUpdateManyWithWhereWithoutEtablissementInput[]
    deleteMany?: FactureEtablissementScalarWhereInput | FactureEtablissementScalarWhereInput[]
  }

  export type UtilisateurGlobalUncheckedUpdateManyWithoutEtablissementNestedInput = {
    create?: XOR<UtilisateurGlobalCreateWithoutEtablissementInput, UtilisateurGlobalUncheckedCreateWithoutEtablissementInput> | UtilisateurGlobalCreateWithoutEtablissementInput[] | UtilisateurGlobalUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: UtilisateurGlobalCreateOrConnectWithoutEtablissementInput | UtilisateurGlobalCreateOrConnectWithoutEtablissementInput[]
    upsert?: UtilisateurGlobalUpsertWithWhereUniqueWithoutEtablissementInput | UtilisateurGlobalUpsertWithWhereUniqueWithoutEtablissementInput[]
    createMany?: UtilisateurGlobalCreateManyEtablissementInputEnvelope
    set?: UtilisateurGlobalWhereUniqueInput | UtilisateurGlobalWhereUniqueInput[]
    disconnect?: UtilisateurGlobalWhereUniqueInput | UtilisateurGlobalWhereUniqueInput[]
    delete?: UtilisateurGlobalWhereUniqueInput | UtilisateurGlobalWhereUniqueInput[]
    connect?: UtilisateurGlobalWhereUniqueInput | UtilisateurGlobalWhereUniqueInput[]
    update?: UtilisateurGlobalUpdateWithWhereUniqueWithoutEtablissementInput | UtilisateurGlobalUpdateWithWhereUniqueWithoutEtablissementInput[]
    updateMany?: UtilisateurGlobalUpdateManyWithWhereWithoutEtablissementInput | UtilisateurGlobalUpdateManyWithWhereWithoutEtablissementInput[]
    deleteMany?: UtilisateurGlobalScalarWhereInput | UtilisateurGlobalScalarWhereInput[]
  }

  export type AbonnementEtablissementUncheckedUpdateManyWithoutEtablissementNestedInput = {
    create?: XOR<AbonnementEtablissementCreateWithoutEtablissementInput, AbonnementEtablissementUncheckedCreateWithoutEtablissementInput> | AbonnementEtablissementCreateWithoutEtablissementInput[] | AbonnementEtablissementUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: AbonnementEtablissementCreateOrConnectWithoutEtablissementInput | AbonnementEtablissementCreateOrConnectWithoutEtablissementInput[]
    upsert?: AbonnementEtablissementUpsertWithWhereUniqueWithoutEtablissementInput | AbonnementEtablissementUpsertWithWhereUniqueWithoutEtablissementInput[]
    createMany?: AbonnementEtablissementCreateManyEtablissementInputEnvelope
    set?: AbonnementEtablissementWhereUniqueInput | AbonnementEtablissementWhereUniqueInput[]
    disconnect?: AbonnementEtablissementWhereUniqueInput | AbonnementEtablissementWhereUniqueInput[]
    delete?: AbonnementEtablissementWhereUniqueInput | AbonnementEtablissementWhereUniqueInput[]
    connect?: AbonnementEtablissementWhereUniqueInput | AbonnementEtablissementWhereUniqueInput[]
    update?: AbonnementEtablissementUpdateWithWhereUniqueWithoutEtablissementInput | AbonnementEtablissementUpdateWithWhereUniqueWithoutEtablissementInput[]
    updateMany?: AbonnementEtablissementUpdateManyWithWhereWithoutEtablissementInput | AbonnementEtablissementUpdateManyWithWhereWithoutEtablissementInput[]
    deleteMany?: AbonnementEtablissementScalarWhereInput | AbonnementEtablissementScalarWhereInput[]
  }

  export type FactureEtablissementUncheckedUpdateManyWithoutEtablissementNestedInput = {
    create?: XOR<FactureEtablissementCreateWithoutEtablissementInput, FactureEtablissementUncheckedCreateWithoutEtablissementInput> | FactureEtablissementCreateWithoutEtablissementInput[] | FactureEtablissementUncheckedCreateWithoutEtablissementInput[]
    connectOrCreate?: FactureEtablissementCreateOrConnectWithoutEtablissementInput | FactureEtablissementCreateOrConnectWithoutEtablissementInput[]
    upsert?: FactureEtablissementUpsertWithWhereUniqueWithoutEtablissementInput | FactureEtablissementUpsertWithWhereUniqueWithoutEtablissementInput[]
    createMany?: FactureEtablissementCreateManyEtablissementInputEnvelope
    set?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    disconnect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    delete?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    connect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    update?: FactureEtablissementUpdateWithWhereUniqueWithoutEtablissementInput | FactureEtablissementUpdateWithWhereUniqueWithoutEtablissementInput[]
    updateMany?: FactureEtablissementUpdateManyWithWhereWithoutEtablissementInput | FactureEtablissementUpdateManyWithWhereWithoutEtablissementInput[]
    deleteMany?: FactureEtablissementScalarWhereInput | FactureEtablissementScalarWhereInput[]
  }

  export type EtablissementCreateNestedOneWithoutUtilisateursGlobauxInput = {
    create?: XOR<EtablissementCreateWithoutUtilisateursGlobauxInput, EtablissementUncheckedCreateWithoutUtilisateursGlobauxInput>
    connectOrCreate?: EtablissementCreateOrConnectWithoutUtilisateursGlobauxInput
    connect?: EtablissementWhereUniqueInput
  }

  export type EnumRoleGlobalFieldUpdateOperationsInput = {
    set?: $Enums.RoleGlobal
  }

  export type EtablissementUpdateOneWithoutUtilisateursGlobauxNestedInput = {
    create?: XOR<EtablissementCreateWithoutUtilisateursGlobauxInput, EtablissementUncheckedCreateWithoutUtilisateursGlobauxInput>
    connectOrCreate?: EtablissementCreateOrConnectWithoutUtilisateursGlobauxInput
    upsert?: EtablissementUpsertWithoutUtilisateursGlobauxInput
    disconnect?: EtablissementWhereInput | boolean
    delete?: EtablissementWhereInput | boolean
    connect?: EtablissementWhereUniqueInput
    update?: XOR<XOR<EtablissementUpdateToOneWithWhereWithoutUtilisateursGlobauxInput, EtablissementUpdateWithoutUtilisateursGlobauxInput>, EtablissementUncheckedUpdateWithoutUtilisateursGlobauxInput>
  }

  export type EtablissementCreateNestedOneWithoutAbonnementsInput = {
    create?: XOR<EtablissementCreateWithoutAbonnementsInput, EtablissementUncheckedCreateWithoutAbonnementsInput>
    connectOrCreate?: EtablissementCreateOrConnectWithoutAbonnementsInput
    connect?: EtablissementWhereUniqueInput
  }

  export type FactureEtablissementCreateNestedManyWithoutAbonnementInput = {
    create?: XOR<FactureEtablissementCreateWithoutAbonnementInput, FactureEtablissementUncheckedCreateWithoutAbonnementInput> | FactureEtablissementCreateWithoutAbonnementInput[] | FactureEtablissementUncheckedCreateWithoutAbonnementInput[]
    connectOrCreate?: FactureEtablissementCreateOrConnectWithoutAbonnementInput | FactureEtablissementCreateOrConnectWithoutAbonnementInput[]
    createMany?: FactureEtablissementCreateManyAbonnementInputEnvelope
    connect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
  }

  export type FactureEtablissementUncheckedCreateNestedManyWithoutAbonnementInput = {
    create?: XOR<FactureEtablissementCreateWithoutAbonnementInput, FactureEtablissementUncheckedCreateWithoutAbonnementInput> | FactureEtablissementCreateWithoutAbonnementInput[] | FactureEtablissementUncheckedCreateWithoutAbonnementInput[]
    connectOrCreate?: FactureEtablissementCreateOrConnectWithoutAbonnementInput | FactureEtablissementCreateOrConnectWithoutAbonnementInput[]
    createMany?: FactureEtablissementCreateManyAbonnementInputEnvelope
    connect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
  }

  export type EtablissementUpdateOneRequiredWithoutAbonnementsNestedInput = {
    create?: XOR<EtablissementCreateWithoutAbonnementsInput, EtablissementUncheckedCreateWithoutAbonnementsInput>
    connectOrCreate?: EtablissementCreateOrConnectWithoutAbonnementsInput
    upsert?: EtablissementUpsertWithoutAbonnementsInput
    connect?: EtablissementWhereUniqueInput
    update?: XOR<XOR<EtablissementUpdateToOneWithWhereWithoutAbonnementsInput, EtablissementUpdateWithoutAbonnementsInput>, EtablissementUncheckedUpdateWithoutAbonnementsInput>
  }

  export type FactureEtablissementUpdateManyWithoutAbonnementNestedInput = {
    create?: XOR<FactureEtablissementCreateWithoutAbonnementInput, FactureEtablissementUncheckedCreateWithoutAbonnementInput> | FactureEtablissementCreateWithoutAbonnementInput[] | FactureEtablissementUncheckedCreateWithoutAbonnementInput[]
    connectOrCreate?: FactureEtablissementCreateOrConnectWithoutAbonnementInput | FactureEtablissementCreateOrConnectWithoutAbonnementInput[]
    upsert?: FactureEtablissementUpsertWithWhereUniqueWithoutAbonnementInput | FactureEtablissementUpsertWithWhereUniqueWithoutAbonnementInput[]
    createMany?: FactureEtablissementCreateManyAbonnementInputEnvelope
    set?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    disconnect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    delete?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    connect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    update?: FactureEtablissementUpdateWithWhereUniqueWithoutAbonnementInput | FactureEtablissementUpdateWithWhereUniqueWithoutAbonnementInput[]
    updateMany?: FactureEtablissementUpdateManyWithWhereWithoutAbonnementInput | FactureEtablissementUpdateManyWithWhereWithoutAbonnementInput[]
    deleteMany?: FactureEtablissementScalarWhereInput | FactureEtablissementScalarWhereInput[]
  }

  export type FactureEtablissementUncheckedUpdateManyWithoutAbonnementNestedInput = {
    create?: XOR<FactureEtablissementCreateWithoutAbonnementInput, FactureEtablissementUncheckedCreateWithoutAbonnementInput> | FactureEtablissementCreateWithoutAbonnementInput[] | FactureEtablissementUncheckedCreateWithoutAbonnementInput[]
    connectOrCreate?: FactureEtablissementCreateOrConnectWithoutAbonnementInput | FactureEtablissementCreateOrConnectWithoutAbonnementInput[]
    upsert?: FactureEtablissementUpsertWithWhereUniqueWithoutAbonnementInput | FactureEtablissementUpsertWithWhereUniqueWithoutAbonnementInput[]
    createMany?: FactureEtablissementCreateManyAbonnementInputEnvelope
    set?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    disconnect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    delete?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    connect?: FactureEtablissementWhereUniqueInput | FactureEtablissementWhereUniqueInput[]
    update?: FactureEtablissementUpdateWithWhereUniqueWithoutAbonnementInput | FactureEtablissementUpdateWithWhereUniqueWithoutAbonnementInput[]
    updateMany?: FactureEtablissementUpdateManyWithWhereWithoutAbonnementInput | FactureEtablissementUpdateManyWithWhereWithoutAbonnementInput[]
    deleteMany?: FactureEtablissementScalarWhereInput | FactureEtablissementScalarWhereInput[]
  }

  export type EtablissementCreateNestedOneWithoutFacturesInput = {
    create?: XOR<EtablissementCreateWithoutFacturesInput, EtablissementUncheckedCreateWithoutFacturesInput>
    connectOrCreate?: EtablissementCreateOrConnectWithoutFacturesInput
    connect?: EtablissementWhereUniqueInput
  }

  export type AbonnementEtablissementCreateNestedOneWithoutFacturesInput = {
    create?: XOR<AbonnementEtablissementCreateWithoutFacturesInput, AbonnementEtablissementUncheckedCreateWithoutFacturesInput>
    connectOrCreate?: AbonnementEtablissementCreateOrConnectWithoutFacturesInput
    connect?: AbonnementEtablissementWhereUniqueInput
  }

  export type EnumStatutFactureFieldUpdateOperationsInput = {
    set?: $Enums.StatutFacture
  }

  export type EtablissementUpdateOneRequiredWithoutFacturesNestedInput = {
    create?: XOR<EtablissementCreateWithoutFacturesInput, EtablissementUncheckedCreateWithoutFacturesInput>
    connectOrCreate?: EtablissementCreateOrConnectWithoutFacturesInput
    upsert?: EtablissementUpsertWithoutFacturesInput
    connect?: EtablissementWhereUniqueInput
    update?: XOR<XOR<EtablissementUpdateToOneWithWhereWithoutFacturesInput, EtablissementUpdateWithoutFacturesInput>, EtablissementUncheckedUpdateWithoutFacturesInput>
  }

  export type AbonnementEtablissementUpdateOneWithoutFacturesNestedInput = {
    create?: XOR<AbonnementEtablissementCreateWithoutFacturesInput, AbonnementEtablissementUncheckedCreateWithoutFacturesInput>
    connectOrCreate?: AbonnementEtablissementCreateOrConnectWithoutFacturesInput
    upsert?: AbonnementEtablissementUpsertWithoutFacturesInput
    disconnect?: AbonnementEtablissementWhereInput | boolean
    delete?: AbonnementEtablissementWhereInput | boolean
    connect?: AbonnementEtablissementWhereUniqueInput
    update?: XOR<XOR<AbonnementEtablissementUpdateToOneWithWhereWithoutFacturesInput, AbonnementEtablissementUpdateWithoutFacturesInput>, AbonnementEtablissementUncheckedUpdateWithoutFacturesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumTypeEtablissementFilter<$PrismaModel = never> = {
    equals?: $Enums.TypeEtablissement | EnumTypeEtablissementFieldRefInput<$PrismaModel>
    in?: $Enums.TypeEtablissement[] | ListEnumTypeEtablissementFieldRefInput<$PrismaModel>
    notIn?: $Enums.TypeEtablissement[] | ListEnumTypeEtablissementFieldRefInput<$PrismaModel>
    not?: NestedEnumTypeEtablissementFilter<$PrismaModel> | $Enums.TypeEtablissement
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumPlanAbonnementFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanAbonnement | EnumPlanAbonnementFieldRefInput<$PrismaModel>
    in?: $Enums.PlanAbonnement[] | ListEnumPlanAbonnementFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanAbonnement[] | ListEnumPlanAbonnementFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanAbonnementFilter<$PrismaModel> | $Enums.PlanAbonnement
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumStatutProvisionnementFilter<$PrismaModel = never> = {
    equals?: $Enums.StatutProvisionnement | EnumStatutProvisionnementFieldRefInput<$PrismaModel>
    in?: $Enums.StatutProvisionnement[] | ListEnumStatutProvisionnementFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatutProvisionnement[] | ListEnumStatutProvisionnementFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutProvisionnementFilter<$PrismaModel> | $Enums.StatutProvisionnement
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumTypeEtablissementWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TypeEtablissement | EnumTypeEtablissementFieldRefInput<$PrismaModel>
    in?: $Enums.TypeEtablissement[] | ListEnumTypeEtablissementFieldRefInput<$PrismaModel>
    notIn?: $Enums.TypeEtablissement[] | ListEnumTypeEtablissementFieldRefInput<$PrismaModel>
    not?: NestedEnumTypeEtablissementWithAggregatesFilter<$PrismaModel> | $Enums.TypeEtablissement
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTypeEtablissementFilter<$PrismaModel>
    _max?: NestedEnumTypeEtablissementFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumPlanAbonnementWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlanAbonnement | EnumPlanAbonnementFieldRefInput<$PrismaModel>
    in?: $Enums.PlanAbonnement[] | ListEnumPlanAbonnementFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlanAbonnement[] | ListEnumPlanAbonnementFieldRefInput<$PrismaModel>
    not?: NestedEnumPlanAbonnementWithAggregatesFilter<$PrismaModel> | $Enums.PlanAbonnement
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlanAbonnementFilter<$PrismaModel>
    _max?: NestedEnumPlanAbonnementFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumStatutProvisionnementWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatutProvisionnement | EnumStatutProvisionnementFieldRefInput<$PrismaModel>
    in?: $Enums.StatutProvisionnement[] | ListEnumStatutProvisionnementFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatutProvisionnement[] | ListEnumStatutProvisionnementFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutProvisionnementWithAggregatesFilter<$PrismaModel> | $Enums.StatutProvisionnement
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatutProvisionnementFilter<$PrismaModel>
    _max?: NestedEnumStatutProvisionnementFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumRoleGlobalFilter<$PrismaModel = never> = {
    equals?: $Enums.RoleGlobal | EnumRoleGlobalFieldRefInput<$PrismaModel>
    in?: $Enums.RoleGlobal[] | ListEnumRoleGlobalFieldRefInput<$PrismaModel>
    notIn?: $Enums.RoleGlobal[] | ListEnumRoleGlobalFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleGlobalFilter<$PrismaModel> | $Enums.RoleGlobal
  }

  export type NestedEnumRoleGlobalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RoleGlobal | EnumRoleGlobalFieldRefInput<$PrismaModel>
    in?: $Enums.RoleGlobal[] | ListEnumRoleGlobalFieldRefInput<$PrismaModel>
    notIn?: $Enums.RoleGlobal[] | ListEnumRoleGlobalFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleGlobalWithAggregatesFilter<$PrismaModel> | $Enums.RoleGlobal
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleGlobalFilter<$PrismaModel>
    _max?: NestedEnumRoleGlobalFilter<$PrismaModel>
  }

  export type NestedEnumStatutFactureFilter<$PrismaModel = never> = {
    equals?: $Enums.StatutFacture | EnumStatutFactureFieldRefInput<$PrismaModel>
    in?: $Enums.StatutFacture[] | ListEnumStatutFactureFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatutFacture[] | ListEnumStatutFactureFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutFactureFilter<$PrismaModel> | $Enums.StatutFacture
  }

  export type NestedEnumStatutFactureWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatutFacture | EnumStatutFactureFieldRefInput<$PrismaModel>
    in?: $Enums.StatutFacture[] | ListEnumStatutFactureFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatutFacture[] | ListEnumStatutFactureFieldRefInput<$PrismaModel>
    not?: NestedEnumStatutFactureWithAggregatesFilter<$PrismaModel> | $Enums.StatutFacture
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatutFactureFilter<$PrismaModel>
    _max?: NestedEnumStatutFactureFilter<$PrismaModel>
  }

  export type UtilisateurGlobalCreateWithoutEtablissementInput = {
    id?: string
    email: string
    motDePasse: string
    prenom: string
    nom: string
    role?: $Enums.RoleGlobal
    estActif?: boolean
    emailVerifie?: boolean
    telephone?: string | null
    photoProfil?: string | null
    derniereConnexion?: Date | string | null
    jetonActualisation?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UtilisateurGlobalUncheckedCreateWithoutEtablissementInput = {
    id?: string
    email: string
    motDePasse: string
    prenom: string
    nom: string
    role?: $Enums.RoleGlobal
    estActif?: boolean
    emailVerifie?: boolean
    telephone?: string | null
    photoProfil?: string | null
    derniereConnexion?: Date | string | null
    jetonActualisation?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UtilisateurGlobalCreateOrConnectWithoutEtablissementInput = {
    where: UtilisateurGlobalWhereUniqueInput
    create: XOR<UtilisateurGlobalCreateWithoutEtablissementInput, UtilisateurGlobalUncheckedCreateWithoutEtablissementInput>
  }

  export type UtilisateurGlobalCreateManyEtablissementInputEnvelope = {
    data: UtilisateurGlobalCreateManyEtablissementInput | UtilisateurGlobalCreateManyEtablissementInput[]
    skipDuplicates?: boolean
  }

  export type AbonnementEtablissementCreateWithoutEtablissementInput = {
    id?: string
    plan: $Enums.PlanAbonnement
    dateDebut: Date | string
    dateFin: Date | string
    montantMensuel: number
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    factures?: FactureEtablissementCreateNestedManyWithoutAbonnementInput
  }

  export type AbonnementEtablissementUncheckedCreateWithoutEtablissementInput = {
    id?: string
    plan: $Enums.PlanAbonnement
    dateDebut: Date | string
    dateFin: Date | string
    montantMensuel: number
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    factures?: FactureEtablissementUncheckedCreateNestedManyWithoutAbonnementInput
  }

  export type AbonnementEtablissementCreateOrConnectWithoutEtablissementInput = {
    where: AbonnementEtablissementWhereUniqueInput
    create: XOR<AbonnementEtablissementCreateWithoutEtablissementInput, AbonnementEtablissementUncheckedCreateWithoutEtablissementInput>
  }

  export type AbonnementEtablissementCreateManyEtablissementInputEnvelope = {
    data: AbonnementEtablissementCreateManyEtablissementInput | AbonnementEtablissementCreateManyEtablissementInput[]
    skipDuplicates?: boolean
  }

  export type FactureEtablissementCreateWithoutEtablissementInput = {
    id?: string
    numeroFacture: string
    montant: number
    dateEmission?: Date | string
    dateEcheance: Date | string
    datePaiement?: Date | string | null
    statut?: $Enums.StatutFacture
    methodePaiement?: string | null
    referencePaiement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    abonnement?: AbonnementEtablissementCreateNestedOneWithoutFacturesInput
  }

  export type FactureEtablissementUncheckedCreateWithoutEtablissementInput = {
    id?: string
    abonnementId?: string | null
    numeroFacture: string
    montant: number
    dateEmission?: Date | string
    dateEcheance: Date | string
    datePaiement?: Date | string | null
    statut?: $Enums.StatutFacture
    methodePaiement?: string | null
    referencePaiement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FactureEtablissementCreateOrConnectWithoutEtablissementInput = {
    where: FactureEtablissementWhereUniqueInput
    create: XOR<FactureEtablissementCreateWithoutEtablissementInput, FactureEtablissementUncheckedCreateWithoutEtablissementInput>
  }

  export type FactureEtablissementCreateManyEtablissementInputEnvelope = {
    data: FactureEtablissementCreateManyEtablissementInput | FactureEtablissementCreateManyEtablissementInput[]
    skipDuplicates?: boolean
  }

  export type UtilisateurGlobalUpsertWithWhereUniqueWithoutEtablissementInput = {
    where: UtilisateurGlobalWhereUniqueInput
    update: XOR<UtilisateurGlobalUpdateWithoutEtablissementInput, UtilisateurGlobalUncheckedUpdateWithoutEtablissementInput>
    create: XOR<UtilisateurGlobalCreateWithoutEtablissementInput, UtilisateurGlobalUncheckedCreateWithoutEtablissementInput>
  }

  export type UtilisateurGlobalUpdateWithWhereUniqueWithoutEtablissementInput = {
    where: UtilisateurGlobalWhereUniqueInput
    data: XOR<UtilisateurGlobalUpdateWithoutEtablissementInput, UtilisateurGlobalUncheckedUpdateWithoutEtablissementInput>
  }

  export type UtilisateurGlobalUpdateManyWithWhereWithoutEtablissementInput = {
    where: UtilisateurGlobalScalarWhereInput
    data: XOR<UtilisateurGlobalUpdateManyMutationInput, UtilisateurGlobalUncheckedUpdateManyWithoutEtablissementInput>
  }

  export type UtilisateurGlobalScalarWhereInput = {
    AND?: UtilisateurGlobalScalarWhereInput | UtilisateurGlobalScalarWhereInput[]
    OR?: UtilisateurGlobalScalarWhereInput[]
    NOT?: UtilisateurGlobalScalarWhereInput | UtilisateurGlobalScalarWhereInput[]
    id?: StringFilter<"UtilisateurGlobal"> | string
    email?: StringFilter<"UtilisateurGlobal"> | string
    motDePasse?: StringFilter<"UtilisateurGlobal"> | string
    prenom?: StringFilter<"UtilisateurGlobal"> | string
    nom?: StringFilter<"UtilisateurGlobal"> | string
    role?: EnumRoleGlobalFilter<"UtilisateurGlobal"> | $Enums.RoleGlobal
    estActif?: BoolFilter<"UtilisateurGlobal"> | boolean
    emailVerifie?: BoolFilter<"UtilisateurGlobal"> | boolean
    telephone?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    photoProfil?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    derniereConnexion?: DateTimeNullableFilter<"UtilisateurGlobal"> | Date | string | null
    jetonActualisation?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    etablissementId?: StringNullableFilter<"UtilisateurGlobal"> | string | null
    createdAt?: DateTimeFilter<"UtilisateurGlobal"> | Date | string
    updatedAt?: DateTimeFilter<"UtilisateurGlobal"> | Date | string
  }

  export type AbonnementEtablissementUpsertWithWhereUniqueWithoutEtablissementInput = {
    where: AbonnementEtablissementWhereUniqueInput
    update: XOR<AbonnementEtablissementUpdateWithoutEtablissementInput, AbonnementEtablissementUncheckedUpdateWithoutEtablissementInput>
    create: XOR<AbonnementEtablissementCreateWithoutEtablissementInput, AbonnementEtablissementUncheckedCreateWithoutEtablissementInput>
  }

  export type AbonnementEtablissementUpdateWithWhereUniqueWithoutEtablissementInput = {
    where: AbonnementEtablissementWhereUniqueInput
    data: XOR<AbonnementEtablissementUpdateWithoutEtablissementInput, AbonnementEtablissementUncheckedUpdateWithoutEtablissementInput>
  }

  export type AbonnementEtablissementUpdateManyWithWhereWithoutEtablissementInput = {
    where: AbonnementEtablissementScalarWhereInput
    data: XOR<AbonnementEtablissementUpdateManyMutationInput, AbonnementEtablissementUncheckedUpdateManyWithoutEtablissementInput>
  }

  export type AbonnementEtablissementScalarWhereInput = {
    AND?: AbonnementEtablissementScalarWhereInput | AbonnementEtablissementScalarWhereInput[]
    OR?: AbonnementEtablissementScalarWhereInput[]
    NOT?: AbonnementEtablissementScalarWhereInput | AbonnementEtablissementScalarWhereInput[]
    id?: StringFilter<"AbonnementEtablissement"> | string
    etablissementId?: StringFilter<"AbonnementEtablissement"> | string
    plan?: EnumPlanAbonnementFilter<"AbonnementEtablissement"> | $Enums.PlanAbonnement
    dateDebut?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    dateFin?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    montantMensuel?: FloatFilter<"AbonnementEtablissement"> | number
    estActif?: BoolFilter<"AbonnementEtablissement"> | boolean
    renouvellementAuto?: BoolFilter<"AbonnementEtablissement"> | boolean
    createdAt?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
    updatedAt?: DateTimeFilter<"AbonnementEtablissement"> | Date | string
  }

  export type FactureEtablissementUpsertWithWhereUniqueWithoutEtablissementInput = {
    where: FactureEtablissementWhereUniqueInput
    update: XOR<FactureEtablissementUpdateWithoutEtablissementInput, FactureEtablissementUncheckedUpdateWithoutEtablissementInput>
    create: XOR<FactureEtablissementCreateWithoutEtablissementInput, FactureEtablissementUncheckedCreateWithoutEtablissementInput>
  }

  export type FactureEtablissementUpdateWithWhereUniqueWithoutEtablissementInput = {
    where: FactureEtablissementWhereUniqueInput
    data: XOR<FactureEtablissementUpdateWithoutEtablissementInput, FactureEtablissementUncheckedUpdateWithoutEtablissementInput>
  }

  export type FactureEtablissementUpdateManyWithWhereWithoutEtablissementInput = {
    where: FactureEtablissementScalarWhereInput
    data: XOR<FactureEtablissementUpdateManyMutationInput, FactureEtablissementUncheckedUpdateManyWithoutEtablissementInput>
  }

  export type FactureEtablissementScalarWhereInput = {
    AND?: FactureEtablissementScalarWhereInput | FactureEtablissementScalarWhereInput[]
    OR?: FactureEtablissementScalarWhereInput[]
    NOT?: FactureEtablissementScalarWhereInput | FactureEtablissementScalarWhereInput[]
    id?: StringFilter<"FactureEtablissement"> | string
    etablissementId?: StringFilter<"FactureEtablissement"> | string
    abonnementId?: StringNullableFilter<"FactureEtablissement"> | string | null
    numeroFacture?: StringFilter<"FactureEtablissement"> | string
    montant?: FloatFilter<"FactureEtablissement"> | number
    dateEmission?: DateTimeFilter<"FactureEtablissement"> | Date | string
    dateEcheance?: DateTimeFilter<"FactureEtablissement"> | Date | string
    datePaiement?: DateTimeNullableFilter<"FactureEtablissement"> | Date | string | null
    statut?: EnumStatutFactureFilter<"FactureEtablissement"> | $Enums.StatutFacture
    methodePaiement?: StringNullableFilter<"FactureEtablissement"> | string | null
    referencePaiement?: StringNullableFilter<"FactureEtablissement"> | string | null
    createdAt?: DateTimeFilter<"FactureEtablissement"> | Date | string
    updatedAt?: DateTimeFilter<"FactureEtablissement"> | Date | string
  }

  export type EtablissementCreateWithoutUtilisateursGlobauxInput = {
    id?: string
    nom: string
    code: string
    schemaName: string
    type?: $Enums.TypeEtablissement
    logo?: string | null
    adresse?: string | null
    ville?: string | null
    pays?: string
    telephone?: string | null
    email?: string | null
    siteWeb?: string | null
    numeroAgrement?: string | null
    devise?: string
    fuseauHoraire?: string
    formatDate?: string
    joursOuvrables?: EtablissementCreatejoursOuvrablesInput | string[]
    heureDebut?: string | null
    heureFin?: string | null
    toleranceRetard?: number
    tauxHeureSup?: number
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: $Enums.PlanAbonnement
    dateExpiration?: Date | string | null
    maxUtilisateurs?: number
    statutProvisionnement?: $Enums.StatutProvisionnement
    erreurProvisionnement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    abonnements?: AbonnementEtablissementCreateNestedManyWithoutEtablissementInput
    factures?: FactureEtablissementCreateNestedManyWithoutEtablissementInput
  }

  export type EtablissementUncheckedCreateWithoutUtilisateursGlobauxInput = {
    id?: string
    nom: string
    code: string
    schemaName: string
    type?: $Enums.TypeEtablissement
    logo?: string | null
    adresse?: string | null
    ville?: string | null
    pays?: string
    telephone?: string | null
    email?: string | null
    siteWeb?: string | null
    numeroAgrement?: string | null
    devise?: string
    fuseauHoraire?: string
    formatDate?: string
    joursOuvrables?: EtablissementCreatejoursOuvrablesInput | string[]
    heureDebut?: string | null
    heureFin?: string | null
    toleranceRetard?: number
    tauxHeureSup?: number
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: $Enums.PlanAbonnement
    dateExpiration?: Date | string | null
    maxUtilisateurs?: number
    statutProvisionnement?: $Enums.StatutProvisionnement
    erreurProvisionnement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    abonnements?: AbonnementEtablissementUncheckedCreateNestedManyWithoutEtablissementInput
    factures?: FactureEtablissementUncheckedCreateNestedManyWithoutEtablissementInput
  }

  export type EtablissementCreateOrConnectWithoutUtilisateursGlobauxInput = {
    where: EtablissementWhereUniqueInput
    create: XOR<EtablissementCreateWithoutUtilisateursGlobauxInput, EtablissementUncheckedCreateWithoutUtilisateursGlobauxInput>
  }

  export type EtablissementUpsertWithoutUtilisateursGlobauxInput = {
    update: XOR<EtablissementUpdateWithoutUtilisateursGlobauxInput, EtablissementUncheckedUpdateWithoutUtilisateursGlobauxInput>
    create: XOR<EtablissementCreateWithoutUtilisateursGlobauxInput, EtablissementUncheckedCreateWithoutUtilisateursGlobauxInput>
    where?: EtablissementWhereInput
  }

  export type EtablissementUpdateToOneWithWhereWithoutUtilisateursGlobauxInput = {
    where?: EtablissementWhereInput
    data: XOR<EtablissementUpdateWithoutUtilisateursGlobauxInput, EtablissementUncheckedUpdateWithoutUtilisateursGlobauxInput>
  }

  export type EtablissementUpdateWithoutUtilisateursGlobauxInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    schemaName?: StringFieldUpdateOperationsInput | string
    type?: EnumTypeEtablissementFieldUpdateOperationsInput | $Enums.TypeEtablissement
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    pays?: StringFieldUpdateOperationsInput | string
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    siteWeb?: NullableStringFieldUpdateOperationsInput | string | null
    numeroAgrement?: NullableStringFieldUpdateOperationsInput | string | null
    devise?: StringFieldUpdateOperationsInput | string
    fuseauHoraire?: StringFieldUpdateOperationsInput | string
    formatDate?: StringFieldUpdateOperationsInput | string
    joursOuvrables?: EtablissementUpdatejoursOuvrablesInput | string[]
    heureDebut?: NullableStringFieldUpdateOperationsInput | string | null
    heureFin?: NullableStringFieldUpdateOperationsInput | string | null
    toleranceRetard?: IntFieldUpdateOperationsInput | number
    tauxHeureSup?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    estArchive?: BoolFieldUpdateOperationsInput | boolean
    planAbonnement?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateExpiration?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUtilisateurs?: IntFieldUpdateOperationsInput | number
    statutProvisionnement?: EnumStatutProvisionnementFieldUpdateOperationsInput | $Enums.StatutProvisionnement
    erreurProvisionnement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    abonnements?: AbonnementEtablissementUpdateManyWithoutEtablissementNestedInput
    factures?: FactureEtablissementUpdateManyWithoutEtablissementNestedInput
  }

  export type EtablissementUncheckedUpdateWithoutUtilisateursGlobauxInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    schemaName?: StringFieldUpdateOperationsInput | string
    type?: EnumTypeEtablissementFieldUpdateOperationsInput | $Enums.TypeEtablissement
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    pays?: StringFieldUpdateOperationsInput | string
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    siteWeb?: NullableStringFieldUpdateOperationsInput | string | null
    numeroAgrement?: NullableStringFieldUpdateOperationsInput | string | null
    devise?: StringFieldUpdateOperationsInput | string
    fuseauHoraire?: StringFieldUpdateOperationsInput | string
    formatDate?: StringFieldUpdateOperationsInput | string
    joursOuvrables?: EtablissementUpdatejoursOuvrablesInput | string[]
    heureDebut?: NullableStringFieldUpdateOperationsInput | string | null
    heureFin?: NullableStringFieldUpdateOperationsInput | string | null
    toleranceRetard?: IntFieldUpdateOperationsInput | number
    tauxHeureSup?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    estArchive?: BoolFieldUpdateOperationsInput | boolean
    planAbonnement?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateExpiration?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUtilisateurs?: IntFieldUpdateOperationsInput | number
    statutProvisionnement?: EnumStatutProvisionnementFieldUpdateOperationsInput | $Enums.StatutProvisionnement
    erreurProvisionnement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    abonnements?: AbonnementEtablissementUncheckedUpdateManyWithoutEtablissementNestedInput
    factures?: FactureEtablissementUncheckedUpdateManyWithoutEtablissementNestedInput
  }

  export type EtablissementCreateWithoutAbonnementsInput = {
    id?: string
    nom: string
    code: string
    schemaName: string
    type?: $Enums.TypeEtablissement
    logo?: string | null
    adresse?: string | null
    ville?: string | null
    pays?: string
    telephone?: string | null
    email?: string | null
    siteWeb?: string | null
    numeroAgrement?: string | null
    devise?: string
    fuseauHoraire?: string
    formatDate?: string
    joursOuvrables?: EtablissementCreatejoursOuvrablesInput | string[]
    heureDebut?: string | null
    heureFin?: string | null
    toleranceRetard?: number
    tauxHeureSup?: number
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: $Enums.PlanAbonnement
    dateExpiration?: Date | string | null
    maxUtilisateurs?: number
    statutProvisionnement?: $Enums.StatutProvisionnement
    erreurProvisionnement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    utilisateursGlobaux?: UtilisateurGlobalCreateNestedManyWithoutEtablissementInput
    factures?: FactureEtablissementCreateNestedManyWithoutEtablissementInput
  }

  export type EtablissementUncheckedCreateWithoutAbonnementsInput = {
    id?: string
    nom: string
    code: string
    schemaName: string
    type?: $Enums.TypeEtablissement
    logo?: string | null
    adresse?: string | null
    ville?: string | null
    pays?: string
    telephone?: string | null
    email?: string | null
    siteWeb?: string | null
    numeroAgrement?: string | null
    devise?: string
    fuseauHoraire?: string
    formatDate?: string
    joursOuvrables?: EtablissementCreatejoursOuvrablesInput | string[]
    heureDebut?: string | null
    heureFin?: string | null
    toleranceRetard?: number
    tauxHeureSup?: number
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: $Enums.PlanAbonnement
    dateExpiration?: Date | string | null
    maxUtilisateurs?: number
    statutProvisionnement?: $Enums.StatutProvisionnement
    erreurProvisionnement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    utilisateursGlobaux?: UtilisateurGlobalUncheckedCreateNestedManyWithoutEtablissementInput
    factures?: FactureEtablissementUncheckedCreateNestedManyWithoutEtablissementInput
  }

  export type EtablissementCreateOrConnectWithoutAbonnementsInput = {
    where: EtablissementWhereUniqueInput
    create: XOR<EtablissementCreateWithoutAbonnementsInput, EtablissementUncheckedCreateWithoutAbonnementsInput>
  }

  export type FactureEtablissementCreateWithoutAbonnementInput = {
    id?: string
    numeroFacture: string
    montant: number
    dateEmission?: Date | string
    dateEcheance: Date | string
    datePaiement?: Date | string | null
    statut?: $Enums.StatutFacture
    methodePaiement?: string | null
    referencePaiement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    etablissement: EtablissementCreateNestedOneWithoutFacturesInput
  }

  export type FactureEtablissementUncheckedCreateWithoutAbonnementInput = {
    id?: string
    etablissementId: string
    numeroFacture: string
    montant: number
    dateEmission?: Date | string
    dateEcheance: Date | string
    datePaiement?: Date | string | null
    statut?: $Enums.StatutFacture
    methodePaiement?: string | null
    referencePaiement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FactureEtablissementCreateOrConnectWithoutAbonnementInput = {
    where: FactureEtablissementWhereUniqueInput
    create: XOR<FactureEtablissementCreateWithoutAbonnementInput, FactureEtablissementUncheckedCreateWithoutAbonnementInput>
  }

  export type FactureEtablissementCreateManyAbonnementInputEnvelope = {
    data: FactureEtablissementCreateManyAbonnementInput | FactureEtablissementCreateManyAbonnementInput[]
    skipDuplicates?: boolean
  }

  export type EtablissementUpsertWithoutAbonnementsInput = {
    update: XOR<EtablissementUpdateWithoutAbonnementsInput, EtablissementUncheckedUpdateWithoutAbonnementsInput>
    create: XOR<EtablissementCreateWithoutAbonnementsInput, EtablissementUncheckedCreateWithoutAbonnementsInput>
    where?: EtablissementWhereInput
  }

  export type EtablissementUpdateToOneWithWhereWithoutAbonnementsInput = {
    where?: EtablissementWhereInput
    data: XOR<EtablissementUpdateWithoutAbonnementsInput, EtablissementUncheckedUpdateWithoutAbonnementsInput>
  }

  export type EtablissementUpdateWithoutAbonnementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    schemaName?: StringFieldUpdateOperationsInput | string
    type?: EnumTypeEtablissementFieldUpdateOperationsInput | $Enums.TypeEtablissement
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    pays?: StringFieldUpdateOperationsInput | string
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    siteWeb?: NullableStringFieldUpdateOperationsInput | string | null
    numeroAgrement?: NullableStringFieldUpdateOperationsInput | string | null
    devise?: StringFieldUpdateOperationsInput | string
    fuseauHoraire?: StringFieldUpdateOperationsInput | string
    formatDate?: StringFieldUpdateOperationsInput | string
    joursOuvrables?: EtablissementUpdatejoursOuvrablesInput | string[]
    heureDebut?: NullableStringFieldUpdateOperationsInput | string | null
    heureFin?: NullableStringFieldUpdateOperationsInput | string | null
    toleranceRetard?: IntFieldUpdateOperationsInput | number
    tauxHeureSup?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    estArchive?: BoolFieldUpdateOperationsInput | boolean
    planAbonnement?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateExpiration?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUtilisateurs?: IntFieldUpdateOperationsInput | number
    statutProvisionnement?: EnumStatutProvisionnementFieldUpdateOperationsInput | $Enums.StatutProvisionnement
    erreurProvisionnement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    utilisateursGlobaux?: UtilisateurGlobalUpdateManyWithoutEtablissementNestedInput
    factures?: FactureEtablissementUpdateManyWithoutEtablissementNestedInput
  }

  export type EtablissementUncheckedUpdateWithoutAbonnementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    schemaName?: StringFieldUpdateOperationsInput | string
    type?: EnumTypeEtablissementFieldUpdateOperationsInput | $Enums.TypeEtablissement
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    pays?: StringFieldUpdateOperationsInput | string
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    siteWeb?: NullableStringFieldUpdateOperationsInput | string | null
    numeroAgrement?: NullableStringFieldUpdateOperationsInput | string | null
    devise?: StringFieldUpdateOperationsInput | string
    fuseauHoraire?: StringFieldUpdateOperationsInput | string
    formatDate?: StringFieldUpdateOperationsInput | string
    joursOuvrables?: EtablissementUpdatejoursOuvrablesInput | string[]
    heureDebut?: NullableStringFieldUpdateOperationsInput | string | null
    heureFin?: NullableStringFieldUpdateOperationsInput | string | null
    toleranceRetard?: IntFieldUpdateOperationsInput | number
    tauxHeureSup?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    estArchive?: BoolFieldUpdateOperationsInput | boolean
    planAbonnement?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateExpiration?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUtilisateurs?: IntFieldUpdateOperationsInput | number
    statutProvisionnement?: EnumStatutProvisionnementFieldUpdateOperationsInput | $Enums.StatutProvisionnement
    erreurProvisionnement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    utilisateursGlobaux?: UtilisateurGlobalUncheckedUpdateManyWithoutEtablissementNestedInput
    factures?: FactureEtablissementUncheckedUpdateManyWithoutEtablissementNestedInput
  }

  export type FactureEtablissementUpsertWithWhereUniqueWithoutAbonnementInput = {
    where: FactureEtablissementWhereUniqueInput
    update: XOR<FactureEtablissementUpdateWithoutAbonnementInput, FactureEtablissementUncheckedUpdateWithoutAbonnementInput>
    create: XOR<FactureEtablissementCreateWithoutAbonnementInput, FactureEtablissementUncheckedCreateWithoutAbonnementInput>
  }

  export type FactureEtablissementUpdateWithWhereUniqueWithoutAbonnementInput = {
    where: FactureEtablissementWhereUniqueInput
    data: XOR<FactureEtablissementUpdateWithoutAbonnementInput, FactureEtablissementUncheckedUpdateWithoutAbonnementInput>
  }

  export type FactureEtablissementUpdateManyWithWhereWithoutAbonnementInput = {
    where: FactureEtablissementScalarWhereInput
    data: XOR<FactureEtablissementUpdateManyMutationInput, FactureEtablissementUncheckedUpdateManyWithoutAbonnementInput>
  }

  export type EtablissementCreateWithoutFacturesInput = {
    id?: string
    nom: string
    code: string
    schemaName: string
    type?: $Enums.TypeEtablissement
    logo?: string | null
    adresse?: string | null
    ville?: string | null
    pays?: string
    telephone?: string | null
    email?: string | null
    siteWeb?: string | null
    numeroAgrement?: string | null
    devise?: string
    fuseauHoraire?: string
    formatDate?: string
    joursOuvrables?: EtablissementCreatejoursOuvrablesInput | string[]
    heureDebut?: string | null
    heureFin?: string | null
    toleranceRetard?: number
    tauxHeureSup?: number
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: $Enums.PlanAbonnement
    dateExpiration?: Date | string | null
    maxUtilisateurs?: number
    statutProvisionnement?: $Enums.StatutProvisionnement
    erreurProvisionnement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    utilisateursGlobaux?: UtilisateurGlobalCreateNestedManyWithoutEtablissementInput
    abonnements?: AbonnementEtablissementCreateNestedManyWithoutEtablissementInput
  }

  export type EtablissementUncheckedCreateWithoutFacturesInput = {
    id?: string
    nom: string
    code: string
    schemaName: string
    type?: $Enums.TypeEtablissement
    logo?: string | null
    adresse?: string | null
    ville?: string | null
    pays?: string
    telephone?: string | null
    email?: string | null
    siteWeb?: string | null
    numeroAgrement?: string | null
    devise?: string
    fuseauHoraire?: string
    formatDate?: string
    joursOuvrables?: EtablissementCreatejoursOuvrablesInput | string[]
    heureDebut?: string | null
    heureFin?: string | null
    toleranceRetard?: number
    tauxHeureSup?: number
    estActif?: boolean
    estArchive?: boolean
    planAbonnement?: $Enums.PlanAbonnement
    dateExpiration?: Date | string | null
    maxUtilisateurs?: number
    statutProvisionnement?: $Enums.StatutProvisionnement
    erreurProvisionnement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    utilisateursGlobaux?: UtilisateurGlobalUncheckedCreateNestedManyWithoutEtablissementInput
    abonnements?: AbonnementEtablissementUncheckedCreateNestedManyWithoutEtablissementInput
  }

  export type EtablissementCreateOrConnectWithoutFacturesInput = {
    where: EtablissementWhereUniqueInput
    create: XOR<EtablissementCreateWithoutFacturesInput, EtablissementUncheckedCreateWithoutFacturesInput>
  }

  export type AbonnementEtablissementCreateWithoutFacturesInput = {
    id?: string
    plan: $Enums.PlanAbonnement
    dateDebut: Date | string
    dateFin: Date | string
    montantMensuel: number
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    etablissement: EtablissementCreateNestedOneWithoutAbonnementsInput
  }

  export type AbonnementEtablissementUncheckedCreateWithoutFacturesInput = {
    id?: string
    etablissementId: string
    plan: $Enums.PlanAbonnement
    dateDebut: Date | string
    dateFin: Date | string
    montantMensuel: number
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AbonnementEtablissementCreateOrConnectWithoutFacturesInput = {
    where: AbonnementEtablissementWhereUniqueInput
    create: XOR<AbonnementEtablissementCreateWithoutFacturesInput, AbonnementEtablissementUncheckedCreateWithoutFacturesInput>
  }

  export type EtablissementUpsertWithoutFacturesInput = {
    update: XOR<EtablissementUpdateWithoutFacturesInput, EtablissementUncheckedUpdateWithoutFacturesInput>
    create: XOR<EtablissementCreateWithoutFacturesInput, EtablissementUncheckedCreateWithoutFacturesInput>
    where?: EtablissementWhereInput
  }

  export type EtablissementUpdateToOneWithWhereWithoutFacturesInput = {
    where?: EtablissementWhereInput
    data: XOR<EtablissementUpdateWithoutFacturesInput, EtablissementUncheckedUpdateWithoutFacturesInput>
  }

  export type EtablissementUpdateWithoutFacturesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    schemaName?: StringFieldUpdateOperationsInput | string
    type?: EnumTypeEtablissementFieldUpdateOperationsInput | $Enums.TypeEtablissement
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    pays?: StringFieldUpdateOperationsInput | string
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    siteWeb?: NullableStringFieldUpdateOperationsInput | string | null
    numeroAgrement?: NullableStringFieldUpdateOperationsInput | string | null
    devise?: StringFieldUpdateOperationsInput | string
    fuseauHoraire?: StringFieldUpdateOperationsInput | string
    formatDate?: StringFieldUpdateOperationsInput | string
    joursOuvrables?: EtablissementUpdatejoursOuvrablesInput | string[]
    heureDebut?: NullableStringFieldUpdateOperationsInput | string | null
    heureFin?: NullableStringFieldUpdateOperationsInput | string | null
    toleranceRetard?: IntFieldUpdateOperationsInput | number
    tauxHeureSup?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    estArchive?: BoolFieldUpdateOperationsInput | boolean
    planAbonnement?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateExpiration?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUtilisateurs?: IntFieldUpdateOperationsInput | number
    statutProvisionnement?: EnumStatutProvisionnementFieldUpdateOperationsInput | $Enums.StatutProvisionnement
    erreurProvisionnement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    utilisateursGlobaux?: UtilisateurGlobalUpdateManyWithoutEtablissementNestedInput
    abonnements?: AbonnementEtablissementUpdateManyWithoutEtablissementNestedInput
  }

  export type EtablissementUncheckedUpdateWithoutFacturesInput = {
    id?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    schemaName?: StringFieldUpdateOperationsInput | string
    type?: EnumTypeEtablissementFieldUpdateOperationsInput | $Enums.TypeEtablissement
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    adresse?: NullableStringFieldUpdateOperationsInput | string | null
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    pays?: StringFieldUpdateOperationsInput | string
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    siteWeb?: NullableStringFieldUpdateOperationsInput | string | null
    numeroAgrement?: NullableStringFieldUpdateOperationsInput | string | null
    devise?: StringFieldUpdateOperationsInput | string
    fuseauHoraire?: StringFieldUpdateOperationsInput | string
    formatDate?: StringFieldUpdateOperationsInput | string
    joursOuvrables?: EtablissementUpdatejoursOuvrablesInput | string[]
    heureDebut?: NullableStringFieldUpdateOperationsInput | string | null
    heureFin?: NullableStringFieldUpdateOperationsInput | string | null
    toleranceRetard?: IntFieldUpdateOperationsInput | number
    tauxHeureSup?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    estArchive?: BoolFieldUpdateOperationsInput | boolean
    planAbonnement?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateExpiration?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    maxUtilisateurs?: IntFieldUpdateOperationsInput | number
    statutProvisionnement?: EnumStatutProvisionnementFieldUpdateOperationsInput | $Enums.StatutProvisionnement
    erreurProvisionnement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    utilisateursGlobaux?: UtilisateurGlobalUncheckedUpdateManyWithoutEtablissementNestedInput
    abonnements?: AbonnementEtablissementUncheckedUpdateManyWithoutEtablissementNestedInput
  }

  export type AbonnementEtablissementUpsertWithoutFacturesInput = {
    update: XOR<AbonnementEtablissementUpdateWithoutFacturesInput, AbonnementEtablissementUncheckedUpdateWithoutFacturesInput>
    create: XOR<AbonnementEtablissementCreateWithoutFacturesInput, AbonnementEtablissementUncheckedCreateWithoutFacturesInput>
    where?: AbonnementEtablissementWhereInput
  }

  export type AbonnementEtablissementUpdateToOneWithWhereWithoutFacturesInput = {
    where?: AbonnementEtablissementWhereInput
    data: XOR<AbonnementEtablissementUpdateWithoutFacturesInput, AbonnementEtablissementUncheckedUpdateWithoutFacturesInput>
  }

  export type AbonnementEtablissementUpdateWithoutFacturesInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateDebut?: DateTimeFieldUpdateOperationsInput | Date | string
    dateFin?: DateTimeFieldUpdateOperationsInput | Date | string
    montantMensuel?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    renouvellementAuto?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    etablissement?: EtablissementUpdateOneRequiredWithoutAbonnementsNestedInput
  }

  export type AbonnementEtablissementUncheckedUpdateWithoutFacturesInput = {
    id?: StringFieldUpdateOperationsInput | string
    etablissementId?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateDebut?: DateTimeFieldUpdateOperationsInput | Date | string
    dateFin?: DateTimeFieldUpdateOperationsInput | Date | string
    montantMensuel?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    renouvellementAuto?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UtilisateurGlobalCreateManyEtablissementInput = {
    id?: string
    email: string
    motDePasse: string
    prenom: string
    nom: string
    role?: $Enums.RoleGlobal
    estActif?: boolean
    emailVerifie?: boolean
    telephone?: string | null
    photoProfil?: string | null
    derniereConnexion?: Date | string | null
    jetonActualisation?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AbonnementEtablissementCreateManyEtablissementInput = {
    id?: string
    plan: $Enums.PlanAbonnement
    dateDebut: Date | string
    dateFin: Date | string
    montantMensuel: number
    estActif?: boolean
    renouvellementAuto?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FactureEtablissementCreateManyEtablissementInput = {
    id?: string
    abonnementId?: string | null
    numeroFacture: string
    montant: number
    dateEmission?: Date | string
    dateEcheance: Date | string
    datePaiement?: Date | string | null
    statut?: $Enums.StatutFacture
    methodePaiement?: string | null
    referencePaiement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UtilisateurGlobalUpdateWithoutEtablissementInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    motDePasse?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleGlobalFieldUpdateOperationsInput | $Enums.RoleGlobal
    estActif?: BoolFieldUpdateOperationsInput | boolean
    emailVerifie?: BoolFieldUpdateOperationsInput | boolean
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    photoProfil?: NullableStringFieldUpdateOperationsInput | string | null
    derniereConnexion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jetonActualisation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UtilisateurGlobalUncheckedUpdateWithoutEtablissementInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    motDePasse?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleGlobalFieldUpdateOperationsInput | $Enums.RoleGlobal
    estActif?: BoolFieldUpdateOperationsInput | boolean
    emailVerifie?: BoolFieldUpdateOperationsInput | boolean
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    photoProfil?: NullableStringFieldUpdateOperationsInput | string | null
    derniereConnexion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jetonActualisation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UtilisateurGlobalUncheckedUpdateManyWithoutEtablissementInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    motDePasse?: StringFieldUpdateOperationsInput | string
    prenom?: StringFieldUpdateOperationsInput | string
    nom?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleGlobalFieldUpdateOperationsInput | $Enums.RoleGlobal
    estActif?: BoolFieldUpdateOperationsInput | boolean
    emailVerifie?: BoolFieldUpdateOperationsInput | boolean
    telephone?: NullableStringFieldUpdateOperationsInput | string | null
    photoProfil?: NullableStringFieldUpdateOperationsInput | string | null
    derniereConnexion?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    jetonActualisation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AbonnementEtablissementUpdateWithoutEtablissementInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateDebut?: DateTimeFieldUpdateOperationsInput | Date | string
    dateFin?: DateTimeFieldUpdateOperationsInput | Date | string
    montantMensuel?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    renouvellementAuto?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    factures?: FactureEtablissementUpdateManyWithoutAbonnementNestedInput
  }

  export type AbonnementEtablissementUncheckedUpdateWithoutEtablissementInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateDebut?: DateTimeFieldUpdateOperationsInput | Date | string
    dateFin?: DateTimeFieldUpdateOperationsInput | Date | string
    montantMensuel?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    renouvellementAuto?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    factures?: FactureEtablissementUncheckedUpdateManyWithoutAbonnementNestedInput
  }

  export type AbonnementEtablissementUncheckedUpdateManyWithoutEtablissementInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: EnumPlanAbonnementFieldUpdateOperationsInput | $Enums.PlanAbonnement
    dateDebut?: DateTimeFieldUpdateOperationsInput | Date | string
    dateFin?: DateTimeFieldUpdateOperationsInput | Date | string
    montantMensuel?: FloatFieldUpdateOperationsInput | number
    estActif?: BoolFieldUpdateOperationsInput | boolean
    renouvellementAuto?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FactureEtablissementUpdateWithoutEtablissementInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFacture?: StringFieldUpdateOperationsInput | string
    montant?: FloatFieldUpdateOperationsInput | number
    dateEmission?: DateTimeFieldUpdateOperationsInput | Date | string
    dateEcheance?: DateTimeFieldUpdateOperationsInput | Date | string
    datePaiement?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statut?: EnumStatutFactureFieldUpdateOperationsInput | $Enums.StatutFacture
    methodePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    referencePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    abonnement?: AbonnementEtablissementUpdateOneWithoutFacturesNestedInput
  }

  export type FactureEtablissementUncheckedUpdateWithoutEtablissementInput = {
    id?: StringFieldUpdateOperationsInput | string
    abonnementId?: NullableStringFieldUpdateOperationsInput | string | null
    numeroFacture?: StringFieldUpdateOperationsInput | string
    montant?: FloatFieldUpdateOperationsInput | number
    dateEmission?: DateTimeFieldUpdateOperationsInput | Date | string
    dateEcheance?: DateTimeFieldUpdateOperationsInput | Date | string
    datePaiement?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statut?: EnumStatutFactureFieldUpdateOperationsInput | $Enums.StatutFacture
    methodePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    referencePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FactureEtablissementUncheckedUpdateManyWithoutEtablissementInput = {
    id?: StringFieldUpdateOperationsInput | string
    abonnementId?: NullableStringFieldUpdateOperationsInput | string | null
    numeroFacture?: StringFieldUpdateOperationsInput | string
    montant?: FloatFieldUpdateOperationsInput | number
    dateEmission?: DateTimeFieldUpdateOperationsInput | Date | string
    dateEcheance?: DateTimeFieldUpdateOperationsInput | Date | string
    datePaiement?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statut?: EnumStatutFactureFieldUpdateOperationsInput | $Enums.StatutFacture
    methodePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    referencePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FactureEtablissementCreateManyAbonnementInput = {
    id?: string
    etablissementId: string
    numeroFacture: string
    montant: number
    dateEmission?: Date | string
    dateEcheance: Date | string
    datePaiement?: Date | string | null
    statut?: $Enums.StatutFacture
    methodePaiement?: string | null
    referencePaiement?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FactureEtablissementUpdateWithoutAbonnementInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFacture?: StringFieldUpdateOperationsInput | string
    montant?: FloatFieldUpdateOperationsInput | number
    dateEmission?: DateTimeFieldUpdateOperationsInput | Date | string
    dateEcheance?: DateTimeFieldUpdateOperationsInput | Date | string
    datePaiement?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statut?: EnumStatutFactureFieldUpdateOperationsInput | $Enums.StatutFacture
    methodePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    referencePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    etablissement?: EtablissementUpdateOneRequiredWithoutFacturesNestedInput
  }

  export type FactureEtablissementUncheckedUpdateWithoutAbonnementInput = {
    id?: StringFieldUpdateOperationsInput | string
    etablissementId?: StringFieldUpdateOperationsInput | string
    numeroFacture?: StringFieldUpdateOperationsInput | string
    montant?: FloatFieldUpdateOperationsInput | number
    dateEmission?: DateTimeFieldUpdateOperationsInput | Date | string
    dateEcheance?: DateTimeFieldUpdateOperationsInput | Date | string
    datePaiement?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statut?: EnumStatutFactureFieldUpdateOperationsInput | $Enums.StatutFacture
    methodePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    referencePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FactureEtablissementUncheckedUpdateManyWithoutAbonnementInput = {
    id?: StringFieldUpdateOperationsInput | string
    etablissementId?: StringFieldUpdateOperationsInput | string
    numeroFacture?: StringFieldUpdateOperationsInput | string
    montant?: FloatFieldUpdateOperationsInput | number
    dateEmission?: DateTimeFieldUpdateOperationsInput | Date | string
    dateEcheance?: DateTimeFieldUpdateOperationsInput | Date | string
    datePaiement?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    statut?: EnumStatutFactureFieldUpdateOperationsInput | $Enums.StatutFacture
    methodePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    referencePaiement?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}