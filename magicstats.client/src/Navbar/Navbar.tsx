import {useState} from 'react';
import './Navbar.css'
import {FaBars, FaHome, FaHouseUser, FaIdBadge, FaUser, FaUsers} from 'react-icons/fa'
import {GiStack} from 'react-icons/gi';
import {Link} from "react-router-dom";

export default function Navbar() {
    const [expanded, setExpanded] = useState<boolean | undefined>(undefined);

    function toggleExpanded() {
        setExpanded(expanded !== undefined ? !expanded : true);
    }

    function resetExpanded() {
        setExpanded(expanded !== undefined ? !expanded : true);
    }

    const expandedClass = expanded === undefined
        ? 'init'
        : (expanded ? 'expanded' : 'not-expanded');

    return (
        <>
            <div className={'top-bar ' + expandedClass}>
                <img alt='logo' src='/stats-white.svg'/>
                <span>Magic stats</span>
                <FaBars className={'expand-button button-like ' + expandedClass} onClick={toggleExpanded}/>
            </div>
            <nav className={expandedClass}>
                <Link to="/" className='navbar-link' onClick={resetExpanded}>
                    <div className="navbar-section">
                        <FaHome className="navbar-icon"/>
                        <p>Home</p>
                    </div>
                </Link>
                <Link to="/pods" className='navbar-link' onClick={resetExpanded}>
                    <div className="navbar-section">
                        <FaUsers className="navbar-icon"/>
                        <p>Pods</p>
                    </div>
                </Link>
                <Link to="/players" className='navbar-link' onClick={resetExpanded}>
                    <div className="navbar-section">
                        <FaUser className="navbar-icon"/>
                        <p>Players</p>
                    </div>
                </Link>
                <Link to="/commanders" className='navbar-link' onClick={resetExpanded}>
                    <div className="navbar-section">
                        <FaIdBadge className="navbar-icon"/>
                        <p>Commanders</p>
                    </div>
                </Link>
                <Link to="/games" className='navbar-link' onClick={resetExpanded}>
                    <div className="navbar-section">
                        <GiStack className="navbar-icon"/>
                        <p>Games</p>
                    </div>
                </Link>
                <Link to="/hosts" className='navbar-link' onClick={resetExpanded}>
                    <div className="navbar-section">
                        <FaHouseUser className="navbar-icon"/>
                        <p>Hosts</p>
                    </div>
                </Link>
            </nav>
        </>
    );
}
