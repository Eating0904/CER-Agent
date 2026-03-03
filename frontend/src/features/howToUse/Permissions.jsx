import {
    Col,
    Image,
    Row,
    Typography,
} from 'antd';

import PermissionImage from '../../assets/images/how-to-use/permission.png';

const { Paragraph } = Typography;

export const Permissions = () => (
    <Row gutter={20}>
        <Col span={12}>
            <Paragraph style={{ fontSize: '18px', lineHeight: '2' }}>
                <ul>
                    <li>
                        The default role is Student.
                    </li>
                    <li>
                        <span style={{ color: 'red' }}>
                            To change your role to Teacher or Assistant(TA),
                            please contact the administrator and provide your account details.
                        </span>
                    </li>
                </ul>
            </Paragraph>
        </Col>
        <Col span={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image src={PermissionImage} alt="Permission" style={{ maxWidth: '100%', height: 'auto' }} />
        </Col>
    </Row>
);
