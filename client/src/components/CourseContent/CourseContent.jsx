import { useEffect, useState } from 'react';
import { Placeholder, IconButton, Dropdown } from 'rsuite';
import { Ellipsis } from 'lucide-react';
import PlusIcon from '@rsuite/icons/Plus';
import axios from 'axios';

export const CourseContent = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [isHovered, setIsHovered] = useState(false);
    const [courseContents, setCourseContents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('Semester 1');

    const fetchCourseContents = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/course-contents`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
            setCourseContents(response.data.data);
        } catch (err) {
            setError('Failed to fetch course contents');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (eventKey) => {
        setTitle(eventKey);
    };

    useEffect(() => {
        fetchCourseContents();
        document.title = 'Course Contents | Task Reminder';
    }, []);

    return (
        <div className='container'>
            <div className="flex justify-between">
                <Dropdown
                    title={title}
                    trigger="click"
                    toggleClassName='bg-white rounded-full p-2 px-8 text-gray-500'
                >
                    <Dropdown.Item eventKey="Semester 1" onSelect={handleSelect}>Semester 1</Dropdown.Item>
                    <Dropdown.Item eventKey="Semester 2" onSelect={handleSelect}>Semester 2</Dropdown.Item>
                    <Dropdown.Item eventKey="Semester 3" onSelect={handleSelect}>Semester 3</Dropdown.Item>
                    <Dropdown.Item eventKey="Semester 4" onSelect={handleSelect}>Semester 4</Dropdown.Item>
                    <Dropdown.Item eventKey="Semester 5" onSelect={handleSelect}>Semester 5</Dropdown.Item>
                    <Dropdown.Item eventKey="Semester 6" onSelect={handleSelect}>Semester 6</Dropdown.Item>
                    <Dropdown.Item eventKey="Semester 7" onSelect={handleSelect}>Semester 7</Dropdown.Item>
                </Dropdown>
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
                    New Course Content
                </IconButton>
            </div>
            <div className='my-4'>
                <table className="min-w-full bg-white rounded-3xl">
                    <thead>
                        <tr className='text-left'>
                            <th className="px-8 py-4">No</th>
                            <th className="px-8 py-4">Code</th>
                            <th className="px-8 py-4">Course Content</th>
                            <th className="px-8 py-4">Lecturer</th>
                            <th className="px-8 py-4">Semester Credit Units</th>
                            <th className="px-8 py-4">Day</th>
                            <th className="px-8 py-4">Time</th>
                            <th className="px-8 py-4">Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className='p-4'>
                                    <Placeholder.Grid rows={5} columns={8} rowHeight={20} active />
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="8" className="px-8 py-4 text-center">{error}</td>
                            </tr>
                        ) : courseContents.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-8 py-4 text-center">No course contents found</td>
                            </tr>
                        ) : (
                            courseContents.map((content, index) => (
                                <tr key={content.id} className="hover:bg-gray-50 text-gray-500">
                                    <td className="px-8 py-4">{index + 1}</td>
                                    <td className="px-8 py-4">{content.code}</td>
                                    <td className="px-8 py-4">{content.course_content}</td>
                                    <td className="px-8 py-4">{content.lecturer}</td>
                                    <td className="px-8 py-4 text-center">{content.scu}</td>
                                    <td className="px-8 py-4">{content.day}</td>
                                    <td className="px-8 py-4">{content.hour_start} - {content.hour_end}</td>
                                    <td className="px-8 py-4">
                                        <Dropdown
                                            trigger="click"
                                            placement='leftStart'
                                            icon={<Ellipsis />}
                                            toggleClassName='bg-white rounded-full text-gray-500'
                                        >
                                            <Dropdown.Item>Edit</Dropdown.Item>
                                            <Dropdown.Item>Delete</Dropdown.Item>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};