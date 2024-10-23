import './Navbar.css'
import {FaHeart} from 'react-icons/fa'

export default function Navbar() {
    return (
        <>
            <nav>
                <NavbarSection text="Commanders"/>
            </nav>
        </>
    );
}

interface NavbarSectionProps {
    text: string
}

function NavbarSection(props: NavbarSectionProps) {
    return (
        <div className="navbar-section">
            <FaHeart className="navbar-icon"/>
            <p>{props.text}</p>
        </div>
    );
}