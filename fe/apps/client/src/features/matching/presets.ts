import type { TranslationKey } from "@/i18n/translations";

/** Preset writing samples from skill.html mockup. */
export interface WritingPreset {
    id: number;
    labelKey: TranslationKey;
    text: string;
}

export const WRITING_PRESETS: WritingPreset[] = [
    {
        id: 1,
        labelKey: "match.preset.1",
        text: "I need to prepare for my IELTS Speaking test next month. Although my vocabulary is wide enough for casual discussions, I freeze when answering abstract questions in Part 3. I want to build reflex and natural phrasing under exam pressure.",
    },
    {
        id: 2,
        labelKey: "match.preset.2",
        text: "I can understand English quite well when watching movies or reading tech documentation, but I really struggle with speaking fluently in spontaneous team meetings. Whenever I need to explain complex system architectures, my mind goes blank searching for transition words, and I tend to make repeated grammar errors with past conditionals and prepositions. My goal is to reach solid CEFR B2+ in 3 months.",
    },
    {
        id: 3,
        labelKey: "match.preset.3",
        text: "My main problem is sentence complexity. I always use basic subject-verb sentences because I am terrified of making grammatical mistakes when attempting inversion, passive voice, or mixed conditionals in presentations.",
    },
];
