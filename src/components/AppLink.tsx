import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

type Params = Record<string, string | number>;

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  params?: Params;
  activeOptions?: { exact?: boolean };
  activeProps?: { className?: string };
  children: ReactNode;
};

export function buildPath(to: string, params?: Params) {
  let path = to;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`$${key}`, encodeURIComponent(String(value)));
    }
  }
  return path.replace(/\/$/, "") || "/";
}

export function navigateTo(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Link({
  to,
  params,
  activeOptions,
  activeProps,
  className,
  onClick,
  children,
  ...props
}: LinkProps) {
  const href = buildPath(to, params);
  const exact = activeOptions?.exact ?? false;
  const isActive =
    typeof window !== "undefined" &&
    (exact ? window.location.pathname === href : window.location.pathname.startsWith(href));
  const resolvedClassName = [className, isActive ? activeProps?.className : ""]
    .filter(Boolean)
    .join(" ");

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      props.target
    ) {
      return;
    }
    event.preventDefault();
    navigateTo(href);
  }

  return (
    <a href={href} className={resolvedClassName} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
