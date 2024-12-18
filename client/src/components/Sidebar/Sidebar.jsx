import { LayoutDashboard, Settings, Book, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useToaster, Message } from 'rsuite';
import axios from 'axios';

const Sidebar = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const toaster = useToaster();
    const token = localStorage.getItem('token');

    const handleLogout = async () => {
        try {
            const response = await axios.post(`${apiUrl}/auth/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            );

            toaster.push(
                <Message showIcon type="success" closable>
                    {response.data.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable>
                    {error.response?.data?.message || 'Failed to logout. Please try again.'}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
            console.error(error);
        } finally {
            localStorage.clear();
            sessionStorage.clear();

            navigate('/auth/login');
        }
    };

    return (
        <>
            <nav className="hidden lg:flex w-1/6 flex-col justify-between">
                <div>
                    <h1 className="text-2xl text-center py-8 font-bold">Task Reminder</h1>
                    <div className="flex justify-center">
                        <ul className="w-4/5">
                            <li className="p-2 rounded-lg">
                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 text-gray-500 ${isActive ? 'bg-blue-100 rounded-lg p-2 text-primary-color' : ''}`
                                    }
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                    Dashboard
                                </NavLink>
                            </li>
                            <li className="p-2 rounded-lg">
                                <NavLink
                                    to="/course-contents"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 text-gray-500 ${isActive ? 'bg-blue-100 rounded-lg p-2 text-primary-color' : ''}`
                                    }
                                >
                                    <Book className="w-5 h-5" />
                                    Course Content
                                </NavLink>
                            </li>
                            <li className="p-2 rounded-lg">
                                <NavLink
                                    to="/settings"
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 text-gray-500 ${isActive ? 'bg-blue-100 rounded-lg p-2 text-primary-color' : ''}`
                                    }
                                >
                                    <Settings className="w-5 h-5" />
                                    Settings
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className='flex justify-center'>
                    <div className="p-4 w-4/5">
                        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 my-8"><LogOut className="w-5 h-5 text-red-500" />Logout</button>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Sidebar