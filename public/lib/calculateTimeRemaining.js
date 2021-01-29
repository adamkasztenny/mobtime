export const calculateTimeRemaining = props => {
  if (!props.timerStartedAt) {
    return props.timerDuration;
  }

  const elapsed = props.currentTime - props.timerStartedAt;
  return props.timerDuration > 0
    ? Math.max(0, props.timerDuration - elapsed)
    : 0;
};

// HACK - remove this shameless copypasta
export const calculateBreakTimeRemaining = props => {
  if (!props.breakStartedAt) {
    return props.breakDuration;
  }

  const elapsed = props.currentTime - props.breakDuration;
  return props.breakDuration > 0
    ? Math.max(0, props.breakDuration - elapsed)
    : 0;
};
