export const ArticlePageContent = ({ articleContent }) => (
    <div
        style={{
            height: '100%',
            padding: '40px 20px',
            overflow: 'auto',
            backgroundColor: '#ffffff',
        }}
    >
        <div
            style={{
                maxWidth: '800px',
                margin: '0 auto',
                whiteSpace: 'pre-wrap',
                fontSize: '16px',
                color: '#333',
                textAlign: 'left',
            }}
        >
            {articleContent || 'No content available.'}
        </div>
    </div>
);
