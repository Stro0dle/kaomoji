export function insertIntoChat(text) {
  const chat = document.querySelector('textarea#InputChat');
  if (!chat || chat.disabled || chat.readOnly) return 'no-chat';

  const start = chat.selectionStart;
  const end = chat.selectionEnd;
  const nextLength = chat.value.length - (end - start) + text.length;
  if (chat.maxLength >= 0 && nextLength > chat.maxLength) return 'too-long';

  chat.setRangeText(text, start, end, 'end');
  chat.dispatchEvent(new Event('input', { bubbles: true }));
  chat.focus({ preventScroll: true });
  return 'ok';
}
