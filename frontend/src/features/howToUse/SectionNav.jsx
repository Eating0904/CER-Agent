import { Button } from 'antd';

const BTN_STYLE = {
    backgroundColor: '#e9d8fd',
    borderColor: '#d8b4fe',
    color: '#6b21a8',
    width: '100%',
};

export const SectionNav = ({ sections, sectionRefs }) => {
    const scrollTo = (key) => {
        sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div
            style={{
                padding: '16px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#faf5ff',
                borderRight: '1px solid #e9d8fd',
                height: '100%',
            }}
        >
            {sections.map(({ key, label }) => (
                <Button
                    key={key}
                    size="small"
                    style={BTN_STYLE}
                    onClick={() => scrollTo(key)}
                >
                    {label}
                </Button>
            ))}
        </div>
    );
};
