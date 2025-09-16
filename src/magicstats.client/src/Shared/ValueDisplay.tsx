import {InfoCircledIcon} from '@radix-ui/react-icons';
import {Box, Card, Dialog, Flex, Separator, Text, Tooltip} from '@radix-ui/themes';
import React from 'react';

type ValueDisplayProps = {
    title: string,
    values: string[],
    tooltip?: string,
}

export default function ValueDisplay({title, values, tooltip}: ValueDisplayProps) {
    return (
        <Box width={{initial: '100%', md: 'fit-content'}}>
            <Card>
                <Flex pb='2' direction='row' width='100%' align='center' justify='center' gap='1'>
                    <Text as='div' size='4' align='center'>
                        {title}
                    </Text>
                    {tooltip &&
                        <Dialog.Root>
                            <Tooltip content={tooltip}>
                                <Dialog.Trigger>
                                    <InfoCircledIcon/>
                                </Dialog.Trigger>
                            </Tooltip>
                            <Dialog.Content maxWidth='fit-content'>
                                <Text as='div' align='center'>{tooltip}</Text>
                            </Dialog.Content>
                        </Dialog.Root>
                    }
                </Flex>
                <Separator size='4' orientation='horizontal'/>
                <Flex gap='3' align='center' justify='center' pt='1'>
                    {values.map((v, i) => <React.Fragment key={i}>
                            <Text as='div' size='3' key={i}>
                                {v}
                            </Text>
                            {i < values.length - 1 &&
                                <Separator key={i.toString() + '-separator'} size='2' orientation='vertical'/>}
                        </React.Fragment>
                    )}
                </Flex>
            </Card>
        </Box>
    );
}