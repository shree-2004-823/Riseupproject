import {
  CravingOutcome,
  ChallengeType,
  EnergyLevel,
  HabitCategory,
  HabitDifficulty,
  MoodLabel,
  PlannerMode,
  PlannerPeriod,
  QuoteCategory,
  TaskStatus,
} from '@prisma/client';
import { HttpError } from './http.js';

function normalizeEnumInput(value: string) {
  return value.trim().replace(/[\s-]+/g, '_').toUpperCase();
}

function parseEnumValue<T extends Record<string, string>>(
  value: string,
  enumObject: T,
  fieldName: string,
) {
  const normalized = normalizeEnumInput(value);

  if (!(normalized in enumObject)) {
    throw new HttpError(400, `Invalid ${fieldName}`);
  }

  return enumObject[normalized as keyof T];
}

export function parseHabitCategory(value: string) {
  return parseEnumValue(value, HabitCategory, 'habit category');
}

export function parseHabitDifficulty(value?: string | null) {
  if (!value) {
    return HabitDifficulty.MEDIUM;
  }

  return parseEnumValue(value, HabitDifficulty, 'habit difficulty');
}

export function parseMoodLabel(value: string) {
  return parseEnumValue(value, MoodLabel, 'mood');
}

export function parsePlannerMode(value?: string | null) {
  if (!value) {
    return PlannerMode.NORMAL;
  }

  return parseEnumValue(value, PlannerMode, 'planner mode');
}

export function parsePlannerPeriod(value: string) {
  return parseEnumValue(value, PlannerPeriod, 'planner period');
}

export function parseEnergyLevel(value?: string | null) {
  if (!value) {
    return EnergyLevel.MEDIUM;
  }

  return parseEnumValue(value, EnergyLevel, 'energy level');
}

export function parseTaskStatus(value?: string | null) {
  if (!value) {
    return TaskStatus.PENDING;
  }

  return parseEnumValue(value, TaskStatus, 'task status');
}

export function parseCravingOutcome(value?: string | null, resisted?: boolean | null) {
  if (value) {
    return parseEnumValue(value, CravingOutcome, 'craving outcome');
  }

  if (resisted === false) {
    return CravingOutcome.RELAPSED;
  }

  return CravingOutcome.RESISTED;
}

export function formatHabitCategory(value: HabitCategory) {
  return value.toLowerCase();
}

export function formatHabitDifficulty(value: HabitDifficulty) {
  return value.toLowerCase();
}

export function formatMoodLabel(value: MoodLabel) {
  return value.toLowerCase();
}

export function formatPlannerMode(value: PlannerMode) {
  return value.toLowerCase().replace('_', '-');
}

export function formatPlannerPeriod(value: PlannerPeriod) {
  return value.toLowerCase();
}

export function formatEnergyLevel(value: EnergyLevel) {
  return value.toLowerCase();
}

export function formatTaskStatus(value: TaskStatus) {
  return value.toLowerCase();
}

export function formatCravingOutcome(value: CravingOutcome) {
  return value.toLowerCase();
}

export function formatQuoteCategory(value: QuoteCategory) {
  return value.toLowerCase();
}

export function formatChallengeType(value: ChallengeType) {
  return value.toLowerCase();
}
