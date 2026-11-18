import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDictationCommand } from '../command/create-dictation.command';
import { Inject, BadRequestException } from '@nestjs/common';
import { IDictationRepository, DICTATION_REPOSITORY } from '../../domain/repository/dictation.repository';
import { IDictationSentenceRepository, DICTATION_SENTENCE_REPOSITORY } from '../../domain/repository/dictation-sentence.repository';
import { DictationSentenceInput } from '../dictation-input.interface';
import { Dictation } from '../../domain/entity/dictation.entity';
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
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

@CommandHandler(CreateDictationCommand)
export class CreateDictationHandler implements ICommandHandler<CreateDictationCommand> {
  constructor(
    @Inject(DICTATION_REPOSITORY) private dictRepo: IDictationRepository,
    @Inject(DICTATION_SENTENCE_REPOSITORY) private sentenceRepo: IDictationSentenceRepository,
    @Inject(FILE_STORAGE) private readonly storage: FileStorage,
  ) {}

  async execute(command: CreateDictationCommand) {
    const { dto, createdBy, audio } = command;

    let audioUrl = dto.audioUrl || '';

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
    }

    if (!audioUrl) {
      throw new BadRequestException('Vui lòng tải lên file audio.');
    }

    this.validateSentences(dto.sentences);

    const dict = Dictation.create({
      title: dto.title,
      description: dto.description || null,
      audioUrl,
      level: dto.level || 'BEGINNER',
      playLimit: dto.playLimit ?? null,
      createdBy,
    });
    const saved = await this.dictRepo.create(dict);

    if (dto.sentences && dto.sentences.length > 0) {
      const sentences = dto.sentences.map((s, i) => ({
        sentence: s.sentence,
        startTime: s.startTime,
        endTime: s.endTime,
        position: s.position ?? i + 1,
        hint: s.hint || null,
        dictationId: saved.id,
      }));
      await this.sentenceRepo.saveAll(sentences);
    }

    return saved;
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
}
