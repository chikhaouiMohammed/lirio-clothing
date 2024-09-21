import { FiMenu } from 'react-icons/fi'
import { useState } from 'react'
import { IoClose, IoShareSocialOutline } from "react-icons/io5"
import { AiOutlineProduct } from "react-icons/ai"
import { GoTasklist } from "react-icons/go"
import { MdOutlineShoppingBag } from "react-icons/md"
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

const Admin = () => {
    const [isMenu, setisMenu] = useState(false)
    let location = useLocation();
    console.log(location)
    const navigate = useNavigate()
    const pathName = location.pathname

    // Function to toggle the menu
    const toggleMenu = () => {
        setisMenu(!isMenu)
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/admin-login');

    }

    return (
        <div className=''>
            {/* menu */}
            {
                !isMenu && 
                <div className='w-full flex justify-start items-center py-6 container mx-auto px-10'>
                    <div onClick={toggleMenu} className='cursor-pointer transition-all duration-200 hover:text-gold'>
                        <FiMenu style={{ width: '1.7rem', height: '1.7rem' }} />
                    </div>
                </div>
            }
            
            <div className='flex justify-between items-center'>
                {/* sidebar */}
                <div className={`w-[250px] z-20 text-darkGray px-8 py-10 bg-lightBeige h-screen transition-all duration-300 absolute  ${isMenu ? ' left-0 top-0 md:fixed' : ' -left-[250px] top-0'}`}>
                    {/* Close icon */}
                    <div className="cursor-pointer" onClick={toggleMenu}>
                        <IoClose className="transition-all duration-300 hover:rotate-90 hover:text-gold" style={{ width: '1.7rem', height: '1.7rem' }} />
                    </div>
                    <div className="flex justify-between items-center w-full my-14">
                        <h1 className="font-poppins text-xl md:text-2xl">My Dashboard</h1>
                    </div>
                    <ul className="w-full flex flex-col items-start justify-center gap-5 font-poppins text-lg">
                        <Link to='/admin' className={`cursor-pointer flex justify-start items-center gap-8 bg-gray-100 transition-all duration-200 ${ pathName === '/admin' ? ' bg-gold' : '' } hover:bg-gold w-full p-2 rounded-xl`}>
                            <div><AiOutlineProduct style={{ width: '1.7rem', height: '1.7rem' }} /></div>
                            <a href="">Products</a>
                        </Link>
                        <Link to='/admin/orders' className={`cursor-pointer flex justify-start items-center gap-8 bg-gray-100 transition-all duration-200 ${ pathName === '/admin' ? ' bg-gold' : '' } hover:bg-gold w-full p-2 rounded-xl`}>
                            <div><GoTasklist style={{ width: '1.7rem', height: '1.7rem' }} /></div>
                            <a href="">Orders</a>
                        </Link>
                        <Link to='/admin/social' className={`cursor-pointer flex justify-start items-center gap-8 bg-gray-100 transition-all duration-200 ${ pathName === '/admin' ? ' bg-gold' : '' } hover:bg-gold w-full p-2 rounded-xl`}>
                            <div><IoShareSocialOutline style={{ width: '1.7rem', height: '1.7rem' }} /></div>
                            <a href="">Social</a>
                        </Link>
                        <Link to='/' className={`cursor-pointer flex justify-start items-center gap-8 bg-gray-100 transition-all duration-200 ${ pathName === '/admin' ? ' bg-gold' : '' } hover:bg-gold w-full p-2 rounded-xl`}>
                            <div><MdOutlineShoppingBag style={{ width: '1.7rem', height: '1.7rem' }} /></div>
                            <a href="">My Shop</a>
                        </Link>
                        <Link to='/admin/categories-sizes' className={`cursor-pointer flex justify-start items-center gap-8 bg-gray-100 transition-all duration-200 ${ pathName === '/admin/categories-sizes' ? ' bg-gold' : '' } hover:bg-gold w-full p-2 rounded-xl`}>
                            <div><AiOutlineProduct style={{ width: '1.7rem', height: '1.7rem' }} /></div>
                            <a href="">Categories & Sizes</a>
                        </Link>
                        <botton onClick={handleLogout} className={`cursor-pointer flex justify-start items-center gap-8 bg-gray-100 transition-all duration-200 ${ pathName === '/admin' ? ' bg-gold' : '' } hover:bg-red-600 w-full p-2 rounded-xl`}>
                            <div><MdOutlineShoppingBag style={{ width: '1.7rem', height: '1.7rem' }} /></div>
                            <a href="">Logout</a>
                        </botton>
                    </ul>
                </div>
                {/* Content */}
                <div className={` w-full ${ isMenu ? 'pt-[100px]' : '' }`}>
                    {/* Actual date */}
                    <p className=" w-full text-center text-xl font-medium">{formattedDate}</p>
                    <Outlet/>
                </div>
                </div>
        </div>
    )
} 

export default Admin
