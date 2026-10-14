/**
 * seed-content/ielts/speaking.ts — IELTS Academic Speaking (3 parts, 17 prompts).
 *
 * Every prompt is an AUDIO_RECORD question (the FE records the candidate's
 * voice; nothing is auto-graded). The explanation tells the student what a
 * Band 6-7 answer must contain.
 */
import { SeedGroup, note, openTask } from '../types';

export const IELTS_SPEAKING: SeedGroup[] = [
  {
    title: 'Speaking Part 1 - Introduction & Interview (10 questions)',
    groupType: 'CUSTOM',
    instructions:
      'Trả lời 10 câu hỏi cá nhân ngắn (2-3 câu mỗi câu, ~4-5 giây suy nghĩ). Tập trung vào: home/study/work, hobbies, thời tiết, giao thông.',
    questions: [
      openTask(
        'AUDIO_RECORD',
        'Do you live in a house or an apartment? Can you describe your home to me?',
        note(
          'Trả lời 2-3 câu: loại nhà + 1-2 chi tiết (số phòng, thích nhất điều gì). Ví dụ: "I live in a small apartment with my family. It is convenient because it is close to the city centre."',
          'apartment (n) - căn hộ',
          'Dễ',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'What do you like most about the area where you live?',
        note(
          'Nêu 1 lý do + ví dụ cụ thể (công viên, quán cà phê, bạn bè quanh đây). Tránh trả lời một từ.',
          'neighbourhood (n) - khu dân cư',
          'Dễ',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'Are you working or studying at the moment?',
        note(
          'Chọn một và mở rộng: "I am studying… I am in my third year of…" hoặc "I am working as…". Có thể nối sang lý do/đam mê.',
          'at the moment - vào lúc này',
          'Dễ',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'Why did you choose that field of study or that job?',
        note(
          'Lý do + liên hệ bản thân: interests, strengths, career plan. Dùng because/since/that is why.',
          'field of study (n) - lĩnh vực học tập',
          'Trung cấp',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'What is your typical day like on weekdays?',
        note(
          'Sắp xếp theo thứ tự thời gian (First…, Then…, After that…, Finally…) để phản xạ tự nhiên và liền mạch.',
          'on weekdays - vào các ngày trong tuần',
          'Dễ',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'Do you prefer to study in the morning or in the evening? Why?',
        note(
          'So sánh nhẹ nhàng + lý do: "I am a morning person because my mind is fresher…" Không cần dài.',
          'a morning person - người thích buổi sáng',
          'Dễ',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'How often do you use public transport?',
        note(
          'Dùng tần suất: every day / twice a week / rarely + 1 câu hoàn cảnh. Lưu ý cách phát âm "transport" (UK /ˈtrænspɔːt/).',
          'public transport - phương tiện công cộng',
          'Dễ',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'What kind of weather do you like best?',
        note(
          'Thời tiết + cảm xúc + hoạt động gắn liền: "I love mild weather because I can go for a walk after dinner."',
          'mild (adj) - ấm áp, dễ chịu',
          'Dễ',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'Did you enjoy your schooldays? Why or why not?',
        note(
          'Quá khứ đơn là trọng tâm: "I really enjoyed them because I had a close group of friends." 1 lý do + 1 ví dụ.',
          'schooldays (n) - những ngày đi học',
          'Trung cấp',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'Is there anything you would like to change about your daily routine?',
        note(
          'Thì hiện tại với "would like to": "I would like to wake up earlier so that I could exercise." Thể hiện được ao ước + lý do.',
          'routine (n) - thói quen hàng ngày',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Speaking Part 2 - Long Turn / Cue card (1 question, 1-2 minutes)',
    groupType: 'CUSTOM',
    instructions:
      'Bạn có 1 phút chuẩn bị (ghi chú vào giấy) và nói liên tục 1-2 phút. Phải nhắc TẤT CẢ các bullet trên thẻ bài.',
    materials: [
      {
        type: 'TEXT',
        title: 'Cue card',
        content:
          'Describe a place you like to visit.\n\n' +
          'You should say:\n' +
          '- where it is\n' +
          '- how often you go there\n' +
          '- what you do there\n' +
          '- and explain why you like visiting this place.\n\n' +
          'You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.',
      },
    ],
    questions: [
      openTask(
        'AUDIO_RECORD',
        'Describe a place you like to visit. Say where it is, how often you go there, what you do there, and explain why you like visiting this place.',
        note(
          'Cấu trúc 1-2 phút: mở đầu (The place I am going to describe is…), thân theo TỪNG bullet trên thẻ, phần quan trọng nhất là "explain why" (2-3 cảm xúc/lý do). Dùng ví dụ cụ thể thay vì chung chung; kết bằng cảm xúc hiện tại (I still go there whenever…).',
          'a peaceful place (n) - nơi yên tĩnh',
          'Khó',
        ),
      ),
    ],
  },
  {
    title: 'Speaking Part 3 - Discussion (6 questions, 4-5 minutes)',
    groupType: 'CUSTOM',
    instructions:
      'Trả lời các câu hỏi mở nâng cao liên quan chủ đề Part 2. Mỗi câu 4-6 câu: quan điểm -> lý do -> ví dụ -> so sánh.',
    questions: [
      openTask(
        'AUDIO_RECORD',
        'Why do some people prefer natural places to city attractions?',
        note(
          'So sánh 2 phía: thiên nhiên = không khí, yên tĩnh, "escape from the stress"; thành phố = tiện nghi, giải trí. Dùng "while / whereas" để bẻ cầu.',
          'escape from - thoát khỏi',
          'Trung cấp',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'Do you think more public parks should be built in cities? Why or why not?',
        note(
          'Quan điểm rõ ngay câu đầu (I firmly believe…) + 2 lợi ích (health, community) + điều kiện (land budget).',
          'public park (n) - công viên công cộng',
          'Trung cấp',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'How has the way people travel for leisure changed compared with 20 years ago?',
        note(
          'So sánh quá khứ-hiện tại: booking online, budget airlines, social media. Dùng "used to" và "nowadays".',
          'leisure (n) - giải trí, thời gian rảnh',
          'Khó',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'Should historical sites charge visitors an entrance fee? What are the advantages and disadvantages?',
        note(
          'Cân nhắc 2 mặt: bảo tồn + doanh thu (advantage) vs. giảm tiếp cận cho người nghèo (disadvantage) -> cân bằng bằng miễn phí ngày nào đó.',
          'historical site (n) - di tích lịch sử',
          'Khó',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'Some people say that children today do not spend enough time outdoors. Do you agree?',
        note(
          'Agree với dữ kiện: screen time tăng, vận động giảm -> ví dụ parks / organised sports. Sau đó nêu giải pháp nhẹ.',
          'outdoors (adv) - ngoài trời',
          'Trung cấp',
        ),
      ),
      openTask(
        'AUDIO_RECORD',
        'How might popular tourist destinations look different in the future?',
        note(
          'Dự báo bằng will / might / is likely to: overtourism controls, virtual tours, eco-tourism. Kết bằng câu tổng quan.',
          'tourist destination (n) - điểm đến du lịch',
          'Khó',
        ),
      ),
    ],
  },
];
