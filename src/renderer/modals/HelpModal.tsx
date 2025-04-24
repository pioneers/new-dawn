import { useMemo } from 'react';
import Modal from './Modal';
import ApiLink, { ApiLinkContext, DocsRef } from '../docs/ApiLink';
import apiDocs, { ApiDoc } from '../docs/apiDocs';
import './HelpModal.css';

/**
 * Modal component displaying help for Dawn and the robot API.
 * @param props
 * @param props.onClose - handler called when the modal is closed by any means
 * @param props.isActive - whether to display the modal
 */
export default function HelpModal({
  onClose,
  isActive,
  docsRef,
}: {
  onClose: () => void;
  isActive: boolean;
  docsRef: DocsRef;
}) {
  docsRef.current ??= {};
  const apiLinkCtx = useMemo(
    () => ({ onShowHelpModal: () => {}, docsRef }),
    [docsRef],
  );
  return (
    <Modal
      modalTitle="Help"
      className="HelpModal"
      onClose={onClose}
      isActive={isActive}
    >
      <ApiLinkContext.Provider value={apiLinkCtx}>
        <h1 className="HelpModal-doc-title">Table of Contents</h1>
        <ul className="HelpModal-toc">
          {Object.entries(apiDocs)
            .toSorted()
            .map(([k, v]: [string, ApiDoc]) => (
              <li key={k}>
                <ApiLink dest={k}>{v.title}</ApiLink>
              </li>
            ))}
        </ul>
        {Object.entries(apiDocs)
          .toSorted()
          .map(([k, v]: [string, ApiDoc]) => (
            <div className="HelpModal-doc-section" key={k}>
              <h1
                className="HelpModal-doc-title"
                ref={(elem) => {
                  if (elem) {
                    docsRef.current![k] = elem;
                  }
                }}
              >
                {v.title}
              </h1>
              {v.body()}
            </div>
          ))}
      </ApiLinkContext.Provider>
    </Modal>
  );
}
