import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { Settings as SettingsComponent } from '../../components/Settings/Settings';
import BottomBar from '../../components/BottomBar/BottomBar';

const Settings = () => {
    return (
        <>
            <div className="flex h-screen">
                <Sidebar className="flex-shrink-0 h-full" />
                <div className="flex flex-col flex-grow overflow-hidden">
                    <Header title="Settings" />
                    <div className="flex-grow p-4 bg-gray-100 overflow-y-auto pb-28 lg:pb-0">
                        <SettingsComponent />
                    </div>
                </div>
            </div>
            <BottomBar />
        </>
    );
};

export default Settings;
