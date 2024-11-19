import './Navbar.css'
import {FaHeart} from 'react-icons/fa'
import {Link} from "react-router-dom";

export default function Navbar() {
    return (
        <>
            <nav>
                <Link to="commanders">
                    <NavbarSection text="Commanders"/>
                </Link>
                <Link to="players">
                    <NavbarSection text="Players"/>
                </Link>
                <Link to="games">
                    <NavbarSection text="Games"/>
                </Link>
            </nav>
        </>
    );
}

interface NavbarSectionProps {
    text: string,
}

function NavbarSection({text}: NavbarSectionProps) {
    return (
        <div className="navbar-section">
            <FaHeart className="navbar-icon"/>
            <p>{text}</p>
        </div>
    );
}