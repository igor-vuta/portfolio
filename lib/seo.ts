/**
 * The link-preview image, declared once and used by every page.
 *
 * Declared rather than using Next's opengraph-image file convention for two
 * reasons, both of which broke previews silently:
 *  - The file convention's URL already carries the base path, and the
 *    layout's metadataBase (…/portfolio) prepends it again, producing
 *    /portfolio/portfolio/… : a 404 in every preview.
 *  - A page that sets its own `openGraph` replaces the layout's object
 *    wholesale, image included. Each page spreads this in explicitly.
 *
 * The path is relative to metadataBase, which already ends in /portfolio.
 */
export const ogImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Igor Vuta, Software Developer: a tablet running Intelli-Factory floating on dark water beside the headline 'Software that ships, with numbers to prove it.'",
};
