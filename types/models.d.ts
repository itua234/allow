import { Sequelize, Model } from 'sequelize';
import { AppAttributes } from '@models/app';

export type AppModelStatic = typeof Model & {
  new (values?: object, options?: object): AppAttributes;
  associate: (models: { Company: any }) => void;
};