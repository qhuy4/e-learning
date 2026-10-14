import {
  IsString,
  Matches,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'resetPasswordMatches', async: false })
class ResetPasswordMatchesConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    return value === (args.object as ResetPasswordDto).password;
  }

  defaultMessage(): string {
    return 'Confirm password must match password';
  }
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
  password: string;

  @IsString()
  @Validate(ResetPasswordMatchesConstraint)
  confirmPassword: string;
}
