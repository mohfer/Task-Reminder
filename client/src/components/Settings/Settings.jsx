import { useEffect, useState } from 'react'
import { Tabs, Dropdown, Divider, Toggle, Form, Input, Button, InputGroup, useToaster, Message, Placeholder, Loader } from 'rsuite';
import EyeCloseIcon from '@rsuite/icons/EyeClose';
import VisibleIcon from '@rsuite/icons/Visible';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Settings = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [notify, setNotify] = useState('5 days left');
    const [taskCreated, setTaskCreated] = useState('');
    const [taskCompleted, setTaskCompleted] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorPassword, setErrorPassword] = useState('');

    const [message, setMessage] = useState({})

    const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const token = localStorage.getItem('token');
    const toaster = new useToaster();
    const navigate = new useNavigate();

    const handleCurrentPasswordVisibleChange = () => {
        setCurrentPasswordVisible(!currentPasswordVisible);
    };

    const handleNewPasswordVisibleChange = () => {
        setNewPasswordVisible(!newPasswordVisible);
    };

    const handleConfirmPasswordVisibleChange = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const deadlines = ['7 days left', '5 days left', '3 days left', '1 day left'].map(
        (deadline) => ({ label: deadline, value: deadline })
    );

    const fetchUserData = async () => {
        try {
            setIsLoadingData(true)
            const response = await axios.get(`${apiUrl}/auth/user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setNotify(response.data.data.settings.deadline_notification)
            setTaskCreated(response.data.data.settings.task_created_notification)
            setTaskCompleted(response.data.data.settings.task_completed_notification)

            setName(response.data.data.user.name)
            setEmail(response.data.data.user.email)
            setPhone(response.data.data.user.phone)
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        } finally {
            setIsLoadingData(false)
        }
    }

    const fetchUserDataSilently = async () => {
        try {
            const response = await axios.get(`${apiUrl}/auth/user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setNotify(response.data.data.settings.deadline_notification)
            setTaskCreated(response.data.data.settings.task_created_notification)
            setTaskCompleted(response.data.data.settings.task_completed_notification)

            setName(response.data.data.user.name)
            setEmail(response.data.data.user.email)
            setPhone(response.data.data.user.phone)
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        }
    }

    const handleNotify = async (deadline) => {
        try {
            const response = await axios.put(`${apiUrl}/settings/deadline-notification`, {
                deadline_notification: deadline
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            toaster.push(
                <Message showIcon type="success" closable >
                    {response.data.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            fetchUserDataSilently()
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        }
    }

    const handleTaskCreated = async () => {
        try {
            const response = await axios.patch(`${apiUrl}/settings/task-created-notification`, {
                task_created_notification: taskCreated
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            toaster.push(
                <Message showIcon type="success" closable >
                    {response.data.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            fetchUserDataSilently()
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        }
    }

    const handleTaskCompleted = async () => {
        try {
            const response = await axios.patch(`${apiUrl}/settings/task-completed-notification`, {
                task_completed_notification: taskCompleted
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            toaster.push(
                <Message showIcon type="success" closable >
                    {response.data.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            fetchUserDataSilently()
        } catch (error) {
            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        }
    }

    const handleUpdateProfile = async () => {
        setIsLoading(true)

        const profileData = {
            name: name,
            email: email,
            phone: phone
        }

        try {
            const response = await axios.put(`${apiUrl}/settings/profile`, profileData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })

            toaster.push(
                <Message showIcon type="success" closable >
                    {response.data.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            localStorage.setItem('name', response.data.data.name)

            fetchUserDataSilently();
            setMessage({})
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
            setIsLoading(false)
        }
    }

    const handleChangePassword = async () => {

        const passwordData = {
            old_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword
        }

        try {
            setIsLoading(true)
            const response = await axios.put(`${apiUrl}/settings/password`, passwordData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })

            toaster.push(
                <Message showIcon type="success" closable >
                    {response.data.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )

            setMessage({})
            setErrorPassword('')
            resetFormPassword()
            fetchUserDataSilently();
        } catch (error) {
            const errors = error.response?.data?.errors || {};

            setMessage(errors);

            if (error.response.status === 401) {
                setErrorPassword(error.response.data.message)
            } else {
                setErrorPassword(error.response.data.errors.old_password)
            }

            toaster.push(
                <Message showIcon type="error" closable >
                    {error.response?.data?.message}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            )
        } finally {
            setIsLoading(false)
        }
    }

    const resetFormPassword = () => {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
    }

    const handleLogout = async () => {
        try {
            setIsLoading(true);
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
            setIsLoading(false);
            localStorage.clear();
            sessionStorage.clear();

            navigate('/auth/login');
        }
    };

    useEffect(() => {
        fetchUserData()

        document.title = 'Settings | Task Reminder';
    }, []);

    return (
        <>
            <div className="container">
                <Tabs defaultActiveKey="1" appearance="subtle">
                    <Tabs.Tab eventKey="1" title="Notifications">
                        <div className="my-4">
                            <div className='min-w-full bg-white rounded-3xl shadow p-6'>
                                {isLoadingData ? (
                                    <Placeholder.Grid rows={2} rowHeight={20} columns={2} active />
                                ) : (
                                    <div className='flex justify-between'>
                                        <div>
                                            <p className='text-lg'>Deadline Notification</p>
                                            <span className='text-gray-500'>Display a notification when the task is approaching the due date.</span>
                                        </div>
                                        <div className='flex items-center'>
                                            <Dropdown
                                                title={notify}
                                                trigger="click"
                                                appearance='ghost'
                                                toggleClassName='bg-white rounded-full p-2 px-8 text-blue-500'
                                            >
                                                {deadlines.map((deadline) => (
                                                    <Dropdown.Item
                                                        key={deadline.value}
                                                        eventKey={deadline.value}
                                                        onClick={() => {
                                                            setNotify(deadline.label);
                                                            handleNotify(deadline.value);
                                                        }}
                                                    >
                                                        {deadline.label}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown>
                                        </div>
                                    </div>
                                )}
                                <Divider />
                                {isLoadingData ? (
                                    <Placeholder.Grid rows={2} rowHeight={20} columns={2} active />
                                ) : (
                                    <div className='flex justify-between'>
                                        <div>
                                            <p className='text-lg'>Task Created Notification</p>
                                            <span className='text-gray-500'>Display a notification when the task is successfully created.</span>
                                        </div>
                                        <div className='flex items-center justify-center w-[108px]'>
                                            <Toggle
                                                checked={taskCreated == 1}
                                                onChange={handleTaskCreated}
                                            />
                                        </div>
                                    </div>
                                )}
                                <Divider />
                                {isLoadingData ? (
                                    <Placeholder.Grid rows={2} rowHeight={20} columns={2} active />
                                ) : (
                                    <div className='flex justify-between'>
                                        <div>
                                            <p className='text-lg'>Task Completed Notification</p>
                                            <span className='text-gray-500'>Display a notification when the task is successfully completed.</span>
                                        </div>
                                        <div className='flex items-center justify-center w-[108px]'>
                                            <Toggle
                                                checked={taskCompleted == 1}
                                                onChange={handleTaskCompleted}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Tabs.Tab>
                    <Tabs.Tab eventKey="2" title="Profile">
                        <div className="my-4">
                            <div className='flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 gap-4'>
                                <div className='w-full bg-white rounded-3xl shadow p-6'>
                                    <p className='text-lg'>Profile Information</p>
                                    <span className='text-gray-500'>Update your account's profile information and email address.</span>
                                    {isLoadingData ? (
                                        <Placeholder.Paragraph rows={4} rowHeight={20} active />
                                    ) : (
                                        <Form className='mt-8' onSubmit={handleUpdateProfile}>
                                            <Form.Group>
                                                <Form.ControlLabel>Name</Form.ControlLabel>
                                                <Input
                                                    placeholder='Enter your name'
                                                    value={name}
                                                    onChange={(value) => setName(value)}
                                                    className={`${message.name ? 'border border-red-500' : ''}`}
                                                />
                                                {message.name && (
                                                    <p className="text-red-500 text-sm">{message.name}</p>
                                                )}
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.ControlLabel>Email</Form.ControlLabel>
                                                <Input
                                                    placeholder='Enter your email'
                                                    value={email}
                                                    onChange={(value) => setEmail(value)}
                                                    className={`${message.email ? 'border border-red-500' : ''}`}
                                                />
                                                {message.email && (
                                                    <p className="text-red-500 text-sm">{message.email}</p>
                                                )}
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.ControlLabel>Phone</Form.ControlLabel>
                                                <Input
                                                    placeholder='Enter your phone'
                                                    value={phone}
                                                    onChange={(value) => setPhone(value)}
                                                    className={`${message.phone ? 'border border-red-500' : ''}`}
                                                />
                                                {message.phone && (
                                                    <p className="text-red-500 text-sm">{message.phone}</p>
                                                )}
                                            </Form.Group>
                                            <Form.Group>
                                                <Button
                                                    disabled={isLoading}
                                                    appearance='primary'
                                                    type='submit'>
                                                    {isLoading ? (
                                                        <Loader content='Saving...' />
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </Button>
                                            </Form.Group>
                                        </Form>
                                    )}
                                </div>
                                <div className='w-full bg-white rounded-3xl shadow p-6'>
                                    <p className='text-lg'>Update Password</p>
                                    <span className='text-gray-500'>Ensure your account is using a long, random password to stay secure.</span>
                                    {isLoadingData ? (
                                        <Placeholder.Paragraph rows={4} rowHeight={20} active />
                                    ) : (
                                        <Form className='mt-8' onSubmit={handleChangePassword}>
                                            <Form.Group>
                                                <Form.ControlLabel>Current Password</Form.ControlLabel>
                                                <InputGroup
                                                    inside
                                                    style={{ width: '100%' }}
                                                    className={`${errorPassword ? 'border border-red-500' : ''}`}
                                                >
                                                    <Input
                                                        placeholder='Enter your current password'
                                                        value={currentPassword}
                                                        onChange={(value) => setCurrentPassword(value)}
                                                        type={currentPasswordVisible ? 'text' : 'password'}
                                                    />
                                                    <InputGroup.Button onClick={handleCurrentPasswordVisibleChange}>
                                                        {currentPasswordVisible ? <VisibleIcon /> : <EyeCloseIcon />}
                                                    </InputGroup.Button>
                                                </InputGroup>
                                                {errorPassword && (
                                                    <p className="text-red-500 text-sm">{errorPassword}</p>
                                                )}
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.ControlLabel>New Password</Form.ControlLabel>
                                                <InputGroup inside style={{ width: '100%' }}
                                                    className={`${message.password ? 'border border-red-500' : ''}`}
                                                >
                                                    <Input
                                                        placeholder='Enter your new password'
                                                        value={newPassword}
                                                        onChange={(value) => setNewPassword(value)}
                                                        type={newPasswordVisible ? 'text' : 'password'}
                                                    />
                                                    <InputGroup.Button onClick={handleNewPasswordVisibleChange}>
                                                        {newPasswordVisible ? <VisibleIcon /> : <EyeCloseIcon />}
                                                    </InputGroup.Button>
                                                </InputGroup>
                                                {message.password && (
                                                    <p className="text-red-500 text-sm">{message.password}</p>
                                                )}
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.ControlLabel>Confirm Password</Form.ControlLabel>
                                                <InputGroup inside style={{ width: '100%' }}
                                                    className={`${message.password_confirmation ? 'border border-red-500' : ''}`}
                                                >
                                                    <Input
                                                        placeholder='Confirm your new password'
                                                        value={confirmPassword}
                                                        onChange={(value) => setConfirmPassword(value)}
                                                        type={confirmPasswordVisible ? 'text' : 'password'}
                                                    />
                                                    <InputGroup.Button onClick={handleConfirmPasswordVisibleChange}>
                                                        {confirmPasswordVisible ? <VisibleIcon /> : <EyeCloseIcon />}
                                                    </InputGroup.Button>
                                                </InputGroup>
                                                {message.password_confirmation && (
                                                    <p className="text-red-500 text-sm">{message.password_confirmation}</p>
                                                )}
                                            </Form.Group>
                                            <Form.Group>
                                                <Button
                                                    disabled={isLoading}
                                                    appearance='primary'
                                                    type='submit'>
                                                    {isLoading ? (
                                                        <Loader content='Saving...' />
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </Button>
                                            </Form.Group>
                                        </Form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Tabs.Tab>
                </Tabs>
                <Button
                    className='block lg:hidden'
                    appearance='primary'
                    color='red'
                    block
                    disabled={isLoading}
                    onClick={handleLogout}>
                    {isLoading ? <Loader content='Logging out...' /> : 'Logout'}</Button>
            </div>
        </>
    )
}