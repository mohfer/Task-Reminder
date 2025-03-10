import { Bar } from 'react-chartjs-2';
import { ListChecks } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import { Placeholder, Dropdown } from 'rsuite';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const BarChart = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [title, setTitle] = useState('Semester 1');
    const [selectedSemester, setSelectedSemester] = useState('Semester 1');
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [courseContents, setCourseContents] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [completedTask, setCompletedTask] = useState(null)
    const [uncompletedTask, setUncompletedTask] = useState(null)
    const [totalTask, setTotalTask] = useState(null)

    const token = localStorage.getItem('token');
    let taskNumber = 0;

    const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(
        (semester) => ({ label: semester, value: semester })
    );

    const fetchCourseContents = async (semester) => {
        setIsLoadingData(true);
        setCourseContents([]);
        setSelectedCourse(null);
        try {
            const response = await axios.get(`${apiUrl}/dashboard/chart`, {
                params: {
                    semester: semester,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setCourseContents(response.data.data.course_contents)
            setCompletedTask(response.data.data.completed_task)
            setUncompletedTask(response.data.data.uncompleted_task)
            setTotalTask(response.data.data.total_task)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        fetchCourseContents(selectedSemester);
    }, [selectedSemester]);

    const data = {
        labels: courseContents.map((content) => content.course_content),
        datasets: [
            {
                label: 'Total Tasks',
                backgroundColor: 'rgba(59, 130, 246, 1)',
                hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                data: courseContents.map((content) => content.total_task),
            },
            {
                label: 'Completed Tasks',
                backgroundColor: 'rgba(16, 185, 129, 1)',
                hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
                data: courseContents.map((content) => content.completed_task),
            },
            {
                label: 'Uncompleted Tasks',
                backgroundColor: 'rgba(234, 179, 8, 1)',
                hoverBackgroundColor: 'rgba(234, 179, 8, 1)',
                data: courseContents.map((content) => content.uncompleted_task),
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: `Data ${selectedSemester}`,
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        if (Number.isInteger(value)) {
                            return value;
                        }
                    },
                },
            },
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const clickedElementIndex = elements[0].index;
                const selectedCourse = courseContents[clickedElementIndex];
                setSelectedCourse(selectedCourse);
            }
        },
    };

    return (
        <>
            <div className="flex justify-end">
                <Dropdown
                    title={title}
                    trigger="click"
                    toggleClassName='bg-white rounded-full p-2 px-8 text-gray-500 shadow hover:bg-gray-50 transition-colors'
                >
                    {semesters.map((semester) => (
                        <Dropdown.Item
                            key={semester.value}
                            eventKey={semester.value}
                            onClick={() => {
                                setTitle(semester.label);
                                setSelectedSemester(semester.value);
                            }}
                            className='hover:bg-gray-100 transition-colors'
                        >
                            {semester.label}
                        </Dropdown.Item>
                    ))}
                </Dropdown>
            </div>
            <div className="lg:flex lg:space-y-0 space-y-4 justify-between gap-4 my-4">
                <div className="flex items-center justify-between gap-8 bg-white rounded-3xl p-4 px-8 flex-1 shadow">
                    <div className="space-y-0 text-gray-500">
                        <p>Total Tasks</p>
                        <p className="font-bold text-2xl text-black">
                            {isLoadingData ? (
                                <Placeholder.Paragraph rows={1} rowHeight={20} active />
                            ) : (
                                totalTask
                            )}
                        </p>
                        <p>Since {selectedSemester}</p>
                    </div>
                    <div>
                        <ListChecks className="w-10 h-10 text-blue-500" />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-8 bg-white rounded-3xl p-4 px-8 flex-1 shadow">
                    <div className="space-y-0 text-gray-500">
                        <p>Completed Task</p>
                        <p className="font-bold text-2xl text-black">
                            {isLoadingData ? (
                                <Placeholder.Paragraph rows={1} rowHeight={20} active />
                            ) : (
                                completedTask
                            )}
                        </p>
                        <p>Since {selectedSemester}</p>
                    </div>
                    <div>
                        <ListChecks className="w-10 h-10 text-green-500" />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-8 bg-white rounded-3xl p-4 px-8 flex-1 shadow">
                    <div className="space-y-0 text-gray-500">
                        <p>Uncompleted Task</p>
                        <p className="font-bold text-2xl text-black">
                            {isLoadingData ? (
                                <Placeholder.Paragraph rows={1} rowHeight={20} active />
                            ) : (
                                uncompletedTask
                            )}
                        </p>
                        <p>Since {selectedSemester}</p>
                    </div>
                    <div>
                        <ListChecks className="w-10 h-10 text-yellow-500" />
                    </div>
                </div>
            </div>
            {isLoadingData ? (
                <div className="bg-white rounded-3xl p-4 px-8 my-4 w-full shadow">
                    <Placeholder.Graph height={400} active />
                </div>
            ) : (
                <div>
                    <div className="flex flex-col lg:flex-row gap-4 my-4">
                        <div className="bg-white rounded-3xl p-4 px-8 flex-1 shadow">
                            <div className="w-full overflow-x-auto">
                                <div className="min-w-[320px] w-full h-[400px]">
                                    <Bar data={data} options={options} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className="w-full bg-white rounded-3xl mb-8 shadow">
                            <thead>
                                <tr className='text-left'>
                                    <th className="px-8 py-4">No</th>
                                    <th className="px-8 py-4">Course Content</th>
                                    <th className="px-8 py-4">Task</th>
                                    <th className="px-8 py-4 text-center">Status</th>
                                    <th className="px-8 py-4 text-center">Created At</th>
                                    <th className="px-8 py-4 text-center">Updated At</th>
                                    <th className="px-8 py-4 text-center">Deadline</th>
                                    <th className="px-8 py-4 text-center">Deadline Label</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingData ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            <Placeholder.Paragraph rows={3} active />
                                        </td>
                                    </tr>
                                ) : courseContents.length === 0 || totalTask === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            Tidak ada data tugas yang tersedia.
                                        </td>
                                    </tr>
                                ) : selectedCourse ? (
                                    selectedCourse.tasks.map((task, index) => (
                                        <tr key={task.id} className="hover:bg-gray-50">
                                            <td className="px-8 py-4">{index + 1}</td>
                                            <td className="px-8 py-4">{selectedCourse.course_content}</td>
                                            <td className="px-8 py-4">{task.task}</td>
                                            <td className="px-8 py-4 text-center"><span className={`p-2 rounded-full text-white ${task.status === 1 ? 'bg-green-500' : 'bg-yellow-500'}`}>{task.status === 1 ? 'Completed' : 'Uncompleted'}</span></td>
                                            <td className="px-8 py-4 text-center">{task.created_at}</td>
                                            <td className="px-8 py-4 text-center">{task.updated_at}</td>
                                            <td className="px-8 py-4 text-center">{task.deadline}</td>
                                            <td className="px-8 py-4 text-center">{task.deadline_label}</td>
                                        </tr>
                                    ))
                                ) : (
                                    courseContents.map((content) =>
                                        content.tasks.map((task) => {
                                            taskNumber += 1;
                                            return (
                                                <tr key={task.id} className="hover:bg-gray-50">
                                                    <td className="px-8 py-4">{taskNumber}</td>
                                                    <td className="px-8 py-4">{content.course_content}</td>
                                                    <td className="px-8 py-4">{task.task}</td>
                                                    <td className="px-8 py-4 text-center"><span className={`p-2 rounded-full text-white ${task.status === 1 ? 'bg-green-500' : 'bg-yellow-500'}`}>{task.status === 1 ? 'Completed' : 'Uncompleted'}</span></td>
                                                    <td className="px-8 py-4 text-center">{task.created_at}</td>
                                                    <td className="px-8 py-4 text-center">{task.updated_at}</td>
                                                    <td className="px-8 py-4 text-center">{task.deadline}</td>
                                                    <td className="px-8 py-4 text-center">{task.deadline_label}</td>
                                                </tr>
                                            );
                                        })
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};