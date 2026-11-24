export const FONT_FILES = {
  PlusJakartaSans_400Regular: require('@assets/fonts/PlusJakartaSans_400Regular.ttf'),
  PlusJakartaSans_500Medium: require('@assets/fonts/PlusJakartaSans_500Medium.ttf'),
  PlusJakartaSans_600SemiBold: require('@assets/fonts/PlusJakartaSans_600SemiBold.ttf'),
  PlusJakartaSans_700Bold: require('@assets/fonts/PlusJakartaSans_700Bold.ttf'),
  PlusJakartaSans_800ExtraBold: require('@assets/fonts/PlusJakartaSans_800ExtraBold.ttf'),
};

export const FONT = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

// Custom fonts have one file per weight, so the weight class picks the family.
export function fontForClass(className: string) {
  if (/(^|\s)font-(extrabold|black)(\s|$)/.test(className)) return FONT.extrabold;
  if (/(^|\s)font-bold(\s|$)/.test(className)) return FONT.bold;
  if (/(^|\s)font-semibold(\s|$)/.test(className)) return FONT.semibold;
  if (/(^|\s)font-medium(\s|$)/.test(className)) return FONT.medium;
  return FONT.regular;
}
