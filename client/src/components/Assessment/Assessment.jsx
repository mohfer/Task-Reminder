import { useEffect, useState } from 'react'
import { Placeholder, Dropdown, Modal, Button, Form, Input, InputNumber, useToaster, Message, Loader } from 'rsuite';
import { Ellipsis } from 'lucide-react';
import axios from 'axios';

export const Assessment = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [title, setTitle] = useState('Semester 1');
    const [selectedSemester, setSelectedSemester] = useState('Semester 1');
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [courseContents, setCourseContents] = useState([]);
    const [message, setMessage] = useState({});
    const [score, setScore] = useState(null);
    const [selectedContent, setSelectedContent] = useState(null);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [totalIps, setTotalIps] = useState(0);
    const [totalIpk, setTotalIpk] = useState(0);
    const [course, setCourse] = useState('');

    const token = localStorage.getItem('token');
    const toaster = useToaster();

    const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(
        (semester) => ({ label: semester, value: semester })
    );

    const fetchCourseContents = async (semester) => {
        setIsLoadingData(true);
        try {
            const response = await axios.get(`${apiUrl}/assessments/calculate`, {
                params: {
                    semester: semester,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setCourseContents(response.data.data.course_contents);
            setTotalIps(response.data.data.ips)
            setTotalIpk(response.data.data.ipk)
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchCourseContentsSilently = async (semester) => {
        try {
            const response = await axios.get(`${apiUrl}/assessments/calculate`, {
                semester: semester,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setCourseContents(response.data.data.course_contents);
            setTotalIps(response.data.data.ips)
            setTotalIpk(response.data.data.ipk)
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateOpen = (content) => {
        setSelectedContent(content);
        setCourse(content.course_content);
        setScore(content.score);
        setUpdateOpen(true);
    };

    const handleUpdateClose = () => {
        setUpdateOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setScore('');
        setSelectedContent(null);
        setMessage({});
    };

    const handleUpdateSubmit = async () => {
        const payload = {
            score
        };

        try {
            setIsLoading(true);

            const response = await axios.patch(`${apiUrl}/assessments/${selectedContent.id}`, payload, {
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

    useEffect(() => {
        fetchCourseContents(selectedSemester)
        document.title = 'Assessments - Task Reminder';
    }, []);
    return (
        <>
            <div className='container'>
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
                <div className='my-4 overflow-x-auto rounded-3xl'>
                    <table className="min-w-full bg-white rounded-3xl mb-8 shadow">
                        <thead>
                            <tr className='text-left'>
                                <th className="px-8 py-4">No</th>
                                <th className="px-8 py-4">Course Content</th>
                                <th className="px-8 py-4 text-center">SCU</th>
                                <th className="px-8 py-4 text-center">Score</th>
                                <th className="px-8 py-4 text-center">Grade</th>
                                <th className="px-8 py-4 text-center">Quality Number</th>
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
                                        <td className="px-8 py-4">{index + 1}</td>
                                        <td className="px-8 py-4">{content.course_content}</td>
                                        <td className="px-8 py-4 text-center">{content.scu}</td>
                                        <td className="px-8 py-4 text-center">{content.score}</td>
                                        <td className="px-8 py-4 text-center">{content.grade}</td>
                                        <td className="px-8 py-4 text-center">{content.quality_number}</td>
                                        <td className="px-8 py-4 text-center">
                                            <Dropdown
                                                trigger="click"
                                                placement='leftStart'
                                                icon={<Ellipsis />}
                                                toggleClassName='bg-white rounded-full text-gray-500'
                                            >
                                                <Dropdown.Item onClick={() => handleUpdateOpen(content)}>Edit</Dropdown.Item>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {isLoadingData ? (
                                <tr>
                                    <td colSpan="8" className='p-4'>
                                        <Placeholder.Paragraph rowHeight={20} rows={1} active />
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    <tr>
                                        <td colSpan="8">
                                            <div className="flex justify-start mx-4 sm:justify-center items-center gap-4 mt-4 mb-4">
                                                <div className="p-2 px-4 font-bold bg-blue-500 rounded-full text-white text-center" style={{ width: 'fit-content' }}>
                                                    Total IPS: {totalIps}
                                                </div>
                                                <div className="p-2 px-4 font-bold bg-green-500 rounded-full text-white text-center" style={{ width: 'fit-content' }}>
                                                    Total IPK: {totalIpk}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                <Modal open={updateOpen} onClose={handleUpdateClose}>
                    <Modal.Header>
                        <Modal.Title>Update Score</Modal.Title>
                        <p className='text-gray-500'>Update the score of the selected course content.</p>
                    </Modal.Header>
                    <Modal.Body>
                        <Form fluid>
                            <Form.Group>
                                <Form.ControlLabel>Course Content</Form.ControlLabel>
                                <Input
                                    placeholder='Enter course content'
                                    value={course}
                                    disabled
                                />
                                {message.course_content && (
                                    <p className="text-red-500 text-sm">{message.course_content}</p>
                                )}
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Score</Form.ControlLabel>
                                <InputNumber
                                    placeholder='Enter score'
                                    value={score}
                                    onChange={(value) => setScore(value)}
                                    min={0}
                                    style={{ width: '100%' }}
                                    className={`${message.score ? 'border border-red-500' : ''}`}
                                />
                                {message.score && (
                                    <p className="text-red-500 text-sm">{message.score}</p>
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
            </div>
        </>
    )
}