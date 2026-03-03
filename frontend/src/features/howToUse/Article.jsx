/* eslint-disable max-len */
import {
    Col,
    Image,
    Row,
    Typography,
} from 'antd';

import ArticleImage from '../../assets/images/how-to-use/article.png';

const { Paragraph } = Typography;

export const Article = () => (
    <Row gutter={20}>
        <Col span={12}>
            <Paragraph style={{ fontSize: '18px', lineHeight: '2' }}>
                <ul>
                    <li>Click the Switcher (Article) at the top of the Practice to access this view.</li>
                    <li>Here is the Article for you to read.</li>
                </ul>
            </Paragraph>
        </Col>
        <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image src={ArticleImage} alt="Article" style={{ maxWidth: '100%', height: 'auto' }} />
        </Col>
    </Row>
);
