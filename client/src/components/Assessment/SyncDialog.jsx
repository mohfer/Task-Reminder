import { SiakangSyncDialog } from '@/components/shared/SiakangSyncDialog';

export const SyncDialog = (props) => (
    <SiakangSyncDialog
        {...props}
        title="Sync Grades from Siakang"
        description={`Scores will be saved into ${props.targetSemester}. Choose which Siakang semester to pull from.`}
    />
);
