import { router, type Href } from 'expo-router';

const MAIN_PATHS = ['/home', '/records', '/orders', '/lab', '/profile'] as const;
export type MainPath = (typeof MAIN_PATHS)[number];

export const isMainPath = (path: string): path is MainPath =>
  (MAIN_PATHS as readonly string[]).includes(path.split('?')[0] ?? '');

// Goes to a main page from a sub page and clears the sub pages, so Back never returns to them.
export function goToMain(path: MainPath = '/home') {
  if (router.canDismiss()) router.dismissAll();
  router.navigate(path);
}

// Same, then opens a sub page on top of the main page, for "do it again" buttons.
export function restartAt(path: Href) {
  goToMain('/home');
  setTimeout(() => router.push(path), 0);
}

// Opens any path: main pages clear the stack, sub pages open normally.
export function openPath(path: string) {
  if (isMainPath(path)) goToMain(path);
  else router.navigate(path as Href);
}
