
const cardVariants = {
  default: "border border-slate-200 bg-white shadow-sm",
  elevated: "border border-slate-100 bg-white shadow-md",
  outlined: "border border-slate-300 bg-transparent",
};

export default function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  as: Element = "div",
  ...props
}) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <Element
      className={[
        "rounded-2xl",
        cardVariants[variant] ?? cardVariants.default,
        paddings[padding] ?? paddings.md,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Element>
  );
}
