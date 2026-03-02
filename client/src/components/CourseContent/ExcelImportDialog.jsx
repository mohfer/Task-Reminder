import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const ExcelImportDialog = ({
    open,
    onOpenChange,
    isLoading,
    onDownloadTemplate,
    onImport,
}) => {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [isProcessingImport, setIsProcessingImport] = useState(false);

    const closeDialog = (nextOpen) => {
        if (!nextOpen) {
            setFile(null);
            setUploadProgress(null);
            setIsProcessingImport(false);
        }
        onOpenChange(nextOpen);
    };

    const handleImportSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            return;
        }

        setUploadProgress(0);
        setIsProcessingImport(false);

        const result = await onImport(file, (progressEvent) => {
            if (!progressEvent?.total) {
                return;
            }

            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
            if (percent === 100) {
                setIsProcessingImport(true);
            }
        });

        if (result.success) {
            closeDialog(false);
        }

        setIsProcessingImport(false);
    };

    return (
        <Dialog open={open} onOpenChange={closeDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Data From Excel</DialogTitle>
                    <DialogDescription>
                        Download the template, fill it, then upload the Excel file (.xlsx / .xls).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleImportSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">1. Download the template.</p>
                        <Button type="button" onClick={onDownloadTemplate} disabled={isLoading}>
                            Download Template
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">2. Upload the completed Excel file.</p>
                        <div className="relative cursor-pointer rounded-md border border-dashed p-4 text-center transition hover:bg-muted/50">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(event) => {
                                    const selected = event.target.files?.[0];
                                    setFile(selected || null);
                                    setUploadProgress(null);
                                    setIsProcessingImport(false);
                                }}
                                disabled={isLoading}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />

                            {file ? (
                                <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Click or drag a file here to select</p>
                            )}
                        </div>

                        {uploadProgress !== null ? (
                            <div className="space-y-2 pt-2">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Uploading: {uploadProgress}%</p>
                                    <Progress value={uploadProgress} />
                                </div>
                                {isProcessingImport ? (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Processing import...</p>
                                        <Progress value={100} />
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => closeDialog(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !file}>
                            {isLoading ? (isProcessingImport ? 'Processing...' : 'Uploading...') : 'Import'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
