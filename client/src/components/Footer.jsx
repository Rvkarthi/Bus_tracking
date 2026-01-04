import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();

    const handleAdminReset = () => {
        // Clear the flags that prevent showing home
        localStorage.removeItem('hasVisited');
        localStorage.removeItem('traveler_org');

        // Navigate to home, which will now show because 'hasVisited' is gone
        // Navigate to admin login
        navigate('/admin/login');
    };

    return (
        <footer style={{ borderRadius: "1rem 1rem 0 0" }} className="w-[90vw] p-6 mt-auto  mx-auto text-center border-t border-yellow-100 bg-yellow-500 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-3">
                <div className="text-white text-s">
                    <p>Created by <span className="font-semibold text-white">R.V.Karthikrishna</span></p>
                    <a href="mailto:karthikrishna465@gmail.com" className="hover:text-yellow-600 transition-colors">
                        Karthikrishna465@gmail.com
                    </a>
                </div>
                <button
                    onClick={handleAdminReset}
                    className="text-xs select-none font-semibold text-yellow-500 transition-colors uppercase tracking-wider"
                >
                    Admin Login 
                </button>
            </div>
        </footer>
    );
};

export default Footer;
