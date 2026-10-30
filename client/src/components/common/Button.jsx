
import Spinner from "./Spinner";

const buttonVariants = {
  primary:
    "bg-[#7A2E1F] text-white hover:bg-[#C0563A] focus-visible:ring-[#C0563A]",

  secondary:
    "bg-[#FAD6C1] text-[#7A2E1F] hover:bg-[#F2C3A9] focus-visible:ring-[#C0563A]",

  outline:
    "border border-[#EBD5C9] bg-[#FFF6F1] text-[#7A2E1F] hover:border-[#C0563A] hover:bg-[#FAD6C1]/40 focus-visible:ring-[#C0563A]",

  ghost:
    "bg-transparent text-[#7A2E1F] hover:bg-[#FAD6C1]/50 focus-visible:ring-[#C0563A]",

  danger:
    "bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600",
};


const buttonSizes = {
  sm: "min-h-9 rounded-lg px-3 text-sm",
  md: "min-h-11 rounded-xl px-5 text-sm",
  lg: "min-h-12 rounded-full px-7 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-medium tracking-wide",
        "transition-all duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        buttonVariants[variant] ?? buttonVariants.primary,
        buttonSizes[size] ?? buttonSizes.md,
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && <Spinner size={16} />}

      {/* The label stays visible while the request runs, so the button still says
          what it is doing instead of swapping to a generic message. */}
      {children}
    </button>
  );
}