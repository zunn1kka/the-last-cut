import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RegisterDto } from 'src/auth/dto/register.dto';

@ValidatorConstraint({ name: 'IsPasswordsMatchingRegister', async: false })
export class IsPasswordsMatchingRegisterConstraint implements ValidatorConstraintInterface {
  public validate(confirmPassword: string, args: ValidationArguments) {
    const obj = args.object as RegisterDto;
    return obj.password === confirmPassword;
  }
  public defaultMessage(args: ValidationArguments) {
    return 'Пароли не совпадают';
  }
}
