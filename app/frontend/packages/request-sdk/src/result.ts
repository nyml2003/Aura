/**
 * Result 类型：函数式错误处理，不抛错，由上层根据 ok/error 展示 Message。
 */

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function Ok<T, E>(value: T): Result<T, E> {
  return { ok: true, value };
}

export function Err<T, E>(error: E): Result<T, E> {
  return { ok: false, error };
}

export function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
  return r.ok === true;
}

export function isErr<T, E>(r: Result<T, E>): r is { ok: false; error: E } {
  return r.ok === false;
}
