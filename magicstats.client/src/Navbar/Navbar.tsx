import './Navbar.css'
import {FaHome, FaIdBadge, FaUser, FaUsers} from 'react-icons/fa'
import {GiStack} from 'react-icons/gi';
import {Link} from "react-router-dom";

export default function Navbar() {
    return (
        <nav>
            <Link to="">
                <div className="navbar-section">
                    <FaHome className="navbar-icon"/>
                    <p>Home</p>
                </div>
            </Link>
            <Link to="pods">
                <div className="navbar-section">
                    <FaUsers className="navbar-icon"/>
                    <p>Pods</p>
                </div>
            </Link>
            <Link to="players">
                <div className="navbar-section">
                    <FaUser className="navbar-icon"/>
                    <p>Players</p>
                </div>
            </Link>
            <Link to="commanders">
                <div className="navbar-section">
                    <FaIdBadge className="navbar-icon"/>
                    <p>Commanders</p>
                </div>
            </Link>
            <Link to="games">
                <div className="navbar-section">
                    <GiStack className="navbar-icon"/>
                    <p>Games</p>
                </div>
            </Link>
        </nav>
    );
}