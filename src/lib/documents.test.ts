import { describe, expect, it } from 'vitest';
import { emptyEditorContent, textToEditorContent } from './documents';

describe('documents content helpers', () => {
  it('emptyEditorContent returns valid TipTap JSON', () => {
    const parsed = JSON.parse(emptyEditorContent());
    expect(parsed.type).toBe('doc');
    expect(Array.isArray(parsed.content)).toBe(true);
  });

  it('textToEditorContent splits lines into paragraphs', () => {
    const parsed = JSON.parse(textToEditorContent('Hello\nWorld'));
    expect(parsed.content).toHaveLength(2);
    expect(parsed.content[0].content[0].text).toBe('Hello');
    expect(parsed.content[1].content[0].text).toBe('World');
  });
});
