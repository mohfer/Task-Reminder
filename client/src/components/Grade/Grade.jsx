import { useState, useEffect } from "react"
import { Placeholder, Dropdown, Modal, Button, IconButton, Form, Input, InputNumber, useToaster, Message, Loader } from 'rsuite';
import { Ellipsis } from 'lucide-react';
import PlusIcon from '@rsuite/icons/Plus';
import axios from 'axios';

export const Grade = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [isHovered, setIsHovered] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [grades, setGrades] = useState([])
    const [grade, setGrade] = useState('')
    const [qualityNumber, setQualityNumber] = useState('')
    const [minimalScore, setMinimalScore] = useState('')
    const [maximalScore, setMaximalScore] = useState('')
    const [selectedGrade, setSelectedGrade] = useState(null)
    const [message, setMessage] = useState({})
    const [open, setOpen] = useState(false)
    const [updateOpen, setUpdateOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteGradeId, setDeleteGradeId] = useState(null)

    const token = localStorage.getItem('token');
    const toaster = useToaster();

    const fetchGrades = async () => {
        setIsLoadingData(true);
        try {
            const response = await axios.get(`${apiUrl}/settings/grades`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setGrades(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingData(false);
        }
    }

    const fetchGradesSilently = async () => {
        try {
            const response = await axios.get(`${apiUrl}/settings/grades`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setGrades(response.data.data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setGrade('')
        setQualityNumber('')
        setMinimalScore('')
        setMaximalScore('')
        setSelectedGrade(null);
        setMessage({});
    };

    const handleSubmit = async () => {
        const payload = {
            grade,
            quality_number: qualityNumber,
            minimal_score: minimalScore,
            maximal_score: maximalScore
        };

        try {
            setIsLoading(true);

            const response = await axios.post(`${apiUrl}/settings/grades`, payload, {
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

            await fetchGradesSilently();
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

    const handleUpdateOpen = (grade) => {
        setSelectedGrade(grade);
        setGrade(grade.grade);
        setQualityNumber(grade.quality_number);
        setMinimalScore(grade.minimal_score);
        setMaximalScore(grade.maximal_score);
        setUpdateOpen(true);
    };

    const handleUpdateSubmit = async () => {
        const payload = {
            grade,
            quality_number: qualityNumber,
            minimal_score: minimalScore,
            maximal_score: maximalScore
        };

        try {
            setIsLoading(true);

            const response = await axios.patch(`${apiUrl}/settings/grades/${selectedGrade.id}`, payload, {
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

            await fetchGradesSilently();
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

    const handleUpdateClose = () => {
        setUpdateOpen(false);
        resetForm();
    };

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`${apiUrl}/settings/grades/${deleteGradeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toaster.push(
                <Message showIcon type="success" closable>
                    Grade deleted successfully.
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );

            await fetchGradesSilently();
            setDeleteOpen(false);
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable>
                    {error.response?.data?.message || 'Failed to delete grade.'}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGrades()
    }, [])

    return (
        <>
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
                    New Grade
                </IconButton>
            </div>
            <div className='my-4 overflow-x-auto rounded-3xl'>
                <table className="min-w-full bg-white rounded-3xl mb-8 shadow">
                    <thead>
                        <tr className='text-left'>
                            <th className="px-8 py-4 text-center">No</th>
                            <th className="px-8 py-4 text-center">Grade</th>
                            <th className="px-8 py-4 text-center">Quality Number</th>
                            <th className="px-8 py-4 text-center">Score</th>
                            <th className="px-8 py-4 text-center">Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoadingData ? (
                            <tr>
                                <td colSpan="5" className='p-4'>
                                    <Placeholder.Grid rows={5} columns={5} rowHeight={20} active />
                                </td>
                            </tr>
                        ) : grades.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-4 text-center">No grade found</td>
                            </tr>
                        ) : (
                            grades.map((grade, index) => (
                                <tr key={grade.id} className="hover:bg-gray-50 text-gray-500">
                                    <td className="px-8 py-4 text-center font-bold">{index + 1}</td>
                                    <td className="px-8 py-4 text-center">{grade.grade}</td>
                                    <td className="px-8 py-4 text-center">{grade.quality_number}</td>
                                    <td className="px-8 py-4 text-center">{grade.minimal_score} - {grade.maximal_score}</td>
                                    <td className="px-8 py-4 text-center">
                                        <Dropdown
                                            trigger="click"
                                            placement='leftStart'
                                            icon={<Ellipsis />}
                                            toggleClassName='bg-white rounded-full text-gray-500'
                                        >
                                            <Dropdown.Item onClick={() => handleUpdateOpen(grade)}>Edit</Dropdown.Item>
                                            <Dropdown.Item onClick={() => { setDeleteGradeId(grade.id); setDeleteOpen(true); }}>Delete</Dropdown.Item>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Add New Grade</Modal.Title>
                    <p className='text-gray-500'>Enter the details of the grades.</p>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.ControlLabel>Grade</Form.ControlLabel>
                            <Input
                                placeholder='Enter grade'
                                value={grade}
                                onChange={(value) => setGrade(value)}
                                className={`${message.grade ? 'border border-red-500' : ''}`}
                            />
                            {message.grade && (
                                <p className="text-red-500 text-sm">{message.grade}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Quality Number</Form.ControlLabel>
                            <InputNumber
                                placeholder='Enter quality number'
                                value={qualityNumber}
                                onChange={(value) => setQualityNumber(value)}
                                min={0}
                                style={{ width: '100%' }}
                                className={`${message.quality_number ? 'border border-red-500' : ''}`}
                            />
                            {message.quality_number && (
                                <p className="text-red-500 text-sm">{message.quality_number}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Minimal score</Form.ControlLabel>
                            <InputNumber
                                placeholder='Enter minimal Score'
                                value={minimalScore}
                                onChange={(value) => setMinimalScore(value)}
                                min={0}
                                style={{ width: '100%' }}
                                className={`${message.minimal_score ? 'border border-red-500' : ''}`}
                            />
                            {message.minimal_score && (
                                <p className="text-red-500 text-sm">{message.minimal_score}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Maximal score</Form.ControlLabel>
                            <InputNumber
                                placeholder='Enter maximal Score'
                                value={maximalScore}
                                onChange={(value) => setMaximalScore(value)}
                                min={0}
                                style={{ width: '100%' }}
                                className={`${message.maximal_score ? 'border border-red-500' : ''}`}
                            />
                            {message.maximal_score && (
                                <p className="text-red-500 text-sm">{message.maximal_score}</p>
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
                    <Modal.Title>Edit Grade</Modal.Title>
                    <p className='text-gray-500'>Enter the details of the grade.</p>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateSubmit}>
                        <Form.Group>
                            <Form.ControlLabel>Grade</Form.ControlLabel>
                            <Input
                                placeholder='Enter grade'
                                value={grade}
                                onChange={(value) => setGrade(value)}
                                className={`${message.grade ? 'border border-red-500' : ''}`}
                            />
                            {message.grade && (
                                <p className="text-red-500 text-sm">{message.grade}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Quality Number</Form.ControlLabel>
                            <InputNumber
                                placeholder='Enter quality number'
                                value={qualityNumber}
                                onChange={(value) => setQualityNumber(value)}
                                min={0}
                                style={{ width: '100%' }}
                                className={`${message.quality_number ? 'border border-red-500' : ''}`}
                            />
                            {message.quality_number && (
                                <p className="text-red-500 text-sm">{message.quality_number}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Minimal score</Form.ControlLabel>
                            <InputNumber
                                placeholder='Enter minimal Score'
                                value={minimalScore}
                                onChange={(value) => setMinimalScore(value)}
                                min={0}
                                style={{ width: '100%' }}
                                className={`${message.minimal_score ? 'border border-red-500' : ''}`}
                            />
                            {message.minimal_score && (
                                <p className="text-red-500 text-sm">{message.minimal_score}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Maximal score</Form.ControlLabel>
                            <InputNumber
                                placeholder='Enter maximal Score'
                                value={maximalScore}
                                onChange={(value) => setMaximalScore(value)}
                                min={0}
                                style={{ width: '100%' }}
                                className={`${message.maximal_score ? 'border border-red-500' : ''}`}
                            />
                            {message.maximal_score && (
                                <p className="text-red-500 text-sm">{message.maximal_score}</p>
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
                    <Modal.Title>Delete Grade</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className='text-gray-500'>Once data is deleted, it cannot be restored. Proceed with caution.</p>
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
    )
}