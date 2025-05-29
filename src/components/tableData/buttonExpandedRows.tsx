import { Button, TableCell } from '@skripsi/components';

export const ButtonExpandedRows = ({
  id,
  label,

  handleOpen,
}: {
  id: string;
  label: string;
  handleOpen: (id: string) => void;
}) => {
  return (
    <TableCell>
      <div className="flex justify-center items-center w-full">
        <Button
          variant="outline"
          onClick={() => handleOpen(id)}
          className="w-8 h-8 rounded-full"
        >
          {label}
        </Button>
      </div>
    </TableCell>
  );
};
