import { BaseMap } from '../features/map/BaseMap';
import { useGetArticleTopicQuery } from '../features/map/topicApi';

import { Template } from './Template';

export const DemoPage = () => {
    const { data } = useGetArticleTopicQuery();
    const topic = data?.topic || '';

    return (
        <Template>
            <BaseMap topic={topic} />
        </Template>
    );
};
