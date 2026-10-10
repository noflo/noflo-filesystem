declare module "mimetype" {
  export function lookup(path: string): string | null;
  export function set(ext: string, mime: string): void;
}
