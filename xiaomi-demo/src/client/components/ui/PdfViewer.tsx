'use client';

interface PdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  invoiceNo?: string;
}

export default function PdfViewer({ isOpen, onClose, pdfUrl, invoiceNo }: PdfViewerProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `invoice-${invoiceNo || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[95%] h-5/6 max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            PDF Preview {invoiceNo && `- ${invoiceNo}`}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#view=FitH&zoom=page-width`}
              className="w-full h-full border border-gray-200 rounded-lg"
              title={`PDF Preview - ${invoiceNo || 'Document'}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <i className="ri-file-pdf-line text-6xl mb-4 text-gray-300"></i>
                <p className="text-lg">PDF file not available</p>
                <p className="text-sm">No PDF file for this invoice</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}