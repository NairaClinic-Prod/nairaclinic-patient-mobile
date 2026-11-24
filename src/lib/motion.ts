import { FadeIn, FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated';

// One set of motion values for the whole app: critically damped, so lists glide into place without bouncing.
export const LIST_LAYOUT = LinearTransition.springify()
  .damping(36)
  .stiffness(220)
  .overshootClamping(1)
  .reduceMotion(ReduceMotion.System);

export const ITEM_ENTER = FadeIn.duration(220).reduceMotion(ReduceMotion.System);

export const ITEM_EXIT = FadeOut.duration(160).reduceMotion(ReduceMotion.System);
