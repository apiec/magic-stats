import {FaHome, FaHouseUser, FaIdBadge, FaUser, FaUsers} from 'react-icons/fa'
import {GiStack} from 'react-icons/gi';
import {Link} from "react-router-dom";
import {Box, Flex, TabNav, Heading} from '@radix-ui/themes';

export default function Navbar() {
    return (
        <>
            <Flex style={{gridArea: 'top-bar'}} height='60px' width='100%' m='1'>
                <MagicStatsLogo/>
            </Flex>
            <TabNav.Root style={{gridArea: 'nav'}}>
                <Flex direction='column'>
                    <TabNav.Link asChild={true}>
                        <Link to="/">
                            <FaHome/>
                            <Box ml='2'>
                                <p>Home</p>
                            </Box>
                        </Link>
                    </TabNav.Link>
                    <TabNav.Link asChild={true}>
                        <Link to="/pods">
                            <FaUsers/>
                            <Box ml='2'>
                                <p>Pods</p>
                            </Box>
                        </Link>
                    </TabNav.Link>
                    <TabNav.Link asChild={true}>
                        <Link to="/players">
                            <FaUser/>
                            <Box ml='2'>
                                <p>Players</p>
                            </Box>
                        </Link>
                    </TabNav.Link>
                    <TabNav.Link asChild={true}>
                        <Link to="/commanders">
                            <FaIdBadge/>
                            <Box ml='2'>
                                <p>Commanders</p>
                            </Box>
                        </Link>
                    </TabNav.Link>
                    <TabNav.Link asChild={true}>
                        <Link to="/games">
                            <GiStack/>
                            <Box ml='2'>
                                <p>Games</p>
                            </Box>
                        </Link>
                    </TabNav.Link>
                    <TabNav.Link asChild={true}>
                        <Link to="/hosts">
                            <FaHouseUser/>
                            <Box ml='2'>
                                <p>Hosts</p>
                            </Box>
                        </Link>
                    </TabNav.Link>
                </Flex>
            </TabNav.Root>
        </>
    );
}

function MagicStatsLogo() {
    return (
        <Flex asChild={true} gap='10px' align='center'>
            <Link to='/' style={{textDecoration: 'none', color: 'var(--color)'}}>
                <img alt='logo' src='/stats-white.svg' height='80%'/>
                <Heading as='h3'>Magic stats</Heading>
            </Link>
        </Flex>
    );
}