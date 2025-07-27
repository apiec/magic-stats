import {Box, Card, Flex, Separator, Text} from '@radix-ui/themes';

type ValueDisplayProps = {
    title: string,
    values: string[],
}

export default function ValueDisplay({title, values}: ValueDisplayProps) {
    return (
        <Box width={{initial: '100%', md: 'fit-content'}}>
            <Card>
                <Box pb='2'>
                    <Text as='div' size='4' weight='bold' align='center'>
                        {title}
                    </Text>
                </Box>
                <Separator size='4' orientation='horizontal'/>
                <Flex gap='3' align='center' justify='center' pt='1'>
                    {values.map((v, i) => <>
                            <Text as='div' size='4' key={i}>
                                {v}
                            </Text>
                            {i < values.length - 1 &&
                                <Separator size='2' orientation='vertical'/>}
                        </>
                    )}
                </Flex>
            </Card>
        </Box>
    );
}