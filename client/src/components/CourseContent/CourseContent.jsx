import { useEffect, useState } from 'react';
import { Placeholder, IconButton, Dropdown, Modal, Button, Form, Input, SelectPicker, InputNumber, useToaster, Message, Loader } from 'rsuite';
import { Ellipsis } from 'lucide-react';
import PlusIcon from '@rsuite/icons/Plus';
import axios from 'axios';

export const CourseContent = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [isHovered, setIsHovered] = useState(false);
    const [courseContents, setCourseContents] = useState([]);
    const [totalScu, setTotalScu] = useState(0);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('Semester 1');
    const [selectedSemester, setSelectedSemester] = useState('Semester 1');
    const [open, setOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
    const [semester, setSemester] = useState('');
    const [code, setCode] = useState('');
    const [course, setCourse] = useState('');
    const [scu, setScu] = useState(0);
    const [lecturer, setLecturer] = useState('');
    const [day, setDay] = useState('');
    const [hourStart, setHourStart] = useState(null);
    const [hourEnd, setHourEnd] = useState(null);
    const [message, setMessage] = useState({});
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteContentId, setDeleteContentId] = useState(null);

    const token = localStorage.getItem('token');
    const toaster = useToaster();

    const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(
        (semester) => ({ label: semester, value: semester })
    );

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
        (day) => ({ label: day, value: day })
    );

    const fetchCourseContents = async (semester) => {
        setIsLoadingData(true);
        try {
            const response = await axios.post(`${apiUrl}/course-contents/filter`, {
                semester: semester,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setCourseContents(response.data.data.course_contents);
            setTotalScu(response.data.data.total_scu);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchCourseContentsSilently = async (semester) => {
        try {
            const response = await axios.post(`${apiUrl}/course-contents/filter`, {
                semester: semester,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setCourseContents(response.data.data.course_contents);
            setTotalScu(response.data.data.total_scu);
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    const handleUpdateOpen = (content) => {
        setSelectedContent(content);
        setSemester(content.semester);
        setCode(content.code);
        setCourse(content.course_content);
        setScu(content.scu);
        setLecturer(content.lecturer);
        setDay(content.day);
        setHourStart(content.hour_start);
        setHourEnd(content.hour_end);
        setUpdateOpen(true);
    };

    const handleUpdateClose = () => {
        setUpdateOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setSemester('');
        setCode('');
        setCourse('');
        setScu(0);
        setLecturer('');
        setDay('');
        setHourStart(null);
        setHourEnd(null);
        setSelectedContent(null);
        setMessage({});
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('semester', semester);
        formData.append('code', code);
        formData.append('course_content', course);
        formData.append('scu', scu);
        formData.append('lecturer', lecturer);
        formData.append('day', day);
        formData.append('hour_start', hourStart);
        formData.append('hour_end', hourEnd);

        try {
            setIsLoading(true);
            const response = await axios.post(`${apiUrl}/course-contents`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toaster.push(
                <Message showIcon type="success" closable >
                    {response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            await fetchCourseContentsSilently(selectedSemester);
            handleClose();
        } catch (error) {
            const errors = error.response?.data?.errors || {};
            setMessage(errors);

            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSubmit = async () => {
        const payload = {
            semester,
            code,
            course_content: course,
            scu,
            lecturer,
            day,
            hour_start: hourStart,
            hour_end: hourEnd,
        };

        try {
            setIsLoading(true);

            const response = await axios.put(`${apiUrl}/course-contents/${selectedContent.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            toaster.push(
                <Message showIcon type="success" closable >
                    {response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            await fetchCourseContentsSilently(selectedSemester);
            handleUpdateClose();
        } catch (error) {
            const errors = error.response?.data?.errors || {};
            setMessage(errors);

            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`${apiUrl}/course-contents/${deleteContentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toaster.push(
                <Message showIcon type="success" closable>
                    Course content deleted successfully.
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );

            await fetchCourseContentsSilently(selectedSemester);
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
    };

    useEffect(() => {
        fetchCourseContents(selectedSemester);
        document.title = 'Course Contents - Task Reminder';
    }, []);

    return (
        <div className='container'>
            <div className="flex justify-between">
                <Dropdown
                    title={title}
                    trigger="click"
                    toggleClassName='bg-white rounded-full p-2 px-8 text-gray-500 shadow'
                >
                    {semesters.map((semester) => (
                        <Dropdown.Item
                            key={semester.value}
                            eventKey={semester.value}
                            onClick={() => {
                                setTitle(semester.label);
                                setSelectedSemester(semester.label);
                                fetchCourseContents(semester.label);
                            }}
                        >
                            {semester.label}
                        </Dropdown.Item>
                    ))}
                </Dropdown>
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
                    New Course Content
                </IconButton>
            </div>
            <div className='my-4 overflow-x-auto rounded-3xl'>
                <table className="min-w-full bg-white rounded-3xl mb-8 shadow">
                    <thead>
                        <tr className='text-left'>
                            <th className="px-8 py-4 text-center">No</th>
                            <th className="px-8 py-4 text-center">Code</th>
                            <th className="px-8 py-4">Course Content</th>
                            <th className="px-8 py-4">Lecturer</th>
                            <th className="px-8 py-4 text-center">Semester Credit Units</th>
                            <th className="px-8 py-4 text-center">Day</th>
                            <th className="px-8 py-4 text-center">Time</th>
                            <th className="px-8 py-4 text-center">Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoadingData ? (
                            <tr>
                                <td colSpan="8" className='p-4'>
                                    <Placeholder.Grid rows={5} columns={8} rowHeight={20} active />
                                </td>
                            </tr>
                        ) : courseContents.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-8 py-4 text-center">No course contents found</td>
                            </tr>
                        ) : (
                            courseContents.map((content, index) => (
                                <tr key={content.id} className="hover:bg-gray-50 text-gray-500">
                                    <td className="px-8 py-4 text-center">{index + 1}</td>
                                    <td className="px-8 py-4 text-center">{content.code}</td>
                                    <td className="px-8 py-4">{content.course_content}</td>
                                    <td className="px-8 py-4">{content.lecturer}</td>
                                    <td className="px-8 py-4 text-center">{content.scu}</td>
                                    <td className="px-8 py-4 text-center">{content.day}</td>
                                    <td className="px-8 py-4 text-center">{content.hour_start} - {content.hour_end}</td>
                                    <td className="px-8 py-4 text-center">
                                        <Dropdown
                                            trigger="click"
                                            placement='leftStart'
                                            icon={<Ellipsis />}
                                            toggleClassName='bg-white rounded-full text-gray-500'
                                        >
                                            <Dropdown.Item onClick={() => handleUpdateOpen(content)}>Edit</Dropdown.Item>
                                            <Dropdown.Item onClick={() => { setDeleteContentId(content.id); setDeleteOpen(true); }}>Delete</Dropdown.Item>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))
                        )}
                        {isLoadingData ? (
                            <tr>
                                <td colSpan="2" className='p-4'>
                                    <Placeholder.Paragraph rowHeight={20} rows={1} active />
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-8 py-4 font-bold">Total Semester Credit Units : {totalScu} </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Add New Course Content</Modal.Title>
                    <p className='text-gray-500'>Enter the details of the courses attended.</p>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="semester">
                            <Form.ControlLabel>Semester</Form.ControlLabel>
                            <SelectPicker
                                data={semesters}
                                searchable={false}
                                placeholder="Select semester"
                                block
                                value={semester}
                                onChange={(value) => setSemester(value)}
                                className={`${message.semester ? 'border border-red-500' : ''}`}
                            />
                            {message.semester && (
                                <p className="text-red-500 text-sm">{message.semester}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Code</Form.ControlLabel>
                            <Input
                                placeholder='Enter code'
                                value={code}
                                onChange={(value) => setCode(value)}
                                className={`${message.code ? 'border border-red-500' : ''}`}
                            />
                            {message.code && (
                                <p className="text-red-500 text-sm">{message.code}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Course Content</Form.ControlLabel>
                            <Input
                                placeholder='Enter course content'
                                value={course}
                                onChange={(value) => setCourse(value)}
                                className={`${message.course_content ? 'border border-red-500' : ''}`}
                            />
                            {message.course_content && (
                                <p className="text-red-500 text-sm">{message.course_content}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>SCU</Form.ControlLabel>
                            <InputNumber
                                placeholder='Enter SCU'
                                value={scu}
                                onChange={(value) => setScu(value)}
                                min={1}
                                style={{ width: '100%' }}
                                className={`${message.scu ? 'border border-red-500' : ''}`}
                            />
                            {message.scu && (
                                <p className="text-red-500 text-sm">{message.scu}</p>
                            )}
                        </Form.Group>
                        <Form.Group controlId="lecturer">
                            <Form.ControlLabel>Lecturer</Form.ControlLabel>
                            <Input
                                placeholder='Enter lecturer'
                                value={lecturer}
                                onChange={(value) => setLecturer(value)}
                                className={`${message.lecturer ? 'border border-red-500' : ''}`}
                            />
                            {message.lecturer && (
                                <p className="text-red-500 text-sm">{message.lecturer}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Day</Form.ControlLabel>
                            <SelectPicker
                                value={day}
                                onChange={(value) => setDay(value)}
                                data={days}
                                searchable={false}
                                placeholder="Select day"
                                block
                                className={`${message.day ? 'border border-red-500' : ''}`}
                            />
                            {message.day && (
                                <p className="text-red-500 text-sm">{message.day}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Hour Start</Form.ControlLabel>
                            <input
                                type="time"
                                value={hourStart}
                                onChange={(e) => setHourStart(e.target.value)}
                                className={`p-2 border border-gray-300 rounded w-full ${message.hour_start ? 'border border-red-500' : ''}`}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Hour End</Form.ControlLabel>
                            <input
                                type="time"
                                value={hourEnd}
                                onChange={(e) => setHourEnd(e.target.value)}
                                className={`p-2 border border-gray-300 rounded w-full ${message.hour_end ? 'border border-red-500' : ''}`}
                            />
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
                    <Modal.Title>Update Course Content</Modal.Title>
                    <p className='text-gray-500'>Update the details of the selected course content.</p>
                </Modal.Header>
                <Modal.Body>
                    <Form fluid>
                        <Form.Group controlId="semester">
                            <Form.ControlLabel>Semester</Form.ControlLabel>
                            <SelectPicker
                                value={semester}
                                onChange={(value) => setSemester(value)}
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
                            <Form.ControlLabel>Code</Form.ControlLabel>
                            <Input
                                placeholder='Enter code'
                                value={code}
                                onChange={(value) => setCode(value)}
                                className={`${message.code ? 'border border-red-500' : ''}`}
                            />
                            {message.code && (
                                <p className="text-red-500 text-sm">{message.code}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Course Content</Form.ControlLabel>
                            <Input
                                placeholder='Enter course content'
                                value={course}
                                onChange={(value) => setCourse(value)}
                                className={`${message.course_content ? 'border border-red-500' : ''}`}
                            />
                            {message.course_content && (
                                <p className="text-red-500 text-sm">{message.course_content}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>SCU</Form.ControlLabel>
                            <InputNumber
                                placeholder='Enter scu'
                                value={scu}
                                onChange={(value) => setScu(value)}
                                min={1}
                                style={{ width: '100%' }}
                                className={`${message.scu ? 'border border-red-500' : ''}`}
                            />
                            {message.scu && (
                                <p className="text-red-500 text-sm">{message.scu}</p>
                            )}
                        </Form.Group>
                        <Form.Group controlId="lecturer">
                            <Form.ControlLabel>Lecturer</Form.ControlLabel>
                            <Input
                                placeholder='Enter lecturer'
                                value={lecturer}
                                onChange={(value) => setLecturer(value)}
                                className={`${message.lecturer ? 'border border-red-500' : ''}`}
                            />
                            {message.lecturer && (
                                <p className="text-red-500 text-sm">{message.lecturer}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Day</Form.ControlLabel>
                            <SelectPicker
                                value={day}
                                onChange={(value) => setDay(value)}
                                data={days}
                                searchable={false}
                                placeholder="Select day"
                                block
                                className={`${message.day ? 'border border-red-500' : ''}`}
                            />
                            {message.day && (
                                <p className="text-red-500 text-sm">{message.day}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Hour Start</Form.ControlLabel>
                            <input
                                type="time"
                                value={hourStart}
                                onChange={(e) => setHourStart(e.target.value)}
                                className={`p-2 border border-gray-300 rounded w-full ${message.hour_start ? 'border border-red-500' : ''}`}
                            />
                            {message.hour_start && (
                                <p className="text-red-500 text-sm">{message.hour_start}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Hour End</Form.ControlLabel>
                            <input
                                type="time"
                                value={hourEnd}
                                onChange={(e) => setHourEnd(e.target.value)}
                                className={`p-2 border border-gray-300 rounded w-full ${message.hour_end ? 'border border-red-500' : ''}`}
                            />
                            {message.hour_end && (
                                <p className="text-red-500 text-sm">{message.hour_end}</p>
                            )}
                        </Form.Group>
                        <Modal.Footer>
                            <Button onClick={handleUpdateClose} appearance="ghost">
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleUpdateSubmit}
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
                    <Modal.Title>Delete Course Content</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className='text-gray-500'>Once data is deleted, it cannot be restored. <span className='font-bold'>Deleting this data may also result in related data, such as tasks</span>, being removed as well. Proceed with caution.</p>
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
        </div>
    );
};