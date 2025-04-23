import { MutableRefObject, createContext, useContext } from 'react';
import type HelpModal from '../modals/HelpModal';
import './ApiLink.css';

export type DocsRef = MutableRefObject<{[key: string]: HTMLElement}>;
export const ApiLinkContext = createContext<{
  onShowHelpModal: null | (() => void);
  docsRef: null | DocsRef;
}>({
  onShowHelpModal: null,
  docsRef: null
});

/**
 * Links to a section of the student API documentation, opening the help window or just jumping to
 * the appropriate section if the window is already open. The single text node child of this
 * component is used as the link text.
 * @param props
 * @param props.dest - the section of the docs to jump to. For the format, see {@link HelpModal}.
 * @param props.code - (optional) whether to display the link text in a monospaced font.
 * @param props.docsRef - (optional) a ref to a dictionary of doc section names to elements,
 * populated by {@link HelpModal}.
 */
export default function ApiLink({
  dest,
  code = false,
  onShowHelpModal = null,
  docsRef = null,
  children,
}: {
  dest: string;
  code?: boolean;
  onShowHelpModal?: () => void;
  docsRef?: DocsRef;
  children: string;
}) {
  const ctx = useContext(ApiLinkContext);
  const onShowHelpModalVal = onShowHelpModal || ctx.onShowHelpModal;
  if (!onShowHelpModalVal) {
    throw new Error('onShowHelpModal is not provided as a prop or as context.');
  }
  const docsRefVal = docsRef || ctx.docsRef;
  if (!docsRefVal) {
    throw new Error('docsRef is not provided as a prop or as context');
  }
  const onClick = () => {
    onShowHelpModalVal();
    // setTimeout hack feels wrong but it works:
    setTimeout(() => docsRefVal.current?.[dest]?.scrollIntoView(), 0);
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
  /**
   * By default, the callback will be inherited from the closest {@link ApiLinkContext} provider.
   */
  onShowHelpModal: null,
  /**
   * By default, the ref will be inherited from the closest {@link ApiLinkContext} provider.
   */
  docsRef: null,
};
