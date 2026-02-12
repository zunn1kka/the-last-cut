import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UpdatePasswordDto } from 'src/user/dto/update-password.dto';

@ValidatorConstraint({ name: 'IsChangePasswordsMatching', async: false })
export class IsChangePasswordsMatchingConstraint implements ValidatorConstraintInterface {
  public validate(confirmPassword: string, args: ValidationArguments) {
    const obj = args.object as UpdatePasswordDto;
    return obj.newPassword === confirmPassword;
  }
  public defaultMessage(args: ValidationArguments) {
    return 'Пароли не совпадают';
  }
}
