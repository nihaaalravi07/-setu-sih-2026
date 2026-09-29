export default function Card({ as: Tag = 'div', interactive = false, className = '', children, ...rest }) {
  return (
    <Tag
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-[var(--r-md)] ${
        interactive ? 'transition-colors duration-150 ease-out hover:border-[var(--border-strong)]' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
