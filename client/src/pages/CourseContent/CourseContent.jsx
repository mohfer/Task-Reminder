import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { CourseContent as CourseContentComponent } from '../../components/CourseContent/CourseContent';
import BottomBar from '../../components/BottomBar/BottomBar';

const CourseContent = () => {
    return (
        <>
            <div className="flex h-screen">
                <Sidebar className="flex-shrink-0 h-full" />
                <div className="flex flex-col flex-grow overflow-hidden">
                    <Header title="Course Content" />
                    <div className="flex-grow p-4 bg-gray-100 overflow-y-auto pb-28 lg:pb-0">
                        <CourseContentComponent />
                    </div>
                </div>
            </div>
            <BottomBar />
        </>
    );
};

export default CourseContent;
