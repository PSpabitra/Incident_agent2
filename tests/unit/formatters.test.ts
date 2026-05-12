import { describe, it, expect } from 'vitest';
import { formatDuration, formatPercent, initialsOf, truncate } from '@/utils/formatters';

describe('formatters', () => {
  it('formatDuration formats seconds, minutes, hours', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(120)).toBe('2m');
    expect(formatDuration(3700)).toBe('1h 1m');
  });

  it('formatPercent multiplies and formats', () => {
    expect(formatPercent(0.5)).toBe('50.0%');
    expect(formatPercent(0.987, 0)).toBe('99%');
  });

  it('initialsOf takes first char of first 2 words', () => {
    expect(initialsOf('Jane Doe')).toBe('JD');
    expect(initialsOf('System')).toBe('S');
  });

  it('truncate appends ellipsis when over limit', () => {
    expect(truncate('hello world', 5)).toBe('hell…');
    expect(truncate('hi', 5)).toBe('hi');
  });
});
