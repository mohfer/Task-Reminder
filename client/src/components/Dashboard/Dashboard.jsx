import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, Ellipsis } from 'lucide-react';
import { Placeholder, Calendar, Badge, IconButton, Dropdown } from 'rsuite';
import PlusIcon from '@rsuite/icons/Plus';
import axios from 'axios';

export const Dashboard = () => {
    const apiUrl = import.meta.env.VITE_API_URL;

    const navigate = useNavigate();

    const [isHovered, setIsHovered] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDashboardData(response.data.data);
        } catch (err) {
            setError('Failed to fetch dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const tasks = dashboardData?.tasks;

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setSelectedMonth(date.getMonth());
        setSelectedYear(date.getFullYear());
    };

    const handlePanelChange = (date) => {
        setSelectedMonth(date.getMonth());
        setSelectedYear(date.getFullYear());
    };

    const filterTasksByMonth = (tasks, month, year) => {
        if (!tasks || month === null || year === null) return { completed: [], uncompleted: [] };

        const completedTasks = tasks.filter(task => {
            const taskDate = new Date(task.deadline);
            return task.status === 1 && taskDate.getMonth() === month && taskDate.getFullYear() === year;
        });

        const uncompletedTasks = tasks.filter(task => {
            const taskDate = new Date(task.deadline);
            return task.status === 0 && taskDate.getMonth() === month && taskDate.getFullYear() === year;
        });

        return { completed: completedTasks, uncompleted: uncompletedTasks };
    };

    const { completed, uncompleted } = filterTasksByMonth(tasks, selectedMonth, selectedYear);
    const totalTasks = completed.length + uncompleted.length;

    const getBadgesForDate = (date) => {
        if (!tasks) return [];

        return tasks.filter(
            (task) =>
                new Date(task.deadline).toLocaleDateString() ===
                date.toLocaleDateString()
        );
    };

    useEffect(() => {
        fetchDashboardData();
        document.title = 'Dashboard | Task Reminder';
    }, []);

    return (
        <div className='container'>
            <div className="flex justify-end">
                <IconButton
                    className='border'
                    style={{
                        backgroundColor: isHovered ? 'rgb(229, 229, 234)' : 'white',
                        color: isHovered ? 'black' : 'rgb(107, 114, 128)',
                        borderRadius: '9999px'
                    }}
                    icon={<PlusIcon style={{ backgroundColor: 'white', color: 'inherit' }} />}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    New Task
                </IconButton>
            </div>

            <div className="flex justify-between gap-4 my-4">
                <div className="flex items-center justify-between gap-8 bg-white rounded-3xl p-4 px-8 flex-1">
                    <div className="space-y-0 text-gray-500">
                        <p>Total Tasks</p>
                        <p className="font-bold text-2xl text-black">
                            {isLoading ? (
                                <Placeholder.Paragraph rows={1} rowHeight={20} active />
                            ) : (
                                totalTasks
                            )}
                        </p>
                        <p>Since last month</p>
                    </div>
                    <div>
                        <ListChecks className="w-10 h-10 text-purple-500" />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-8 bg-white rounded-3xl p-4 px-8 flex-1">
                    <div className="space-y-0 text-gray-500">
                        <p>Completed Task</p>
                        <p className="font-bold text-2xl text-black">
                            {isLoading ? (
                                <Placeholder.Paragraph rows={1} rowHeight={20} active />
                            ) : (
                                completed.length
                            )}
                        </p>
                        <p>Since last month</p>
                    </div>
                    <div>
                        <ListChecks className="w-10 h-10 text-green-500" />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-8 bg-white rounded-3xl p-4 px-8 flex-1">
                    <div className="space-y-0 text-gray-500">
                        <p>Uncompleted Task</p>
                        <p className="font-bold text-2xl text-black">
                            {isLoading ? (
                                <Placeholder.Paragraph rows={1} rowHeight={20} active />
                            ) : (
                                uncompleted.length
                            )}
                        </p>
                        <p>Since last month</p>
                    </div>
                    <div>
                        <ListChecks className="w-10 h-10 text-yellow-500" />
                    </div>
                </div>
            </div>

            <div className="flex-grow-0">
                <div className="flex justify-between gap-4 my-4">
                    <div className="bg-white rounded-3xl p-4 px-8 flex-1">
                        {isLoading ? (
                            <Placeholder.Graph active />
                        ) : (
                            <Calendar
                            bordered
                                onSelect={handleDateClick}
                                onPanelChange={handlePanelChange}
                                renderCell={(date) => {
                                    const badgesForDate = getBadgesForDate(date);
                                    return (
                                        <div className="flex justify-center h-full">
                                            {badgesForDate.length > 0 && (
                                                <div className="flex flex-col gap-1 w-1/2">
                                                    {badgesForDate.map((task) => (
                                                        <Badge
                                                            key={task.id}
                                                            content={task.code}
                                                            color={task.status === 0 ? 'yellow' : 'green'}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        )
                        }

                    </div>
                </div>
                {selectedDate && (
                    <div>
                        {getBadgesForDate(selectedDate).length > 0 ? (
                            <table className="min-w-full bg-white rounded-3xl mb-8">
                                <thead>
                                    <tr className='text-left'>
                                        <th className="px-8 py-4">No</th>
                                        <th className="px-8 py-4">Course Content</th>
                                        <th className="px-8 py-4">Task</th>
                                        <th className="px-8 py-4">Deadline</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getBadgesForDate(selectedDate).map((task, index) => (
                                        <tr key={task.id} className="hover:bg-gray-50">
                                            <td className="px-8 py-4">{index + 1}</td>
                                            <td className="px-8 py-4">{task.course_content}</td>
                                            <td className="px-8 py-4">{task.task}</td>
                                            <td className="px-8 py-4">{task.deadline_text}</td>
                                            <td className="px-8 py-4">{task.status === 0 ? 'Pending' : 'Completed'}</td>
                                            <td className="px-8 py-4">
                                                <Dropdown
                                                    trigger="click"
                                                    icon={<Ellipsis />}
                                                    placement='leftStart'
                                                    toggleClassName='bg-white rounded-full text-gray-500'
                                                >
                                                    <Dropdown.Item>Edit</Dropdown.Item>
                                                    <Dropdown.Item>Delete</Dropdown.Item>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="min-w-full bg-white rounded-3xl">
                                <thead>
                                    <tr className='text-left'>
                                        <th className="px-8 py-4">Course Content</th>
                                        <th className="px-8 py-4">Task</th>
                                        <th className="px-8 py-4">Deadline</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Deadline Text</th>
                                        <th className="px-8 py-4">Options</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={6} className="px-8 py-4 text-center">No tasks for this date</td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};