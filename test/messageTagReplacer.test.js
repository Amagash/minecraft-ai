import { replaceMessageTag } from '../api.js';

describe('replaceMessageTag', () => {
  test('replaces [[MESSAGE]] tag with the provided message', () => {
    const result = replaceMessageTag("<message>[[MESSAGE]]</message>", "Hello, world!");
    expect(result).toBe("<message>Hello, world!</message>");
  });

  test('replaces [[MESSAGE]] tag within a longer string', () => {
    const result = replaceMessageTag("This is a test [[MESSAGE]] string.", "with a message");
    expect(result).toBe("This is a test with a message string.");
  });

  test('does not modify the string if no [[MESSAGE]] tag is present', () => {
    const result = replaceMessageTag("No message tag present", "This should not replace anything");
    expect(result).toBe("No message tag present");
  });
});
