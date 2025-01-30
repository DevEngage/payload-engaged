import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@radix-ui/react-alert-dialog";

import { cn } from "..";
import { AlertDialogFooter, AlertDialogHeader } from "../alert-dialog";

type ConfirmDialogProps = {
  title?: string;
  description?: string;
  isDestructive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
};

export default function ConfirmDialog({
  title = "Are you absolutely sure?",
  description = "This action cannot be undone.",
  isDestructive = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn({
              "text-red-500": isDestructive,
            })}
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
