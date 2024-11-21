import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { CourseContent as CourseContentComponent } from '../../components/CourseContent/CourseContent';

const CourseContent = () => {
    return (
        <div className="flex h-screen">
            <Sidebar className="flex-shrink-0 h-full" />
            <div className="flex flex-col flex-grow overflow-hidden">
                <Header title="Course Content" />
                <div className="flex-grow p-4 bg-gray-100 overflow-y-auto">
                    <CourseContentComponent />
                </div>
            </div>
        </div>
    );
};

export default CourseContent;
