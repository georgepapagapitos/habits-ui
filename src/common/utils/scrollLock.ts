// Store the original body overflow style to restore it later
let originalOverflow: string | null = null;
let originalPosition: string | null = null;
let originalTop: string | null = null;
let scrollY: number = 0;

export const lockScroll = (): void => {
  // Remember the current scroll position
  scrollY = window.scrollY;

  // Save original styles before modifying them
  originalOverflow = document.body.style.overflow;
  originalPosition = document.body.style.position;
  originalTop = document.body.style.top;

  // Lock the scroll by setting overflow to hidden
  // and fixing the position to prevent scroll underneath
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
};

export const unlockScroll = (): void => {
  // Restore original styles
  document.body.style.overflow = originalOverflow || "";
  document.body.style.position = originalPosition || "";
  document.body.style.top = originalTop || "";
  document.body.style.width = "";

  // Restore scroll position
  window.scrollTo(0, scrollY);
};
