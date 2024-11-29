import { Avatar } from 'rsuite'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const Header = ({ title }) => {
    const storedName = localStorage.getItem('name');
    const navigate = useNavigate();

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
                    <p className="hidden lg:block text-3xl">Hi, {storedName}</p>
                    <Avatar
                        circle
                        style={{ background: '#000' }}
                    >
                        ;
                    </Avatar>
                </div>
            </div>
        </>
    )
}

export default Header