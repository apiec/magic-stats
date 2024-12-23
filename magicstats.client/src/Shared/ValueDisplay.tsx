import './ValueDisplay.css';

type ValueDisplayProps = {
    title: string,
    values: string[],
}

export default function ValueDisplay({title, values}: ValueDisplayProps) {
    return (
        <div className='value-display'>
            <p className='value-display-title'>{title}</p>
            <div className='value-display-values-container'>
                {values.map((v, i) =>
                    <p key={i} className='value-display-value'>{v}</p>
                )}
            </div>
        </div>
    );
}