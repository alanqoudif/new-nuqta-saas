import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FiExternalLink } from 'react-icons/fi';

interface ExternalServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  serviceUrl: string;
  onConfirm: () => void;
}

const ExternalServiceModal: React.FC<ExternalServiceModalProps> = ({
  isOpen,
  onClose,
  serviceName,
  serviceUrl,
  onConfirm
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="توجيه إلى خدمة خارجية"
    >
      <div className="mb-6">
        <p className="mb-4">
          سيتم توجيهك إلى خدمة <strong>{serviceName}</strong> الخارجية.
        </p>
        <p className="text-gray-400 mb-4">
          الرابط: <span className="text-primary-400">{serviceUrl}</span>
        </p>
        <p className="text-yellow-500 text-sm">
          ملاحظة: هذه الخدمة تعمل خارج موقع نقطة للذكاء الاصطناعي.
        </p>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={onClose}
        >
          إلغاء
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          className="flex items-center"
        >
          <FiExternalLink className="ml-2" /> متابعة
        </Button>
      </div>
    </Modal>
  );
};

export default ExternalServiceModal; 