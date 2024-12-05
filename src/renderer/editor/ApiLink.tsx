import './ApiLink.css';

/**
 * Links to a section of the student API documentation, opening the help window or just jumping to
 * the appropriate section if the window is already open. The single text node child of this
 * component is used as the link text.
 * @param props
 * @param props.dest - the section of the docs to jump to. TODO: figure out format
 * @param props.code - whether to display the link text in a monospaced font.
 */
export default function ApiLink({
  dest,
  code = false,
  children,
}: {
  dest: string;
  code?: boolean;
  children: string;
}) {
  const text = `(${children})[${dest}]`;
  // Placeholder
  return (
    <button type="button" className="ApiLink">
      {code ? <code>{text}</code> : text}
    </button>
  );
}
/**
 * Default props for ApiLink.
 */
ApiLink.defaultProps = {
  /**
   * By default, link text is displayed in the inherited font.
   */
  code: false,
};
