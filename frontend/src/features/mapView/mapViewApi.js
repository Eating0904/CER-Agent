import baseApi from '../../api/baseApi';

const mapViewApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getViewMaps: build.query({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.username) searchParams.set('username', params.username);
                if (params.map_id) searchParams.set('map_id', params.map_id);
                if (params.map_name) searchParams.set('map_name', params.map_name);
                if (params.template_id) searchParams.set('template_id', params.template_id);
                const qs = searchParams.toString();
                return { url: `map/view/${qs ? `?${qs}` : ''}` };
            },
            providesTags: ['ViewMaps'],
        }),

        getViewMap: build.query({
            query: (mapId) => ({ url: `map/${mapId}/view/` }),
            providesTags: (result, error, mapId) => [{ type: 'ViewMap', id: mapId }],
        }),

        getViewEssay: build.query({
            query: (mapId) => ({ url: `essay/view/${mapId}/` }),
            providesTags: (result, error, mapId) => [{ type: 'ViewEssay', id: mapId }],
        }),
    }),
});

export const {
    useGetViewMapsQuery,
    useLazyGetViewMapQuery,
    useLazyGetViewEssayQuery,
} = mapViewApi;

export default mapViewApi;
