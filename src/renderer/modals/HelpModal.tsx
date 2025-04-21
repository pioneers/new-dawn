import Modal from './Modal';
import type { DocsRef } from '../docs/ApiLink';
import apiDocs from '../docs/apiDocs';
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
  return (
    <Modal modalTitle="Help" className="HelpModal" onClose={onClose} isActive={isActive}>
      {Object.entries(apiDocs).toSorted().map(([k, v]) => (
        <div className="HelpModal-doc-section" key={k}>
          <h1 className="HelpModal-doc-title" ref={(elem) => docsRef.current[k] = elem}>
            {v.title}
          </h1>
          {v.component(() => {}, docsRef)}
        </div>
      ))}
    </Modal>
  );
}
