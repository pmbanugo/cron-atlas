import { NavLink } from "@remix-run/react";
import { twMerge } from "tailwind-merge";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={twMerge("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <NavLink
        to={"/"}
        className={({ isActive }) =>
          twMerge("font-medium transition-colors hover:text-primary")
        }
      >
        Home
      </NavLink>
    </nav>
  );
}
