import computeRowsLayout, { RowsLayoutModel } from "../../layouts/rows";
import PhotoRenderer from "../renderers/PhotoRenderer";
import RowContainerRenderer from "../renderers/RowContainerRenderer";
import {
    ComponentsProps,
    Instrumentation,
    PaginationSliceProps,
    Photo,
    RenderPhoto,
    RenderRowContainer,
    RowsLayoutOptions,
} from "../../types";
import { useMemo } from "react";

type RowsLayoutProps<T extends Photo = Photo> = {
    photos: T[];
    layoutOptions: RowsLayoutOptions;
    renderPhoto?: RenderPhoto<T>;
    renderRowContainer?: RenderRowContainer;
    componentsProps?: ComponentsProps;
    instrumentation?: Instrumentation;
    pagination?: PaginationSliceProps;
};

//
const chunkPhotos = <T extends Photo = Photo>(photos: T[], pagination: PaginationSliceProps) => {
    const result = [];
    const totalPages = pagination.length;
    if (totalPages === 1) {
        result.push(photos);
    } else {
        for (let i = 0; i < totalPages; i++) {
            const start = i > 0 ? pagination[i - 1].limit : 0;
            const end = i > 0 ? pagination[i - 1].limit + pagination[i].limit : pagination[i].limit;
            result.push(photos.slice(start, end));
        }
    }
    return result;
};

const RowsLayout = <T extends Photo = Photo>(props: RowsLayoutProps<T>): JSX.Element => {
    const { photos, layoutOptions, renderPhoto, renderRowContainer, componentsProps, instrumentation, pagination } =
        props;

    const rows = useMemo(() => {
        const chunks = pagination?.length ? chunkPhotos(photos, pagination) : [photos];
        return chunks.reduce((acc, photos) => {
            const rows = computeRowsLayout<T>({ photos, layoutOptions, instrumentation });
            return [...(acc as []), ...(rows || []).map((row) => row)];
        }, [] as RowsLayoutModel<T>);
    }, [pagination, photos, layoutOptions, instrumentation]);

    if (rows === undefined) return <></>;

    return (
        <>
            {rows.map((row, rowIndex) => (
                <RowContainerRenderer
                    key={`row-${rowIndex}`}
                    layoutOptions={layoutOptions}
                    rowIndex={rowIndex}
                    rowsCount={rows.length}
                    renderRowContainer={renderRowContainer}
                    rowContainerProps={componentsProps?.rowContainerProps}
                >
                    {row.map(({ photo, layout }) => (
                        <PhotoRenderer
                            key={photo.key || photo.src}
                            photo={photo}
                            layout={layout}
                            layoutOptions={layoutOptions}
                            renderPhoto={renderPhoto}
                            imageProps={componentsProps?.imageProps}
                        />
                    ))}
                </RowContainerRenderer>
            ))}
        </>
    );
};

export default RowsLayout;
