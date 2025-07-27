import {Box, Card, Flex, Text} from '@radix-ui/themes';

type ValueDisplayProps = {
    title: string,
    values: string[],
}

export default function ValueDisplay({title, values}: ValueDisplayProps) {
    return (
        <Box width={{initial: '100%', md: 'fit-content'}}>
            <Card>
                <Text as='div' size='4' weight='bold' align='center'>
                    {title}
                </Text>
                <Flex gap='4' align='center' justify='center' pt='2'>
                    {values.map((v, i) =>
                        <Text as='div' size='4' key={i}>
                            {v}
                        </Text>
                    )}
                </Flex>
            </Card>
        </Box>
    );
}