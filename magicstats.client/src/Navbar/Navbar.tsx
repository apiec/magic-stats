import {FaBars, FaHome, FaHouseUser, FaIdBadge, FaUser, FaUsers} from 'react-icons/fa'
import {GiStack} from 'react-icons/gi';
import {Link as RouterLink} from "react-router-dom";
import {Flex, TabNav, Heading, Text, Box} from '@radix-ui/themes';
import {ReactNode, useState} from 'react';
import './Navbar.css';

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

    function expanding(className: string) {
        return className + ' ' + expandedClass;
    }

    return (
        <>
            <Flex className={expanding('top-bar')}>
                <MagicStatsLogo/>
                <FaBars className={expanding('button-like expand-button')} onClick={toggleExpanded}/>
            </Flex>
            <Box className={expanding('navbar')}>
                <TabNav.Root>
                    <Flex direction='column'>
                        <NavLink text='Home' link='/' icon=<FaHome/> onClick={resetExpanded}/>
                        <NavLink text='Pods' link='/pods' icon=<FaUsers/> onClick={resetExpanded}/>
                        <NavLink text='Players' link='/players' icon=<FaUser/> onClick={resetExpanded}/>
                        <NavLink text='Commanders' link='/commanders' icon=<FaIdBadge/> onClick={resetExpanded}/>
                        <NavLink text='Games' link='/games' icon=<GiStack/> onClick={resetExpanded}/>
                        <NavLink text='Hosts' link='/hosts' icon=<FaHouseUser/> onClick={resetExpanded}/>
                    </Flex>
                </TabNav.Root>
            </Box>
        </>
    );
}

type NavLinkProps = {
    icon: ReactNode,
    text: string,
    link: string,
    onClick: () => void;
}

function NavLink({icon, text, link, onClick}: NavLinkProps) {
    return <TabNav.Link className='navbar-section' asChild onClick={onClick}>
        <RouterLink to={link}>
            <Text asChild size='4'>
                {icon}
            </Text>
            <Text size='3' ml='2'>{text}</Text>
        </RouterLink>
    </TabNav.Link>
}

function MagicStatsLogo() {
    return (
        <Flex className='magicstats-logo' asChild>
            <RouterLink to='/'>
                <img alt='logo' src='/stats-white.svg'/>
                <Heading as='h3'>Magic stats</Heading>
            </RouterLink>
        </Flex>
    );
}