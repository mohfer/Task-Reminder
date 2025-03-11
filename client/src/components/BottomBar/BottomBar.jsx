import { LayoutDashboard, Settings, Book, Trophy } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const BottomBar = () => {
    return (
        <div className="block lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 rounded-3xl m-4">
            <div className="flex justify-around items-center py-3">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `
                        flex flex-col items-center 
                        ${isActive ? 'text-blue-600' : 'text-gray-500'}
                    `}
                >
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-xs mt-1">Dashboard</span>
                </NavLink>

                <NavLink
                    to="/course-contents"
                    className={({ isActive }) => `
                        flex flex-col items-center 
                        ${isActive ? 'text-blue-600' : 'text-gray-500'}
                    `}
                >
                    <Book className="w-6 h-6" />
                    <span className="text-xs mt-1">Courses</span>
                </NavLink>

                <NavLink
                    to="/assessments"
                    className={({ isActive }) => `
                        flex flex-col items-center 
                        ${isActive ? 'text-blue-600' : 'text-gray-500'}
                    `}
                >
                    <Trophy className="w-6 h-6" />
                    <span className="text-xs mt-1">Assessments</span>
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => `
                        flex flex-col items-center 
                        ${isActive ? 'text-blue-600' : 'text-gray-500'}
                    `}
                >
                    <Settings className="w-6 h-6" />
                    <span className="text-xs mt-1">Settings</span>
                </NavLink>
            </div>
        </div>
    )
}

export default BottomBar