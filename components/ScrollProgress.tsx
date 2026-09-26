/**
 * Travel indicator seated in the header's lower edge.
 *
 * Pure CSS now: a scaleX animation on the root scroll timeline (see
 * `.scroll-progress` in globals.css). The previous version was a client
 * component with a scroll listener, a ResizeObserver, and a per-frame read
 * of scrollHeight, and it was one of the last two things doing main-thread
 * work on every scroll frame. The timeline tracks document height by itself,
 * so none of that machinery is needed.
 *
 * Where scroll timelines are unsupported the bar is simply not shown; it is
 * supplementary to the header, the depth gauge and the scrollbar.
 */
export default function ScrollProgress() {
  return <div aria-hidden="true" data-print="hide" className="scroll-progress" />;
}
