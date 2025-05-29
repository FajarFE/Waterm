export const TipBox = ({
  children,
  type = 'tip',
}: {
  children: React.ReactNode;
  type: 'tip' | 'warning' | 'note' | string;
}) => {
  const isWarning = type === 'warning';
  const isNote = type === 'note';

  return (
    <div
      className={`my-4 p-4 rounded-lg flex items-start gap-3 ${
        isWarning
          ? 'bg-amber-50 border border-amber-200'
          : isNote
          ? 'bg-gray-50 border border-gray-200'
          : 'bg-blue-50 border border-blue-200'
      }`}
    >
      <div
        className={`mt-1 ${
          isWarning
            ? 'text-amber-500'
            : isNote
            ? 'text-gray-500'
            : 'text-blue-500'
        }`}
      >
        {isWarning ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        ) : isNote ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8h.01"></path>
            <path d="M12 12h.01"></path>
            <path d="M12 16h.01"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        )}
      </div>
      <div className="flex-1">
        <p
          className={`font-medium ${
            isWarning
              ? 'text-amber-800'
              : isNote
              ? 'text-gray-800'
              : 'text-blue-800'
          }`}
        >
          {isWarning ? 'Perhatian' : isNote ? 'Catatan' : 'Tips'}
        </p>
        <div
          className={`text-sm ${
            isWarning
              ? 'text-amber-700'
              : isNote
              ? 'text-gray-700'
              : 'text-blue-700'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
