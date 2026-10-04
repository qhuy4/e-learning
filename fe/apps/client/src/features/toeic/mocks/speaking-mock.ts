import type { SpeakingGroup, SpeakingTask } from "../types";

/**
 * TOEIC Speaking test structure (ETS): 11 tasks in five task types, ~20 minutes.
 * UI-only mock content — prompts are illustrative, no audio/recording backend.
 */
export const SPEAKING_GROUPS: SpeakingGroup[] = [
  { key: "read-aloud", label: "Read a Text Aloud", from: 1, to: 2 },
  { key: "describe-picture", label: "Describe a Picture", from: 3, to: 4 },
  { key: "respond", label: "Respond to Questions", from: 5, to: 7 },
  { key: "info-response", label: "Respond Using Information", from: 8, to: 10 },
  { key: "opinion", label: "Express an Opinion", from: 11, to: 11 },
];

export const SPEAKING_GROUP_LABEL: Record<string, string> = Object.fromEntries(
  SPEAKING_GROUPS.map((g) => [g.key, g.label]),
);

export const SPEAKING_TASKS: SpeakingTask[] = [
  {
    id: 1,
    kind: "read-aloud",
    group: "Read a Text Aloud",
    prompt:
      "Look at the text on your screen. You will have 45 seconds to prepare, then 45 seconds to read it aloud.",
    text: "Attention, all staff: the quarterly planning meeting has been moved to Conference Room B on Thursday at 10 a.m. Please bring your department reports and arrive five minutes early. Contact the front desk if you have any questions.",
    prepSec: 45,
    responseSec: 45,
  },
  {
    id: 2,
    kind: "read-aloud",
    group: "Read a Text Aloud",
    prompt:
      "Look at the memo on your screen. You will have 45 seconds to prepare, then 45 seconds to read it aloud.",
    text: "Memorandum: Effective next Monday, the west parking lot will be closed for resurfacing. Employees who normally park there should use the visitor lot near the main entrance. The work is expected to take three days.",
    prepSec: 45,
    responseSec: 45,
  },
  {
    id: 3,
    kind: "describe-picture",
    group: "Describe a Picture",
    prompt:
      "Look at the picture. Describe the picture and talk about what is happening. You will have 30 seconds to prepare, then 45 seconds to respond.",
    imageHint: "Picture: four colleagues sitting around a table in a meeting room, one presenting a chart on a screen",
    text: "Describe the scene: who is in the picture, what they are doing, and where it is taking place.",
    prepSec: 30,
    responseSec: 45,
  },
  {
    id: 4,
    kind: "describe-picture",
    group: "Describe a Picture",
    prompt:
      "Look at the picture. Describe the picture and talk about what is happening. You will have 30 seconds to prepare, then 45 seconds to respond.",
    imageHint: "Picture: a customer speaking with a receptionist at a hotel front desk, luggage trolley nearby",
    text: "Describe the setting, the people, and what is likely happening in the picture.",
    prepSec: 30,
    responseSec: 45,
  },
  {
    id: 5,
    kind: "respond",
    group: "Respond to Questions",
    prompt: "You will have 10 seconds to prepare, then 30 seconds to answer the question.",
    text: "What do you usually do during your lunch break at work?",
    prepSec: 10,
    responseSec: 30,
  },
  {
    id: 6,
    kind: "respond",
    group: "Respond to Questions",
    prompt: "You will have 10 seconds to prepare, then 30 seconds to answer the question.",
    text: "What kinds of projects do you enjoy working on the most? Why?",
    prepSec: 10,
    responseSec: 30,
  },
  {
    id: 7,
    kind: "respond",
    group: "Respond to Questions",
    prompt: "You will have 10 seconds to prepare, then 30 seconds to answer the question.",
    text: "How do you usually get to work, and would you like to change the way you travel?",
    prepSec: 10,
    responseSec: 30,
  },
  {
    id: 8,
    kind: "info-response",
    group: "Respond Using Information",
    prompt:
      "Read the information below. You will have 30 seconds to prepare, then 60 seconds to respond to the question using the information.",
    info: ["Meeting room: R-204", "Available: 2:00 p.m. – 4:00 p.m.", "Projector: yes", "Seats: 12"],
    text: "A coworker asks you to book a room for a four-person team meeting in the afternoon. Respond to the caller.",
    prepSec: 30,
    responseSec: 60,
  },
  {
    id: 9,
    kind: "info-response",
    group: "Respond Using Information",
    prompt:
      "Read the information below. You will have 30 seconds to prepare, then 60 seconds to respond to the question using the information.",
    info: ["Project deadline: Friday, Nov 14", "Current status: 70% complete", "Delay risk: shipping approval", "Team: 3 members"],
    text: "Your manager asks about the status of the report. Give an update using the notes.",
    prepSec: 30,
    responseSec: 60,
  },
  {
    id: 10,
    kind: "info-response",
    group: "Respond Using Information",
    prompt:
      "Read the information below. You will have 30 seconds to prepare, then 60 seconds to respond to the question using the information.",
    info: ["Order #48-2210", "Placed: Monday", "Status: delayed in transit", "New arrival: Wednesday", "Refund: available on request"],
    text: "A customer calls about a late order. Explain the situation and offer a solution.",
    prepSec: 30,
    responseSec: 60,
  },
  {
    id: 11,
    kind: "opinion",
    group: "Express an Opinion",
    prompt:
      "You will have 30 seconds to prepare, then 60 seconds to give your opinion on the topic below.",
    text: "Some companies allow employees to work from home three days a week. Do you think this is a good idea? Explain your reasons.",
    prepSec: 30,
    responseSec: 60,
  },
];

/** Every task marked as recorded — used by the demo result page. */
export const PRESET_SPEAKING: Record<number, boolean> = Object.fromEntries(
  SPEAKING_TASKS.map((t) => [t.id, true]),
);
