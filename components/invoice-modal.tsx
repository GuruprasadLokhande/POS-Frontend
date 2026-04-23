interface InvoiceModalProps {
  onClose: () => void;
}

export default function InvoiceModal({ onClose }: InvoiceModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Invoice</h2>
        <p>Invoice details here...</p>
        <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2">
          Close
        </button>
      </div>
    </div>
  );
}