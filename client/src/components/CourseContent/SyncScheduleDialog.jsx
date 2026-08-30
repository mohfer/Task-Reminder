import { SiakangSyncDialog } from '@/components/shared/SiakangSyncDialog';

export const SyncScheduleDialog = (props) => (
    <SiakangSyncDialog
        {...props}
        title="Sync Schedule from Siakang"
        description={`The schedule will be imported into ${props.targetSemester}. Choose which Siakang semester to pull from.`}
    />
);
