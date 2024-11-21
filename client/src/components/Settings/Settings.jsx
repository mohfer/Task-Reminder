import { useEffect } from 'react'



export const Settings = () => {

    useEffect(() => {
        document.title = 'Settings | Task Reminder';
    }, []);

    return (
        <h1 className="text-2xl">Settings</h1>
    )
}