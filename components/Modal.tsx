
import React, { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="close-modal-btn absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-2xl font-bold mb-4 text-[#4A5568]">{title}</h3>
                <div className="modal-content text-gray-700 space-y-3 prose max-w-none" dangerouslySetInnerHTML={{ __html: children as string }}>
                </div>
            </div>
        </div>
    );
};

export default Modal;
