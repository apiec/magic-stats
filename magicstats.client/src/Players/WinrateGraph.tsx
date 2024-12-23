import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

export type DataPoint = {
    date: number,
    value: number,
}

export type DataSeries = {
    name: string,
    data: DataPoint[],
}

export type WinrateGraphProps = {
    data: DataSeries[],
}
export default function WinrateGraph({data}: WinrateGraphProps) {

    const minDate = Math.min(...data.map(s => Math.min(...s.data.map(p => p.date))));
    const maxDate = Math.max(...data.map(s => Math.max(...s.data.map(p => p.date))));
    const stepCount = 5;
    const step = Math.floor((maxDate - minDate) / stepCount);
    const lastStepFix = maxDate - minDate - step * stepCount;
    const ticks = Array.from({length: stepCount + 1}, (_, k) => minDate + k * step);
    ticks[stepCount] += lastStepFix;

    const maxValue = Math.max(...data.map(s => Math.max(...s.data.map(p => p.value))));
    const topValue = Math.ceil(10 * maxValue) / 10;

    return (
        <ResponsiveContainer width='50%' height='50%'>
            <LineChart>
                <CartesianGrid vertical={false}/>
                <XAxis
                    dataKey='date'
                    type='number'
                    ticks={ticks}
                    domain={[minDate, maxDate]}
                    padding={{left: 20, right: 20}}
                    tickFormatter={(tickItem: number) => {
                        return new Date(tickItem).toLocaleDateString();
                    }}/>
                <YAxis dataKey='value' domain={[0, topValue]}/>
                <Tooltip/>
                <Legend/>
                {data.map((s, i) => (
                    <Line type='monotone' dataKey='value' data={s.data} name={s.name} key={s.name} stroke={colors[i]}/>
                ))}
            </LineChart>

        </ResponsiveContainer>
    );
}

const colors = [
    'red',
    'green',
    'magenta',
    'orange',
    'cyan',
]