import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDictationCommand } from '../command/update-dictation.command';
import { Inject, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { IDictationRepository, DICTATION_REPOSITORY } from '../../domain/repository/dictation.repository';
import { IDictationSentenceRepository, DICTATION_SENTENCE_REPOSITORY } from '../../domain/repository/dictation-sentence.repository';
import { Dictation } from '../../domain/entity/dictation.entity';
import { DictationSentenceInput } from '../dictation-input.interface';
import { FILE_STORAGE, FileStorage } from '@/common/storage/domain/interface/file-storage.interface';
import { extname } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/x-m4a',
  'audio/mp4',
];
const MAX_AUDIO_SIZE = 50 * 1024 * 1024;

@CommandHandler(UpdateDictationCommand)
export class UpdateDictationHandler implements ICommandHandler<UpdateDictationCommand> {
  constructor(
    @Inject(DICTATION_REPOSITORY) private dictRepo: IDictationRepository,
    @Inject(DICTATION_SENTENCE_REPOSITORY) private sentenceRepo: IDictationSentenceRepository,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
  ) {}

  async execute(command: UpdateDictationCommand) {
    const { id, userId, dto, audio } = command;

    const dict = await this.dictRepo.findById(Number(id));
    if (!dict) throw new NotFoundException();
    if (dict.createdBy !== userId) throw new UnauthorizedException();

    let audioUrl = dto.audioUrl ?? dict.audioUrl;
    let oldAudioKey: string | null = null;

    if (audio) {
      if (!ALLOWED_AUDIO_TYPES.includes(audio.mimetype)) {
        throw new BadRequestException('Loại file audio không hợp lệ. Chỉ chấp nhận MP3, WAV, OGG, WebM, M4A.');
      }
      if (audio.size > MAX_AUDIO_SIZE) {
        throw new BadRequestException('Dung lượng file audio vượt quá 50MB.');
      }

      const extension = extname(audio.originalname).toLowerCase() || '.mp3';
      const key = `dictations/audio/${randomUUID()}${extension}`;
      await this.storage.upload({
        key,
        body: audio.buffer,
        contentType: audio.mimetype,
        contentLength: audio.size,
      });
      audioUrl = this.storage.getPublicUrl(key) ?? key;

      if (dict.audioUrl) {
        oldAudioKey = this.extractStorageKey(dict.audioUrl);
      }
    }

    this.validateSentences(dto.sentences);

    const updateData: Partial<Dictation> = {
      title: dto.title ?? dict.title,
      description: dto.description ?? dict.description,
      audioUrl,
      level: dto.level ?? dict.level,
      playLimit: dto.playLimit !== undefined ? dto.playLimit : dict.playLimit,
    };

    await this.dictRepo.update(Number(id), updateData);

    if (oldAudioKey) {
      this.storage.delete(oldAudioKey).catch(() => {});
    }

    if (dto.sentences) {
      await this.sentenceRepo.deleteAllByDictationId(Number(id));
      const sentences = dto.sentences.map((s, i) => ({
        sentence: s.sentence,
        startTime: s.startTime,
        endTime: s.endTime,
        position: s.position ?? i + 1,
        hint: s.hint || null,
        dictationId: id,
      }));
      await this.sentenceRepo.saveAll(sentences);
    }

    return { success: true };
  }

  private validateSentences(sentences: DictationSentenceInput[] | undefined) {
    if (!sentences || !Array.isArray(sentences)) return;
    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i];
      if (!s.sentence || !s.sentence.trim()) {
        throw new BadRequestException(`Câu thứ ${i + 1}: nội dung không được để trống.`);
      }
      if (typeof s.startTime !== 'number' || typeof s.endTime !== 'number') {
        throw new BadRequestException(`Câu thứ ${i + 1}: startTime và endTime phải là số.`);
      }
      if (s.startTime >= s.endTime) {
        throw new BadRequestException(`Câu thứ ${i + 1}: startTime phải nhỏ hơn endTime.`);
      }
    }
  }

  private extractStorageKey(audioUrl: string): string | null {
    const match = audioUrl.match(/\/storage\/(.+)$/);
    return match ? match[1] : null;
  }
}
