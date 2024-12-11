import './Navbar.css'
import {FaIdBadge, FaUser} from 'react-icons/fa'
import {GiStack} from 'react-icons/gi';
import {Link} from "react-router-dom";

export default function Navbar() {
    return (
        <>
            <nav>
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
        </>
    );
}