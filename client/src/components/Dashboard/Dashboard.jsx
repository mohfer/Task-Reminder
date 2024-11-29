import { useEffect, useState } from 'react';
import { ListChecks, Ellipsis } from 'lucide-react';
import { Placeholder, Calendar, Badge, IconButton, Dropdown, Checkbox, Message, useToaster, Modal, Form, Input, SelectPicker, Button, Loader } from 'rsuite';
import PlusIcon from '@rsuite/icons/Plus';
import axios from 'axios';

export const Dashboard = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const toaster = useToaster();
    const [isHovered, setIsHovered] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState({});
    const [semester, setSemester] = useState('');
    const [course, setCourse] = useState('');
    const [task, setTask] = useState('');
    const [deadline, setDeadline] = useState('');
    const [courseContents, setCourseContents] = useState([]);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTaskId, setDeleteTaskId] = useState(null);
    const token = localStorage.getItem('token');

    const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(
        (semester) => ({ label: semester, value: semester })
    );

    const fetchDashboardData = async () => {
        try {
            setIsLoadingData(true);
            const response = await axios.get(`${apiUrl}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDashboardData(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchDashboardDataSilently = async () => {
        try {
            const response = await axios.get(`${apiUrl}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDashboardData(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const tasks = dashboardData?.tasks;

    const handleDateClick = (date) => {
        setSelectedDate(date);
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

    const handleStatusChange = async (taskId, value) => {
        try {
            setIsLoading(true)
            const response = await axios.patch(`${apiUrl}/tasks/${taskId}/status`, { status: value ? 1 : 0 }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            await fetchDashboardDataSilently();

            toaster.push(
                <Message showIcon type="success" closable >
                    {response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        } finally {
            setIsLoading(false)
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    const handleUpdateOpen = (task) => {
        setSelectedTask(task);
        setSemester(task.semester);
        fetchCourseContents(task.semester).then(() => setCourse(task.course_content_id));
        setTask(task.task);
        setDeadline(task.deadline);
        setUpdateOpen(true);
    };

    const handleUpdateClose = () => {
        setUpdateOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setSemester('');
        setCourse('');
        setTask('')
        setDeadline(null)
        setMessage({});
    };

    const fetchCourseContents = async (semester) => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${apiUrl}/course-contents/filter`, {
                semester: semester,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setCourseContents(response.data.data.course_contents);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        const newTaskData = {
            course_content_id: course,
            task,
            deadline,
        };

        try {
            setIsLoading(true);
            const response = await axios.post(`${apiUrl}/tasks`, newTaskData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            toaster.push(
                <Message showIcon type="success" closable >
                    {response.data.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
            await fetchDashboardDataSilently();
            handleClose();
        } catch (error) {
            const errors = error.response?.data?.errors || {};
            setMessage(errors);

            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSubmit = async () => {
        const updateTaskData = {
            course_content_id: course,
            task,
            deadline,
        };

        try {
            setIsLoading(true);
            const response = await axios.put(`${apiUrl}/tasks/${selectedTask.id}`, updateTaskData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })

            toaster.push(
                <Message showIcon type="success" closable >
                    {response.data.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
            await fetchDashboardDataSilently();
            handleUpdateClose();
        } catch (error) {
            const errors = error.response?.data?.errors || {};
            setMessage(errors);

            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );

        } finally {
            setIsLoading(false);
        }
    }

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`${apiUrl}/tasks/${deleteTaskId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            toaster.push(
                <Message showIcon type="success" closable>
                    Course content deleted successfully.
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );

            await fetchDashboardDataSilently();
            setDeleteOpen(false);
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable>
                    {error.response?.data?.message || 'Failed to delete course content.'}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
        document.title = 'Dashboard | Task Reminder';
    }, []);

    return (
        <>
            <div className='container'>
                <div className="flex justify-end">
                    <IconButton
                        onClick={handleOpen}
                        className='shadow'
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

                <div className="lg:flex lg:space-y-0 space-y-4 justify-between gap-4 my-4">
                    <div className="flex items-center justify-between gap-8 bg-white rounded-3xl p-4 px-8 flex-1 shadow">
                        <div className="space-y-0 text-gray-500">
                            <p>Total Tasks</p>
                            <p className="font-bold text-2xl text-black">
                                {isLoadingData ? (
                                    <Placeholder.Paragraph rows={1} rowHeight={20} active />
                                ) : (
                                    totalTasks
                                )}
                            </p>
                            <p>Since last month</p>
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
                                    completed.length
                                )}
                            </p>
                            <p>Since last month</p>
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
                        <div className="bg-white rounded-3xl p-4 px-8 flex-1 shadow">
                            {isLoadingData ? (
                                <Placeholder.Graph active />
                            ) : (
                                <Calendar
                                    compact
                                    bordered
                                    onSelect={handleDateClick}
                                    renderCell={(date) => {
                                        const badgesForDate = getBadgesForDate(date);
                                        return (
                                            <div className="flex justify-center h-full">
                                                {badgesForDate.length > 0 && (
                                                    <div className="flex flex-col gap-1 w-1/2 lg:w-full">
                                                        {badgesForDate.map((task) => (
                                                            <Badge
                                                                key={task.id}
                                                                content={task.code}
                                                                color={task.deadline_text === 'Overdue' && task.status === 0 ? (
                                                                    'red'
                                                                ) : task.status === 0 ? (
                                                                    'yellow'
                                                                ) : (
                                                                    'green'
                                                                )}
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
                        <div className='overflow-x-auto rounded-3xl'>
                            <table className="min-w-full bg-white rounded-3xl mb-8 shadow">
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
                                    {getBadgesForDate(selectedDate).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-4 text-center">No tasks for this date</td>
                                        </tr>
                                    ) : (
                                        getBadgesForDate(selectedDate).map((task, index) => (
                                            <tr key={task.id} className="hover:bg-gray-50">
                                                <td className="px-8 py-4">{index + 1}</td>
                                                <td className="px-8 py-4">{task.course_content}</td>
                                                <td className="px-8 py-4">{task.task}</td>
                                                <td className="px-8 py-4">{task.deadline_text}</td>
                                                <td className="px-8 py-4">{task.status === 0 ? (
                                                    <Checkbox
                                                        color="green"
                                                        checked={false}
                                                        disabled={isLoading}
                                                        onChange={(value) => handleStatusChange(task.id, value)} />
                                                ) : (
                                                    <Checkbox
                                                        color="green"
                                                        checked={true}
                                                        disabled={isLoading}
                                                        onChange={(value) => handleStatusChange(task.id, value)} />
                                                )}</td>
                                                <td className="px-8 py-4">
                                                    <Dropdown
                                                        trigger="click"
                                                        icon={<Ellipsis />}
                                                        placement='leftStart'
                                                        toggleClassName='bg-white rounded-full text-gray-500'
                                                    >
                                                        <Dropdown.Item onClick={() => handleUpdateOpen(task)}>Edit</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => { setDeleteTaskId(task.id); setDeleteOpen(true); }}>Delete</Dropdown.Item>
                                                    </Dropdown>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <Modal className='rounded-3xl' open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Add New Task</Modal.Title>
                    <p className='text-gray-500'>Enter the details of the task you want to do.</p>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="semester">
                            <Form.ControlLabel>Semester</Form.ControlLabel>
                            <SelectPicker
                                value={semester}
                                onChange={(value) => {
                                    setSemester(value);
                                    fetchCourseContents(value);
                                }}
                                data={semesters}
                                searchable={false}
                                placeholder="Select semester"
                                block
                                className={`${message.semester ? 'border border-red-500' : ''}`}
                            />
                            {message.semester && (
                                <p className="text-red-500 text-sm">{message.semester}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Course Content</Form.ControlLabel>
                            <SelectPicker
                                loading={isLoading}
                                data={courseContents.map(content => ({ label: content.course_content, value: content.id }))}
                                searchable={false}
                                placeholder="Select course"
                                block
                                value={course}
                                onChange={(value) => setCourse(value)}
                                className={`${message.course_content ? 'border border-red-500' : ''}`}
                            />
                            {message.course_content && (
                                <p className="text-red-500 text-sm">{message.course_content}</p>
                            )}
                        </Form.Group>
                        <Form.Group controlId="task">
                            <Form.ControlLabel>Task</Form.ControlLabel>
                            <Input
                                placeholder="Enter task"
                                as="textarea"
                                rows={3}
                                value={task}
                                onChange={(value) => setTask(value)}
                                className={`${message.task ? 'border border-red-500' : ''}`}
                            />
                            {message.task && (
                                <p className="text-red-500 text-sm">{message.task}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Deadline</Form.ControlLabel>
                            <input
                                type='date'
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                placeholder="Select deadline"
                                className={`p-2 border border-gray-300 rounded w-full ${message.deadline ? 'border border-red-500' : ''}`}
                            />
                            {message.deadline && (
                                <p className="text-red-500 text-sm">{message.deadline}</p>
                            )}
                        </Form.Group>
                        <Modal.Footer>
                            <Button onClick={handleClose} appearance="ghost">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                appearance="primary"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader content="Adding..." /> : 'Add'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal open={updateOpen} onClose={handleUpdateClose}>
                <Modal.Header>
                    <Modal.Title>Edit Task</Modal.Title>
                    <p className='text-gray-500'>Enter the details of the task you want to do.</p>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateSubmit}>
                        <Form.Group controlId="semester">
                            <Form.ControlLabel>Semester</Form.ControlLabel>
                            <SelectPicker
                                value={semester}
                                onChange={(value) => {
                                    setSemester(value);
                                    fetchCourseContents(value);
                                }}
                                data={semesters}
                                searchable={false}
                                placeholder="Select semester"
                                block
                                className={`${message.semester ? 'border border-red-500' : ''}`}
                            />
                            {message.semester && (
                                <p className="text-red-500 text-sm">{message.semester}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Course Content</Form.ControlLabel>
                            <SelectPicker
                                loading={isLoading}
                                data={courseContents.map(content => ({ label: content.course_content, value: content.id }))}
                                searchable={false}
                                placeholder="Select course"
                                block
                                value={course}
                                onChange={(value) => setCourse(value)}
                                className={`${message.course_content ? 'border border-red-500' : ''}`}
                            />
                            {message.course_content && (
                                <p className="text-red-500 text-sm">{message.course_content}</p>
                            )}
                        </Form.Group>
                        <Form.Group controlId="task">
                            <Form.ControlLabel>Task</Form.ControlLabel>
                            <Input
                                placeholder="Enter task"
                                as="textarea"
                                rows={3}
                                value={task}
                                onChange={(value) => setTask(value)}
                                className={`${message.task ? 'border border-red-500' : ''}`}
                            />
                            {message.task && (
                                <p className="text-red-500 text-sm">{message.task}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Deadline</Form.ControlLabel>
                            <input
                                type='date'
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                placeholder="Select deadline"
                                className={`p-2 border border-gray-300 rounded w-full ${message.deadline ? 'border border-red-500' : ''}`}
                            />
                            {message.deadline && (
                                <p className="text-red-500 text-sm">{message.deadline}</p>
                            )}
                        </Form.Group>
                        <Modal.Footer>
                            <Button onClick={handleUpdateClose} appearance="ghost">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                appearance="primary"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader content="Updating..." /> : 'Update'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <Modal.Header>
                    <Modal.Title>Delete Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className='text-gray-500'>Once data is deleted, <span className='font-bold'>it cannot be restored</span></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setDeleteOpen(false)} appearance="ghost">
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        color='red'
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader content="Deleting..." /> : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};