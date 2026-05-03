import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ButtonActionsProps = {
  downloadDocument: () => void;
  deleteDocument: () => void;
};

export default function ButtonActions({
  downloadDocument,
  deleteDocument,
}: ButtonActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" className="flex-1" onClick={downloadDocument}>
        <Download className="size-4" />
        Descargar
      </Button>
      <Button variant="outline" onClick={deleteDocument}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
