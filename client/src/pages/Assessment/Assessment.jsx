import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { Assessment as AssessmentComponent } from '../../components/Assessment/Assessment';
import BottomBar from '../../components/BottomBar/BottomBar';

const Assessment = () => {
    return (
        <>
            <div className="flex h-screen">
                <Sidebar className="flex-shrink-0 h-full" />
                <div className="flex flex-col flex-grow overflow-hidden">
                    <Header title="Assessment" />
                    <div className="flex-grow p-4 bg-gray-100 overflow-y-auto pb-28 lg:pb-0">
                        <AssessmentComponent />
                    </div>
                </div>
            </div>
            <BottomBar />
        </>
    );
};

export default Assessment;
