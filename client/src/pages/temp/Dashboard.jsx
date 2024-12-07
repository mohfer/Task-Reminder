import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { Dashboard as DashboardComponent } from '../../components/Dashboard/Dashboard';
import BottomBar from '../../components/BottomBar/BottomBar';

const Dashboard = () => {
    return (
        <>
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex flex-col flex-grow overflow-hidden">
                    <Header title="Dashboard" />
                    <div className="flex-grow p-4 bg-gray-100 overflow-y-auto pb-28 lg:pb-0">
                        <DashboardComponent />
                    </div>
                </div>
            </div>
            <BottomBar />
        </>
    );
};

export default Dashboard;
