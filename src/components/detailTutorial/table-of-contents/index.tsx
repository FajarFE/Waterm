// Component for table of contents
export const TableOfContents = ({
  steps,
  activeStep,
  onClick,
  children,
}: {
  steps: {
    title: string;
  }[];
  activeStep: number;
  onClick: (index: number) => void;
  children?: React.ReactNode;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
      <h3 className="font-semibold text-gray-800 mb-3">Daftar Isi</h3>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => onClick(index)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              activeStep === index
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            {index + 1}. {step.title}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
};
