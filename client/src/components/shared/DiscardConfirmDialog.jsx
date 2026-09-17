import { memo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const DiscardConfirmDialog = memo(({ open, onOpenChange, onConfirm }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discard changes?</DialogTitle>
                    <DialogDescription>You have unsaved changes. Discard them?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Keep editing
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Discard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

DiscardConfirmDialog.displayName = 'DiscardConfirmDialog';
