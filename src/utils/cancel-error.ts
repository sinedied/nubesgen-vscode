export class CancelError extends Error {
  constructor(text?: string) {
    super(text);
  }
}
