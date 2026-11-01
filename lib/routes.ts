/**
 * The site's branches. One list feeds the header, the home page's relay,
 * and the relay at the foot of every branch, so a page can never be added
 * to one of them and forgotten in the others.
 */
import { projectCounts } from "@/lib/profile";

export type Branch = {
  href: string;
  nav: string;
  title: string;
  body: string;
};

export const branches: Branch[] = [
  {
    href: "/intelli-factory/",
    nav: "Intelli-Factory",
    title: "Intelli-Factory, in depth",
    body: "The algorithm, the 3,600-run benchmark, the Pareto front, and the production architecture.",
  },
  {
    href: "/projects/",
    nav: "Projects",
    title: `All ${projectCounts.total} projects`,
    body: `${projectCounts.live} you can open and try, and ${projectCounts.rest} with source or a walkthrough on request.`,
  },
  {
    href: "/experience/",
    nav: "Experience",
    title: "Experience and credentials",
    body: "Roles and internships, verified certificates, and the full skills matrix.",
  },
];
