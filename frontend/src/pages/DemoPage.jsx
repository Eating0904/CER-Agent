import { BaseMap } from '../features/map/BaseMap';
import { useGetTopicQuery } from '../features/map/topicApi';

import { Template } from './Template';

export const DemoPage = () => {
    const { data } = useGetTopicQuery();
    const topic = data?.topic || '';

    return (
        <Template>
            <BaseMap topic={topic} />
        </Template>
    );
};
