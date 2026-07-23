const FLAGGED_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'cunt', 'dick', 'bastard',
  'slut', 'whore', 'piss', 'cock', 'porn', 'nsfw', 'nude', 'sex',
];

export function containsFlaggedWords(input: string): boolean {
  const lower = input.toLowerCase();
  return FLAGGED_WORDS.some(word => {
    const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return re.test(lower);
  });
}

export function getFlaggedWords(input: string): string[] {
  const lower = input.toLowerCase();
  return FLAGGED_WORDS.filter(word => {
    const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return re.test(lower);
  });
}

export const MAX_MESSAGE_LENGTH = 10000;
export const MAX_MESSAGE_ATTACHMENT_SIZE_MB = 50;
