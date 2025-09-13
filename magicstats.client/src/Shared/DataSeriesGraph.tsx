import {Box, BoxProps} from "@radix-ui/themes";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {toPercentage} from "./toPercentage.ts";

export type DataPoint = {
    date: number,
    value: number,
}

export type DataSeries = {
    name: string,
    data: DataPoint[],
}

type DataSeriesGraphProps = {
    data: DataSeries[]
} & BoxProps;

export function DataSeriesGraph({data, ...boxProps}: DataSeriesGraphProps) {
    const minDate = Math.min(...data.flatMap(s => s.data).map(p => p.date));
    const maxDate = Math.max(...data.flatMap(s => s.data).map(p => p.date));
    const stepCount = 5;
    const step = Math.floor((maxDate - minDate) / stepCount);
    const lastStepFix = maxDate - minDate - step * stepCount;
    const ticks = Array.from({length: stepCount + 1}, (_, k) => minDate + k * step);
    ticks[stepCount] += lastStepFix;

    const maxValue = Math.max(...data.map(s => Math.max(...s.data.map(p => p.value))));
    const topValue = Math.ceil(10 * maxValue) / 10;
    const horizontalTicks = Array.from({length: topValue / 0.2 + 1}, (_, k) => 0.2 * k);

    return (
        <Box {...boxProps}>
            <ResponsiveContainer width='100%' height='100%' minHeight='200px' minWidth='200px'>
                <LineChart>
                    <CartesianGrid vertical={false} horizontalValues={horizontalTicks} strokeWidth={1}
                                   strokeDasharray='5 5'/>
                    <XAxis
                        dataKey='date'
                        type='number'
                        allowDuplicatedCategory={false} // without this active data point detection breaks ¯\_(ツ)_/¯
                        ticks={ticks}
                        domain={[minDate, maxDate]}
                        padding={{left: 20, right: 20}}
                        tickFormatter={(tickItem: number) => {
                            return new Date(tickItem).toLocaleDateString();
                        }}/>
                    <YAxis ticks={horizontalTicks} dataKey='value' domain={[0, topValue]}
                           tickFormatter={(tickItem: number) => toPercentage(tickItem)}/>
                    <Tooltip formatter={(value: number, _) => toPercentage(value)}
                             filterNull={true}
                             contentStyle={{background: 'var(--gray-2)'}}
                             labelFormatter={(label: number, _) => new Date(label).toLocaleDateString()}/>
                    <Legend/>
                    {data.map((s, i) => (
                        <Line type='monotone' dataKey='value' data={s.data} name={s.name} key={s.name}
                              stroke={colors[i % colors.length]}
                              strokeDasharray={strokes[Math.floor(i / colors.length)]}
                              dot={false} strokeWidth={2}/>
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}

const colors = [
    '#1e90ff',
    '#8000ff',
    '#ff8000',
    '#00e000',
    '#f030a8',
    '#80f4c4',
    '#2f4f4f',
    '#ffff00',
]

const strokes = [
    '',
    '10',
    '10 5 5 5',
]