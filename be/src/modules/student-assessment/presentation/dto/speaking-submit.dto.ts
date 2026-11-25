import { Type } from 'class-transformer';
import { IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class SpeakingSubmitDto {
  @IsString()
  @MaxLength(40)
  promptId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(120)
  durationSeconds: number;
}
