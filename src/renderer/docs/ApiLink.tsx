import type { RefObject } from 'react';
import type HelpModal from '../modal/HelpModal.tsx';
import './ApiLink.css';

export type DocsRef = RefObject<{[key: string]: HTMLElement}>;

/**
 * Links to a section of the student API documentation, opening the help window or just jumping to
 * the appropriate section if the window is already open. The single text node child of this
 * component is used as the link text.
 * @param props
 * @param props.dest - the section of the docs to jump to. For the format, see {@link HelpModal}.
 * @param props.code - whether to display the link text in a monospaced font.
 * @param props.docsRef - a ref to a dictionary of doc section names to elements, populated by
 * {@link HelpModal}.
 */
export default function ApiLink({
  dest,
  code = false,
  onShowHelpModal,
  docsRef,
  children,
}: {
  dest: string;
  code?: boolean;
  onShowHelpModal: () => void;
  docsRef: DocsRef;
  children: string;
}) {
  const onClick = () => {
    onShowHelpModal();
    // Deferring feels wrong but it works:
    setTimeout(() => docsRef.current?.[dest]?.scrollIntoView(), 0);
  };
  return (
    <button onClick={onClick} type="button" className="ApiLink">
      {code ? <code>{children}</code> : children}
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
