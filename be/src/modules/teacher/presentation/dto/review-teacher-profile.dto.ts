import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from '../../domain/enum/approval-status.enum';

export class ReviewTeacherProfileDto {
  @IsEnum(ApprovalStatus, {
    message: 'Trạng thái duyệt phải là APPROVED (2) hoặc REJECTED (3)',
  })
  status: ApprovalStatus;

  @IsString()
  @IsOptional()
  rejectReason?: string;
}
