import 'sequelize';

declare module 'sequelize' {
  interface Model<TModelAttributes extends {} = any, TCreationAttributes extends {} = any> {
    readonly createdAt: Date;
    readonly updatedAt: Date;
  }

  interface ModelStatic<M extends Model> {
    init<M extends Model = Model>(
      this: ModelStatic<M>,
      attributes: ModelAttributes<M, any>,
      options: InitOptions<M>
    ): void;
  }
}

export {};
