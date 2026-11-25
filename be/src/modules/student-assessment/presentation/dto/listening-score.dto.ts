import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ListeningResponseDto {
  @IsString()
  @MaxLength(32)
  itemId: string;

  @IsInt()
  @Min(0)
  @Max(3)
  optionIndex: number;
}

export class ListeningScoreDto {
  @IsString()
  @MaxLength(40)
  version: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ListeningResponseDto)
  responses: ListeningResponseDto[];
}
