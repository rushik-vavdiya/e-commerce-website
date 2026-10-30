// The centered column every storefront band sits in: one max-width and one set
// of side paddings, so two sections on the same page cannot drift out of line.
// Pass `as` when the wrapper should be a semantic element (section, nav, …).
export default function Container({
  as: Element = 'div',
  className = '',
  children,
  ...props
}) {
  return (
    <Element
      className={[
        'mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Element>
  );
}
