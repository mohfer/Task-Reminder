import { Avatar } from 'rsuite'
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Dropdown } from 'rsuite';
import useSemesterStore from "../../store/useSemesterStore";

const Header = ({ title }) => {
    const storedName = localStorage.getItem('name');
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;
    const { semesterLabel, setSemester } = useSemesterStore();

    const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(
        (semester) => ({ label: semester, value: semester })
    );

    useEffect(() => {
        localStorage.removeItem('isPasswordReset');

        const storedToken = localStorage.getItem('token');
        const emailVerified = localStorage.getItem('isEmailVerified');

        if (!storedToken) {
            navigate('/auth/login');
        } else if (emailVerified === 'false') {
            navigate('/auth/verify-email');
        }
    }, [navigate]);

    return (
        <>
            <div className="flex justify-between w-full px-4 pb-2 bg-gray-100">
                <h1 className="text-3xl pt-8 font-bold">{title}</h1>
                <div className='flex items-center gap-4 pt-8'>
                    {pathname != "/settings" &&
                        <Dropdown
                            title={semesterLabel}
                            trigger="click"
                            toggleClassName='bg-white rounded-full p-2 px-8 text-gray-500 shadow hover:bg-gray-[229, 229, 234] transition-colors'
                        >
                            {semesters.map((semester) => (
                                <Dropdown.Item
                                    key={semester.value}
                                    eventKey={semester.value}
                                    onClick={() => {
                                        setSemester(semester.value, semester.label);
                                    }}
                                    className='hover:bg-gray-100 transition-colors'
                                >
                                    {semester.label}
                                </Dropdown.Item>
                            ))}
                        </Dropdown>
                    }

                    <p className="hidden lg:block text-3xl">Hi, {storedName}</p>
                    <div className='hidden lg:block'>
                        <Avatar
                            circle
                            style={{ background: '#000' }}
                        >
                            ;
                        </Avatar>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header