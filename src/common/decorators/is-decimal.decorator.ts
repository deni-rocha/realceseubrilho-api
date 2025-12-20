// src/common/decorators/is-decimal.decorator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Decimal } from 'decimal.js';

export function IsDecimalString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDecimalString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          try {
            if (typeof value !== 'string') return false;
            const decimal = new Decimal(value);
            return decimal.isPositive() || decimal.isZero();
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser um valor decimal válido e não negativo`;
        },
      },
    });
  };
}
