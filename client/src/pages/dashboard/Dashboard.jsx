import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { Dashboard as DashboardComponent } from '../../components/Dashboard/Dashboard';

const Dashboard = () => {
    return (
        <div className="flex h-screen">
            <Sidebar className="flex-shrink-0 h-full" />
            <div className="flex flex-col flex-grow overflow-hidden">
                <Header title="Dashboard" />
                <div className="flex-grow p-4 bg-gray-100 overflow-y-auto">
                    <DashboardComponent />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;